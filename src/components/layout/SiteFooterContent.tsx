import Link from "next/link";
import { KeyraLogo } from "@/components/brand/KeyraLogo";
import type { SiteFooterLink, SiteFooterPayload, SiteFooterSocialLink } from "@/lib/siteFooter";

function linkTitle(link: SiteFooterLink): string | undefined {
  return link.description ? `${link.label} — ${link.description}` : undefined;
}

function FooterAppLinkItem({ item }: { item: SiteFooterLink }) {
  const title = linkTitle(item);
  const internalPath = item.internalPath?.startsWith("/") ? (item.internalPath as `/${string}`) : undefined;

  return (
    <li>
      {internalPath ? (
        <Link href={internalPath} className="keyra-site-footer__link" title={title}>
          {item.label}
        </Link>
      ) : item.isExternal ? (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="keyra-site-footer__link"
          title={title}
        >
          {item.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <Link href={item.href} className="keyra-site-footer__link" title={title}>
          {item.label}
        </Link>
      )}
    </li>
  );
}

function FooterSiteLinkItem({ link }: { link: SiteFooterLink }) {
  return (
    <li>
      {link.isExternal ? (
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

function FooterSocialLinkItem({ link }: { link: SiteFooterSocialLink }) {
  if (link.platform === "LINKEDIN") {
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="keyra-site-footer__social"
        aria-label={link.label}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="keyra-site-footer__social-icon">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        <span className="sr-only">{link.label} (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="keyra-site-footer__social"
      aria-label={link.label}
    >
      <span className="keyra-site-footer__social-fallback" aria-hidden="true">
        {link.platform.slice(0, 1)}
      </span>
      <span className="sr-only">{link.label} (opens in a new tab)</span>
    </a>
  );
}

export function SiteFooterContent({ data }: { data: SiteFooterPayload }) {
  const { settings, onThisSiteLinks, keyraAppLinks, socialLinks } = data;
  const year = new Date().getFullYear();

  return (
    <footer className="keyra-site-footer">
      <div className="keyra-site-footer__inner mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="keyra-site-footer__grid">
          <section className="keyra-site-footer__block keyra-site-footer__block--brand">
            <KeyraLogo variant="footer" showWordmark={false} logoSrc={settings.logoSrc} />
            <p className="keyra-site-footer__lede">{settings.description}</p>
          </section>

          <section className="keyra-site-footer__block">
            <h2 className="keyra-site-footer__label">{settings.onThisSiteLabel}</h2>
            <nav className="keyra-site-footer__nav" aria-label={settings.onThisSiteLabel}>
              <ul className="keyra-site-footer__link-grid keyra-site-footer__link-grid--site">
                {onThisSiteLinks.map((link) => (
                  <FooterSiteLinkItem key={link.id} link={link} />
                ))}
              </ul>
            </nav>
          </section>

          <section className="keyra-site-footer__block">
            <h2 className="keyra-site-footer__label">{settings.keyraAppsLabel}</h2>
            <nav className="keyra-site-footer__nav" aria-label={settings.keyraAppsLabel}>
              <ul className="keyra-site-footer__link-grid keyra-site-footer__link-grid--apps">
                {keyraAppLinks.map((item) => (
                  <FooterAppLinkItem key={item.id} item={item} />
                ))}
              </ul>
            </nav>
          </section>
        </div>

        <div className="keyra-site-footer__meta">
          <p className="keyra-site-footer__copyright">© {year} Keyra. All rights reserved.</p>
          {socialLinks.length > 0 ? (
            <div className="keyra-site-footer__socials">
              {socialLinks.map((link) => (
                <FooterSocialLinkItem key={link.id} link={link} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
