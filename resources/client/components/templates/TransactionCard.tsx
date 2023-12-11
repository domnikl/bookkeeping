import { Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material';
import React from 'react';
import { formatDate } from '../../Utils';
import AmountChip from '../atoms/AmountChip';
import ArrowRight from '@mui/icons-material/ArrowRight';
import Transaction from '../../interfaces/Transaction';

type TransactionCardProps = {
  transaction: Transaction;
  onSetupCategory: (payment: Transaction) => void;
  onApply: (payment: Transaction) => void;
};

export default function TransactionCard(props: TransactionCardProps) {
  const additionalInformation = [
    props.transaction.summary,
    props.transaction.accountIban,
    formatDate(props.transaction.bookingDate),
  ];

  const additional = additionalInformation.filter((x) => x != '');

  const handleSetupCategory = () => {
    props.onSetupCategory(props.transaction);
  };

  let detailsLink = <></>;

  if (props.transaction.name.startsWith('AMAZON')) {
    const orderId = props.transaction.summary.split(' ')[0];
    detailsLink = (
      <Button
        href={
          'https://www.amazon.de/gp/your-account/order-details/ref=ppx_yo_dt_b_order_details_o00?ie=UTF8&orderID=' +
          orderId
        }
      >
        <ArrowRight /> Amazon
      </Button>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 10 }} color="text.secondary" gutterBottom>
          {additional.join(' · ')}
        </Typography>

        <Typography variant="h6" component="div">
          {props.transaction.name}
        </Typography>

        {props.transaction.accountIban && (
          <Typography sx={{ fontSize: 12 }} color="text.secondary">
            {props.transaction.accountIban}
          </Typography>
        )}

        <Stack direction="row" justifyContent="right">
          <AmountChip amount={props.transaction.amount / 100} />
        </Stack>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => props.onApply(props.transaction)}>
          Apply
        </Button>
        <Button size="small" onClick={handleSetupCategory}>
          Setup category
        </Button>
        {detailsLink}
      </CardActions>
    </Card>
  );
}
