import React from 'react';
import CategoriesList from '../templates/CategoriesList';
import IsFetching from '../atoms/IsFetching';
import Category from 'resources/client/interfaces/Category';
import { useQuery, useQueryClient } from 'react-query';
import { useFetch } from '../../Utils';

const loadCategories = async () => {
  const data = await useFetch<Category[]>('/categories');
  return data.map((x) => ({
    ...x,
    dueDate: x.dueDate ? new Date(x.dueDate) : null,
  }));
};

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
