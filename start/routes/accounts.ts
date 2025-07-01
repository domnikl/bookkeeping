import Route from '@ioc:Adonis/Core/Route';
import AccountModel from 'App/Models/AccountModel';

Route.get('accounts', async () => {
  const accounts = await AccountModel.query().orderBy('sort', 'asc').orderBy('name', 'asc');

  console.log(accounts.map((x) => x.toJSON()));

  return accounts.map((x) => ({
    ...x.toJSON(),
    isActive: x.toJSON().is_active,
  }));
});

Route.put('accounts/:iban', async ({ params, request }) => {
  const account = await AccountModel.findOrFail(params.iban);
  const data = request.body();

  account.merge({
    name: data.name,
    isActive: data.is_active,
    sort: data.sort,
  });

  await account.save();
  return account;
});

Route.post('accounts', async ({ request }) => {
  const data = request.body();
  return await AccountModel.create(data);
});

Route.delete('accounts/:iban', async ({ params }) => {
  const account = await AccountModel.findOrFail(params.iban);
  await account.delete();
  return { success: true };
});
