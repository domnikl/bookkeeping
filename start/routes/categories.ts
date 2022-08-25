import Route from '@ioc:Adonis/Core/Route';

import CategoryModel from 'App/Models/CategoryModel';
import { wrapUpMonth } from 'Database/categories';

Route.post('categories', async ({ request }) => {
  await CategoryModel.updateOrCreate(request.body(), request.body());

  return request.body();
});

Route.get('categories', async () => {
  return await CategoryModel.query().orderBy('summary');
});

Route.get('categories/parents', async() => {
  return await CategoryModel.query().whereNotNull('parent').distinct('parent').orderBy('parent')
});

Route.post('close-month/:date', async ({ request }) => {
  await wrapUpMonth(request.params().date)

  return {};
});
