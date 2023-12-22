import Route from '@ioc:Adonis/Core/Route';
import Database from '@ioc:Adonis/Lucid/Database';

Route.get('reports/balances', async () => {
  const report = await Database.rawQuery(
    `SELECT a.iban, a.name AS account, b.booking_date AS "bookingDate", b.amount
    FROM accounts a
    INNER JOIN (
        SELECT DISTINCT ON (b.account) b.booking_date, b.account AS iban, b.amount
        FROM balances b
        ORDER BY b.account, b.booking_date DESC
    ) b ON b.iban = a.iban
    WHERE a.is_active = true
    ORDER BY a.sort;`,
    []
  );

  return report.rows;
});

Route.get('reports/:from/:to', async ({ request }) => {
  const from = request.params().from;
  const to = request.params().to;

  const report = await Database.rawQuery(
    `SELECT c.id, c.account, c.summary, c.expected_amount AS "expectedAmount", c.every, c.due_date as "dueDate", x.amount
  FROM categories c
  LEFT JOIN (SELECT p.category_id, SUM(p.amount) AS amount
      FROM payments p
      WHERE booking_date::date >= ? AND booking_date::date <= ?
      GROUP BY p.category_id) AS x ON x.category_id = c.id
  WHERE ((due_date::date >= ? AND due_date::date <= ?) OR due_date IS NULL)
  AND c.is_active = true
  ORDER BY summary`,
    [from, to, from, to]
  );

  return report.rows;
});
