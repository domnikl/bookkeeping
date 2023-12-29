import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
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
import { DatePicker } from '@mui/x-date-pickers';
import { removeTimeFromDate } from '../../Utils';
import Category from 'resources/client/interfaces/Category';
import { useQuery } from 'react-query';
import Account from 'resources/client/interfaces/Account';
import { loadAccounts, loadGroups, loadParents } from '../../api';

type SetupCategoryModalProps = {
  onClose: () => void;
  onSubmit: (category: Category) => void;
  category: null | Category;
};

export default function SetupCategoryModal(props: SetupCategoryModalProps) {
  const [summary, setSummary] = useState<string>('');
  const [every, setEvery] = useState<number | null>(1);
  const [amount, setAmount] = useState<number>(10);
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [parent, setParent] = useState<string>('');
  const [group, setGroup] = useState<string>('');
  const [account, setAccount] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  const { data: parents } = useQuery<Array<Category>>('parents', loadParents);
  const { data: groups } = useQuery<Array<Category>>('groups', loadGroups);
  const { data: accounts } = useQuery<Array<Account>>('accounts', loadAccounts);

  useEffect(() => {
    setSummary(props.category?.summary ?? '');
    setAmount(props.category?.expectedAmount ?? 0);
    setEvery(props.category?.every ?? 1);
    setDueDate(props.category?.dueDate ?? null);
    setParent(props.category?.parent ?? '');
    setGroup(props.category?.group ?? '');
    setAccount(props.category?.account ?? '');
    setIsActive(props.category?.isActive ?? false);
  }, [props.category]);

  useEffect(() => {
    if (every === 0) {
      setDueDate(null);
    }
  }, [every]);

  const handleClose = () => {
    props.onClose();
  };

  const handleButtonSubmit = () => {
    props.onSubmit({
      id: props.category?.id ?? uuidv4(),
      summary: summary ?? '',
      every: every,
      expectedAmount: amount,
      dueDate: dueDate,
      isActive: isActive,
      parent: parent ?? null,
      group: group ?? null,
      account: account,
    });
  };

  const handleUpdateOnEvery = (newValue: string | number | null) => {
    const every = newValue !== '' ? parseInt(newValue?.toString()!!) : null;
    setEvery(every);

    if (every === null) {
      setDueDate(null);
    }
  };

  return (
    <StyledModal open={props.category !== null} onClose={handleClose}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Setup category
      </Typography>
      <Typography id="modal-modal-description" sx={{ mt: 2 }}>
        {every ? 'This will setup a regular payment that is due every ' + every + ' months.' : ''}
      </Typography>
      <Box component="form">
        <Stack spacing={2}>
          <FormControl fullWidth>
            <TextField
              id="summary"
              label="summary"
              variant="outlined"
              onChange={(e) => setSummary(e.target.value)}
              value={summary}
            />
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="account-label">account</InputLabel>
            <Select
              labelId="account-label"
              id="account"
              value={account}
              label="Account"
              onChange={(e) => setAccount(e.target.value)}
            >
              {accounts?.map((a) => (
                <MenuItem key={a.iban} value={a.iban}>
                  {a.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <TextField
              id="amount"
              label="expected amount in cents"
              variant="outlined"
              type="number"
              onChange={(e) => setAmount(parseInt(e.target.value))}
              value={amount}
            />
          </FormControl>

          <FormControl fullWidth>
            <Autocomplete
              freeSolo
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="parent"
              renderInput={(params) => (
                <TextField
                  {...params}
                  key={parent}
                  label="Parent"
                  variant="outlined"
                  onChange={(e) => setParent(e.target.value)}
                />
              )}
              options={parents?.map((e: Category) => e.parent ?? '') ?? []}
              onInputChange={(_, newValue: string) => setParent(newValue)}
              value={parent}
            />
          </FormControl>

          <FormControl fullWidth>
            <Autocomplete
              freeSolo
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="group"
              renderInput={(params) => (
                <TextField
                  {...params}
                  key={group}
                  label="Group"
                  variant="outlined"
                  onChange={(e) => setGroup(e.target.value)}
                />
              )}
              options={groups?.map((e: Category) => e.group ?? '') ?? []}
              onInputChange={(_, newValue: string) => setGroup(newValue)}
              value={group}
            />
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="interval-label">interval</InputLabel>
            <Select
              labelId="interval-label"
              id="interval"
              value={every}
              label="Interval"
              onChange={(e) => handleUpdateOnEvery(e.target.value)}
            >
              <MenuItem value={0}>never</MenuItem>
              <MenuItem value={1}>monthly</MenuItem>
              <MenuItem value={3}>quarterly</MenuItem>
              <MenuItem value={12}>yearly</MenuItem>
            </Select>
          </FormControl>

          {every ? (
            <FormControl fullWidth>
              <DatePicker
                label="due date"
                views={['year', 'month', 'day']}
                openTo="month"
                value={dueDate}
                minDate={new Date('2010-01-01')}
                onChange={(newValue) => {
                  newValue !== null
                    ? setDueDate(removeTimeFromDate(new Date(newValue)))
                    : setDueDate(null);
                }}
              />
            </FormControl>
          ) : null}

          <FormControl fullWidth>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                }
                label="is active"
              />
            </FormGroup>
          </FormControl>
        </Stack>
      </Box>
      <Button onClick={handleButtonSubmit}>Save</Button>
      <Button onClick={() => props.onClose()}>Cancel</Button>
    </StyledModal>
  );
}
