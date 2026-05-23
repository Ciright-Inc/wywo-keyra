import Link from "next/link";
import { KeyraLogo } from "@/components/brand/KeyraLogo";
import { KEYRA_LINKEDIN_URL } from "@/lib/keyraBrandAssets";
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

        <div className="keyra-site-footer__meta">
          <p className="keyra-site-footer__copyright">© {year} Keyra. All rights reserved.</p>
          <a
            href={KEYRA_LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="keyra-site-footer__social"
            aria-label="Keyra on LinkedIn"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="keyra-site-footer__social-icon">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <span className="sr-only">LinkedIn (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
