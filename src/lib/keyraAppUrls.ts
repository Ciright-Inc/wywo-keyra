/**
 * Keyra / SimSecure app launcher URLs — same env names and production defaults as
 * `simsecure/components/BentoMenu.js` (and simsecure-developer `bento-menu.tsx`).
 * Override per environment with NEXT_PUBLIC_* in `.env.local`.
 */

function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

/** get-started.keyra.ie */
export function keyraGetStartedUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_GET_STARTED_URL?.trim() || "https://get-started.keyra.ie");
}

/** Main Keyra / Ciright Pro app — app.keyra.ie (`NEXT_PUBLIC_SIMSECURE_URL` in SimSecure). */
export function keyraPlatformAppUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_SIMSECURE_URL?.trim() || "https://app.keyra.ie");
}

/** developer.keyra.ie */
export function keyraDeveloperPortalUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_DEVELOPER_URL?.trim() || "https://developer.keyra.ie");
}

/** myaccount.keyra.ie */
export function keyraMyAccountUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_MY_ACCOUNT_URL?.trim() || "https://myaccount.keyra.ie");
}

/** setting.keyra.ie */
export function keyraSettingsPortalUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_SETTINGS_URL?.trim() || "https://setting.keyra.ie");
}

/** affiliate.keyra.ie */
export function keyraAffiliatesUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_AFFILIATES_URL?.trim() || "https://affiliate.keyra.ie");
}

/** press.keyra.ie */
export function keyraPressUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_PRESS_URL?.trim() || "https://press.keyra.ie");
}

/** This marketing site (e.g. https://keyra.ie or http://localhost:3030). */
export function keyraMarketingOrigin(): string {
  return trimSlash(
    process.env.NEXT_PUBLIC_KEYRA_SITE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      "https://keyra.ie",
  );
}

export function keyraMarketingPath(path: string): string {
  const base = keyraMarketingOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Shared list for 9-dot launcher + footer (SimSecure-style subdomain URLs). */
export type KeyraEcosystemAppLink = {
  id: string;
  label: string;
  description: string;
  href: string;
  /** Footer: Next `Link` for same-site paths; launcher still uses absolute `href` in a new tab. */
  internalPath?: `/${string}`;
};

export function getKeyraEcosystemAppLinks(): KeyraEcosystemAppLink[] {
  return [
    {
      id: "get-started",
      label: "Get Started",
      description: "Enrollment & verification",
      href: keyraGetStartedUrl(),
    },
    {
      id: "platform",
      label: "Keyra",
      description: "Platform & product hub",
      href: keyraPlatformAppUrl(),
    },
    {
      id: "developer",
      label: "Developer",
      description: "APIs & documentation",
      href: keyraDeveloperPortalUrl(),
    },
    {
      id: "my-account",
      label: "My Account",
      description: "Account portal",
      href: keyraMyAccountUrl(),
    },
    {
      id: "settings",
      label: "Settings",
      description: "Settings app",
      href: keyraSettingsPortalUrl(),
    },
    {
      id: "affiliates",
      label: "Affiliates",
      description: "Affiliate program",
      href: keyraAffiliatesUrl(),
    },
    {
      id: "press",
      label: "Press",
      description: "Press room",
      href: keyraPressUrl(),
    },
    {
      id: "trust",
      label: "Trust",
      description: "Trust & assurance",
      href: keyraMarketingPath("/trust"),
      internalPath: "/trust",
    },
    {
      id: "global",
      label: "Global deployment",
      description: "Deployment map",
      href: keyraMarketingPath("/global-deployment"),
      internalPath: "/global-deployment",
    },
  ];
}

/**
 * Consumer hub for widgets / deep links — prefers explicit app URL, then SimSecure platform URL, else same-origin `/app`.
 */
export function keyraConsumerAppHref(): string {
  const explicit = process.env.NEXT_PUBLIC_KEYRA_APP_URL?.trim();
  if (explicit) return trimSlash(explicit);
  const sim = process.env.NEXT_PUBLIC_SIMSECURE_URL?.trim();
  if (sim) return trimSlash(sim);
  return "/app";
}

export function keyraConsumerAppIsExternal(): boolean {
  return keyraConsumerAppHref().startsWith("http");
}
