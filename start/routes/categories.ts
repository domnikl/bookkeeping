import Route from '@ioc:Adonis/Core/Route';
import Database from '@ioc:Adonis/Lucid/Database';

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

Route.get('categories/:categoryId/historic', async ({ request }) => {
  const categoryId = request.params().categoryId;
  const from = request.input('from');
  const to = request.input('to');

  const historicData = await Database.rawQuery(
    `SELECT 
      id,
      category_id,
      summary,
      expected_amount,
      due_date,
      parent,
      account,
      onetime,
      created_at
    FROM historic_categories
    WHERE category_id = ? 
    AND due_date >= ? 
    AND due_date <= ?
    ORDER BY due_date ASC`,
    [categoryId, from, to]
  );

  const category = await CategoryModel.query().where('id', categoryId).first();

  if (category) {
    historicData.rows.push({
      id: null,
      category_id: category.id,
      summary: category.summary,
      expected_amount: category.expectedAmount,
      due_date: new Date(),
      parent: category.parent,
      account: category.account,
      onetime: category.onetime,
      created_at: category.createdAt,
    });
  }

  return historicData.rows.map((row) => ({
    ...row,
    dueDate: row.due_date ? new Date(row.due_date) : null,
    createdAt: new Date(row.created_at),
  }));
});
