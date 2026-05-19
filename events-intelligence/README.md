This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3040](http://localhost:3040) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Railway (SAT Project / shared Postgres)

This app ships `railway.toml` so you can add it as a **new service** in the same Railway project where **Postgres** and **auth.keyra** (`simsecure-auth-session`) already run.

1. **Create service** → Deploy from GitHub → select this repository → root directory `events-intelligence` (or repo root if this is the only app).
2. **Connect Postgres** → In the Railway canvas, connect your existing **Postgres** plugin/service to this service (or add variable **`DATABASE_URL`** from the Postgres service’s reference). One Postgres database can hold multiple apps if table names do not collide; Prisma here uses its own models (`Event`, etc.).
3. **Database on startup** → `railway.toml` runs **`npm run deploy:db`** before **`npm run start`** so Prisma can reach the private Postgres URL. Set **`SEED_ON_EMPTY_ONLY=true`** after the first successful deploy if you want redeploys to skip re-seeding.
4. **Required variables** (service → Variables):
   - **`ADMIN_PASSWORD`** — operator login
   - **`ADMIN_SESSION_SECRET`** — at least 16 characters
   - **`NEXT_PUBLIC_KEYRA_SITE_URL`** — e.g. `https://keyra.ie`
   - Optional **`NEXT_PUBLIC_PUBLIC_EVENTS_URL`** — public catalogue URL if admin is on another hostname
5. **Auth.keyra** — `simsecure-auth-session` stays a separate HTTP service; this app’s **`/admin`** login remains cookie + `ADMIN_PASSWORD` unless you add SSO separately.

### Railway CLI (deploy from your laptop)

Install the [Railway CLI](https://docs.railway.com/guides/cli) (e.g. `brew install railway`). From **`events-intelligence`** (same folder as `railway.toml`):

```bash
cd events-intelligence
railway login              # once per machine
railway link               # choose project + this service (e.g. SAT → events-intelligence)
railway status             # confirm project, environment, and service

# Upload the current directory and deploy (good for testing config before you push)
railway up --ci -m "Deploy from CLI"

# Or redeploy from the connected Git branch (no local upload)
railway redeploy --yes --from-source
```

Other useful commands: `railway logs`, `railway open`, `railway variable list`, `railway run printenv` (local command with service variables injected).

Railway sets **`PORT`**; **`npm run start`** binds **`0.0.0.0`** and uses that port.

## Deploy on Vercel

You can also use [Vercel](https://vercel.com/new); run database migrations/seed in CI or a release job—do not rely on `next build` alone for `deploy:db`.

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
