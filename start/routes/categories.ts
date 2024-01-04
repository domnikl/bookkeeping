import Route from '@ioc:Adonis/Core/Route';

import CategoryModel from 'App/Models/CategoryModel';
import { wrapUpMonth } from 'Database/categories';

Route.post('categories', async ({ request }) => {
  const category = request.body();

  await CategoryModel.updateOrCreate({ id: category.id }, category);

  return category;
});

Route.get('categories', async () => {
  return CategoryModel.query().orderBy('summary');
});

Route.get('categories/parents', async () => {
  return CategoryModel.query().whereNotNull('parent').distinct('parent').orderBy('parent');
});

Route.get('categories/groups', async () => {
  return CategoryModel.query().whereNotNull('group').distinct('group').orderBy('group');
});

Route.get('categories/:categoryId', async ({ request }) => {
  return CategoryModel.query()
    .where('id', request.params().categoryId)
    .preload('payments', (query) => {
      query.orderBy('bookingDate', 'desc');
    })
    .first();
});

Route.post('close-month/:date', async ({ request }) => {
  await wrapUpMonth(request.params().date);

  return {};
});
