import { Stack } from '@mui/material';
import React, { useState } from 'react';
import { useFetch, usePostFetch } from '../../Utils';
import Empty from '../molecules/Empty';
import IsFetching from '../atoms/IsFetching';
import ApplyIncomingPaymentModal from './ApplyIncomingPaymentModal';
import IncomingPaymentCard from './IncomingPaymentCard';
import SetupCategoryModal from './SetupCategoryModal';
import IncomingPayment from 'resources/client/interfaces/IncomingPayment';
import Category from 'resources/client/interfaces/Category';
import Payment from 'resources/client/interfaces/Payment';
import { v4 as uuidv4 } from 'uuid';
import { useQuery, useQueryClient } from 'react-query';

const loadIncomingPayments = () => {
  return useFetch<IncomingPayment[]>('/incoming-payments').then((data) =>
    data.map((x) => ({ ...x, bookingDate: new Date(x.bookingDate) }))
  );
};

const applyCategory = (category: Category) => {
  return usePostFetch('/categories', category);
};

const applyPayment = (payment: Payment) => {
  return usePostFetch('/payments', payment);
};

type IncomingPaymentsListProps = {
  onCategoryCreated: (category: Category) => void;
  onIncomingPaymentApplied: (payment: Payment) => void;
  categories: Category[];
};

export default function IncomingPaymentsList(props: IncomingPaymentsListProps) {
  const [incomingPaymentToSetupCategory, setIncomingPaymentToSetupCategory] =
    useState<null | Category>(null);
  const [incomingPaymentToApply, setIncomingPaymentToApply] = useState<null | IncomingPayment>(
    null
  );

  const queryClient = useQueryClient();
  const {
    isLoading,
    data: incomingPayments,
  } = useQuery<IncomingPayment[], Error>('incoming-payments', loadIncomingPayments);

  const handleCloseApply = () => {
    setIncomingPaymentToApply(null);
  };

  const handleApply = (incomingPayment: IncomingPayment): void => {
    setIncomingPaymentToApply(incomingPayment);
  };

  const handleSubmitApply = (payment: Payment) => {
    applyPayment(payment).then(() => {
      props.onIncomingPaymentApplied(payment);
      queryClient.invalidateQueries(['incoming-payments']);
      setIncomingPaymentToApply(null);
    });
  };

  const handleSetupCategory = (incomingPayment: IncomingPayment): void => {
    setIncomingPaymentToSetupCategory({
      id: uuidv4(),
      summary: incomingPayment.summary.substring(0, 100),
      expectedAmount: incomingPayment.amount,
      dueDate: incomingPayment.bookingDate,
      parent: null,
      isActive: true,
      every: null
    });
  };

  const handleCloseSetupCategory = () => {
    setIncomingPaymentToSetupCategory(null);
  };

  const handleSubmitSetupCategoryModal = (category: Category) => {
    applyCategory(category).then(() => {
      props.onCategoryCreated(category);
      setIncomingPaymentToSetupCategory(null);
    });
  };

  return (
    <IsFetching isFetching={isLoading}>
      <Empty items={incomingPayments ?? null} text="There are no new payments.">
        <SetupCategoryModal
          onSubmit={handleSubmitSetupCategoryModal}
          onClose={handleCloseSetupCategory}
          category={incomingPaymentToSetupCategory}
        />
        <ApplyIncomingPaymentModal
          onSubmit={handleSubmitApply}
          onClose={handleCloseApply}
          incomingPayment={incomingPaymentToApply}
          categories={props.categories}
        />
        <Stack spacing={1}>
          {(incomingPayments ?? []).map((payment: IncomingPayment) => (
            <IncomingPaymentCard
              incomingPayment={payment}
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
