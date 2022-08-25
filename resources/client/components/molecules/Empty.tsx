import { Box, Typography } from '@mui/material';
import React from 'react';

type EmptyProps = {
  items: Array<any> | Object | null;
  children: any;
  text?: string;
};

function hasData(items: Array<any> | Object | null) {
  if (items instanceof Array) {
    return items.length > 0;
  } else if (items instanceof Object) {
    return Object.keys(items).length > 0;
  } else {
    return !!items;
  }
}

export default function Empty(props: EmptyProps) {
  const text = props.text ?? 'No data';
  const x = hasData(props.items);

  return (
    <>
      {!x && (
        <Box>
          <Typography
            sx={{ fontSize: 12, textAlign: 'center' }}
            color="text.secondary"
            gutterBottom
          >
            {text}
          </Typography>
        </Box>
      )}
      {x && props.children}
    </>
  );
}
