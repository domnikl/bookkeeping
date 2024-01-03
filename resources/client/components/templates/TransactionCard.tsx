import { Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material';
import React from 'react';
import { formatDate } from '../../Utils';
import AmountChip from '../atoms/AmountChip';
import ArrowRight from '@mui/icons-material/ArrowRight';
import Transaction from '../../interfaces/Transaction';
import { Link } from 'react-router-dom';

type TransactionCardProps = {
  transaction: Transaction;
};

export default function TransactionCard(props: TransactionCardProps) {
  const additionalInformation = [
    props.transaction.summary,
    props.transaction.accountIban,
    formatDate(props.transaction.bookingDate),
  ];

  const additional = additionalInformation.filter((x) => x != '');

  let detailsLink = <></>;
  let urlParams = new URLSearchParams();
  urlParams.set('summary', props.transaction.summary);
  urlParams.set('every', '1');
  urlParams.set('expectedAmount', props.transaction.amount.toString());
  urlParams.set('dueDate', formatDate(props.transaction.bookingDate));
  urlParams.set('isActive', 'true');
  urlParams.set('account', props.transaction.accountIban ?? '');

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
        <Button size="small" component={Link} to={'/transactions/apply/' + props.transaction.id}>
          Apply
        </Button>
        <Button size="small" component={Link} to={'/categories/create?' + urlParams}>
          Setup category
        </Button>
        {detailsLink}
      </CardActions>
    </Card>
  );
}
