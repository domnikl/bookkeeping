import React, { useContext } from 'react';
import Empty from '../molecules/Empty';
import IsFetching from '../atoms/IsFetching';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartDataset, ChartOptions } from 'chart.js';
import { formatDate } from '../../Utils';
import Balance from '../../interfaces/Balance';
import CategoryBudget from 'resources/client/interfaces/CategoryBudget';
import { CategoryBudgetContext } from '../pages/DashboardPage';

const sumBudgets = (budget: CategoryBudget[]): number => {
  return budget.reduce((previous, current) => previous + (current.remaining ?? 0), 0) / 100;
}

const buildPrediction = (balances: Balance[], categoryBudget: CategoryBudget[]) => {
  if (balances.length == 0) return [];
  
  const last = balances[0];
  let balance = last.amount / 100;

  const withoutDueDate = categoryBudget.filter((c) => c.remaining != 0 && c.dueDate === null);
  const withDueDate = categoryBudget.filter((c) => c.remaining != 0 && c.dueDate !== null);
  const dueDateGone = categoryBudget.filter((c) => c.remaining != 0 && c.dueDate !== null && c.dueDate < new Date());

  const data = new Array(31);
  data[last.bookingDate.getDate() - 1] = last.amount / 100 + sumBudgets(dueDateGone);

  const daysLeft = 31 - last.bookingDate.getDate();
  const daily = sumBudgets(withoutDueDate) / daysLeft;

  for (let i = last.bookingDate.getDate() + 1; i <= 31; i++) {
    const sumDueCategories = sumBudgets(withDueDate.filter((c) => c.dueDate?.getDate() == i));

    data[i - 1] = balance + sumDueCategories + daily;
    balance = balance + sumDueCategories + daily;
  }

  return data;
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

const balancesToGraphData = (balances: Balance[], categoryBudget: CategoryBudget[]): ChartDataset[] => {
  const byMonth: Map<string, Balance[]> = new Map<string, Balance[]>();
  const byDate: Map<string, Balance> = new Map<string, Balance>();

  const b = balances.sort((a, b) => (a.bookingDate > b.bookingDate ? -1 : 1));

  // take last booking of the day
  b.forEach((x) => {
    const key = formatDate(x.bookingDate);

    if (!byDate.has(key)) {
      byDate.set(formatDate(x.bookingDate), x);
    }
  });

  // group by month
  byDate.forEach((x) => {
    const key = formatDate(x.bookingDate).substr(0, 7);
    const existing = byMonth.get(key) ?? [];

    byMonth.set(key, [...existing, x]);
  });

  const existingValues = Array.from(byMonth).map(([key, balances], index): ChartDataset => {
    const data = new Array(31);

    balances.forEach((x: Balance) => {
      const index = x.bookingDate.getDate() - 1;
      data[index] = x.amount / 100;
    });

    const color = colors[index];

    return {
      label: key,
      data: data,
      fill: false,
      backgroundColor: color,
      borderColor: color,
      hidden: index > 3,
    };
  });

  const predictions: ChartDataset[] = [{
    label: 'prediction',
    data: buildPrediction(b, categoryBudget),
    fill: false,
    backgroundColor: colors[0],
    borderColor: colors[0],
    borderDash: [3, 5],
    hidden: false
  }];

  return existingValues.concat(predictions);
};

type BalancesGraphProps = {
  isFetching: boolean;
  balances: Balance[];
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
