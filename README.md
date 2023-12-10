# bookkeeping

This is my bookkeeping application. It is heavily opinionated and uses PostgreSQL as a storage backend, FinTS to synchronize bank account balances and transactions and Supabase to handle sign ins and auth.

## Refresh access to FinTS

Just login into the UI of your bank and run `node ace fints` afterwards.

## Building it

```sh
npm run build
```

and deploy the build folder to your production environment and run `node ace migration:run` followed by `node server.js` from it.

If you want to use FinTS to automatically import transactions from your accounts, add a _cronjob_ and run the following:

```sh
node ace fints
```

## Development

```sh
docker-compose up -d # to start local DB server
npm run dev
```
