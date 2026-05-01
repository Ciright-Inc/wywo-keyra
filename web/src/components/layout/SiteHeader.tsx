"use client";

import Link from "next/link";
import { AccountMenu } from "./AccountMenu";
import { MobileNav } from "./MobileNav";
import { KeyraLogo } from "@/components/brand/KeyraLogo";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";

const nav = [
  { href: "/#problem", label: "Why identity" },
  { href: "/#missing-layer", label: "The shift" },
  { href: "/#for", label: "Who it's for" },
  { href: "/#global", label: "Global" },
];

export function SiteHeader() {
  const { user } = useKeyraSession();

  return (
    <header className="sticky top-0 z-50 border-b border-keyra-border bg-keyra-bg/90 backdrop-blur-md">
      <div className="relative mx-auto grid h-16 w-full min-w-0 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-3 sm:gap-6 sm:px-6">
        <Link
          href="/"
          className="flex h-16 shrink-0 items-center py-1 pr-2 sm:pr-3"
          aria-label="Keyra home"
        >
          <KeyraLogo variant="header" showWordmark={false} />
        </Link>

        <nav
          className="relative hidden min-h-0 min-w-0 lg:flex lg:items-center lg:justify-center mr-4"
          aria-label="Primary"
          style={{ lineHeight: '1.5' }}
        >
          <div className="flex max-w-full flex-nowrap items-center justify-center gap-2 overflow-visible whitespace-nowrap px-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium leading-relaxed text-keyra-primary/90 transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-keyra-primary lg:px-4 flex items-center justify-center min-w-fit"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="relative flex shrink-0 items-center justify-end gap-3 py-1 pl-4 sm:gap-4 sm:pl-6">
          <MobileNav />
          <AccountMenu />

          <div
            className="flex shrink-0 flex-row flex-nowrap items-stretch rounded-[var(--keyra-radius-pill)] border border-[rgba(102,227,255,0.38)] bg-[rgba(11,18,32,0.92)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
            aria-label="Sign in and get protected"
          >
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="flex shrink-0 items-center whitespace-nowrap px-3 py-2 text-sm font-semibold leading-none text-keyra-accent transition hover:bg-[rgba(102,227,255,0.09)] hover:text-keyra-primary"
                >
                  Sign in
                </Link>
                <div
                  className="my-1.5 w-px shrink-0 self-stretch bg-[rgba(102,227,255,0.28)]"
                  aria-hidden
                />
              </>
            ) : null}
            <Link href="/#get-protected" className="inline-flex shrink-0">
              <span className="flex items-center whitespace-nowrap rounded-[var(--keyra-radius-pill)] bg-[rgba(102,227,255,0.14)] px-3 py-2 text-sm font-semibold leading-none text-keyra-primary ring-1 ring-[rgba(102,227,255,0.42)] transition hover:bg-[rgba(102,227,255,0.22)]">
                Be Protected Online
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
