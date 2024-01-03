import { Stack } from '@mui/material';
import React, { useState } from 'react';
import Empty from '../molecules/Empty';
import IsFetching from '../atoms/IsFetching';
import ApplyTransactionModal from './ApplyTransactionModal';
import TransactionCard from './TransactionCard';
import Transaction from '../../interfaces/Transaction';
import Category from 'resources/client/interfaces/Category';
import Payment from 'resources/client/interfaces/Payment';
import { useQuery, useQueryClient } from 'react-query';
import { applyPayment, loadTransactions } from '../../api';

type TransactionsListProps = {
  onTransactionApplied: (payment: Payment) => void;
  categories: Category[];
};

export default function TransactionsList(props: TransactionsListProps) {
  const [transactionToApply, setTransactionToApply] = useState<null | Transaction>(null);

  const queryClient = useQueryClient();
  const { isLoading, data: transactions } = useQuery<Transaction[], Error>(
    'transactions',
    loadTransactions
  );

  const handleCloseApply = () => {
    setTransactionToApply(null);
  };

  const handleApply = (transaction: Transaction): void => {
    setTransactionToApply(transaction);
  };

  const handleSubmitApply = (payment: Payment) => {
    applyPayment(payment).then(() => {
      props.onTransactionApplied(payment);
      queryClient.invalidateQueries(['transactions']).then(() => setTransactionToApply(null));
    });
  };

  return (
    <IsFetching isFetching={isLoading}>
      <Empty items={transactions ?? null} text="There are no new payments.">
        <ApplyTransactionModal
          onSubmit={handleSubmitApply}
          onClose={handleCloseApply}
          transaction={transactionToApply}
          categories={props.categories}
        />
        <Stack spacing={1}>
          {(transactions ?? []).map((payment: Transaction) => (
            <TransactionCard
              transaction={payment}
              key={payment.id}
              onApply={handleApply}
            />
          ))}
        </Stack>
      </Empty>
    </IsFetching>
  );
}
