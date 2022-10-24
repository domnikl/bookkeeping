import { BaseCommand } from '@adonisjs/core/build/standalone';
import { DateTime } from 'luxon';
import BalanceModel from 'App/Models/BalanceModel';
import {
  PinTanClient,
  SEPAAccount,
  Balance as SEPABalance,
  Statement,
  Transaction as SEPATransaction,
} from 'fints';
import { v4 as uuid4v } from 'uuid';
import TransactionModel from 'App/Models/TransactionModel';

function removeTimeFromDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

async function getTransactions(
  client: PinTanClient,
  account: SEPAAccount,
  startDate: Date,
  endDate: Date
): Promise<SEPATransaction[]> {
  const statements = await client.statements(account, startDate, endDate);
  return statements.map((s: Statement) => s.transactions).flat();
}

async function insertTransactionsIntoDatabase(
  account: SEPAAccount,
  transactions: SEPATransaction[]
): Promise<TransactionModel[]> {
  return await Promise.all(
    transactions.map(async (t: SEPATransaction) => {
      const bookingDate: Date = removeTimeFromDate(new Date(t.valueDate));
      const summary = t.descriptionStructured?.reference.text ?? '';
      const amount = Math.ceil((t.isCredit ? t.amount : t.amount * -1) * 100);

      return await TransactionModel.updateOrCreate(
        {
          bookingDate: DateTime.fromJSDate(bookingDate),
          name: t.descriptionStructured?.name ?? '',
          summary,
        },
        {
          id: uuid4v(),
          bookingDate: DateTime.fromJSDate(bookingDate),
          name: t.descriptionStructured?.name ?? '',
          summary,
          amount,
          accountIban: account.iban,
        }
      );
    })
  );
}

async function insertBalanceIntoDatabase(balance: SEPABalance): Promise<BalanceModel> {
  console.log(`inserting balance ${balance.bookedBalance * 100} for ${balance.account.iban}`);

  return await BalanceModel.create({
    id: uuid4v(),
    bookingDate: DateTime.now(),
    accountIban: balance.account.iban,
    amount: Math.floor(balance.bookedBalance * 100),
  });
}

export async function runImport() {
  const now = new Date();
  const endDate = now;
  const startDate = new Date();
  startDate.setDate(now.getDate() - 1);

  const client = new PinTanClient({
    url: process.env.FINTS_URL!!,
    name: process.env.FINTS_NAME!!,
    pin: process.env.FINTS_PIN!!,
    blz: process.env.FINTS_BLZ!!,
    productId: process.env.FINTS_PRODUCT_ID!!,
  });

  const accounts: SEPAAccount[] = await client.accounts();

  await Promise.all(
    accounts.map(async (account: SEPAAccount) => {
      return await insertBalanceIntoDatabase(await client.balance(account));
    })
  );

  await Promise.all(
    accounts.map(async (account: SEPAAccount) => {
      const transactions = await getTransactions(client, account, startDate, endDate);
      const affected = await insertTransactionsIntoDatabase(account, transactions);

      // TODO: report newly transmitted transactions to Discord also
      console.log(
        `import completed: ${affected.length} transactions processed for ${account.iban}`
      );
    })
  );
}

export default class FinTs extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'fints';

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'fetch input data from FinTS servers';

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process
     */
    stayAlive: false,
  };

  public async run() {
    runImport();

    await this.exit();
  }
}
