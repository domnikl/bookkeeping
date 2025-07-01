import Route from '@ioc:Adonis/Core/Route';
import Database from '@ioc:Adonis/Lucid/Database';
import PaymentModel from 'App/Models/PaymentModel';
import TransactionModel from 'App/Models/TransactionModel';
import { sumPaymentsOfTransaction } from 'Database/payments';

Route.get('payments', async () => {
  return PaymentModel.query()
    .preload('category')
    .preload('transaction')
    .orderBy('createdAt', 'desc')
    .orderBy('bookingDate', 'desc')
    .limit(50);
});

Route.get('payments/:from/:to', async ({ params }) => {
  const from = params.from;
  const to = params.to;

  return PaymentModel.query()
    .preload('category')
    .preload('transaction')
    .whereBetween('bookingDate', [from, to])
    .orderBy('bookingDate', 'desc');
});

Route.post('payments', async ({ request, response }) => {
  const payment = request.body();
  delete payment.transaction;

  await Database.transaction(async (trx) => {
    await PaymentModel.create(payment);

    const transaction = await (
      await TransactionModel.findOrFail(payment.transactionId)
    ).useTransaction(trx);
    const sumOfPayments = await sumPaymentsOfTransaction(payment.transactionId);

    // only ACK if all the amount was "spent" in payments
    if (sumOfPayments == transaction.amount) {
      transaction.ack = true;
      await transaction.save();
    }
  });

  response.status(201);

  return payment;
});
