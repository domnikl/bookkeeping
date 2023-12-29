import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import React from 'react';
import CategoryBudget from 'resources/client/interfaces/CategoryBudget';
import AmountChip from '../atoms/AmountChip';
import IsFetching from '../atoms/IsFetching';
import Empty from '../molecules/Empty';
import Account from 'resources/client/interfaces/Account';
import { beginOfMonth, endOfMonth } from '../../Utils';
import { useQuery } from 'react-query';
import { loadBudgets } from '../../api';

type ReportForecastProps = {
  account: Account;
};

const sumTotal = (s: number, item: CategoryBudget, _a, _b) => {
  return s + item.expectedAmount;
};

const sumRemaining = (s: number, item: CategoryBudget, _a, _b) => {
  return s + (item.remainingAmount ?? 0);
};

const sumFilteredBy = (
  categories: CategoryBudget[],
  expression: (x: CategoryBudget) => unknown,
  sum: (s: number, item: CategoryBudget, _a, _b) => number
): number => {
  return categories.filter(expression).reduce<number>(sum, 0);
};

export default function ReportForecast(props: ReportForecastProps) {
  const from = beginOfMonth(new Date());
  const to = endOfMonth(new Date());

  const { isLoading, data: categories } = useQuery<CategoryBudget[], Error>(
    ['report-categories', props.account.iban],
    () => loadBudgets(props.account, from, to)
  );

  const expensesTotal = sumFilteredBy(categories ?? [], (x) => x.expectedAmount < 0, sumTotal);
  const earningsTotal = sumFilteredBy(categories ?? [], (x) => x.expectedAmount > 0, sumTotal);

  const expensesRemaining = sumFilteredBy(
    categories ?? [],
    (x) => x.remainingAmount && x.remainingAmount < 0,
    sumRemaining
  );

  const earningsRemaining = sumFilteredBy(
    categories ?? [],
    (x) => x.remainingAmount && x.remainingAmount > 0,
    sumRemaining
  );

  return (
    <IsFetching isFetching={isLoading}>
      <Empty items={categories ?? []} text="There is not enough data to calculate forecasts yet.">
        <TableContainer component={Paper}>
          <Table aria-label="report">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Earnings</TableCell>
                <TableCell>Expenses</TableCell>
                <TableCell>Sum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Expected</TableCell>
                <TableCell align="right">
                  <AmountChip amount={earningsTotal / 100} />
                </TableCell>
                <TableCell align="right">
                  <AmountChip amount={expensesTotal / 100} />
                </TableCell>
                <TableCell align="right">
                  <AmountChip amount={(expensesTotal + earningsTotal) / 100} />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Remaing</TableCell>
                <TableCell align="right">
                  <AmountChip amount={earningsRemaining / 100} />
                </TableCell>
                <TableCell align="right">
                  <AmountChip amount={expensesRemaining / 100} />
                </TableCell>
                <TableCell align="right">
                  <AmountChip amount={(expensesRemaining + earningsRemaining) / 100} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Empty>
    </IsFetching>
  );
}
