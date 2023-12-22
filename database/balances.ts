import Database from '@ioc:Adonis/Lucid/Database';
import { format } from 'date-fns';
import { BudgetItem, budgets } from './categories';
import { beginNextMonth, isWorkDay, untilEndOfMonth, workDaysLeftInMonth } from 'App/Utils';

export async function findBalancesByMonth(iban: string, from: string, to: string) {
  const ungrouped = (
    await Database.rawQuery(
      `WITH r AS (
        SELECT date(booking_date) AS booking_date, amount, rank() OVER (PARTITION BY date(booking_date) ORDER BY booking_date DESC) AS rnk
        FROM balances
        WHERE account = ?
        AND date(booking_date) >= date(?) AND date(booking_date) <= date(?)
      )

      SELECT booking_date, amount
      FROM r
      WHERE r.rnk = 1
      ORDER BY booking_date ASC`,
      [iban, from, to]
    )
  ).rows;

  const byMonth: Map<string, number[]> = new Map();

  ungrouped.forEach((x) => {
    const label = format(x.booking_date, 'yyyy-MM');
    const existing = byMonth[label] ?? [];

    byMonth[label] = [...existing, x.amount];
  });

  const existingValues: any[] = Object.keys(byMonth)
    .map((key) => {
      return {
        label: key,
        prediction: false,
        data: byMonth[key],
      };
    })
    .reverse();

  let prediction = await buildPredictions(
    iban,
    ungrouped[ungrouped.length - 1].amount,
    new Date(to)
  );

  existingValues.unshift({
    label: 'prediction',
    prediction: true,
    data: prediction,
  });

  existingValues.unshift({
    label: 'prediction',
    prediction: true,
    data: await buildPredictionNextMonth(iban, prediction[prediction.length - 1]),
  });

  return existingValues;
}

async function buildPredictions(iban: string, lastBalance: number, lastBookingDate: Date) {
  const date = new Date();
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  // get all budgets for this month
  const categoryBudget = (await budgets(from, to)).filter((b) => (b.account = iban));

  let balance = lastBalance;
  const start = lastBookingDate;

  const withoutDueDate = categoryBudget.filter(
    (c) => c.remainingAmount !== 0 && c.dueDate === null
  );
  const withDueDate = categoryBudget.filter(
    (c) => c.remainingAmount !== 0 && c.dueDate !== null && c.dueDate >= start
  );
  const dueDateGone = categoryBudget.filter(
    (c) => c.remainingAmount !== 0 && c.dueDate !== null && c.dueDate < start
  );

  let remainingFromNonWorkDay = sumRemaining(dueDateGone);
  const daily = sumRemaining(withoutDueDate) / workDaysLeftInMonth(start);

  return untilEndOfMonth(start, (date) => {
    const dueOnThisDay = sumRemaining(
      withDueDate.filter((c) => c.dueDate?.getDate() === date.getDate())
    );

    if (isWorkDay(date)) {
      balance += daily + remainingFromNonWorkDay + dueOnThisDay;
      remainingFromNonWorkDay = 0;
    } else {
      remainingFromNonWorkDay += dueOnThisDay;
    }

    return parseInt(balance.toFixed(0));
  });
}

async function buildPredictionNextMonth(iban: string, lastBalance: number) {
  const date = new Date();
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  // get all budgets for this month
  const categoryBudget = (await budgets(from, to)).filter((b) => (b.account = iban));

  const start = beginNextMonth(new Date());

  const withoutDueDate = categoryBudget.filter((c) => c.dueDate === null);
  const daily = sumExpected(withoutDueDate) / workDaysLeftInMonth(start);

  let remainingFromNonWorkDay = 0;
  let balance = lastBalance;

  return untilEndOfMonth(start, (date) => {
    const dueOnThisDay = sumExpected(
      categoryBudget.filter((c) => c.dueDate?.getDate() === date.getDate())
    );

    if (isWorkDay(date)) {
      balance += daily + remainingFromNonWorkDay + dueOnThisDay;
      remainingFromNonWorkDay = 0;
    } else {
      remainingFromNonWorkDay += dueOnThisDay;
    }

    return balance;
  });
}

const sumRemaining = (items: BudgetItem[]) => {
  return items.reduce(
    (acc, current) => acc + (Number.isNaN(current.remainingAmount) ? 0 : current.remainingAmount),
    0
  );
};

const sumExpected = (items: BudgetItem[]) => {
  return items.reduce(
    (acc, current) => acc + (Number.isNaN(current.expectedAmount) ? 0 : current.expectedAmount),
    0
  );
};
