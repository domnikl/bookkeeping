import { Button, Card, CardActions, CardContent, Link, Stack, Typography } from '@mui/material';
import React from 'react';
import { formatDate, beginOfMonth } from '../../Utils';
import AmountChip from '../atoms/AmountChip';
import ArrowRight from '@mui/icons-material/ArrowRight';
import { AppliedPayment } from 'resources/client/interfaces/Payment';
import { Link as RouterLink } from 'react-router-dom';

type PaymentCardProps = {
  payment: AppliedPayment;
};

export default function PaymentCard(props: PaymentCardProps) {
  let detailsLink = <></>;

  if (props.payment.transaction?.name.startsWith('AMAZON')) {
    const orderId = props.payment.transaction?.summary.split(' ')[0];
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

  const isCurrent = props.payment?.bookingDate >= beginOfMonth(new Date());
  const color = isCurrent ? 'text.primary' : 'grey.600';

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="end" justifyContent="space-between">
          <Stack>
            <Typography variant="h6" component="div" color={color}>
              <Link
                component={RouterLink}
                to={'/categories/' + props.payment.categoryId + '/payments'}
              >
                {props.payment.category.summary}
              </Link>
            </Typography>

            <Typography sx={{ fontSize: 14 }} color={color} component="div">
              {props.payment.summary}
            </Typography>

            <Typography sx={{ fontSize: 10 }} color={color} gutterBottom>
              {formatDate(props.payment.bookingDate ?? new Date())}
            </Typography>
          </Stack>

          <AmountChip amount={props.payment.amount / 100} />
        </Stack>
      </CardContent>
      <CardActions>{detailsLink}</CardActions>
    </Card>
  );
}
