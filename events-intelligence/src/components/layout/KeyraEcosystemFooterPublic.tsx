"use client";

/**
 * Same link model as keyra.ie `SiteFooter`. Colors use `keyra-site-footer` CSS variables
 * from `keyra-theme.css` (institutional black field, not Tailwind zinc).
 */

function trimSlash(s: string): string {
  return String(s || "").replace(/\/+$/, "");
}

function marketingOrigin(): string {
  return trimSlash(
    process.env.NEXT_PUBLIC_KEYRA_SITE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      "https://keyra.ie",
  );
}

function ecosystemAppLinks(): { id: string; label: string; href: string }[] {
  const m = marketingOrigin();
  return [
    {
      id: "get-started",
      label: "Get Started",
      href: trimSlash(process.env.NEXT_PUBLIC_GET_STARTED_URL || "https://get-started.keyra.ie"),
    },
    {
      id: "platform",
      label: "Keyra",
      href: trimSlash(process.env.NEXT_PUBLIC_SIMSECURE_URL || "https://app.keyra.ie"),
    },
    {
      id: "developer",
      label: "Developer",
      href: trimSlash(process.env.NEXT_PUBLIC_DEVELOPER_URL || "https://developer.keyra.ie"),
    },
    {
      id: "my-account",
      label: "My Account",
      href: trimSlash(process.env.NEXT_PUBLIC_MY_ACCOUNT_URL || "https://myaccount.keyra.ie"),
    },
    {
      id: "settings",
      label: "Settings",
      href: trimSlash(process.env.NEXT_PUBLIC_SETTINGS_URL || "https://setting.keyra.ie"),
    },
    {
      id: "affiliates",
      label: "Affiliates",
      href: trimSlash(process.env.NEXT_PUBLIC_AFFILIATES_URL || "https://affiliate.keyra.ie"),
    },
    {
      id: "press",
      label: "Press",
      href: trimSlash(process.env.NEXT_PUBLIC_PRESS_URL || "https://press.keyra.ie"),
    },
    { id: "trust", label: "Trust", href: `${m}/trust` },
    { id: "global", label: "Global deployment", href: trimSlash(process.env.NEXT_PUBLIC_GLOBAL_DEPLOYMENT_URL || `${m}/global-deployment`) },
  ];
}

const ON_KEYRA_NAV_LINKS: { href: string; label: string }[] = [
  { href: "/#problem", label: "Why identity" },
  { href: "/#missing-layer", label: "The shift" },
  { href: "/#for", label: "Who it's for" },
  { href: "/#global", label: "Global" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact us" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

function splitInHalf<T>(arr: T[]): [T[], T[]] {
  const mid = Math.ceil(arr.length / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
}

function onKeyraLinkList(): { href: string; label: string }[] {
  const base = marketingOrigin();
  return ON_KEYRA_NAV_LINKS.map(({ href, label }) => ({
    label,
    href: href.startsWith("http") ? href : `${base}${href.startsWith("/") ? href : `/${href}`}`,
  }));
}

/** Parity with Keyra `SiteFooter`: `text-keyra-text-2` + `hover:text-keyra-primary`. */
const linkClass =
  "block text-sm text-[var(--keyra-text-secondary)] transition hover:text-[var(--keyra-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--keyra-ring)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm";

const sectionTitle =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--keyra-text-secondary)]";

/** Matches `AudienceLaneSwitcher` footer idle pills on keyra.ie (not token-mixed borders). */
const pillClass =
  "min-h-9 shrink-0 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-center text-[11px] font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white sm:min-h-0 sm:py-1.5 sm:text-xs";

export function KeyraEcosystemFooterPublic() {
  const year = new Date().getFullYear();
  const m = marketingOrigin();
  const apps = ecosystemAppLinks();
  const [appsLeft, appsRight] = splitInHalf(apps);
  const siteLinks = onKeyraLinkList();
  const [siteLeft, siteRight] = splitInHalf(siteLinks);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-[var(--keyra-text)] sm:px-6 sm:py-10 lg:py-11">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12 xl:gap-14">
        <div className="min-w-0">
          <h2 className={sectionTitle}>Keyra ecosystem</h2>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-[var(--keyra-text-secondary)]">
            Choose the experience that matches your context — consumer protection, enterprise deployment, or
            partner tooling.
          </p>
          <div className="mt-4 flex flex-wrap gap-1 sm:gap-2" role="navigation" aria-label="Keyra audience">
            <a href={`${m}/`} className={pillClass} rel="noopener noreferrer">
              Consumers
            </a>
            <a href={trimSlash(process.env.NEXT_PUBLIC_GLOBAL_DEPLOYMENT_URL || `${m}/global-deployment`)} className={pillClass} rel="noopener noreferrer">
              Governments &amp; carriers
            </a>
            <a href={trimSlash(process.env.NEXT_PUBLIC_DEVELOPER_URL || "https://developer.keyra.ie")} className={pillClass} rel="noopener noreferrer" target="_blank">
              Partners &amp; developers
            </a>
          </div>
          <a
            href={m}
            className="mt-5 inline-flex text-sm font-semibold text-[var(--keyra-primary)] underline-offset-4 transition hover:underline"
            rel="noopener noreferrer"
          >
            Keyra home
          </a>
        </div>

        <div className="min-w-0">
          <h2 className={sectionTitle}>On this site</h2>
          <nav className="mt-3" aria-label="Keyra marketing site">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-5">
              <ul className="flex min-w-0 flex-col gap-2">
                {siteLeft.map((link) => (
                  <li key={link.label} className="min-w-0">
                    <a href={link.href} className={linkClass} rel="noopener noreferrer">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <ul className="flex min-w-0 flex-col gap-2">
                {siteRight.map((link) => (
                  <li key={link.label} className="min-w-0">
                    <a href={link.href} className={linkClass} rel="noopener noreferrer">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="min-w-0">
          <h2 className={sectionTitle}>Keyra apps</h2>
          <nav className="mt-3" aria-label="Keyra apps">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-5">
              <ul className="flex min-w-0 flex-col gap-2">
                {appsLeft.map((item) => (
                  <li key={item.id} className="min-w-0">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                      title={item.label}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              <ul className="flex min-w-0 flex-col gap-2">
                {appsRight.map((item) => (
                  <li key={item.id} className="min-w-0">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                      title={item.label}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>

      <div className="mt-8 border-t border-[color:color-mix(in_srgb,var(--keyra-border)_80%,transparent)] pt-6 text-center text-xs text-[var(--keyra-text-secondary)] sm:text-left">
        <p>© {year} Keyra. All rights reserved.</p>
      </div>
    </div>
  );
}
