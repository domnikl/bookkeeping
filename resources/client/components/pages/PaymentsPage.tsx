import React from 'react';
import { useQuery } from 'react-query';
import { AppliedPayment } from 'resources/client/interfaces/Payment';
import IsFetching from '../atoms/IsFetching';
import PaymentsList from '../templates/PaymentsList';
import { loadPayments } from '../../api';

export default function PaymentsPage() {
  const {
    isLoading,
    error,
    data: payments,
  } = useQuery<AppliedPayment[], Error>('applied-payments', loadPayments);

  return (
    <>
      <h1>Payments</h1>
      <IsFetching isFetching={isLoading} error={error}>
        <PaymentsList payments={payments!!} />
      </IsFetching>
    </>
  );
}
