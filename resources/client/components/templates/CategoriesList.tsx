import { Edit, Warning } from '@mui/icons-material';
import { Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import Category from 'resources/client/interfaces/Category';
import { formatDate } from '../../Utils';
import AmountChip from '../atoms/AmountChip';
import Empty from '../molecules/Empty';
import { Link } from 'react-router-dom';

type CategoriesListProps = {
  categories: Category[];
  onCategoryCreated: () => void;
};

export default function CategoriesList(props: CategoriesListProps) {
  return (
    <Stack spacing={1}>
      <Empty items={props.categories}>
        {props.categories.map((category: Category) => (
          <Card key={category.id}>
            <CardContent>
              <Stack spacing={1} direction="row" sx={{ justifyContent: 'space-between' }}>
                <Stack spacing={1} justifyItems="right" sx={{ flexGrow: 11 }}>
                  <Stack
                    direction="row"
                    sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
                    spacing={2}
                  >
                    <Stack direction="row" sx={{ alignItems: 'baseline' }} spacing={1}>
                      {!category.isActive && <Warning />}
                      <Typography variant="h6" component="div">
                        {category.summary}
                      </Typography>
                      <Typography sx={{ fontSize: 12 }} color="text.secondary" component="div">
                        {category.parent}
                      </Typography>

                      {category.group && (
                        <Typography sx={{ fontSize: 12 }} color="text.secondary" component="div">
                          ({category.group})
                        </Typography>
                      )}
                    </Stack>
                  </Stack>

                  {category.dueDate !== null ? (
                    <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
                      {formatDate(category.dueDate)}, every {category.every} month
                    </Typography>
                  ) : null}
                  <Typography sx={{ fontSize: 12 }} color="text.secondary" component="div">
                    {category.account}
                  </Typography>
                </Stack>

                <AmountChip amount={category.expectedAmount / 100} />

                <IconButton
                  sx={{ flexGrow: 1, height: '56px', width: '56px' }}
                  size="small"
                  component={Link}
                  to={'/categories/edit/' + category.id}
                >
                  <Edit fontSize="inherit" />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Empty>
    </Stack>
  );
}
