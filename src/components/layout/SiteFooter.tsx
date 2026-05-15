import Link from "next/link";
import { AudienceLaneSwitcher } from "@/components/governance/AudienceLaneSwitcher";
import { KeyraLogo } from "@/components/brand/KeyraLogo";
import { getKeyraEcosystemAppLinks, type KeyraEcosystemAppLink } from "@/lib/keyraAppUrls";

const links = [
  { href: "/#problem", label: "Why identity" },
  { href: "/#missing-layer", label: "The shift" },
  { href: "/#for", label: "Who it's for" },
  { href: "/#global", label: "Global" },
  { href: "/developers", label: "Developers" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact us" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

function splitInHalf<T>(arr: T[]): [T[], T[]] {
  const mid = Math.ceil(arr.length / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
}

const linkClass =
  "text-sm text-keyra-text-2 transition hover:text-keyra-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-keyra-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-keyra-bg rounded-sm";

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
  const [siteLinksLeft, siteLinksRight] = splitInHalf(links);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-keyra-border bg-keyra-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-11">
        <section
          className="rounded-2xl border border-keyra-border/90 bg-keyra-surface/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5"
          aria-labelledby="footer-ecosystem-heading"
        >
          <h2 id="footer-ecosystem-heading" className={sectionTitleClass}>
            Keyra ecosystem
          </h2>
          <div className="mt-3">
            <AudienceLaneSwitcher variant="footer" />
          </div>
        </section>

        <div className="mt-8 grid gap-8 border-t border-keyra-border/80 pt-8 lg:mt-9 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:pt-9 xl:gap-8">
          <div className="w-max max-w-full shrink-0 pr-2 lg:pr-0">
            <Link
              href="/"
              className="group inline-flex max-w-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-keyra-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-keyra-bg"
              aria-label="Keyra home"
            >
              <KeyraLogo variant="footer" showWordmark={false} />
            </Link>
          </div>

          <div className="min-w-0">
            <h2 className={sectionTitleClass}>On this site</h2>
            <nav className="mt-3" aria-label="Footer">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-5">
                <ul className="flex min-w-0 flex-col gap-2">
                  {siteLinksLeft.map((link) => (
                    <li key={link.label} className="min-w-0">
                      <Link href={link.href} className={`${linkClass} block`}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="flex min-w-0 flex-col gap-2">
                  {siteLinksRight.map((link) => (
                    <li key={link.label} className="min-w-0">
                      <Link href={link.href} className={`${linkClass} block`}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>

          <div className="min-w-0 lg:border-l lg:border-keyra-border/50 lg:pl-6 xl:pl-8">
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

        <div className="mt-8 border-t border-keyra-border/60 pt-6 text-center text-xs text-keyra-text-2/80 sm:text-left">
          <p>© {year} Keyra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
