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
import { DatePicker } from '@mui/lab';
import { removeTimeFromDate, useFetch } from '../../Utils';
import Category from 'resources/client/interfaces/Category';
import { useQuery } from 'react-query';

const loadParents = () => {
  return useFetch<Array<string>>('/categories/parents');
};

type SetupCategoryModalProps = {
  onClose: () => void;
  onSubmit: (category: Category) => void;
  category: null | Category;
};

export default function SetupCategoryModal(props: SetupCategoryModalProps) {
  const [summary, setSummary] = useState<undefined | string>();
  const [every, setEvery] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(10);
  const [dueDate, setDueDate] = useState<null | Date>(null);
  const [parent, setParent] = useState<null | string>();
  const [isActive, setIsActive] = useState<boolean>(false);

  let existingParents: Array<string> = [];
  const { data: parents } = useQuery<Array<string>>('parents', loadParents);

  if (parents !== undefined) {
    existingParents = parents.map((e) => e ?? '');
  }

  useEffect(() => {
    setSummary(props.category?.summary);
    setAmount(props.category?.expectedAmount ?? 0);
    setEvery(props.category?.every ?? null);
    setDueDate(props.category?.dueDate ?? null);
    setParent(props.category?.parent);
    setIsActive(props.category?.isActive ?? false);
  }, [props.category]);

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
    });
  };

  const handleUpdateOnEvery = (newValue: string | number | null) => {
    const every = newValue != '' ? parseInt(newValue?.toString()!!) : null;
    setEvery(every);

    if (every == null) {
      setDueDate(null);
    }
  }

  return (
    <StyledModal open={props.category != null} onClose={handleClose}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Setup category
      </Typography>
      <Typography id="modal-modal-description" sx={{ mt: 2 }}>
        {!!every ? 'This will setup a regular payment that is due every ' + every + ' months.' : ''}
      </Typography>
      <Box component="form">
        <Stack spacing={2}>
          <FormControl fullWidth>
            <TextField
              id="summary"
              label="summary"
              variant="outlined"
              onChange={(e) => setSummary(e.target.value)}
              defaultValue={summary}
            />
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">interval</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              defaultValue={every}
              label="Interval"
              onChange={(e) => handleUpdateOnEvery(e.target.value)}
            >
              <MenuItem value={0}>never</MenuItem>
              <MenuItem value={1}>monthly</MenuItem>
              <MenuItem value={3}>quarterly</MenuItem>
              <MenuItem value={12}>yearly</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <TextField
              id="amount"
              label="expected amount in cents"
              variant="outlined"
              type="number"
              onChange={(e) => setAmount(parseInt(e.target.value))}
              defaultValue={amount}
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
              options={existingParents ?? []}
              onInputChange={(_, newValue: string) => setParent(newValue)}
              defaultValue={parent}
            />
          </FormControl>

          {!!every ? (
            <FormControl fullWidth>
              <DatePicker
                label="due date"
                views={['year', 'month', 'day']}
                openTo="month"
                value={dueDate}
                minDate={new Date('2010-01-01')}
                onChange={(newValue) => {
                  newValue != null
                    ? setDueDate(removeTimeFromDate(new Date(newValue)))
                    : setDueDate(null);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </FormControl>
          ) : null}

          <FormControl fullWidth>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} label="is active" />
            </FormGroup>
          </FormControl>
        </Stack>
      </Box>
      <Button onClick={handleButtonSubmit}>Save</Button>
      <Button onClick={() => props.onClose()}>Cancel</Button>
    </StyledModal>
  );
}
