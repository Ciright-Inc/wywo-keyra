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
  const links = siteLinks();
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
              <ul className="keyra-site-footer__link-grid keyra-site-footer__link-grid--site">
                {links.map((link) => (
                  <FooterSiteLinkItem key={link.label} link={link} />
                ))}
              </ul>
            </nav>
          </section>

          <section className="keyra-site-footer__block">
            <h2 className="keyra-site-footer__label">Keyra apps</h2>
            <nav className="keyra-site-footer__nav" aria-label="Keyra apps">
              <ul className="keyra-site-footer__link-grid keyra-site-footer__link-grid--apps">
                {appLinks.map((item) => (
                  <FooterAppLinkItem key={item.id} item={item} />
                ))}
              </ul>
            </nav>
          </section>
        </div>

        <p className="keyra-site-footer__meta">© {year} Keyra. All rights reserved.</p>
      </div>
    </footer>
  );
}
