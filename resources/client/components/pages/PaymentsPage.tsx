import React from 'react';
import { useQuery } from 'react-query';
import { AppliedPayment } from 'resources/client/interfaces/Payment';
import IsFetching from '../atoms/IsFetching';
import PaymentsList from '../templates/PaymentsList';
import { loadCategory, loadPayments } from '../../api';
import Category from 'resources/client/interfaces/Category';
import { useLoaderData } from 'react-router-dom';
import { Warning } from '@mui/icons-material';

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
        Payments
        {loaderData?.category ? ' for ' + loaderData?.category?.summary : ''} {isActive}
      </h1>
      <IsFetching isFetching={isLoading} error={error}>
        <PaymentsList payments={payments!!} />
      </IsFetching>
    </>
  );
}
