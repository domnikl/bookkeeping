import React from 'react';
import { useQuery } from 'react-query';
import { AppliedPayment } from 'resources/client/interfaces/Payment';
import IsFetching from '../atoms/IsFetching';
import PaymentsList from '../templates/PaymentsList';
import PaymentsTimelineGraph from '../templates/PaymentsTimelineGraph';
import { loadCategory, loadPayments } from '../../api';
import Category from 'resources/client/interfaces/Category';
import { useLoaderData } from 'react-router-dom';
import { Warning } from '@mui/icons-material';
import { Grid } from '@mui/material';

export async function loader({ params }) {
  return { category: await loadCategory(params.categoryId) };
}

export default function PaymentsPage() {
  let isLoading = false;
  let error: Error | undefined | null = undefined;
  let payments: AppliedPayment[] = [];
  let isActive: JSX.Element = <></>;
  const loaderData = useLoaderData() as { category: Category } | undefined;

  if (!loaderData?.category) {
    const query = useQuery<AppliedPayment[], Error>('applied-payments', loadPayments);
    isLoading = query.isLoading;
    error = query.error;
    payments = query.data ?? [];
  } else {
    payments = loaderData.category.payments ?? [];
    isActive = !loaderData.category.isActive ? <Warning /> : <></>;
  }

  return (
    <>
      <h1>
        Category {loaderData?.category ? loaderData?.category?.summary : ''} {isActive}
      </h1>
      <IsFetching isFetching={isLoading} error={error}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <h2>Timeline (Last 12 Months)</h2>
            <PaymentsTimelineGraph payments={payments} categoryId={loaderData?.category?.id} />
          </Grid>
          <Grid item xs={12}>
            <h2>Payments</h2>
            <PaymentsList payments={payments!!} />
          </Grid>
        </Grid>
      </IsFetching>
    </>
  );
}
