import { Check, Warning } from '@mui/icons-material';
import { Stack, TableCell, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import CategoryBudget from '../../interfaces/CategoryBudget';
import { formatDate, getLocalStorage, setLocalStorage } from '../../Utils';
import AmountChip from '../atoms/AmountChip';
import IsFetching from '../atoms/IsFetching';
import CircularProgressWithLabel from '../molecules/CircularProgressWithLabel';
import Empty from '../molecules/Empty';
import EnhancedTable, { HeadCell } from '../molecules/EnhancedTable';
import { CategoryBudgetContext } from '../pages/DashboardPage';

function remainingColumn(c: CategoryBudget) {
  let contents: any = null;

  if (c.remaining == 0) {
    contents = <Check />;
  } else if (c.remaining == null) {
    contents = (
      <Stack direction="row" justifyContent="space-between">
        <Warning />
        <AmountChip amount={0} />
      </Stack>
    );
  } else {
    contents = <AmountChip amount={c.remaining / 100} />;
  }

  return <TableCell align="right">{contents}</TableCell>;
}

type ReportByCategoryProps = {
  isFetching: boolean;
};

type LocalStorageParams = {
  sortOrder: string;
  sortKey: string;
}

export default function ReportByCategory(props: ReportByCategoryProps) {
  const [sortParams, setSortParams] = useState<LocalStorageParams>(getLocalStorage<LocalStorageParams>('reportByCategorySort', () => { return { sortOrder: 'asc', sortKey: 'summary' }}));
  const categoryBudgets = useContext<CategoryBudget[]>(CategoryBudgetContext);

  useEffect(() => {
    setLocalStorage<LocalStorageParams>('reportByCategorySort', sortParams);
  }, [sortParams]);

  const headCells: HeadCell[] = [
    {
      id: 'summary',
      disablePadding: false,
      label: 'Category',
      numeric: false,
    },
    {
      id: 'expectedAmount',
      disablePadding: false,
      label: 'Expected',
      numeric: true,
    },
    {
      id: 'amount',
      disablePadding: false,
      label: 'Actual',
      numeric: true,
    },
    {
      id: 'remaining',
      disablePadding: false,
      label: 'Remaining',
      numeric: true,
    },
    {
      id: 'percentage',
      disablePadding: false,
      label: '%',
      numeric: true,
    },
  ];

  const cells = [
    (c: CategoryBudget) => (
      <TableCell>
        <Stack direction="column">
          {c.summary}
          <Typography sx={{ fontSize: 12 }} color="text.secondary">
            {!!c.dueDate && formatDate(c.dueDate)}
          </Typography>
        </Stack>
      </TableCell>
    ),
    (c: CategoryBudget) => (
      <TableCell align="right">
        <AmountChip amount={c.expectedAmount / 100} />
      </TableCell>
    ),
    (c: CategoryBudget) => (
      <TableCell align="right">
        <AmountChip amount={(c.amount ?? 0) / 100} />
      </TableCell>
    ),
    remainingColumn,
    (c: CategoryBudget) => (
      <TableCell align='right'>
        <CircularProgressWithLabel value={c.percentage ?? 0.0} />
      </TableCell>
    )
  ];

  return (
    <IsFetching isFetching={props.isFetching}>
      <Empty items={categoryBudgets} text="There is not enough data to calculate budgets yet.">
        <EnhancedTable
          defaultSortKey={sortParams.sortKey}
          defaultSortOrder={sortParams.sortOrder}
          rowsPerPage={100}
          rows={categoryBudgets}
          headCells={headCells}
          cells={cells}
          onSortingChanged={(orderBy, order) => {
            setSortParams({ sortKey: orderBy, sortOrder: order });
          }}
        />
      </Empty>
    </IsFetching>
  );
}
