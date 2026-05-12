# Keyra global deployment registry

This feature adds a **public** deployment explorer at `/global-deployment` and an **internal** admin surface under `/admin/deployments`.

## Prerequisites

- Node.js 20+
- `npm install`

## Environment

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite for local dev (`file:./dev.db`) or PostgreSQL in production. |
| `KEYRA_ADMIN_JWT_SECRET` | **Production:** HS256 secret, **at least 32 characters**, used to sign the `keyra_admin_jwt` cookie after login. In `NODE_ENV=development`, a fixed dev fallback is used when unset. |
| `KEYRA_ADMIN_TOKEN` | Optional **break-glass** shared secret. If set, it can be entered on `/admin/login` (break-glass field) to receive a service JWT, or sent as `Authorization: Bearer …` / raw cookie for scripts. |
| `SEED_ADMIN_PASSWORD` | Used by `prisma/seed.ts` for hashed passwords on the six demo `AdminUser` rows. If unset, seed uses `ChangeMeSeed!123`. |
| `KEYRA_ADMIN_ACTOR_ID` / `KEYRA_ADMIN_ACTOR_ROLE` | Optional labels on audit and status history rows. |
| `MANDRILL_API_KEY` + `MANDRILL_FROM_EMAIL` | Optional; required in production to send server access verification emails. |
| `NEXT_PUBLIC_KEYRA_SITE_URL` | Optional; used in verification email links (defaults to `https://keyra.ie`). |

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

Initial schema SQL lives under `prisma/migrations/` (SQLite-oriented). For local iteration you can still use:

```bash
npm run db:push
npm run db:seed
```

For migration workflow:

```bash
npm run db:migrate
```

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
