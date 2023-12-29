import React from 'react';
import Empty from '../molecules/Empty';
import IsFetching from '../atoms/IsFetching';
import { ChartData, ChartDataset, ChartOptions } from 'chart.js';
import { BalancesForGraph } from '../../interfaces/Balance';

import { Chart as ChartJS, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Account from 'resources/client/interfaces/Account';
import { useQuery } from 'react-query';
import { loadBalances } from '../../api';
ChartJS.register(...registerables);

function removeTimeFromDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
}

export function beginOfMonth(date: Date): Date {
  return removeTimeFromDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function beginNextMonth(date: Date): Date {
  date.setMonth(date.getMonth() + 1);
  return beginOfMonth(date);
}

const colors = [
  '#808080',
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
];

type BalancesGraphProps = {
  account: Account;
};

const d = new Date();
d.setMonth(d.getMonth() - 12);
const startDate = beginOfMonth(d);

export default function BalancesGraph(props: BalancesGraphProps) {
  const labels = Array.from({ length: 31 }, (_, i) => `${i + 1}`);

  const { data: balances, isLoading: isFetching } = useQuery<BalancesForGraph[], Error>(
    ['balances', props.account, startDate],
    () => loadBalances(props.account?.iban ?? '', startDate, new Date())
  );

  const data: ChartData<'line'> = {
    labels,
    datasets: (balances ?? []).map((b, index): ChartDataset<'line'> => {
      return {
        label: b.label,
        data: b.data.map((e) => (e ?? NaN) / 100.0),
        fill: false,
        backgroundColor: colors[index],
        borderColor: colors[index],
        borderDash: b.prediction ? [3, 5] : [],
        hidden: index > 2,
      };
    }),
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
    <IsFetching isFetching={isFetching}>
      <Empty items={balances ?? null} text="There is not yet enough data.">
        <Line data={data} options={options} />
      </Empty>
    </IsFetching>
  );
}
