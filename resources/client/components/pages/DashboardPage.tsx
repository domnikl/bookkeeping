import { Button, Grid, Stack } from '@mui/material';
import React, { useState } from 'react';
import TransactionsList from '../templates/TransactionsList';
import { getLocalStorage, setLocalStorage } from '../../Utils';
import ReportByCategory from '../templates/ReportByCategory';
import ReportBalances from '../templates/ReportBalances';
import ReportForecast from '../templates/ReportForecast';
import { Link } from 'react-router-dom';
import BalancesGraph from '../templates/BalancesGraph';
import AccountSelect from '../molecules/AccountSelect';
import Account from '../../interfaces/Account';
import Category from 'resources/client/interfaces/Category';
import WrapUpMonth from '../templates/WrapUpMonth';
import { useQuery } from 'react-query';
import { queryClient } from '../../App';
import { loadCategories, loadAccounts } from '../../api';

export default function DashboardPage() {
  const { data: categories } = useQuery<Category[]>('categories', loadCategories);
  const { data: accounts } = useQuery<Account[], Error>('accounts', loadAccounts);

  const [accountForBalances, setAccountForBalances] = useState<Account | null>(
    getLocalStorage<Account | null>('accountForBalances', () => null)
  );

  const refreshReportCategories = () => {
    queryClient.invalidateQueries('report-categories');
  };

  return (
    <>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between">
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={4}>
          <h1>Dashboard</h1>

          <AccountSelect
            items={accounts ?? []}
            onSelect={(a) => {
              setAccountForBalances(a);
              setLocalStorage<Account>('accountForBalances', a);
            }}
            value={accountForBalances}
          />
        </Stack>

        <WrapUpMonth onWrappedUp={refreshReportCategories} categories={categories ?? []} />
      </Stack>

      <Grid container spacing={2}>
        <Grid item md={12} lg={12}>
          <h2>Balance history</h2>

          {accountForBalances && <BalancesGraph account={accountForBalances} />}
        </Grid>

        <Grid item md={12} lg={6}>
          <Stack>
            <Stack direction="row" justifyContent="space-between" alignContent="baseline">
              <h2>New payments</h2>
              <Button component={Link} to="/payments" variant="text">
                see all payments
              </Button>
            </Stack>

            <TransactionsList />
          </Stack>
        </Grid>

        <Grid item md={12} lg={6}>
          <h2>Balances</h2>
          <ReportBalances />
        </Grid>

        <Grid item md={12} lg={6}>
          <h2>Forecast</h2>
          {accountForBalances && <ReportForecast account={accountForBalances} />}
        </Grid>

        <Grid item md={12} lg={6}>
          {accountForBalances && <ReportByCategory account={accountForBalances} />}
        </Grid>
      </Grid>
    </>
  );
}
