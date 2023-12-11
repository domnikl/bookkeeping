import Database from '@ioc:Adonis/Lucid/Database';
import { format } from 'date-fns';

export async function findBalancesByMonth(iban: string, from: string, to: string) {
  const ungrouped = (
    await Database.rawQuery(
      `SELECT DISTINCT ON (date(booking_date)) date(booking_date), amount, rank() OVER (PARTITION BY booking_date ORDER BY booking_date DESC)
    FROM balances
    WHERE date(booking_date) >= ? AND date(booking_date) <= ?
    AND account = ?
    ORDER BY 1 DESC`,
      [from, to, iban]
    )
  ).rows;

  const byMonth: Record<string, any> = {};

  ungrouped.forEach((x) => {
    const key = format(x.date, 'yyyy-MM');
    const existing = byMonth[key] ?? [];

    byMonth[key] = [
      ...existing,
      {
        bookingDate: format(x.date, 'yyyy-MM-dd'),
        amount: x.amount,
      },
    ];
  });

  return byMonth;
}
