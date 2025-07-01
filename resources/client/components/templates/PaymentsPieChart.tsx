import React from 'react';
import Empty from '../molecules/Empty';
import IsFetching from '../atoms/IsFetching';
import { ChartData, ChartOptions } from 'chart.js';
import { AppliedPayment } from '../../interfaces/Payment';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useQuery } from 'react-query';
import { loadPaymentsByDateRange } from '../../api';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useTheme, useMediaQuery } from '@mui/material';

ChartJS.register(...registerables);

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

export default function PaymentsPieChart() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentMonth = new Date();
  const fromDate = startOfMonth(currentMonth);
  const toDate = endOfMonth(currentMonth);

  const { data: payments, isLoading: isFetching } = useQuery<AppliedPayment[], Error>(
    ['payments-by-date', fromDate, toDate],
    () => loadPaymentsByDateRange(fromDate, toDate)
  );

  // Group payments by category and sum amounts
  const paymentsByCategory = (payments ?? []).reduce((acc, payment) => {
    const categoryName = payment.category?.summary || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += payment.amount;
    return acc;
  }, {} as Record<string, number>);

  // Convert to chart data format
  const labels = Object.keys(paymentsByCategory);
  const data = Object.values(paymentsByCategory);

  const chartData: ChartData<'pie'> = {
    labels,
    datasets: [
      {
        data: data.map((amount) => amount / 100), // Convert cents to euros
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? ('bottom' as const) : ('right' as const),
        labels: {
          padding: isMobile ? 10 : 20,
          usePointStyle: true,
          color: 'rgba(255, 255, 255, 0.3)',
          font: {
            size: isMobile ? 11 : 14,
            weight: 'normal',
          },
          generateLabels: (chart) => {
            return (
              chart.data.labels?.map((label, index) => ({
                text: label as string,
                fillStyle: colors[index % colors.length],
                strokeStyle: colors[index % colors.length],
                lineWidth: 0,
                pointStyle: 'circle',
                hidden: false,
                index: index,
                color: 'rgba(255, 255, 255, 0.3)',
              })) || []
            );
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          size: isMobile ? 14 : 16,
          weight: 'bold',
        },
        bodyFont: {
          size: isMobile ? 12 : 14,
        },
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: €${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        height: isMobile ? '350px' : '400px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <IsFetching isFetching={isFetching}>
        <Empty
          items={payments ?? null}
          text={`No payments found for ${format(currentMonth, 'MMMM yyyy')}.`}
        >
          <div style={{ flex: 1, minHeight: 0 }}>
            <Pie data={chartData} options={options} />
          </div>
        </Empty>
      </IsFetching>
    </div>
  );
}
