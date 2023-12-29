import { Check, Warning } from '@mui/icons-material';
import { Button, Stack, TableCell, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import CategoryBudget from '../../interfaces/CategoryBudget';
import {
  beginOfMonth,
  endOfMonth,
  formatDate,
  getLocalStorage,
  setLocalStorage,
  useFetch,
} from '../../Utils';
import AmountChip from '../atoms/AmountChip';
import IsFetching from '../atoms/IsFetching';
import CircularProgressWithLabel from '../molecules/CircularProgressWithLabel';
import Empty from '../molecules/Empty';
import EnhancedTable, { HeadCell } from '../molecules/EnhancedTable';
import { Link } from 'react-router-dom';
import Account from '../../interfaces/Account';
import { useQuery } from 'react-query';

const loadReportCategories = async (account: Account, from: Date, to: Date) => {
  const data = await useFetch<CategoryBudget[]>(
    '/reports/' + account.iban + '/' + formatDate(from) + '/' + formatDate(to)
  );
  return data.map((x) => ({
    ...x,
    dueDate: x.dueDate !== null ? new Date(x.dueDate) : null,
  }));
};

function remainingColumn(c: CategoryBudget) {
  let contents: any;

  if (c.remainingAmount === 0) {
    contents = <Check />;
  } else if (c.remainingAmount === null) {
    contents = (
      <Stack direction="row" justifyContent="space-between">
        <Warning />
        <AmountChip amount={0} />
      </Stack>
    );
  } else {
    contents = <AmountChip amount={c.remainingAmount / 100} />;
  }

  return (
    <TableCell align="right" key={'budget-remaining-' + c.summary}>
      {contents}
    </TableCell>
  );
}

type ReportByCategoryProps = {
  account: Account;
};

type LocalStorageParams = {
  sortOrder: string;
  sortKey: string;
};

export default function ReportByCategory(props: ReportByCategoryProps) {
  const [sortParams, setSortParams] = useState<LocalStorageParams>(
    getLocalStorage<LocalStorageParams>('reportByCategorySort', () => {
      return { sortOrder: 'asc', sortKey: 'summary' };
    })
  );

  const from = beginOfMonth(new Date());
  const to = endOfMonth(new Date());

  const { isLoading, data: categoryBudgets } = useQuery<CategoryBudget[], Error>(
    'report-categories',
    () => loadReportCategories(props.account, from, to)
  );

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
      id: 'actualAmount',
      disablePadding: false,
      label: 'Actual',
      numeric: true,
    },
    {
      id: 'remainingAmount',
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
      <TableCell key={'budget-summary-' + c.summary}>
        <Stack direction="column">
          {c.summary}
          <Typography sx={{ fontSize: 12 }} color="text.secondary">
            {!!c.dueDate && formatDate(c.dueDate)}
          </Typography>
        </Stack>
      </TableCell>
    ),
    (c: CategoryBudget) => (
      <TableCell align="right" key={'budget-expected-' + c.summary}>
        <AmountChip amount={c.expectedAmount / 100} />
      </TableCell>
    ),
    (c: CategoryBudget) => (
      <TableCell align="right" key={'budget-actual-' + c.summary}>
        <AmountChip amount={(c.actualAmount ?? 0) / 100} />
      </TableCell>
    ),
    remainingColumn,
    (c: CategoryBudget) => (
      <TableCell align="right" key={'budget-percentage-' + c.summary}>
        <CircularProgressWithLabel value={c.percentage ?? 0.0} />
      </TableCell>
    ),
  ];

  return (
    <Stack>
      <Stack direction="row" justifyContent="space-between" alignContent="baseline">
        <h2>Budget</h2>
        <Button component={Link} to="/categories" variant="text">
          setup categories
        </Button>
      </Stack>

      <IsFetching isFetching={isLoading}>
        <Empty
          items={categoryBudgets ?? []}
          text="There is not enough data to calculate budgets yet."
        >
          <EnhancedTable
            defaultSortKey={sortParams.sortKey}
            defaultSortOrder={sortParams.sortOrder}
            rowsPerPage={100}
            rows={categoryBudgets ?? []}
            headCells={headCells}
            cells={cells}
            onSortingChanged={(orderBy, order) => {
              setSortParams({ sortKey: orderBy, sortOrder: order });
            }}
          />
        </Empty>
      </IsFetching>
    </Stack>
  );
}
