# Move Keyra (keyra.ie) into the SAT Railway project

This runbook aligns with your goal: **one Railway project (“SAT”)** for `simsecure-auth-backend`, Postgres, and the **Keyra marketing / deployment** Next.js app, instead of a separate “Keyra-only” Railway project.

You **do not** merge the Node codebases. Keyra stays a **separate service** next to `simsecure-auth-backend`. You **can** use the **same PostgreSQL database** both apps already use for auth, as long as you accept that Keyra **Prisma migrations** will add tables alongside the auth service’s SQL tables (different names — no overlap with `auth_users`, `auth_sessions`, etc.).

**Primary workflow below uses the [Railway CLI](https://docs.railway.com/cli)** (`railway link`, `railway add`, `railway variable`, `railway up`, …).

---

## 1. What stays separate vs shared

| Piece | Shared? | Notes |
|--------|---------|--------|
| **Railway project** | Yes | Add Keyra as another **service** in the SAT project (or migrate the existing Keyra service’s settings here). |
| **Postgres plugin** | Recommended | One `DATABASE_URL` for **both** `simsecure-auth-backend` and **Keyra**, e.g. `${{ Postgres.DATABASE_URL }}`. |
| **Keyra app code / deploy** | Own service | Build & start from repo root `Keyra/` (see below). |
| **Auth backend** | Unchanged | Still the source of truth for sessions, hosted login, developer DB tables, etc. |
| **Prisma (Keyra)** | Same DB URL | `prisma migrate deploy` on Keyra startup adds **Keyra-only** tables (`Region`, `AdminUser`, …). |

**Before first production point:** take a **snapshot / backup** of Postgres if Keyra was on a different database and you are consolidating data.

---

## 2. If Keyra currently uses its *own* Postgres

1. **Export / migrate** any data you need from the old Keyra DB (or run migrations once against the SAT DB and re-seed catalog if acceptable).
2. On the new Keyra service, set `DATABASE_URL` to the **same** variable reference as `simsecure-auth-backend` (SAT Postgres).
3. Deploy Keyra once; `npm start` runs `prisma migrate deploy` then catalog seed (see `package.json` / `DEPLOYMENTS.md`).
4. Turn down the **old** Postgres service only after you’ve verified keyra.ie and `/admin` against the new DB.

---

## 3. Railway CLI — Keyra in SAT

### Install & auth

```bash
brew install railway          # or: npm i -g @railway/cli
railway login                 # browser; use: railway login --browserless on SSH
railway whoami
```

### 3a. Link SAT from `Keyra/`

Use the folder that contains `package.json` and `railway.toml` (monorepo: `SIM Project/Keyra`).

```bash
cd Keyra
railway link
```

Pick **workspace** → **SAT** project → **environment** (e.g. production). Non-interactive example:

```bash
railway link --project "<project-name-or-id>" --environment "<env-name-or-id>"
```

Link metadata is stored in **`.railway/`** (typically gitignored).

### 3b. Create the Keyra service (if missing)

**Empty service** — then wire **GitHub** and set **Root Directory = `Keyra`** in the UI for a monorepo:

```bash
cd Keyra
railway add --service keyra-web
railway service keyra-web        # or: railway service  (interactive)
```

**From GitHub** (still set **Root Directory = `Keyra`** if the repo root is the monorepo):

```bash
cd Keyra
railway add --repo your-org/your-repo --service keyra-web
```

Inspect:

```bash
railway service list
railway status
railway service status --all
```

### 3c. Monorepo: Root Directory

If Git is attached at the **monorepo** root, in Railway → Keyra service → **Settings** → **Root Directory** = **`Keyra`**.

### 3d. Variables (CLI)

Use the **real** Postgres plugin name from `railway service list` (often `Postgres`).

```bash
railway variable set 'DATABASE_URL=${{ Postgres.DATABASE_URL }}'
railway variable set 'KEYRA_ADMIN_JWT_SECRET=<32+ char secret>'
railway variable set 'NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL=https://auth.keyra.ie'
railway variable set 'NEXT_PUBLIC_KEYRA_SITE_URL=https://keyra.ie'
# railway variable set 'KEYRA_ADMIN_HOST=admin.keyra.ie'
# railway variable set 'KEYRA_ADMIN_PUBLIC_ORIGIN=https://admin.keyra.ie'
railway variable list
```

Staged variables may need a **deploy** or confirmation in the Railway UI. **Sealed** secrets are not shown in `railway variable list`.

Local run with service env:

```bash
railway run printenv DATABASE_URL
railway run npm run dev
```

### 3e. Deploy & logs

```bash
cd Keyra
railway up --ci -m "Deploy Keyra"           # upload cwd and deploy
railway redeploy --yes --from-source       # rebuild from connected Git branch
railway logs
railway logs --build
```

### 3f. Domains (CLI)

```bash
railway domain
railway domain keyra.ie
```

Detach the same host from the **old** project service so DNS is not split.

### 3g. Auth backend (same SAT project)

From a directory linked to the auth service:

```bash
cd /path/to/simsecure-auth-backend
railway link --project "<SAT>" --environment production --service "<auth-service-name>"
railway service list
railway variable set 'CORS_ALLOWED_ORIGINS=https://keyra.ie,https://www.keyra.ie'
railway variable set 'HOSTED_LOGIN_PUBLIC_URL=https://keyra.ie'
```

Tune values to match production; see **`RAILWAY_ENV.md`**.

---

## 4. Dashboard-only alternative

1. SAT project → **New** → **GitHub Repo** → **Root Directory** `Keyra`.
2. Start command comes from **`Keyra/railway.toml`**.

You can still run **`railway link`** from `Keyra/` afterward for variables, logs, and deploys.

---

## 5. Environment reference (Keyra service)

| Variable | Typical value |
|----------|----------------|
| `DATABASE_URL` | `${{ Postgres.DATABASE_URL }}` (or same reference auth uses) |
| `KEYRA_ADMIN_JWT_SECRET` | ≥32 chars in production |
| `NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL` | e.g. `https://auth.keyra.ie` |
| `NEXT_PUBLIC_KEYRA_SITE_URL` | `https://keyra.ie` / `https://www.keyra.ie` |
| `KEYRA_ADMIN_HOST` / `KEYRA_ADMIN_PUBLIC_ORIGIN` | Optional admin host split |

Details: **`Keyra/DEPLOYMENTS.md`**, **`RAILWAY_ENV.md`**.

---

## 6. Networking & cutover

1. Deploy; test Railway-provided URL first.
2. `railway domain …` or dashboard → attach **keyra.ie** / **www** / **admin** if used.
3. Remove domains from the old project.
4. Retire old Keyra-only project when stable.

---

## 7. events-intelligence (optional)

```bash
cd Keyra/events-intelligence
railway link --project "<SAT>" --environment production
railway add --service events-intelligence    # if needed
railway service events-intelligence
railway variable set 'DATABASE_URL=${{ Postgres.DATABASE_URL }}'
# ADMIN_PASSWORD, ADMIN_SESSION_SECRET, … see events-intelligence/README.md
railway up --ci
```

---

## 8. Checklist

- [ ] `railway login` / `railway link` from **`Keyra/`** → SAT
- [ ] Service exists; **Root Directory** = **`Keyra`** if monorepo
- [ ] `railway variable set` + `railway variable list`; `DATABASE_URL` shared with Postgres/auth plan
- [ ] Auth `CORS_ALLOWED_ORIGINS` + `HOSTED_LOGIN_PUBLIC_URL` updated on auth service
- [ ] `railway up` or redeploy from Git OK; **`railway logs`** clean
- [ ] Domains moved; smoke: `/`, `/global-deployment`, `/admin/login`, hosted login

CLI reference: [docs.railway.com/cli](https://docs.railway.com/cli).
