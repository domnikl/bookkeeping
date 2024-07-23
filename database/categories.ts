import Database from '@ioc:Adonis/Lucid/Database';
import CategoryModel from 'App/Models/CategoryModel';

export async function wrapUpMonth(date: string) {
  const [year, month] = date.split('-');
  const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1, 12);
  const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

  await Database.transaction(async (trx) => {
    // collect historical data
    await Database.rawQuery(
      `INSERT INTO historic_categories (id, category_id, summary, expected_amount, due_date, parent, account, onetime, created_at, updated_at)
        SELECT gen_random_uuid() AS id,
                c.id AS category_id,
                summary,
                expected_amount,
                COALESCE(due_date, DATE(?)) AS "date",
                parent,
                account,
                c.onetime,
                now(),
                now()
        FROM categories c
        WHERE c.is_active = true
        AND ((c.due_date >= ? AND c.due_date <= ?) OR c.every IS NULL)
        ORDER BY date;
        `,
      [startOfMonth, startOfMonth, endOfMonth]
    ).useTransaction(trx);

    // after historical data has been written, update the categories itself and move forward the dueDate
    const promises = (
      await CategoryModel.query()
        .useTransaction(trx)
        .whereBetween('dueDate', [startOfMonth, endOfMonth])
    )
      .map((c: CategoryModel) => {
        if (c.dueDate === null || c.every === null || c.oneTime) {
          return c;
        }

        c.dueDate = c.dueDate?.plus({ months: c.every });

        return c;
      })
      .map(async (c: CategoryModel) => await c.save());

    await Promise.all(promises);
  });
}

export interface BudgetItem {
  account: string;
  summary: string;
  every: number | null;
  dueDate: Date | null;
  expectedAmount: number;
  actualAmount: number;
  remainingAmount: number;
  percentage: number;
}

export async function budgets(iban: string, from: Date, to: Date): Promise<BudgetItem[]> {
  const report = await Database.rawQuery(
    `WITH amounts AS (
      SELECT c.id,
                        c.account,
                        c.summary,
                        c.every,
                        c.due_date,
                        c.expected_amount,
                        coalesce(x.amount, 0) AS actual_amount
                 FROM categories c
                          LEFT JOIN (SELECT p.category_id, SUM(p.amount) AS amount
                                     FROM payments p
                                     WHERE booking_date::date >= date(?)
                                       AND booking_date::date <= date(?)
                                     GROUP BY p.category_id) AS x ON x.category_id = c.id
                 WHERE ((due_date::date >= date(?) AND due_date::date <= date(?)) OR
                        due_date IS NULL)
                   AND c.is_active = true
                   AND c.account = ?),
    with_remaining AS (
      SELECT id, account, summary, every, due_date, expected_amount, actual_amount,
       CASE
        WHEN expected_amount = 0 THEN 0
        WHEN expected_amount = actual_amount THEN 0
        WHEN expected_amount > 0 THEN CASE
            WHEN actual_amount > expected_amount THEN 0
            ELSE expected_amount - actual_amount
        END
        ELSE CASE
            WHEN actual_amount < expected_amount THEN NULL -- spending exceeded
            WHEN actual_amount > 0 THEN CASE
                WHEN actual_amount + expected_amount > 0 THEN 0 -- get money back
                ELSE expected_amount + actual_amount
            END
            ELSE expected_amount - actual_amount
        END
       END AS remaining
      FROM amounts
      )

      SELECT id, account, summary, every, due_date AS "dueDate", expected_amount AS "expectedAmount", actual_amount AS "actualAmount", remaining AS "remainingAmount", CASE
          WHEN expected_amount = 0 THEN 0
          WHEN expected_amount = actual_amount THEN 100
          WHEN expected_amount != 0 THEN floor((100.0 / abs(expected_amount)) * abs(actual_amount))
          ELSE 0
      END AS percentage
      FROM with_remaining
      ORDER BY summary`,
    [from, to, from, to, iban]
  );

  return report.rows.map((e) => {
    return {
      ...e,
      actualAmount: parseInt(e.actualAmount),
      expectedAmount: parseInt(e.expectedAmount),
      remainingAmount: parseInt(e.remainingAmount),
      percentage: parseFloat(e.percentage),
      dueDate: e.dueDate !== null ? new Date(e.dueDate) : null,
    };
  });
}
