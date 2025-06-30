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
import iconv from 'iconv-lite';

function removeTimeFromDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

/**
 * Decode text from FinTS which often comes with ISO-8859-1 encoding
 * This fixes German umlauts and other special characters
 */
function decodeFinTSText(text: string): string {
  if (!text) return '';

  text = JSON.parse(JSON.stringify(text));

  try {
    // First try to decode as ISO-8859-1 (Latin-1) to UTF-8
    // This is the most common encoding issue with German FinTS data
    const buf = Buffer.from(text, 'latin1');
    return iconv.decode(buf, 'utf-8');
  } catch (error) {
    console.error(error);

    // If decoding fails, return the original text
    console.warn(`Failed to decode FinTS text: ${text.substring(0, 50)}...`);
    return text;
  }
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
      const rawSummary =
        t.descriptionStructured?.reference.text ?? t.descriptionStructured?.reference.raw ?? '';
      const rawName = !!t.descriptionStructured?.name
        ? t.descriptionStructured?.name
        : t.descriptionStructured?.reference.raw ?? '';

      // Decode text to fix German umlauts
      const summary = decodeFinTSText(rawSummary);
      const name = decodeFinTSText(rawName);

      const amount = Math.ceil((t.isCredit ? t.amount : t.amount * -1) * 100);

      return await TransactionModel.updateOrCreate(
        {
          summary: summary.substring(0, 255),
          amount,
          bookingDate: DateTime.fromJSDate(bookingDate),
        },
        {
          id: uuid4v(),
          bookingDate: DateTime.fromJSDate(bookingDate),
          name: name.substring(0, 255),
          summary: summary.substring(0, 255),
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
      console.log(`importing ${account.iban} ...`);
      const transactions = await getTransactions(client, account, startDate, endDate);
      const affected = await insertTransactionsIntoDatabase(account, transactions);

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
    await runImport();

    await this.exit();
  }
}
