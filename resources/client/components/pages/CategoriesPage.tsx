import React from 'react';
import CategoriesList from '../templates/CategoriesList';
import IsFetching from '../atoms/IsFetching';
import Category from 'resources/client/interfaces/Category';
import { useQuery } from 'react-query';
import { loadCategories } from '../../api';
import { Button, Stack } from '@mui/material';
import { Add } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function CategoriesPage() {
  const {
    isLoading,
    error,
    data: categories,
  } = useQuery<Category[], Error>('categories', loadCategories);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <h1>Categories</h1>
        <Button variant="contained" startIcon={<Add />} component={Link} to="/categories/create">
          Create New Category
        </Button>
      </Stack>
      <IsFetching isFetching={isLoading} error={error}>
        <CategoriesList categories={categories!!} />
      </IsFetching>
    </>
  );
}
