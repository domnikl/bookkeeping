import { Button, Grid, Stack } from '@mui/material';
import React, { createContext, useState } from 'react';
import TransactionsList from '../templates/TransactionsList';
import {
  beginOfMonth,
  endOfMonth,
  formatDate,
  getLocalStorage,
  setLocalStorage,
  useFetch,
} from '../../Utils';
import ReportByCategory from '../templates/ReportByCategory';
import ReportBalances from '../templates/ReportBalances';
import ReportForecast from '../templates/ReportForecast';
import { calculateBudget } from '../../CategoryBudget';
import { Link } from 'react-router-dom';
import BalancesGraph from '../templates/BalancesGraph';
import AccountSelect from '../molecules/AccountSelect';
import Account from '../../interfaces/Account';
import { BalancesMap } from '../../interfaces/Balance';
import CategoryBudget from 'resources/client/interfaces/CategoryBudget';
import Category from 'resources/client/interfaces/Category';
import WrapUpMonth from '../templates/WrapUpMonth';
import { format } from 'date-fns';
import { useQuery } from 'react-query';
import { queryClient } from '../../App';

export const CategoryBudgetContext = createContext<CategoryBudget[]>([]);

const loadAccounts = () => {
  return useFetch<Account[]>('/accounts');
};

const loadCategories = () => {
  return useFetch<Category[]>('/categories').then((data) =>
    data.map((x) => ({ ...x, dueDate: x.dueDate ? new Date(x.dueDate) : null }))
  );
};

const loadBalances = (iban: string, from: Date, to: Date) => {
  return useFetch<BalancesMap>(
    `/balances/${iban}/${format(from, 'yyyy-MM-dd')}/${format(to, 'yyyy-MM-dd')}`
  );
};

const loadReportCategories = (from: Date, to: Date) => {
  return useFetch<CategoryBudget[]>('/reports/' + formatDate(from) + '/' + formatDate(to)).then(
    (data) =>
      calculateBudget(
        data.map((x) => ({
          ...x,
          amount: x.amount != null ? parseInt(x.amount?.toString()) : null,
          expectedAmount: parseInt(x.expectedAmount.toString()),
          dueDate: x.dueDate != null ? new Date(x.dueDate) : null,
        }))
      )
  );
};

export default function DashboardPage() {
  const from = beginOfMonth(new Date());
  const to = endOfMonth(new Date());

  const d = new Date();
  d.setMonth(d.getMonth() - 12);
  const balancesGraphStartDate = beginOfMonth(d);

  const { data: categories } = useQuery<Category[]>('categories', loadCategories);

  const { data: accounts } = useQuery<Account[], Error>('accounts', loadAccounts);
  const { isLoading: isLoadingReportCategories, data: reportCategories } = useQuery<
    CategoryBudget[],
    Error
  >('report-categories', () => loadReportCategories(from, to));

  const [accountForBalances, setAccountForBalances] = useState<Account | null>(
    getLocalStorage<Account | null>('accountForBalances', () => null)
  );

  let balances: BalancesMap | undefined = {};
  let isFetchingBalances = false;

  ({ data: balances, isLoading: isFetchingBalances } = useQuery<BalancesMap, Error>(
    ['balances', accountForBalances, balancesGraphStartDate],
    () => loadBalances(accountForBalances?.iban ?? '', balancesGraphStartDate, new Date())
  ));

  const refreshReportCategories = () => {
    queryClient.invalidateQueries('report-categories');
  };

  const handleCategoryCreated = () => {
    queryClient.invalidateQueries('categories');
  };

  const handleTransactionApplied = () => {
    queryClient.invalidateQueries('report-categories');
  };

  return (
    <>
      <CategoryBudgetContext.Provider value={reportCategories ?? []}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between">
          <h1>Dashboard</h1>
          <WrapUpMonth onWrappedUp={refreshReportCategories} categories={categories ?? []} />
        </Stack>

        <Grid container spacing={2}>
          <Grid item md={12} lg={6}>
            <Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <h2>Balance history</h2>
                <AccountSelect
                  items={accounts ?? []}
                  onSelect={(a) => {
                    setAccountForBalances(a);
                    setLocalStorage<Account>('accountForBalances', a);
                  }}
                  value={accountForBalances}
                />
              </Stack>

              {!!balances && <BalancesGraph isFetching={isFetchingBalances} balances={balances ?? []} />}
            </Stack>
            <Stack>
              <Stack direction="row" justifyContent="space-between" alignContent="baseline">
                <h2>Budget</h2>
                <Button component={Link} to="/categories" variant="text">
                  setup categories
                </Button>
              </Stack>

              <ReportByCategory isFetching={isLoadingReportCategories} />
            </Stack>
          </Grid>
          <Grid item md={12} lg={6}>
            <Stack>
              <Stack>
                <h2>Balances</h2>
                <ReportBalances />
              </Stack>
              <Stack>
                <h2>Forecast</h2>
                <ReportForecast isFetching={isLoadingReportCategories} />
              </Stack>
              <Stack>
                <Stack direction="row" justifyContent="space-between" alignContent="baseline">
                  <h2>New payments</h2>
                  <Button component={Link} to="/payments" variant="text">
                    see all payments
                  </Button>
                </Stack>

                <TransactionsList
                  onCategoryCreated={handleCategoryCreated}
                  onTransactionApplied={handleTransactionApplied}
                  categories={categories ?? []}
                />
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CategoryBudgetContext.Provider>
    </>
  );
}
