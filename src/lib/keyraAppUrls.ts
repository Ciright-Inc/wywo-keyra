/**
 * Keyra / SimSecure app launcher URLs — same env names and production defaults as
 * `simsecure/components/BentoMenu.js` (and simsecure-developer `bento-menu.tsx`).
 * Override per environment with NEXT_PUBLIC_* in `.env.local`.
 */

function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

/** Canonical marketing host — strip legacy www for return URLs and links. */
export function canonicalKeyraHostname(hostname: string): string {
  return hostname.toLowerCase() === "www.keyra.ie" ? "keyra.ie" : hostname;
}

/** Normalize absolute Keyra return URLs to the canonical marketing host. */
export function normalizeKeyraReturnUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    url.hostname = canonicalKeyraHostname(url.hostname);
    return url.toString();
  } catch {
    return trimmed;
  }
}

/** get-started.keyra.ie */
export function keyraGetStartedUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_GET_STARTED_URL?.trim() || "https://get-started.keyra.ie");
}

/**
 * Opens Get Started with optional `return` query — after login/verification the app may send the user
 * back to Keyra (absolute URL; see get-started `return` handling).
 */
export function buildGetStartedAccessUrl(returnToAbsoluteUrl: string): string {
  const gs = keyraGetStartedUrl();
  let u = returnToAbsoluteUrl.trim();
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    const base = keyraMarketingOrigin();
    const path = u.startsWith("/") ? u : `/${u}`;
    u = `${trimSlash(base)}${path}`;
  }
  u = normalizeKeyraReturnUrl(u);
  return `${gs}/?return=${encodeURIComponent(u)}`;
}

/** After Get Started / hosted login — sync auth into keyra_session, then open `nextPath`. */
export function buildKeyraSessionContinueUrl(nextPath: string): string {
  const base = keyraMarketingOrigin();
  const path = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${trimSlash(base)}/api/keyra/session/continue?next=${encodeURIComponent(path)}`;
}

/** Admin "Login on Keyra" — return via session bridge so cookies sync on same origin. */
export function buildAdminGetStartedAccessUrl(nextPath: string): string {
  return buildGetStartedAccessUrl(buildKeyraSessionContinueUrl(nextPath));
}

/** Main Keyra platform app — app.keyra.ie (`NEXT_PUBLIC_SIMSECURE_URL` in SimSecure). */
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

/** governments.keyra.ie */
export function keyraGovernmentsUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_GOVERNMENTS_URL?.trim() || "https://governments.keyra.ie");
}

/** partners.keyra.ie */
export function keyraPartnersUrl(): string {
  return trimSlash(process.env.NEXT_PUBLIC_PARTNERS_URL?.trim() || "https://partners.keyra.ie");
}

/** Canonical marketing origin for public CMS APIs (footer, etc.). */
export function keyraMarketingPublicOrigin(): string {
  return trimSlash(
    process.env.NEXT_PUBLIC_KEYRA_MARKETING_ORIGIN?.trim() ||
      process.env.NEXT_PUBLIC_KEYRA_SITE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      "https://keyra.ie",
  );
}

/** This marketing site (e.g. https://keyra.ie or http://localhost:3030). */
export function keyraMarketingOrigin(): string {
  return trimSlash(
    process.env.NEXT_PUBLIC_KEYRA_SITE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      keyraMarketingPublicOrigin(),
  );
}

export function keyraMarketingPath(path: string): string {
  const base = keyraMarketingOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Global deployment map — governments.keyra.ie (live deployment explorer). */
export function keyraGlobalDeploymentUrl(): string {
  return keyraGovernmentsUrl();
}

/** SOIP — Sovereign Operational Intelligence Platform (soip.keyra.ie). */
export function keyraSoipUrl(): string {
  return trimSlash(
    process.env.NEXT_PUBLIC_SOIP_URL?.trim() || "https://soip.keyra.ie",
  );
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
      id: "governments",
      label: "Governments",
      description: "Government programs",
      href: keyraGovernmentsUrl(),
    },
    {
      id: "partners",
      label: "Partners",
      description: "Partner programs",
      href: keyraPartnersUrl(),
    },
  ];
}

/** Full app directory used by the admin Apps tab and the 9-dot launcher. */
export function getKeyraAdminAppLinks(): KeyraEcosystemAppLink[] {
  return [
    { id: "keyra", label: "Keyra", description: "Platform & product hub", href: keyraPlatformAppUrl() },
    { id: "get-started", label: "Get Started", description: "Enrollment & verification", href: keyraGetStartedUrl() },
    { id: "developer", label: "Developer", description: "APIs & documentation", href: keyraDeveloperPortalUrl() },
    { id: "settings", label: "Settings", description: "Settings app", href: keyraSettingsPortalUrl() },
    { id: "press", label: "Press", description: "Press room", href: keyraPressUrl() },
    { id: "my-account", label: "My Account", description: "Account portal", href: keyraMyAccountUrl() },
    { id: "affiliates", label: "Affiliates", description: "Affiliate program", href: keyraAffiliatesUrl() },
    { id: "directors", label: "Directors", description: "Directors portal", href: "https://directors.keyra.ie" },
    { id: "video", label: "Video", description: "Video app", href: "https://video.keyra.ie" },
    { id: "event", label: "Event", description: "Event app", href: "https://event.keyra.ie" },
    { id: "podcast", label: "Podcast", description: "Podcast app", href: "https://podcast.keyra.ie" },
    { id: "ve", label: "Ve", description: "Ve app", href: "https://ve.keyra.ie" },
    { id: "admin", label: "Admin", description: "Admin portal", href: "https://admin.keyra.ie" },
    { id: "info", label: "Info", description: "Information hub", href: "https://info.keyra.ie" },
    { id: "family-office", label: "Family Office", description: "Family office portal", href: "https://family-office.keyra.ie" },
    { id: "ftp", label: "FTP", description: "File transfer portal", href: "https://ftp.keyra.ie" },
    { id: "app", label: "App", description: "Consumer app", href: keyraPlatformAppUrl() },
    { id: "jione-documents", label: "Jione Documents", description: "Documents workspace", href: "https://jione-documents.keyra.ie" },
    { id: "authenticator", label: "Authenticator", description: "Authenticator app", href: "https://authenticator.keyra.ie" },
    { id: "investor", label: "Investor", description: "Investor portal", href: "https://investor.keyra.ie" },
    { id: "esim", label: "ESim", description: "eSIM app", href: "https://esim.keyra.ie" },
    { id: "analytics", label: "Analytics", description: "Analytics workspace", href: "https://analytics.keyra.ie" },
    { id: "drive", label: "Drive", description: "Drive workspace", href: "https://drive.keyra.ie" },
    { id: "soip", label: "SOIP", description: "Sovereign operational intelligence", href: keyraSoipUrl() },
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
