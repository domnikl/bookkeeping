import Route from '@ioc:Adonis/Core/Route';
import { findBalancesByMonth } from 'Database/balances';

Route.get('balances/:iban/:from/:to', async ({ request }) => {
  const from = request.params().from;
  const to = request.params().to;
  const iban = request.params().iban;

  return await findBalancesByMonth(iban, from, to);
});
