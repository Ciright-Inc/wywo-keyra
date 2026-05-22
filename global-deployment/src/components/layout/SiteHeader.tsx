"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AccountMenu } from "./AccountMenu";
import { KeyraAppLauncher } from "./KeyraAppLauncher";
import { MobileNav } from "./MobileNav";
import { KeyraLogo } from "@/components/brand/KeyraLogo";
import { buildGetStartedAccessUrl, keyraDeveloperPortalUrl, keyraMarketingOrigin } from "@/lib/keyraAppUrls";
import { globalDeploymentOrigin } from "@/lib/site-branding";

type NavItem = { href: string; label: string; external?: boolean };

function buildNav(marketing: string): NavItem[] {
  return [
    { href: `${marketing}/#problem`, label: "Why identity" },
    { href: `${marketing}/#missing-layer`, label: "The shift" },
    { href: `${marketing}/#for`, label: "Who it's for" },
    { href: `${marketing}/#global`, label: "Global" },
    { href: keyraDeveloperPortalUrl(), label: "Developers", external: true },
  ];
}

export function SiteHeader() {
  const marketing = keyraMarketingOrigin();
  const accessHref = useMemo(
    () => buildGetStartedAccessUrl(`${globalDeploymentOrigin()}/`),
    [],
  );
  const nav = useMemo(() => buildNav(marketing), [marketing]);

  return (
    <header className="keyra-site-header-shell z-[var(--keyra-z-header)]">
      <div className="relative mx-auto flex min-h-12 w-full min-w-0 max-w-7xl items-center justify-between gap-2 px-3 pt-1.5 sm:px-6 lg:h-14 lg:grid lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)_auto] lg:items-center lg:gap-x-5 lg:pt-0">
        <Link
          href="/"
          className="relative z-0 flex min-w-0 shrink-0 items-center justify-start overflow-visible lg:col-start-1 lg:row-start-1 lg:h-14 lg:pr-3"
          aria-label="Keyra Global Deployment"
        >
          <KeyraLogo variant="header" showWordmark={false} />
        </Link>

        <nav
          className="relative hidden min-h-0 min-w-0 lg:col-start-2 lg:row-start-1 lg:flex lg:items-center lg:justify-center lg:mr-4"
          aria-label="Primary"
          style={{ lineHeight: "1.5" }}
        >
          <div className="flex max-w-full flex-nowrap items-center justify-center gap-2 overflow-visible whitespace-nowrap px-2">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : "noopener noreferrer"}
                className="relative flex min-w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium leading-relaxed text-keyra-primary/90 transition-colors hover:bg-black/[0.05] hover:text-keyra-primary lg:px-4"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="relative z-10 flex shrink-0 flex-nowrap items-center justify-end gap-2 lg:col-start-3 lg:row-start-1 lg:pl-3 xl:gap-3 xl:pl-5">
          <div className="flex shrink-0 items-center gap-2">
            <KeyraAppLauncher />
            <AccountMenu />
            <MobileNav />
          </div>

          <div
            className="hidden min-w-0 shrink-0 flex-row flex-nowrap items-stretch rounded-[var(--keyra-radius-pill)] border border-keyra-border bg-keyra-surface/90 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md sm:flex sm:p-1"
            aria-label="Access Get Started and Be Protected Online"
          >
            <a
              href={accessHref}
              className="flex shrink-0 items-center whitespace-nowrap px-2 py-2 text-xs font-medium leading-none text-keyra-accent transition duration-300 ease-out hover:bg-[rgba(255,255,255,0.04)] hover:text-keyra-primary sm:px-3 sm:text-sm"
            >
              Access
            </a>
            <div className="my-1.5 w-px shrink-0 self-stretch bg-keyra-border" aria-hidden />
            <a
              href={`${marketing}/#get-protected`}
              className="inline-flex min-w-0 shrink-0"
              rel="noopener noreferrer"
            >
              <span className="flex items-center whitespace-nowrap rounded-[var(--keyra-radius-pill)] bg-[var(--keyra-action)] px-2 py-2 text-xs font-medium leading-none text-keyra-primary ring-1 ring-[var(--keyra-action-border)] transition duration-300 ease-out hover:bg-[rgba(255,255,255,0.05)] sm:px-3 sm:text-sm">
                <span className="sm:hidden">Get protected</span>
                <span className="hidden sm:inline">Be Protected Online</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
