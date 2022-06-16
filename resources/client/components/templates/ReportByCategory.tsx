import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack,
} from '@mui/material';
import React, { useContext, useState } from 'react';
import CategoryBudget from 'resources/client/interfaces/CategoryBudget';
import IsFetching from '../atoms/IsFetching';
import Empty from '../molecules/Empty';
import { CategoryBudgetContext } from '../pages/DashboardPage';
import ReportByCategoryItem from './ReportByCategoryItem';

type ReportByCategoryProps = {
  isFetching: boolean;
};

type CategoryBudgetSortFunction = (a: CategoryBudget, b: CategoryBudget) => number;

const sortBySummary: CategoryBudgetSortFunction = (a: CategoryBudget, b: CategoryBudget) =>
  a.summary > b.summary ? 1 : -1;
const sortByExpected: CategoryBudgetSortFunction = (a: CategoryBudget, b: CategoryBudget) =>
  a.expectedAmount < b.expectedAmount ? -1 : 1;
const sortByAmount: CategoryBudgetSortFunction = (a: CategoryBudget, b: CategoryBudget) =>
  a.amount != null && a.amount < b.amount!! ? -1 : 1;
const sortByRemaining: CategoryBudgetSortFunction = (a: CategoryBudget, b: CategoryBudget) =>
  a.remaining != null && a.remaining < b.remaining!! ? -1 : 1;

export default function ReportByCategory(props: ReportByCategoryProps) {
  const [sortCriteria, setSortCriteria] = useState<CategoryBudgetSortFunction>(() => sortBySummary);
  const categoryBudgets = useContext<CategoryBudget[]>(CategoryBudgetContext);

  const sorted = categoryBudgets.sort(sortCriteria);
  console.log(sortCriteria);
  console.log(categoryBudgets);

  const handleSortClick = (criteria: CategoryBudgetSortFunction) => {
    setSortCriteria(() => criteria);
  }

  return (
    <IsFetching isFetching={props.isFetching}>
      <Empty items={sorted} text="There is not enough data to calculate budgets yet.">
        <Stack direction="row">
          <Button onClick={() => handleSortClick(sortBySummary)}>summary</Button>
          <Button onClick={() => handleSortClick(sortByExpected)}>expected</Button>
          <Button onClick={() => handleSortClick(sortByAmount)}>actual</Button>
          <Button onClick={() => handleSortClick(sortByRemaining)}>remaining</Button>
        </Stack>
        <TableContainer component={Paper}>
          <Table aria-label="report">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Expected</TableCell>
                <TableCell>Actual</TableCell>
                <TableCell>Remaining</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((row) => (
                <ReportByCategoryItem key={row.id} item={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Empty>
    </IsFetching>
  );
}
