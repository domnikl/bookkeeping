import { Stack } from '@mui/material';
import React, { useState } from 'react';
import { useFetch, usePostFetch } from '../../Utils';
import Empty from '../molecules/Empty';
import IsFetching from '../atoms/IsFetching';
import ApplyTransactionModal from './ApplyTransactionModal';
import TransactionCard from './TransactionCard';
import SetupCategoryModal from './SetupCategoryModal';
import Transaction from '../../interfaces/Transaction';
import Category from 'resources/client/interfaces/Category';
import Payment from 'resources/client/interfaces/Payment';
import { v4 as uuidv4 } from 'uuid';
import { useQuery, useQueryClient } from 'react-query';

const loadTransactions = async () => {
  let data = await useFetch<Transaction[]>('/transactions');
  return data.map((x) => ({ ...x, bookingDate: new Date(x.bookingDate) }));
};

const applyCategory = (category: Category) => {
  return usePostFetch('/categories', category);
};

const applyPayment = (payment: Payment) => {
  return usePostFetch('/payments', payment);
};

type TransactionsListProps = {
  onCategoryCreated: (category: Category) => void;
  onTransactionApplied: (payment: Payment) => void;
  categories: Category[];
};

export default function TransactionsList(props: TransactionsListProps) {
  const [transactionToSetupCategory, setTransactionToSetupCategory] = useState<null | Category>(
    null
  );
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

  const handleSetupCategory = (transaction: Transaction): void => {
    setTransactionToSetupCategory({
      id: uuidv4(),
      summary: transaction.summary.substring(0, 100),
      expectedAmount: transaction.amount,
      dueDate: transaction.bookingDate,
      parent: null,
      group: null,
      account: transaction.accountIban,
      isActive: true,
      every: null,
    });
  };

  const handleCloseSetupCategory = () => {
    setTransactionToSetupCategory(null);
  };

  const handleSubmitSetupCategoryModal = (category: Category) => {
    applyCategory(category).then(() => {
      props.onCategoryCreated(category);
      setTransactionToSetupCategory(null);
    });
  };

  return (
    <IsFetching isFetching={isLoading}>
      <Empty items={transactions ?? null} text="There are no new payments.">
        <SetupCategoryModal
          onSubmit={handleSubmitSetupCategoryModal}
          onClose={handleCloseSetupCategory}
          category={transactionToSetupCategory}
        />
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
              onSetupCategory={handleSetupCategory}
            />
          ))}
        </Stack>
      </Empty>
    </IsFetching>
  );
}
