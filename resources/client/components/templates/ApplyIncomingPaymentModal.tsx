import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import StyledModal from '../molecules/StyledModal';
import { v4 as uuidv4 } from 'uuid';
import { DatePicker } from '@mui/lab';
import { removeTimeFromDate } from '../../Utils';
import WarningIcon from '@mui/icons-material/Warning';
import Category from 'resources/client/interfaces/Category';
import IncomingPayment from 'resources/client/interfaces/IncomingPayment';
import Payment from 'resources/client/interfaces/Payment';

type ApplyIncomingPaymentModalProps = {
  onClose: () => void;
  onSubmit: (payment: Payment) => void;
  categories: Category[];
  incomingPayment: null | IncomingPayment;
};

export default function ApplyIncomingPaymentModal(props: ApplyIncomingPaymentModalProps) {
  const [summary, setSummary] = useState<undefined | string>(props.incomingPayment?.summary);
  const [amount, setAmount] = useState<number>(10);
  const [bookingDate, setBookingDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState<string>('');

  useEffect(() => {
    setSummary(props.incomingPayment?.summary.substr(0, 100));
    setAmount(props.incomingPayment?.amount ?? 0);
    setBookingDate(removeTimeFromDate(props.incomingPayment?.bookingDate ?? new Date()));
    setCategoryId('');
  }, [props.incomingPayment]);

  const handleClose = () => {
    props.onClose();
  };

  const handleButtonSubmit = () => {
    props.onSubmit({
      id: uuidv4(),
      bookingDate: bookingDate,
      summary: summary ?? '',
      amount: amount,
      incomingPaymentId: props.incomingPayment?.id.toString() ?? '',
      categoryId: categoryId,
      transaction: props.incomingPayment,
    });
  };

  return (
    <StyledModal open={props.incomingPayment != null} onClose={handleClose}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Apply payment
      </Typography>

      <Box component="form">
        <Stack spacing={2}>
          <FormControl fullWidth>
            <TextField
              id="summary"
              label="summary"
              variant="outlined"
              onChange={(e) => setSummary(e.target.value.substr(0, 100))}
              defaultValue={summary}
            />
          </FormControl>

          <FormControl fullWidth>
            <TextField
              id="amount"
              label="amount in cents"
              variant="outlined"
              type="number"
              onChange={(e) => setAmount(parseInt(e.target.value))}
              defaultValue={amount}
            />
          </FormControl>

          <FormControl fullWidth>
            <DatePicker
              label="booking date"
              views={['year', 'month', 'day']}
              openTo="year"
              value={bookingDate}
              minDate={new Date('2010-01-01')}
              onChange={(newValue) => {
                newValue != null ? setBookingDate(removeTimeFromDate(newValue)) : new Date();
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="select-category-label">category</InputLabel>
            <Select
              labelId="select-category-label"
              id="select-category"
              value={categoryId}
              label="Category"
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <MenuItem value=""></MenuItem>
              {props.categories.map((r: Category) => (
                <MenuItem value={r.id} key={r.id}>
                  <Stack direction="row" alignContent="center" justifyContent="space-between">
                    {r.summary} {!r.isActive && <WarningIcon />}
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
      <Button onClick={handleButtonSubmit}>Save</Button>
      <Button onClick={() => props.onClose()}>Cancel</Button>
    </StyledModal>
  );
}
