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
import { useTheme, useMediaQuery } from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        borderWidth: isMobile ? 3 : 2,
        pointRadius: isMobile ? 4 : 3,
        pointHoverRadius: isMobile ? 6 : 5,
      };
    }),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: isMobile ? 1.5 : 3,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: isMobile ? 15 : 20,
          font: {
            size: isMobile ? 12 : 14,
          },
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: isMobile ? 14 : 16,
        },
        bodyFont: {
          size: isMobile ? 12 : 14,
        },
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: €${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Day of Month',
          font: {
            size: isMobile ? 12 : 14,
          },
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
          maxTicksLimit: isMobile ? 8 : 12,
        },
        grid: {
          display: !isMobile,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Balance (€)',
          font: {
            size: isMobile ? 12 : 14,
          },
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
          callback: function (value) {
            return '€' + value;
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div style={{ height: isMobile ? '300px' : '400px', width: '100%' }}>
      <IsFetching isFetching={isFetching}>
        <Empty items={balances ?? null} text="There is not yet enough data.">
          <Line data={data} options={options} />
        </Empty>
      </IsFetching>
    </div>
  );
}
