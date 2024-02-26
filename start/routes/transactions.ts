import Route from '@ioc:Adonis/Core/Route';
import TransactionModel from 'App/Models/TransactionModel';
import { sumPaymentsOfTransaction } from 'Database/payments';

Route.get('transactions/:transactionId', async ({ request }) => {
  const transactionId = request.params().transactionId
  const transaction = await TransactionModel.find(transactionId);
  const sumPayments = parseInt(await sumPaymentsOfTransaction(transactionId));

  transaction.amount -= sumPayments;

  return transaction;
});

Route.get('transactions', async () => {
  const transactions = await TransactionModel.query()
    .where('ack', false)
    .orderBy('bookingDate', 'desc')
    .preload('account');

  return await Promise.all(
    transactions.map(async (t) => {
      t.amount -= await sumPaymentsOfTransaction(t.id);
      return t;
    })
  );
});
