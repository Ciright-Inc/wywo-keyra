import Link from "next/link";
import { KeyraLogo } from "@/components/brand/KeyraLogo";
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

function FooterAppLinkItem({ item }: { item: KeyraEcosystemAppLink }) {
  return (
    <li>
      {item.internalPath ? (
        <Link
          href={item.internalPath}
          className="keyra-site-footer__link"
          title={`${item.label} — ${item.description}`}
        >
          {item.label}
        </Link>
      ) : (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="keyra-site-footer__link"
          title={`${item.label} — ${item.description}`}
        >
          {item.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </li>
  );
}

function FooterSiteLinkItem({ link }: { link: SiteLink }) {
  return (
    <li>
      {link.external ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="keyra-site-footer__link"
        >
          {link.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <Link href={link.href} className="keyra-site-footer__link">
          {link.label}
        </Link>
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
    <footer className="keyra-site-footer">
      <div className="keyra-site-footer__inner mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="keyra-site-footer__grid">
          <section className="keyra-site-footer__block keyra-site-footer__block--brand">
            <KeyraLogo variant="footer" showWordmark={false} />
            <p className="keyra-site-footer__lede">
              Choose the experience that matches your context — consumer protection, enterprise deployment, or
              partner tooling.
            </p>
          </section>

          <section className="keyra-site-footer__block">
            <h2 className="keyra-site-footer__label">On this site</h2>
            <nav className="keyra-site-footer__nav" aria-label="Footer">
              <div className="keyra-site-footer__columns">
                <ul className="keyra-site-footer__column">
                  {siteLinksLeft.map((link) => (
                    <FooterSiteLinkItem key={link.label} link={link} />
                  ))}
                </ul>
                <ul className="keyra-site-footer__column keyra-site-footer__column--end">
                  {siteLinksRight.map((link) => (
                    <FooterSiteLinkItem key={link.label} link={link} />
                  ))}
                </ul>
              </div>
            </nav>
          </section>

          <section className="keyra-site-footer__block">
            <h2 className="keyra-site-footer__label">Keyra apps</h2>
            <nav className="keyra-site-footer__nav" aria-label="Keyra apps">
              <div className="keyra-site-footer__columns">
                <ul className="keyra-site-footer__column">
                  {appLinksLeft.map((item) => (
                    <FooterAppLinkItem key={item.id} item={item} />
                  ))}
                </ul>
                <ul className="keyra-site-footer__column keyra-site-footer__column--end">
                  {appLinksRight.map((item) => (
                    <FooterAppLinkItem key={item.id} item={item} />
                  ))}
                </ul>
              </div>
            </nav>
          </section>
        </div>

        <p className="keyra-site-footer__meta">© {year} Keyra. All rights reserved.</p>
      </div>
    </footer>
  );
}
