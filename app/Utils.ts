export function workDaysLeftInMonth(start: Date): number {
  return untilEndOfMonth(start, (date) => (isWorkDay(date) ? 1 : 0)).reduce((a, b) => a + b, 0);
}

export function untilEndOfMonth(start: Date, fn: (current: Date) => any): Array<any> {
  const mapped = new Array(31);

  for (let i = start.getDate() - 1; i <= endOfMonth(start).getDate(); i++) {
    const x = new Date(start);
    x.setDate(i);

    mapped[i] = fn(x);
  }

  return mapped;
}

export function isWorkDay(date: Date): boolean {
  return date.getDay() !== 6 && date.getDay() !== 0;
}

export function endOfMonth(date: Date): Date {
  return removeTimeFromDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function removeTimeFromDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
}

export function beginNextMonth(date: Date): Date {
  date.setMonth(date.getMonth() + 1);
  return beginOfMonth(date);
}

export function beginOfMonth(date: Date): Date {
  return removeTimeFromDate(new Date(date.getFullYear(), date.getMonth(), 1));
}
