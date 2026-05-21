"use client";

import { getKeyraEcosystemAppLinks, keyraMarketingOrigin, type KeyraEcosystemAppLink } from "@/lib/keyraAppUrls";

type SiteLink = { href: string; label: string };

function siteLinks(marketing: string): SiteLink[] {
  return [
    { href: `${marketing}/#problem`, label: "Why identity" },
    { href: `${marketing}/#missing-layer`, label: "The shift" },
    { href: `${marketing}/#for`, label: "Who it's for" },
    { href: `${marketing}/#global`, label: "Global" },
    { href: `${marketing}/faq`, label: "FAQ" },
    { href: `${marketing}/contact`, label: "Contact us" },
    { href: `${marketing}/privacy`, label: "Privacy" },
    { href: `${marketing}/terms`, label: "Terms" },
  ];
}

function splitInHalf<T>(arr: T[]): [T[], T[]] {
  const mid = Math.ceil(arr.length / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
}

const linkClass =
  "text-sm text-keyra-text-2 transition hover:text-keyra-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-keyra-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm";

const sectionTitleClass =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-keyra-text-2";

function FooterAppLinkItem({ item, linkClass }: { item: KeyraEcosystemAppLink; linkClass: string }) {
  return (
    <li className="min-w-0">
      <a
        href={item.href}
        target={item.internalPath ? undefined : "_blank"}
        rel={item.internalPath ? undefined : "noopener noreferrer"}
        className={`${linkClass} block`}
        title={`${item.label} — ${item.description}`}
      >
        {item.label}
        {!item.internalPath ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </a>
    </li>
  );
}

export function SiteFooter() {
  const marketing = keyraMarketingOrigin();
  const appLinks = getKeyraEcosystemAppLinks();
  const [appLinksLeft, appLinksRight] = splitInHalf(appLinks);
  const links = siteLinks(marketing);
  const [siteLinksLeft, siteLinksRight] = splitInHalf(links);
  const year = new Date().getFullYear();

  return (
    <footer className="keyra-site-footer border-t border-keyra-border">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-11">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12 xl:gap-14">
          <div className="min-w-0">
            <h2 className={sectionTitleClass}>Keyra ecosystem</h2>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-keyra-text-2">
              Global deployment registry and operator posture for governments, carriers, and enterprise partners.
            </p>
            <a
              href={marketing}
              className="mt-5 inline-flex text-sm font-semibold text-keyra-primary underline-offset-4 transition hover:underline"
              rel="noopener noreferrer"
            >
              Keyra home
            </a>
          </div>

          <div className="min-w-0">
            <h2 className={sectionTitleClass}>On keyra.ie</h2>
            <nav className="mt-3" aria-label="Footer">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-5">
                <ul className="flex min-w-0 flex-col gap-2">
                  {siteLinksLeft.map((link) => (
                    <li key={link.label} className="min-w-0">
                      <a href={link.href} className={`${linkClass} block`} rel="noopener noreferrer">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <ul className="flex min-w-0 flex-col gap-2">
                  {siteLinksRight.map((link) => (
                    <li key={link.label} className="min-w-0">
                      <a href={link.href} className={`${linkClass} block`} rel="noopener noreferrer">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>

          <div className="min-w-0">
            <h2 className={sectionTitleClass}>Keyra apps</h2>
            <nav className="mt-3" aria-label="Keyra apps">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-5">
                <ul className="flex min-w-0 flex-col gap-2">
                  {appLinksLeft.map((item) => (
                    <FooterAppLinkItem key={item.id} item={item} linkClass={linkClass} />
                  ))}
                </ul>
                <ul className="flex min-w-0 flex-col gap-2">
                  {appLinksRight.map((item) => (
                    <FooterAppLinkItem key={item.id} item={item} linkClass={linkClass} />
                  ))}
                </ul>
              </div>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t border-keyra-border/80 pt-6 text-center text-xs text-keyra-text-2 sm:text-left">
          <p>© {year} Keyra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
