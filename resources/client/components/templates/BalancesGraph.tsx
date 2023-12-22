import React, { useContext } from 'react';
import Empty from '../molecules/Empty';
import IsFetching from '../atoms/IsFetching';
import { ChartData, ChartDataset, ChartOptions } from 'chart.js';
import Balance, { BalancesMap } from '../../interfaces/Balance';
import CategoryBudget from 'resources/client/interfaces/CategoryBudget';
import { CategoryBudgetContext } from '../pages/DashboardPage';

import { Chart as ChartJS, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Account from 'resources/client/interfaces/Account';
ChartJS.register(...registerables);

function isWorkDay(date: Date): boolean {
  return date.getDay() !== 6 && date.getDay() !== 0;
}

function removeTimeFromDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
}

function endOfMonth(date: Date): Date {
  return removeTimeFromDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function workDaysLeftInMonth(start: Date): number {
  return untilEndOfMonth(start, (date) => (isWorkDay(date) ? 1 : 0)).reduce((a, b) => a + b, 0);
}

export function beginOfMonth(date: Date): Date {
  return removeTimeFromDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function beginNextMonth(date: Date): Date {
  date.setMonth(date.getMonth() + 1);
  return beginOfMonth(date);
}

function untilEndOfMonth(start: Date, fn: (current: Date) => any): Array<any> {
  const mapped = new Array(31);

  for (let i = start.getDate() - 1; i < endOfMonth(start).getDate(); i++) {
    const x = new Date(start);
    x.setDate(i);

    mapped[i] = fn(x);
  }

  return mapped;
}

const sumRemaining = (budget: CategoryBudget[]): number => {
  return budget.reduce((previous, current) => previous + (current.remaining ?? 0), 0) / 100;
};

const sumExpected = (budget: CategoryBudget[]): number => {
  return budget.reduce((previous, current) => previous + (current.expectedAmount ?? 0), 0) / 100;
};

const buildPrediction = (
  account: Account,
  balances: BalancesMap,
  categoryBudget: CategoryBudget[]
) => {
  categoryBudget = categoryBudget.filter((c) => c.account === account.iban);
  const months = Object.keys(balances);

  if (months.length === 0) return [];

  const lastMonth = months[0];
  const lastBalance = balances[lastMonth][0];

  let balance = lastBalance.amount / 100;
  const start = new Date(lastBalance.bookingDate);

  const withoutDueDate = categoryBudget.filter((c) => c.remaining !== 0 && c.dueDate === null);
  const withDueDate = categoryBudget.filter(
    (c) => c.remaining !== 0 && c.dueDate !== null && c.dueDate >= start
  );
  const dueDateGone = categoryBudget.filter(
    (c) => c.remaining !== 0 && c.dueDate !== null && c.dueDate < start
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

    return balance;
  });
};

const buildPredictionNextMonth = (
  account: Account,
  balance: number,
  categoryBudget: CategoryBudget[]
) => {
  categoryBudget = categoryBudget.filter((c) => c.account === account.iban);

  const start = beginNextMonth(new Date());

  const withoutDueDate = categoryBudget.filter((c) => c.dueDate === null);
  const daily = sumExpected(withoutDueDate) / workDaysLeftInMonth(start);

  let remainingFromNonWorkDay = 0;

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
};

const colors = [
  '#66bb6a',
  '#303f9f',
  '#ffa726',
  '#ef5350',
  '#26a69a',
  '#d4e157',
  '#fff9c4',
  '#ff7043',
  '#78909c',
  '#8d6e63',
  '#9e9d24',
  '#880e4f',
  '#4fc3f7',
  '#808080',
];

const balancesToGraphData = (
  account: Account,
  balances: BalancesMap,
  categoryBudget: CategoryBudget[]
): ChartDataset<'line'>[] => {
  const months = Object.keys(balances);

  const existingValues: ChartDataset<'line'>[] = months.map(
    (month, index): ChartDataset<'line'> => {
      const data = new Array(31);

      balances[month].forEach((x: Balance) => {
        const index = new Date(x.bookingDate).getDate() - 1;
        data[index] = x.amount / 100;
      });

      return {
        label: month,
        data: data,
        fill: false,
        backgroundColor: colors[index],
        borderColor: colors[index],
        hidden: index > 1,
      };
    }
  );

  const predictedThisMonth = buildPrediction(account, balances, categoryBudget);
  let predictions: ChartDataset<'line'> = {
    label: 'prediction',
    data: predictedThisMonth,
    fill: false,
    backgroundColor: colors[0],
    borderColor: colors[0],
    borderDash: [3, 5],
    hidden: false,
  };

  existingValues.unshift(predictions);

  if (predictedThisMonth.length > 0) {
    const keys = Object.keys(predictedThisMonth);
    const last = keys[keys.length - 1];

    existingValues.unshift({
      label: 'prediction',
      data: buildPredictionNextMonth(account, predictedThisMonth[last], categoryBudget),
      fill: false,
      backgroundColor: colors[colors.length - 1],
      borderColor: colors[colors.length - 1],
      borderDash: [3, 5],
      hidden: false,
    });
  }

  return existingValues;
};

type BalancesGraphProps = {
  isFetching: boolean;
  balances: BalancesMap;
  account: Account;
};

export default function BalancesGraph(props: BalancesGraphProps) {
  const categoryBudgets = useContext<CategoryBudget[]>(CategoryBudgetContext);
  const labels = Array.from({ length: 31 }, (_, i) => `${i + 1}`);

  const data: ChartData<'line'> = {
    labels,
    datasets: balancesToGraphData(props.account, props.balances, categoryBudgets),
  };

  const options: ChartOptions<'line'> = {
    aspectRatio: 3,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <IsFetching isFetching={props.isFetching}>
      <Empty items={props.balances} text="There is not yet enough data.">
        <Line data={data} options={options} />
      </Empty>
    </IsFetching>
  );
}
