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
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DatePicker } from '@mui/x-date-pickers';
import { removeTimeFromDate } from '../../Utils';
import WarningIcon from '@mui/icons-material/Warning';
import Category from '../../interfaces/Category';
import Transaction from '../../interfaces/Transaction';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import { applyPayment, loadCategories, loadTransaction } from '../../api';
import { useQuery } from 'react-query';

export async function loader({ params }) {
  return { transaction: await loadTransaction(params.transactionId) };
}

export default function ApplyTransactionPage() {
  const navigate = useNavigate();
  const { transaction } = useLoaderData() as { transaction: Transaction };
  const { data: categories } = useQuery<Category[], Error>('categories', loadCategories);

  const [summary, setSummary] = useState<string>(transaction?.summary ?? '');
  const [amount, setAmount] = useState<number>(transaction?.amount ?? 0);
  const [bookingDate, setBookingDate] = useState<Date>(transaction?.bookingDate ?? new Date());
  const [categoryId, setCategoryId] = useState<string>('');

  const handleButtonSubmit = () => {
    applyPayment({
      id: uuidv4(),
      bookingDate: bookingDate,
      summary: summary ?? '',
      amount: amount,
      transactionId: transaction?.id.toString() ?? '',
      categoryId: categoryId,
      transaction: transaction,
    }).then(() => {
      navigate('/');
    });
  };

  return (
    <>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Apply payment
      </Typography>

      <Box component="form">
        <Stack spacing={2}>
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
              {(categories ?? [])
                .filter((e) => e.account === transaction?.accountIban)
                .map((r: Category) => (
                  <MenuItem value={r.id} key={r.id}>
                    <Stack direction="row" alignContent="center" justifyContent="space-between">
                      {r.summary} {!r.isActive && <WarningIcon />}
                    </Stack>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <TextField
              id="summary"
              label="summary"
              variant="outlined"
              onChange={(e) => setSummary(e.target.value.substr(0, 100))}
              value={summary}
            />
          </FormControl>

          <FormControl fullWidth>
            <TextField
              id="amount"
              label="amount in cents"
              variant="outlined"
              type="number"
              onChange={(e) => setAmount(parseInt(e.target.value))}
              value={amount}
            />
          </FormControl>

          <FormControl fullWidth>
            <DatePicker
              label="booking date"
              views={['year', 'month', 'day']}
              openTo="day"
              value={bookingDate}
              minDate={new Date('2010-01-01')}
              onChange={(newValue) => {
                newValue !== null ? setBookingDate(removeTimeFromDate(newValue)) : new Date();
              }}
            />
          </FormControl>
        </Stack>
      </Box>
      <Button onClick={handleButtonSubmit}>Save</Button>
      <Button component={Link} to="/">
        Cancel
      </Button>
    </>
  );
}
