import Route from '@ioc:Adonis/Core/Route';
import Database from '@ioc:Adonis/Lucid/Database';
import { budgets } from 'Database/categories';

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
  const from = new Date(request.params().from);
  const to = new Date(request.params().to);

  return budgets(from, to);
});
