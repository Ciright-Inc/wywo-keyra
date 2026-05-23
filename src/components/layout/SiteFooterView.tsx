import Image from "next/image";
import Link from "next/link";
import { KEYRA_LOGO_SRC } from "@/lib/keyraBrandAssets";
import { SocialPlatformIcon } from "@/lib/siteFooter/socialIcons";
import { NEW_TAB_LINK } from "@/lib/newTabLink";
import type { SiteFooterConfig, SiteFooterLinkView } from "@/lib/siteFooter/types";

function FooterLinkItem({ link }: { link: SiteFooterLinkView }) {
  const useInternal = Boolean(link.internalPath) && !link.isExternal;

  return (
    <li>
      {useInternal ? (
        <Link
          href={link.internalPath!}
          {...NEW_TAB_LINK}
          className="keyra-site-footer__link"
          title={link.description ? `${link.label} — ${link.description}` : link.label}
        >
          {link.label}
        </Link>
      ) : link.isExternal ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="keyra-site-footer__link"
          title={link.description ? `${link.label} — ${link.description}` : link.label}
        >
          {link.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <Link
          href={link.href}
          {...NEW_TAB_LINK}
          className="keyra-site-footer__link"
          title={link.description ? `${link.label} — ${link.description}` : link.label}
        >
          {link.label}
        </Link>
      )}
    </li>
  );
}

type Props = {
  config: SiteFooterConfig;
};

export function SiteFooterView({ config }: Props) {
  const year = new Date().getFullYear();
  const logoSrc = config.settings.logoSrc?.trim() || KEYRA_LOGO_SRC;

  return (
    <footer className="keyra-site-footer">
      <div className="keyra-site-footer__inner mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="keyra-site-footer__grid">
          <section className="keyra-site-footer__block keyra-site-footer__block--brand">
            <span className="inline-flex items-center gap-2.5">
              <span
                className="relative block h-8 shrink-0 sm:h-9"
                style={{ aspectRatio: "1320/520" }}
              >
                <Image
                  src={logoSrc}
                  alt="Keyra"
                  fill
                  sizes="(max-width: 768px) 140px, 180px"
                  className="object-contain object-left"
                  unoptimized
                />
              </span>
            </span>
            <p className="keyra-site-footer__lede">{config.settings.description}</p>
          </section>

          <section className="keyra-site-footer__block">
            <h2 className="keyra-site-footer__label">{config.settings.onThisSiteLabel}</h2>
            <nav className="keyra-site-footer__nav" aria-label="Footer">
              <ul className="keyra-site-footer__link-grid keyra-site-footer__link-grid--site">
                {config.onThisSiteLinks.map((link) => (
                  <FooterLinkItem key={link.id} link={link} />
                ))}
              </ul>
            </nav>
          </section>

          <section className="keyra-site-footer__block">
            <h2 className="keyra-site-footer__label">{config.settings.keyraAppsLabel}</h2>
            <nav className="keyra-site-footer__nav" aria-label="Keyra apps">
              <ul className="keyra-site-footer__link-grid keyra-site-footer__link-grid--apps">
                {config.keyraAppLinks.map((link) => (
                  <FooterLinkItem key={link.id} link={link} />
                ))}
              </ul>
            </nav>
          </section>
        </div>

        <div className="keyra-site-footer__meta">
          <p className="keyra-site-footer__copyright">© {year} Keyra. All rights reserved.</p>
          {config.socialLinks.length > 0 ? (
            <div className="keyra-site-footer__social-list">
              {config.socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="keyra-site-footer__social"
                  aria-label={social.label}
                >
                  <SocialPlatformIcon platform={social.platform} />
                  <span className="sr-only">{social.label} (opens in a new tab)</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
