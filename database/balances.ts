import Database from "@ioc:Adonis/Lucid/Database";
import { format } from "date-fns"

export async function findBalancesByMonth(iban: string, from: string, to: string) {
  const ungrouped = (
    await Database.rawQuery(
      `SELECT DISTINCT ON (date("bookingDate")) date("bookingDate"), amount, rank() OVER (PARTITION BY "bookingDate" ORDER BY "bookingDate" DESC)
    FROM balances
    WHERE "bookingDate" >= ? AND "bookingDate" <= ?
    AND account = ?
    ORDER BY 1 DESC`,
      [from, to, iban]
    )
  ).rows;

  const byMonth: Record<string, any> = {}

  ungrouped.forEach((x) => {
    const key = format(x.date, 'yyyy-MM');
    const existing = byMonth[key] ?? [];

    byMonth[key] = [...existing, {
      bookingDate: x.date,
      amount: x.amount
    }];
  });

  return byMonth;
}
