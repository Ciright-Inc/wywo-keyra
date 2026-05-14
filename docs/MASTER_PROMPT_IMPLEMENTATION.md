# Master prompt — implementation completion (Keyra)

This document maps the **non-destructive governance directive** to concrete artifacts in this repository. Operational systems (routes, auth, middleware, Prisma, admin APIs, data UIs) were **not** removed or flattened; refinements are **additive** or **token-level** where noted.

| Directive theme | Implementation |
|-----------------|----------------|
| **1. Do not break** | No route renames, no auth weakening, no DB schema changes. Changes are UI/governance layers + documentation. |
| **2. Live data interfaces** | No removal of deployment views, SAT admin tables, feeds, or maps. |
| **3. Safe phases** | Phase 1 audit: `docs/ECOSYSTEM_GOVERNANCE_PHASE1.md`. Phase 2+ delivered incrementally below. |
| **4. Shared DNA + differentiated lanes** | Existing `html[data-keyra-lane]` + `globals.css` lanes (consumer / enterprise / developer). |
| **4A Consumer experience** | `PageIntentRibbon` on home + trust; calm copy; no admin density on `/`. |
| **4B Enterprise** | `PageIntentRibbon` on global deployment hero; admin unchanged structurally. |
| **4C Ecosystem / developers** | `PageIntentRibbon` on `/developers`; developer lane CSS unchanged. |
| **5. Trust visualization** | `TrustOperatingLine` (calm status, no cyberpunk); used in `/app` layout. Home retains existing subtle `SignalDot` motion (pre-existing). |
| **6. Mobile-first** | `AudienceLaneSwitcher` + `MobileNav` compact strip; touch-friendly `min-h-9` on lane pills. |
| **7. Performance** | No new animation libraries or heavy deps. |
| **8. Design token governance** | Central z-index scale on `:root`: `--keyra-z-header`, `--keyra-z-overlay`, `--keyra-z-drawer`, `--keyra-z-sticky`, `--keyra-z-toast`. Header / mobile nav reference these. |
| **9. Content density** | Progressive disclosure unchanged for admin catalog tools (prior work). |
| **10. Globalization** | Metadata locale remains `en-IE`; future i18n URL strategy not forced. |
| **11. Admin elevation** | Prior catalog-modal pattern retained; this pass does not regress admin density. |
| **12. Audience switching** | `AudienceLaneSwitcher` in `SiteHeader`, `MobileNav`, `SiteFooter`; deep-links to `/`, `/global-deployment`, `/developers` only. |
| **13. Five-second page structure** | `PageIntentRibbon` (Who / Problem / Next) on home, trust, developers, global deployment. |
| **14. SAT protocol placement** | Consumer home does not add SAT technical depth; SAT remains in admin + developer narrative. |
| **15. QA** | Run `npx tsc --noEmit`, `npm run lint`, `npm run build` before release. |

## File index (Keyra)

| Path | Role |
|------|------|
| `src/lib/audienceLanes.ts` | Stable hrefs/labels for the switcher |
| `src/components/governance/AudienceLaneSwitcher.tsx` | Client switcher + active state from pathname |
| `src/components/trust/PageIntentRibbon.tsx` | Intent strip (server-safe) |
| `src/components/trust/TrustOperatingLine.tsx` | Calm trust status line |
| `src/components/layout/SiteHeader.tsx` | Lane bar under primary nav |
| `src/components/layout/MobileNav.tsx` | Compact switcher + z tokens |
| `src/components/layout/SiteFooter.tsx` | Ecosystem block |
| `src/components/home/HomeContent.tsx` | Home intent ribbon |
| `src/components/global-deployment/GlobalDeploymentHero.tsx` | Enterprise intent ribbon |
| `src/app/trust/page.tsx` | Trust intent ribbon |
| `src/app/developers/page.tsx` | Developer intent ribbon |
| `src/app/app/layout.tsx` | Trust operating line under app chrome |
| `src/app/globals.css` | Z-index token block |
| `web/src/...` | Mirrored copies where the `web/` tree exists for the same components |

## Environment

- Optional: none required for Keyra switcher (internal links).

## Version

- **1.0** — 2026-05-14 — Governance + trust + intent ribbons + z tokens + audience switcher.
