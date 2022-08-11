import Database from '@ioc:Adonis/Lucid/Database';
import CategoryModel from 'App/Models/CategoryModel';

export async function wrapUpMonth(date: string) {
  const [year, month] = date.split('-');
  const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1, 12);
  const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

  await Database.transaction(async (trx) => {
    // collect historical data
    await Database.rawQuery(
      `INSERT INTO historic_categories (id, category_id, summary, expected_amount, due_date, parent, created_at, updated_at)
        SELECT gen_random_uuid() AS id,
                c.id AS category_id,
                summary,
                "expectedAmount",
                COALESCE("dueDate", DATE(?)) AS "date",
                parent,
                now(),
                now()
        FROM categories c
        WHERE c."isActive" = true
        AND ((c."dueDate" BETWEEN ? AND ?) OR c.every IS NULL)
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
        if (c.dueDate === null || c.every === null) {
          return c;
        }

        c.dueDate = c.dueDate?.plus({ months: c.every });

        return c;
      })
      .map(async (c: CategoryModel) => await c.save());

    await Promise.all(promises);
  });
}
