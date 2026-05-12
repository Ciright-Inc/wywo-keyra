# Keyra global deployment registry

This feature adds a **public** deployment explorer at `/global-deployment` and an **internal** admin surface under `/admin/deployments`.

## Prerequisites

- Node.js 20+
- `npm install`

## Environment

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | **PostgreSQL** connection string (local Docker, Railway Postgres plugin, etc.). Required for `prisma migrate` and the app. |
| `KEYRA_ADMIN_JWT_SECRET` | **Production:** HS256 secret, **at least 32 characters**, used to sign the `keyra_admin_jwt` cookie after login. In `NODE_ENV=development`, a fixed dev fallback is used when unset. |
| `KEYRA_ADMIN_TOKEN` | Optional **break-glass** shared secret. If set, it can be entered on `/admin/login` (break-glass field) to receive a service JWT, or sent as `Authorization: Bearer …` / raw cookie for scripts. |
| `SEED_ADMIN_PASSWORD` | Used by `prisma/seed.ts` for hashed passwords on the six demo `AdminUser` rows. If unset, seed uses `ChangeMeSeed!123`. |
| `KEYRA_ADMIN_ACTOR_ID` / `KEYRA_ADMIN_ACTOR_ROLE` | Optional labels on audit and status history rows. |
| `MANDRILL_API_KEY` + `MANDRILL_FROM_EMAIL` | Optional; required in production to send server access verification emails. |
| `NEXT_PUBLIC_KEYRA_SITE_URL` | Optional; used in verification email links (defaults to `https://keyra.ie`). |
| `KEYRA_ADMIN_HOST` | Optional; admin hostname only (e.g. `admin.keyra.ie`). When set, `/admin/*` and `/api/admin/*` on any other host redirect here (307). Omit on localhost. |
| `KEYRA_ADMIN_PUBLIC_ORIGIN` | Optional; full origin for that redirect (e.g. `https://admin.keyra.ie`). Defaults to `https://$KEYRA_ADMIN_HOST` in production, `http://$KEYRA_ADMIN_HOST` otherwise. |

### Admin sign-in

1. **Recommended:** After `npm run db:seed`, use a seeded email and password (see table below). Password comes from `SEED_ADMIN_PASSWORD` or the default `ChangeMeSeed!123`.
2. **Break-glass:** If `KEYRA_ADMIN_TOKEN` is set, paste it into the break-glass field on `/admin/login` (email/password are ignored) to receive a short-lived **service** JWT with global scope.

### Seeded admin users (`db:seed`)

| Email | Role |
|--------|------|
| `global@seed.keyra` | Global admin |
| `regional@seed.keyra` | Regional admin (Northern Europe) |
| `country@seed.keyra` | Country admin (Ireland) |
| `telco@seed.keyra` | Telco admin (eir) |
| `compliance@seed.keyra` | Compliance reviewer |
| `readonly@seed.keyra` | Read-only |

## Database

The app uses **PostgreSQL** (Prisma `provider = "postgresql"`). Migrations live under `prisma/migrations/`. If you used an older SQLite-only setup (`file:./dev.db`), replace `DATABASE_URL` in `.env` with PostgreSQL and run `npm run db:migrate:deploy` (or `db:migrate`) against a fresh database, then `npm run db:seed` if you need demo data.

### Local setup

Quick Postgres with Docker:

```bash
docker run --name keyra-pg -e POSTGRES_USER=keyra -e POSTGRES_PASSWORD=keyra -e POSTGRES_DB=keyra \
  -p 5432:5432 -d postgres:16-alpine
```

Then set `DATABASE_URL` in `.env` (see `.env.example`), apply schema, and seed:

```bash
npm run db:migrate:deploy   # or: npm run db:migrate  (creates dev migrations interactively)
npm run db:seed
```

For schema iteration without migration files:

```bash
npm run db:push
npm run db:seed
```

### Production / Railway

1. Add a **PostgreSQL** service in the same Railway project.
2. On the **Keyra** web service, set `DATABASE_URL` to Railway’s reference (e.g. `${{Postgres.DATABASE_URL}}`) or paste the connection string from the Postgres service.
3. Deploy: **`npm run start`** runs **`prisma migrate deploy`** before `next start`, so new migrations apply automatically. Ensure `DATABASE_URL` is available at runtime (it is by default for linked variables).
4. **One-time data:** after the first successful deploy, run seed if you need demo admins and deployment rows (Railway shell or a one-off command):

   ```bash
   npx prisma db seed
   ```

   Set `SEED_ADMIN_PASSWORD` in Railway first if you do not want the default seed password.

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run db:migrate` | `prisma migrate dev` — create/apply migrations in development |
| `npm run db:migrate:deploy` | `prisma migrate deploy` — apply pending migrations (also runs at container start) |
| `npm run db:push` | Push schema without a migration (prototyping only) |
| `npm run db:seed` | Load deployment JSON + admin users |

## Railway checklist

- [ ] Postgres plugin (or external Postgres) and `DATABASE_URL` on the Keyra service
- [ ] `KEYRA_ADMIN_JWT_SECRET` (≥32 characters) for production
- [ ] `NEXT_PUBLIC_KEYRA_SITE_URL` (e.g. `https://www.keyra.ie`)
- [ ] Custom domain **`admin.keyra.ie`** (or your chosen admin host) on the same Keyra service as `www.keyra.ie`
- [ ] `KEYRA_ADMIN_HOST=admin.keyra.ie` and `KEYRA_ADMIN_PUBLIC_ORIGIN=https://admin.keyra.ie` so the main site stops serving admin paths and sends staff to the admin host
- [ ] Optional: `KEYRA_ADMIN_TOKEN`, Mandrill vars, `SEED_ADMIN_PASSWORD` for seeding

## Development

```bash
npm run dev
```

- Public page: `http://localhost:3030/global-deployment`
- Admin UI: `http://localhost:3030/admin/login` → deployments hub

Admin list and edit pages respect **RBAC**: rows are filtered by role and `scopeJson` on `AdminUser`. Mutations use the same rules as `/api/admin/deployments/*` (server actions call the same authorization helpers).

## Tests

```bash
npm test
```

Vitest uses **happy-dom** and **Testing Library** for a smoke test on the public deployment accordion (`GlobalDeploymentView`).

## Notes

- Public data is cached via `unstable_cache` and revalidated after admin mutations that call `revalidatePublicDeployments()` (including server actions under `src/app/admin/deployments/actions.ts`).
- Middleware (`middleware.ts`) checks for a valid JWT or legacy token on `/admin/*` and `/api/admin/*`. Fine-grained RBAC runs in route handlers and server actions.
- Event emission for downstream Rust/Kafka consumers is stubbed in `src/lib/deployments/emitDeploymentEvent.ts` with TODO wiring.
