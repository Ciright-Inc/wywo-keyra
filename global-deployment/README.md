# Keyra Global Deployment

Standalone public site for the Keyra deployment map and country/operator registry. Runs separately from the main Keyra marketing app (`keyra.ie`), similar to `events-intelligence/`.

## Local development

```bash
cd global-deployment
cp .env.example .env   # set DATABASE_URL to the same Postgres as Keyra root
npm install

# From Keyra root — seed deployment map once if the database is empty:
# DATABASE_URL="..." npm run db:seed:deploy-catalog

npm run dev
```

Open [http://localhost:3050](http://localhost:3050).

The main Keyra app at `http://localhost:3030/global-deployment` redirects here.

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Same PostgreSQL as main Keyra (deployment registry tables) |
| `NEXT_PUBLIC_GLOBAL_DEPLOYMENT_URL` | This site's public origin |
| `NEXT_PUBLIC_KEYRA_SITE_URL` | Main Keyra marketing site (ecosystem links) |
| `MANDRILL_API_KEY` / `MANDRILL_FROM_EMAIL` | Optional; server access verification emails |

Schema migrations are owned by the **Keyra root** app (`prisma/migrations/`). This app only runs `prisma generate`.

## Production

Deploy as its own Railway service with root directory `global-deployment`. Point `DATABASE_URL` at the shared Postgres and set `NEXT_PUBLIC_GLOBAL_DEPLOYMENT_URL` to the public hostname (e.g. `https://global.keyra.ie`).

Admin edits remain on the main Keyra app at `/admin/deployments`.

## Deploy on Railway (Keyra-Projects / SAT)

Same Railway project as **Postgres**, **keyra-web**, **events-intelligence**, and **simsecure-auth-session** (Ankit Mekwan / Keyra-Projects).

1. **Login** (required if CLI token expired):
   ```bash
   railway login
   ```
2. **Deploy** from this folder:
   ```bash
   cd global-deployment
   chmod +x scripts/railway-deploy.sh
   ./scripts/railway-deploy.sh
   ```
   Or manually:
   ```bash
   railway link --project 161cc1ec-95ff-49d6-a0be-75c3769be820 --environment production
   railway add --service global-deployment   # first time only
   railway service global-deployment
   railway variable set 'DATABASE_URL=${{ Postgres.DATABASE_URL }}'
   railway variable set 'NEXT_PUBLIC_KEYRA_SITE_URL=https://keyra.ie'
   railway up --ci
   ```
3. **Public URL** — after deploy:
   ```bash
   railway domain
   railway variable set 'NEXT_PUBLIC_GLOBAL_DEPLOYMENT_URL=https://<your-domain>'
   ```
4. **Seed data** (if map is empty) — from Keyra root against the same Postgres:
   ```bash
   cd ..
   railway run --service global-deployment printenv DATABASE_URL   # verify
   DATABASE_URL="..." npm run db:seed:deploy-catalog
   ```

Railway sets **`PORT`**; **`npm run start`** binds **`0.0.0.0`**. Schema migrations are owned by the main Keyra app — this service only needs `prisma generate`.
