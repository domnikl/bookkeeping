import { Stack } from '@mui/material';
import React from 'react';
import Empty from '../molecules/Empty';
import IsFetching from '../atoms/IsFetching';
import TransactionCard from './TransactionCard';
import Transaction from '../../interfaces/Transaction';
import { useQuery } from 'react-query';
import { loadTransactions } from '../../api';

export default function TransactionsList() {
  const { isLoading, data: transactions } = useQuery<Transaction[], Error>(
    'transactions',
    loadTransactions
  );

  return (
    <IsFetching isFetching={isLoading}>
      <Empty items={transactions ?? null} text="There are no new payments.">
        <Stack spacing={1}>
          {(transactions ?? []).map((payment: Transaction) => (
            <TransactionCard
              transaction={payment}
              key={payment.id}
            />
          ))}
        </Stack>
      </Empty>
    </IsFetching>
  );
}
