import Link from "next/link";
import { KeyraHomeLink } from "@/components/layout/KeyraHomeLink";
import { getKeyraEcosystemAppLinks, type KeyraEcosystemAppLink } from "@/lib/keyraAppUrls";

type SiteLink = { href: string; label: string; external?: boolean };

function siteLinks(): SiteLink[] {
  return [
    { href: "/#problem", label: "Why identity" },
    { href: "/#missing-layer", label: "The shift" },
    { href: "/#for", label: "Who it's for" },
    { href: "/#global", label: "Global" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact us" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
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
      {item.internalPath ? (
        <Link
          href={item.internalPath}
          className={`${linkClass} block`}
          title={`${item.label} — ${item.description}`}
        >
          {item.label}
        </Link>
      ) : (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClass} block`}
          title={`${item.label} — ${item.description}`}
        >
          {item.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </li>
  );
}

export function SiteFooter() {
  const appLinks = getKeyraEcosystemAppLinks();
  const [appLinksLeft, appLinksRight] = splitInHalf(appLinks);
  const links = siteLinks();
  const [siteLinksLeft, siteLinksRight] = splitInHalf(links);
  const year = new Date().getFullYear();

  return (
    <footer className="keyra-site-footer border-t border-keyra-border">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-11">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12 xl:gap-14">
          <div className="min-w-0">
            <h2 className={sectionTitleClass}>Keyra ecosystem</h2>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-keyra-text-2">
              Choose the experience that matches your context — consumer protection, enterprise deployment, or
              partner tooling.
            </p>
            <KeyraHomeLink className="mt-5 inline-flex text-sm font-semibold text-keyra-primary underline-offset-4 transition hover:underline">
              Keyra home
            </KeyraHomeLink>
          </div>

          <div className="min-w-0">
            <h2 className={sectionTitleClass}>On this site</h2>
            <nav className="mt-3" aria-label="Footer">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-5">
                <ul className="flex min-w-0 flex-col gap-2">
                  {siteLinksLeft.map((link) => (
                    <li key={link.label} className="min-w-0">
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${linkClass} block`}
                        >
                          {link.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <Link href={link.href} className={`${linkClass} block`}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
                <ul className="flex min-w-0 flex-col gap-2">
                  {siteLinksRight.map((link) => (
                    <li key={link.label} className="min-w-0">
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${linkClass} block`}
                        >
                          {link.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <Link href={link.href} className={`${linkClass} block`}>
                          {link.label}
                        </Link>
                      )}
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
