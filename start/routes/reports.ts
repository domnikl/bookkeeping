import Route from '@ioc:Adonis/Core/Route';
import Database from '@ioc:Adonis/Lucid/Database';

Route.get('reports/balances', async () => {
  const report = await Database.rawQuery(
    `SELECT a.iban, a.name AS account, b."bookingDate", b.amount
    FROM accounts a
    INNER JOIN (
        SELECT DISTINCT ON (b.account) b."bookingDate", b.account AS iban, b.amount
        FROM balances b
        ORDER BY b.account, b."bookingDate" DESC
    ) b ON b.iban = a.iban
    WHERE a."isActive" = true
    ORDER BY a.sort;`,
    []
  );

  return report.rows;
});

Route.get('reports/:from/:to', async ({ request }) => {
  const from = request.params().from;
  const to = request.params().to;

  const report = await Database.rawQuery(
    `SELECT c.id, c.summary, c."expectedAmount", c.every, c."dueDate", x.amount
  FROM categories c
  LEFT JOIN (SELECT p."categoryId", SUM(p.amount) AS amount
      FROM payments p
      WHERE "bookingDate" >= ? AND "bookingDate" <= ?
      GROUP BY p."categoryId") AS x ON x."categoryId" = c.id
  WHERE (("dueDate" >= ? AND "dueDate" <= ?) OR "dueDate" IS NULL)
  AND c."isActive" = true
  ORDER BY summary`,
    [from, to, from, to]
  );

  return report.rows;
});
