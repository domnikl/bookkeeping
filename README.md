# bookkeeping

Bookkeeping is a highly opinionated private household management tool.
It uses Postgres as a storage backend and FinTS to synchronize bank account balances and transactions as well as Auth0 to handle sign ins and auth.

## Refresh access to FinTS

Depending on your bank, refreshing access sometimes require to login into another app they provide and run `node ace fints` afterward to resync.
Integration may not work with every bank, you may need to tweak settings as FinTS is a rather obscure protocol.
Please have a look at the [fints](https://github.com/domnikl/fints) fork.

## Building it

```sh
npm run build
```

and deploy the build folder to your production environment and run `node ace migration:run` followed by `node server.js` from it.

## Docker

```sh
docker build -t domnikl/bookkeeping . --network host
```

Fetching balances and transactions from FinTS will run on a schedule, but if you need to do it manually, run the following command:

```sh
node ace fints
```

## Development

```sh
docker-compose up -d # to start local DB server
npm run dev
```
