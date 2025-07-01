import React, { useMemo } from 'react';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AppliedPayment } from '../../interfaces/Payment';
import { useTheme, useMediaQuery } from '@mui/material';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { useQuery } from 'react-query';
import { loadHistoricCategory } from '../../api';

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

type PaymentsTimelineGraphProps = {
  payments: AppliedPayment[];
  categoryId?: string;
};

export default function PaymentsTimelineGraph(props: PaymentsTimelineGraphProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Memoize the date range to prevent unnecessary recalculations
  const { startDate, endDate, months } = useMemo(() => {
    const end = new Date();
    const start = subMonths(end, 11);
    const monthList = eachMonthOfInterval({ start, end: end });
    return { startDate: start, endDate: end, months: monthList };
  }, []);

  // Stabilize the query key
  const queryKey = useMemo(() => {
    if (!props.categoryId) return ['historic-category', 'no-category'];
    return [
      'historic-category',
      props.categoryId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
    ];
  }, [props.categoryId, startDate, endDate]);

  // Load historic category data if categoryId is provided
  const { data: historicData } = useQuery(
    queryKey,
    () => (props.categoryId ? loadHistoricCategory(props.categoryId, startDate, endDate) : null),
    {
      enabled: !!props.categoryId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Memoize the payments by month calculation
  const paymentsByMonth = useMemo(() => {
    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthPayments = props.payments.filter((payment) => {
        const paymentDate = new Date(payment.bookingDate);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });

      const totalAmount = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);

      // Find planned amount for this month from historic data
      let plannedAmount = 0;
      if (historicData) {
        const monthHistoric = historicData.find((item) => {
          const itemDate = new Date(item.dueDate);
          return itemDate >= monthStart && itemDate <= monthEnd;
        });
        if (monthHistoric) {
          plannedAmount = monthHistoric.expected_amount / 100; // Convert cents to euros
        }
      }

      return {
        month: format(month, 'MMM yyyy'),
        total: totalAmount / 100, // Convert cents to euros
        planned: plannedAmount,
        count: monthPayments.length,
      };
    });
  }, [months, props.payments, historicData]);

  // Memoize the datasets
  const datasets = useMemo(() => {
    const baseDatasets: any[] = [
      {
        label: 'Actual',
        data: paymentsByMonth.map((item) => item.total),
        fill: false,
        backgroundColor: colors[0],
        borderColor: colors[0],
        borderWidth: isMobile ? 2 : 1,
        pointRadius: isMobile ? 3 : 2,
        pointHoverRadius: isMobile ? 5 : 4,
        tension: 0.1,
      },
    ];

    // Add planned amounts line if we have historic data
    if (historicData && historicData.length > 0) {
      baseDatasets.push({
        label: 'Planned',
        data: paymentsByMonth.map((item) => item.planned),
        fill: false,
        backgroundColor: colors[2],
        borderColor: colors[2],
        borderWidth: isMobile ? 2 : 1,
        pointRadius: isMobile ? 3 : 2,
        pointHoverRadius: isMobile ? 5 : 4,
        borderDash: [8, 4],
        tension: 0.1,
      });
    }

    return baseDatasets;
  }, [paymentsByMonth, historicData, isMobile]);

  const data: ChartData<'line'> = useMemo(
    () => ({
      labels: paymentsByMonth.map((item) => item.month),
      datasets,
    }),
    [paymentsByMonth, datasets]
  );

  const options: ChartOptions<'line'> = useMemo(
    () => ({
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
            color: 'rgba(255, 255, 255, 0.7)',
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
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              const monthIndex = context.dataIndex;
              const monthData = paymentsByMonth[monthIndex];

              if (label === 'Planned Amount') {
                return `${label}: €${value.toFixed(2)}`;
              } else {
                return `${label}: €${value.toFixed(2)} (${monthData.count} payments)`;
              }
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Month',
            font: {
              size: isMobile ? 12 : 14,
            },
            color: 'rgba(255, 255, 255, 0.7)',
          },
          ticks: {
            font: {
              size: isMobile ? 10 : 12,
            },
            color: 'rgba(255, 255, 255, 0.7)',
            maxTicksLimit: isMobile ? 6 : 12,
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            display: !isMobile,
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Amount (€)',
            font: {
              size: isMobile ? 12 : 14,
            },
            color: 'rgba(255, 255, 255, 0.7)',
          },
          ticks: {
            font: {
              size: isMobile ? 10 : 12,
            },
            color: 'rgba(255, 255, 255, 0.7)',
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
    }),
    [isMobile, paymentsByMonth]
  );

  return (
    <div
      style={{
        height: isMobile ? '300px' : '400px',
        width: '100%',
        marginBottom: '20px',
      }}
    >
      <Line data={data} options={options} />
    </div>
  );
}
