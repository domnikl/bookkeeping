import Route from '@ioc:Adonis/Core/Route';
import Database from '@ioc:Adonis/Lucid/Database';
import PaymentModel from 'App/Models/PaymentModel';
import TransactionModel from 'App/Models/TransactionModel';
import { sumPaymentsOfTransaction } from 'Database/payments';

Route.get('payments', async () => {
  return await PaymentModel.query()
    .orderBy('bookingDate', 'desc')
    .preload('category')
    .preload('transaction')
    .orderBy('bookingDate', 'desc')
    .limit(50);
});

Route.post('payments', async ({ request, response }) => {
  const payment = request.body();
  delete payment.transaction;

  await Database.transaction(async (trx) => {
    await PaymentModel.create(payment);

    const transaction = await (await TransactionModel.findOrFail(payment.incomingPaymentId)).useTransaction(trx);
    const sumOfPayments = await sumPaymentsOfTransaction(payment.incomingPaymentId);

    // only ACK if all of the amount was "spent" in payments
    if (sumOfPayments == transaction.amount) {
      transaction.ack = true;
      await transaction.save();
    }
  });

  response.status(201);

  return payment;
});
