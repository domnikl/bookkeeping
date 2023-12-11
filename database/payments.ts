import Database from '@ioc:Adonis/Lucid/Database';

export async function sumPaymentsOfTransaction(transactionId: string): Promise<number> {
    const sum = await Database.from('payments').where('transaction_id', transactionId).sum({'amount': 'amount'});

    return sum[0].amount;
}
