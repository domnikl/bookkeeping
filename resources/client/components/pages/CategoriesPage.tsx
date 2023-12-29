import React from 'react';
import CategoriesList from '../templates/CategoriesList';
import IsFetching from '../atoms/IsFetching';
import Category from 'resources/client/interfaces/Category';
import { useQuery, useQueryClient } from 'react-query';
import { loadCategories } from '../../api';

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  const {
    isLoading,
    error,
    data: categories,
  } = useQuery<Category[], Error>('categories', loadCategories);

  return (
    <>
      <h1>Categories</h1>
      <IsFetching isFetching={isLoading} error={error}>
        <CategoriesList
          categories={categories!!}
          onCategoryCreated={() => queryClient.invalidateQueries(['categories'])}
        />
      </IsFetching>
    </>
  );
}
