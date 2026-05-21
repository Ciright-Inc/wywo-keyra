"use client";

import Link from "next/link";
import { AccountMenu } from "./AccountMenu";
import { KeyraAppLauncher } from "./KeyraAppLauncher";
import { MobileNav } from "./MobileNav";
import { KeyraLogo } from "@/components/brand/KeyraLogo";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { keyraDeveloperPortalUrl } from "@/lib/keyraAppUrls";
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
      <div className="relative mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 gap-y-0 px-3 py-0.5 sm:px-6 lg:h-14 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)_auto] lg:items-center lg:gap-x-5 lg:gap-y-0 lg:py-0">
        <Link
          href="/"
          className="relative z-0 flex w-full min-w-0 items-center justify-start overflow-visible py-0 lg:col-start-1 lg:row-start-1 lg:h-14 lg:w-auto lg:max-w-none lg:py-0 lg:pr-3"
          aria-label="Keyra home"
        >
          <KeyraLogo variant="header" showWordmark={false} />
        </Link>

        <nav
          className="relative hidden min-h-0 min-w-0 lg:col-start-2 lg:row-start-1 lg:flex lg:items-center lg:justify-center lg:mr-4"
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
                  className="relative flex min-w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium leading-relaxed text-keyra-primary/90 transition-colors hover:bg-black/[0.05] hover:text-keyra-primary lg:px-4"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex min-w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium leading-relaxed text-keyra-primary/90 transition-colors hover:bg-black/[0.05] hover:text-keyra-primary lg:px-4"
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </nav>

        <div className="relative z-10 flex w-full min-w-0 shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 py-0.5 sm:flex-nowrap sm:justify-between lg:col-start-3 lg:row-start-1 lg:w-auto lg:flex-nowrap lg:justify-end lg:gap-2 lg:py-0.5 lg:pl-3 xl:gap-3 xl:pl-5">
          <MobileNav />
          <AccountMenu />

          <div
            className="flex min-w-0 shrink-0 flex-row flex-nowrap items-stretch rounded-[var(--keyra-radius-pill)] border border-keyra-border bg-keyra-surface/90 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md sm:p-1"
            aria-label="Sign in and get protected"
          >
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="flex shrink-0 items-center whitespace-nowrap px-2 py-2 text-xs font-medium leading-none text-keyra-accent transition-colors duration-150 ease-out active:bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] hover:text-keyra-primary sm:px-3 sm:text-sm"
                >
                  Sign in
                </Link>
                <div className="my-1.5 w-px shrink-0 self-stretch bg-keyra-border" aria-hidden />
              </>
            ) : null}
            <Link href="/#get-protected" className="inline-flex min-w-0 shrink-0">
              <span className="flex items-center whitespace-nowrap rounded-[var(--keyra-radius-pill)] bg-[var(--keyra-action)] px-2 py-2 text-xs font-medium leading-none text-keyra-primary ring-1 ring-[var(--keyra-action-border)] transition-colors duration-150 ease-out active:bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.05)] sm:px-3 sm:text-sm">
                <span className="sm:hidden">Get protected</span>
                <span className="hidden sm:inline">Be Protected Online</span>
              </span>
            </Link>
          </div>

          <KeyraAppLauncher />
        </div>
      </div>
    </header>
  );
}
