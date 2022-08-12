import React, { useContext } from 'react';
import Empty from '../molecules/Empty';
import IsFetching from '../atoms/IsFetching';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartDataset, ChartOptions } from 'chart.js';
import Balance, { BalancesMap } from '../../interfaces/Balance';
import CategoryBudget from 'resources/client/interfaces/CategoryBudget';
import { CategoryBudgetContext } from '../pages/DashboardPage';

const sumBudgets = (budget: CategoryBudget[]): number => {
  return budget.reduce((previous, current) => previous + (current.remaining ?? 0), 0) / 100;
}

const buildPrediction = (balances: BalancesMap, categoryBudget: CategoryBudget[]) => {
  const months = Object.keys(balances);
  
  if (months.length == 0) return [];
  
  const lastMonth = months[0];
  const lastBalance = balances[lastMonth][0];

  let balance = lastBalance.amount / 100;

  const withoutDueDate = categoryBudget.filter((c) => c.remaining != 0 && c.dueDate === null);
  const withDueDate = categoryBudget.filter((c) => c.remaining != 0 && c.dueDate !== null);
  const dueDateGone = categoryBudget.filter((c) => c.remaining != 0 && c.dueDate !== null && c.dueDate < new Date());

  const data = new Array(31);
  const d = new Date(lastBalance.bookingDate);
  data[d.getDate() - 1] = lastBalance.amount / 100 + sumBudgets(dueDateGone);

  const daysLeft = 31 - d.getDate();
  const daily = sumBudgets(withoutDueDate) / daysLeft;

  for (let i = d.getDate() + 1; i <= 31; i++) {
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

const balancesToGraphData = (balances: BalancesMap, categoryBudget: CategoryBudget[]): ChartDataset[] => {
  const months = Object.keys(balances);

  const existingValues = months.map((month, index): ChartDataset => {
    const data = new Array(31);
    
    balances[month].forEach((x: Balance) => {
      const index = new Date(x.bookingDate).getDate() - 1;
      data[index] = x.amount / 100;
    });

    const color = colors[index];

    return {
      label: month,
      data: data,
      fill: false,
      backgroundColor: color,
      borderColor: color,
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
