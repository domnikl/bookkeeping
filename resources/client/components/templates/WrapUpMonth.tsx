import { Button } from '@mui/material';
import React from 'react';
import { format } from 'date-fns';
import Category from '../../interfaces/Category';
import { closeMonth } from '../../api';

type WrapUpMonthProps = {
  categories: Category[];
  onWrappedUp: () => void;
};

export default function WrapUpMonth(props: WrapUpMonthProps) {
  const dueDates = props.categories
    .map((x) => x.dueDate)
    .filter((x) => x !== null)
    .sort((a: Date, b: Date) => (a.getTime() > b.getTime() ? 1 : -1));

  const smallest = dueDates[0] ?? new Date();

  const handleClick = () => {
    if (
      confirm(
        `This will wrap up the month of ${format(
          smallest,
          'LLL. yyyy'
        )} and you will no longer be able to add payments to it. Are you sure?`
      )
    ) {
      closeMonth(smallest).then(props.onWrappedUp);
    }
  };

  return (
    <Button onClick={handleClick} variant="contained">
      Wrap up {format(smallest, 'LLL. yyyy')}
    </Button>
  );
}
