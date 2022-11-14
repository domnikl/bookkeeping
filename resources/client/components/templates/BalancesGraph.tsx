import React, { useContext } from 'react';
import Empty from '../molecules/Empty';
import IsFetching from '../atoms/IsFetching';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartDataset, ChartOptions } from 'chart.js';
import Balance, { BalancesMap } from '../../interfaces/Balance';
import CategoryBudget from 'resources/client/interfaces/CategoryBudget';
import { CategoryBudgetContext } from '../pages/DashboardPage';

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
  return untilEndOfMonth(start, (date) => (isWorkDay(date) ? 1 : 0))
    .reduce((a, b) => a + b, 0);
}

function untilEndOfMonth(start: Date, fn: (current: Date) => any): Array<any> {
  const mapped = new Array(31);

  for (let i = start.getDate() - 1; i < endOfMonth(start).getDate(); i++) {
    const x = (new Date(start));
    x.setDate(i)

    mapped[i] = fn(x)
  }

  return mapped
}

const sumBudgets = (budget: CategoryBudget[]): number => {
  return budget.reduce((previous, current) => previous + (current.remaining ?? 0), 0) / 100;
}

const buildPrediction = (balances: BalancesMap, categoryBudget: CategoryBudget[]) => {
  const months = Object.keys(balances);
  
  if (months.length == 0) return [];
  
  const lastMonth = months[0];
  const lastBalance = balances[lastMonth][0];

  let balance = lastBalance.amount / 100;
  const start = new Date(lastBalance.bookingDate);

  const withoutDueDate = categoryBudget.filter((c) => c.remaining != 0 && c.dueDate === null);
  const withDueDate = categoryBudget.filter((c) => c.remaining != 0 && c.dueDate !== null && c.dueDate >= start);
  const dueDateGone = categoryBudget.filter((c) => c.remaining != 0 && c.dueDate !== null && c.dueDate < start);

  let remainingFromNonWorkDay = sumBudgets(dueDateGone);
  const daily = sumBudgets(withoutDueDate) / workDaysLeftInMonth(start);

  return untilEndOfMonth(start, (date) => {
    const dueOnThisDay = sumBudgets(withDueDate.filter((c) => c.dueDate?.getDate() == date.getDate()));

    if (isWorkDay(date)) {
      balance += daily + remainingFromNonWorkDay + dueOnThisDay;
      remainingFromNonWorkDay = 0;
    } else {
      remainingFromNonWorkDay += dueOnThisDay;
    }

    return balance;
  });
}

const colors = [
  '#ffa726',
  '#66bb6a',
  '#ef5350',
  '#303f9f',
  '#26a69a',
  '#d4e157',
  '#fff9c4',
  '#ff7043',
  '#78909c',
  '#8d6e63',
  '#9e9d24',
  '#880e4f',
  '#4fc3f7',
];

const balancesToGraphData = (balances: BalancesMap, categoryBudget: CategoryBudget[]): ChartDataset[] => {
  const months = Object.keys(balances);

  const existingValues = months.map((month, index): ChartDataset => {
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
      hidden: index > 3,
    };
  });

  const predictions: ChartDataset[] = [{
    label: 'prediction',
    data: buildPrediction(balances, categoryBudget),
    fill: false,
    backgroundColor: colors[0],
    borderColor: colors[0],
    borderDash: [3, 5],
    hidden: false
  }];

  return predictions.concat(existingValues);
};

type BalancesGraphProps = {
  isFetching: boolean;
  balances: BalancesMap;
};

export default function BalancesGraph(props: BalancesGraphProps) {
  const categoryBudgets = useContext<CategoryBudget[]>(CategoryBudgetContext);

  const data: ChartData = {
    labels: Array.from({ length: 31 }, (_, i) => i + 1),
    datasets: balancesToGraphData(props.balances, categoryBudgets),
  };

  const options: ChartOptions = {
    aspectRatio: 3,
    scales: {
      xAxes: {
        grid: {
          color: 'rgba(155, 155, 155, 0.3)',
        },
      },
      yAxes: {
        grid: {
          color: 'rgba(155, 155, 155, 0.5)',
        },
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
