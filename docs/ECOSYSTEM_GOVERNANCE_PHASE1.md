# Keyra — Ecosystem governance (Phase 1 audit & implementation map)

**Status:** Phase 1 complete — read-only inventory and safe sequencing.  
**Companion:** See `simsecure/docs/ECOSYSTEM_GOVERNANCE_PHASE1.md` for the SimSecure / app.keyra surface.  
**Directive:** Refine without breaking routes, auth, APIs, DB contracts, admin workflows, or live data UIs.

---

## 1. Repo role

| Area | Responsibility |
|------|------------------|
| Consumer marketing & app shell | Public pages, trust story, signup/login, verify flows |
| Authenticated consumer | `/app/*`, onboarding, profile, family, settings |
| Enterprise / ops | `/admin/*`, `/global-deployment` |
| Developer surface | `/developers` |
| Backend-in-app | Prisma, `/api/*` including admin SAT protocols, countries, deployments |

**Next.js:** 16.x (App Router under `src/app/`).  
**Styling:** Tailwind v4 + `src/app/globals.css` design tokens and **three design lanes** (see §5).

---

## 2. Route inventory (App Router)

Routes are discovered under `src/app/**/page.tsx` (primary). A **mirrored** tree exists under `web/src/app/` — treat as deployment/sync risk; any change should consider parity or explicit deprecation.

### Public / marketing

- `/` — home  
- `/about`, `/contact`, `/faq`, `/how-it-works`, `/trust`, `/terms`, `/privacy`  
- `/signup`, `/login`, `/hosted-login`, `/callback`  
- `/verify`, `/verify-device` (dedicated layouts where present)

### Consumer app (session-backed)

- `/app`, `/app/profile`, `/app/family`, `/app/settings` — nested `app/layout.tsx`

### Onboarding

- `/onboarding/verify`, `/onboarding/complete`

### Enterprise / admin

- `/admin` — hub  
- `/admin/login` — exempt from full admin gate in middleware  
- `/admin/authentication` — auth segment hub  
- `/admin/authentication/countries`, `/protocols`, `/settings`  
- `/admin/deployments` — hub + nested: `countries`, `telcos`, `regions`, `server-nodes`, `access-domain-rules`, `access-requests`, `audit` + dynamic `[id]` editors  

### Strategic / telco-facing

- `/global-deployment`

### Developer

- `/developers`

---

## 3. Middleware (`middleware.ts`)

| Concern | Behavior |
|---------|----------|
| OIDC shim | `POST /callback` → rewrite to `/api/ipification/oidc-return` |
| Admin host split | Optional redirect of admin traffic to `getAdminPublicOrigin()` when `adminSplitHostEnabled()` |
| Admin protection | `/admin`, `/api/admin` require `adminIsConfigured()` and `isAuthorizedAdmin()` except `/admin/login` and `/api/admin/auth/*` |
| Misconfiguration | Admin UI/API return 503 when admin not configured |
| Design lane SSR | `keyraDesignLaneFromPathname` → header `x-keyra-design-lane` + `no-store` cache headers for shells |

**Non-breaking rule:** Any new protected segment must extend this matrix explicitly; do not weaken admin gates.

---

## 4. Layouts & composition

| Path | Role |
|------|------|
| `src/app/layout.tsx` | Root: Inter, `data-keyra-lane`, `HeaderNoSSR`, `main`, `SiteFooter`, `KeyraSessionProvider`, toasts, optional home agent |
| `src/app/app/layout.tsx` | Authenticated app chrome |
| `src/app/admin/deployments/layout.tsx` | `AdminDeploymentsShell`, `dynamic = "force-dynamic"` |
| `src/app/admin/authentication/layout.tsx` | Auth admin segment shell |
| `src/app/verify-device/layout.tsx` | Device verify flow |

---

## 5. Design governance (already in codebase)

**Lane model** (`src/lib/keyraDesignLane.ts`):

| Lane | Path prefix |
|------|-------------|
| `consumer` | default (public + `/app` etc.) |
| `enterprise` | `/admin`, `/global-deployment` |
| `developer` | `/developers` |

**Tokens:** `globals.css` documents lane-specific overrides on `html[data-keyra-lane=…]` including typography, spacing, motion, radii, shadows.

**Gap vs master prompt:** Lanes are **implicit** (URL-driven), not a visible **global audience switcher**. Adding a switcher must not remap URLs blindly — prefer labels that deep-link to existing routes or copy-only context.

---

## 6. Session & cookies

- `KEYRA_SESSION_COOKIE`, `parseSession`, `KeyraSessionProvider` — root layout reads cookie for SSR initial user.  
**Rule:** Cookie name, payload shape, and protected route checks must remain backward compatible.

---

## 7. Data & operational APIs (high level)

- **Prisma** — migrations + seeds (`npm start` path includes deploy catalog seeding per `package.json`).  
- **Admin APIs** — SAT protocols, authentication countries/settings, deployments CRUD and audit.  
**Rule:** No destructive schema renames without migration + dual-read period.

---

## 8. Risk register (this repo)

| Risk | Mitigation for later phases |
|------|-----------------------------|
| `web/` duplicate tree | Diff policy: single source of truth or codegen sync |
| Lane vs “audience” copy | Align marketing copy to `consumer` lane tokens only |
| Dense admin tables | Progressive disclosure (already started: catalog tools modals) |
| SAT protocol depth on consumer | Keep protocol detail in admin / developers / docs per directive §15 |

---

## 9. Implementation map — phased (non-destructive)

### Phase 2 — Global experience governance (incremental)

1. **Navigation audit** — ensure every admin leaf is reachable from hub; add missing cross-links only.  
2. **Consumer clarity** — page-level hero/problem/solution blocks **without** removing operational widgets.  
3. **Trust visualization language** — shared chip/badge/timeline components **wrapping** existing data, not replacing fetch logic.  
4. **Mobile** — touch targets and overflow on widest tables; sticky headers (already used in places).  

### Phase 3 — Token consolidation

- Map duplicated Tailwind arbitrary values → CSS variables in `globals.css` in small PRs.  
- No new heavy animation libraries.

### Phase 4 — Audience switcher (optional UI)

- Read-only or deep-link switcher: “Consumers” → `/`, “Governments & carriers” → `/global-deployment` or `/admin` (role-gated), “Partners & developers” → `/developers`.  
- Must not replace existing nav.

### Phase 5 — i18n / globalization

- Keyra defaults `en-IE` in metadata; future `lang` routing requires middleware + catalog strategy — **design only** until product approves URL scheme.

---

## 10. QA checklist (after each batch)

- [ ] `npm run lint` / `npx tsc --noEmit`  
- [ ] `npm run build` (or CI)  
- [ ] Smoke: `/`, `/login`, `/app`, `/admin/login`, one admin data page, one API that feeds UI  
- [ ] Mobile width 375px: no horizontal runaway on primary flows  

---

## 11. Document control

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-05-14 | Initial Phase 1 inventory from codebase scan |
