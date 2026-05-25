"use client";

import Link from "next/link";
import { AccountMenu } from "./AccountMenu";
import { KeyraAppLauncher } from "./KeyraAppLauncher";
import { MobileNav } from "./MobileNav";
import { KeyraLogo } from "@/components/brand/KeyraLogo";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { keyraDeveloperPortalUrl } from "@/lib/keyraAppUrls";
import { NEW_TAB_LINK } from "@/lib/newTabLink";
import { useMemo } from "react";

type NavItem = { href: string; label: string; external?: boolean };

function buildNav(): NavItem[] {
  return [
    { href: "/#problem", label: "Why identity" },
    { href: "/#missing-layer", label: "The shift" },
    { href: "/#for", label: "Who it's for" },
    { href: "/#global", label: "Global" },
    { href: keyraDeveloperPortalUrl(), label: "Developers", external: true },
  ];
}

export function SiteHeader() {
  const { user } = useKeyraSession();
  const nav = useMemo(() => buildNav(), []);

  return (
    <header className="keyra-site-header-shell z-[var(--keyra-z-header)]">
      <div className="relative mx-auto flex min-h-12 w-full min-w-0 max-w-7xl items-center justify-between gap-2 px-3 pt-1.5 sm:px-6 xl:h-14 xl:grid xl:grid-cols-[minmax(0,auto)_minmax(0,1fr)_auto] xl:items-center xl:gap-x-5 xl:pt-0">
        <Link
          href="/"
          className="relative z-0 flex min-w-0 shrink-0 items-center justify-start overflow-visible xl:col-start-1 xl:row-start-1 xl:h-14 xl:pr-3"
          aria-label="Keyra home"
        >
          <KeyraLogo variant="header" showWordmark={false} />
        </Link>

        <nav
          className="relative hidden min-h-0 min-w-0 xl:col-start-2 xl:row-start-1 xl:flex xl:items-center xl:justify-center xl:mr-4"
          aria-label="Primary"
          style={{ lineHeight: "1.5" }}
        >
          <div className="flex max-w-full flex-nowrap items-center justify-center gap-2 overflow-visible whitespace-nowrap px-2">
            {nav.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex min-w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium leading-relaxed text-keyra-primary/90 transition-colors hover:bg-black/[0.05] hover:text-keyra-primary xl:px-4"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex min-w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium leading-relaxed text-keyra-primary/90 transition-colors hover:bg-black/[0.05] hover:text-keyra-primary xl:px-4"
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </nav>

        <div className="relative z-10 flex shrink-0 flex-nowrap items-center justify-end gap-2 xl:col-start-3 xl:row-start-1 xl:gap-3 xl:pl-5">
          <div className="flex shrink-0 items-center gap-2">
            <KeyraAppLauncher />
            <AccountMenu />
            <MobileNav />
          </div>

          <div
            className="hidden min-w-0 shrink-0 flex-row flex-nowrap items-stretch rounded-[var(--keyra-radius-pill)] border border-keyra-border bg-keyra-surface/90 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md sm:flex sm:p-1"
            aria-label="Sign in and get protected"
          >
            {!user ? (
              <>
                <Link
                  href="/login"
                  {...NEW_TAB_LINK}
                  className="flex shrink-0 items-center whitespace-nowrap px-2 py-2 text-xs font-medium leading-none text-keyra-accent transition-colors duration-150 ease-out active:bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] hover:text-keyra-primary sm:px-3 sm:text-sm"
                >
                  Sign in
                </Link>
                <div className="my-1.5 w-px shrink-0 self-stretch bg-keyra-border" aria-hidden />
              </>
            ) : null}
            <Link href="/#get-protected" {...NEW_TAB_LINK} className="inline-flex min-w-0 shrink-0">
              <span className="flex items-center whitespace-nowrap rounded-[var(--keyra-radius-pill)] bg-[var(--keyra-action)] px-2 py-2 text-xs font-medium leading-none text-keyra-primary ring-1 ring-[var(--keyra-action-border)] transition-colors duration-150 ease-out active:bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.05)] sm:px-3 sm:text-sm">
                <span className="sm:hidden">Get protected</span>
                <span className="hidden sm:inline">Be Protected Online</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
