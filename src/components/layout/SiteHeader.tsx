"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "./AccountMenu";
import { KeyraAppLauncher } from "./KeyraAppLauncher";
import { MobileNav } from "./MobileNav";
import { KeyraLogo } from "@/components/brand/KeyraLogo";
import { AudienceLaneSwitcher } from "@/components/governance/AudienceLaneSwitcher";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { buildGetStartedAccessUrl, keyraMarketingOrigin } from "@/lib/keyraAppUrls";
import { useMemo } from "react";

const nav = [
  { href: "/#problem", label: "Why identity" },
  { href: "/#missing-layer", label: "The shift" },
  { href: "/#for", label: "Who it's for" },
  { href: "/#global", label: "Global" },
  { href: "/developers", label: "Developers" },
];

export function SiteHeader() {
  const { user } = useKeyraSession();
  const pathname = usePathname();
  const accessHref = useMemo(() => {
    if (typeof window !== "undefined") {
      return buildGetStartedAccessUrl(
        `${window.location.origin}${pathname}${window.location.search || ""}`,
      );
    }
    const base = keyraMarketingOrigin();
    const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return buildGetStartedAccessUrl(`${base}${path}`);
  }, [pathname]);
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLoginRoute = pathname.startsWith("/admin/login");
  const isProtectedAdminRoute = isAdminRoute && !isAdminLoginRoute;

  async function handleAdminSignOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <header className="keyra-site-header-shell z-[var(--keyra-z-header)]">
      <div
        className={
          isAdminRoute
            ? "relative flex w-full min-w-0 items-center justify-between px-4 py-1 sm:px-6 lg:h-14 lg:px-8 lg:py-0 xl:px-10"
            : "relative mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 gap-y-0 px-3 py-0.5 sm:px-6 lg:h-14 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)_auto] lg:items-center lg:gap-x-5 lg:gap-y-0 lg:py-0"
        }
      >
        <Link
          href="/"
          className={
            isAdminRoute
              ? "relative z-0 flex min-w-0 items-center justify-start overflow-visible py-0 lg:h-14"
              : "relative z-0 flex w-full min-w-0 items-center justify-start overflow-visible py-0 lg:col-start-1 lg:row-start-1 lg:h-14 lg:w-auto lg:max-w-none lg:py-0 lg:pr-3"
          }
          aria-label="Keyra home"
        >
          <KeyraLogo variant="header" showWordmark={false} />
        </Link>

        {!isAdminRoute ? (
          <nav
            className="relative hidden min-h-0 min-w-0 lg:col-start-2 lg:row-start-1 lg:flex lg:items-center lg:justify-center lg:mr-4"
            aria-label="Primary"
            style={{ lineHeight: "1.5" }}
          >
            <div className="flex max-w-full flex-nowrap items-center justify-center gap-2 overflow-visible whitespace-nowrap px-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex min-w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium leading-relaxed text-keyra-primary/90 transition-colors hover:bg-black/[0.05] hover:text-keyra-primary lg:px-4"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}

        <div
          className={
            isAdminRoute
              ? "relative z-10 flex min-w-0 shrink-0 items-center justify-end gap-2 py-0.5 xl:gap-3"
              : "relative z-10 flex w-full min-w-0 shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 py-0.5 sm:flex-nowrap sm:justify-between lg:col-start-3 lg:row-start-1 lg:w-auto lg:flex-nowrap lg:justify-end lg:gap-2 lg:py-0.5 lg:pl-3 xl:gap-3 xl:pl-5"
          }
        >
          {!isAdminRoute ? (
            <>
              <MobileNav />
              <AccountMenu />
            </>
          ) : null}

          {isAdminLoginRoute ? null : (
            <div
              className="flex min-w-0 shrink-0 flex-row flex-nowrap items-stretch rounded-[var(--keyra-radius-pill)] border border-keyra-border bg-keyra-surface/90 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md sm:p-1"
              aria-label="Access Get Started and Be Protected Online"
            >
              {isProtectedAdminRoute ? (
                <button
                  type="button"
                  onClick={handleAdminSignOut}
                  className="flex shrink-0 items-center whitespace-nowrap px-2 py-2 text-xs font-medium leading-none text-keyra-accent transition duration-300 ease-out hover:bg-[rgba(255,255,255,0.04)] hover:text-keyra-primary sm:px-3 sm:text-sm"
                >
                  Sign out
                </button>
              ) : !user ? (
                <>
                  <a
                    href={accessHref}
                    className="flex shrink-0 items-center whitespace-nowrap px-2 py-2 text-xs font-medium leading-none text-keyra-accent transition duration-300 ease-out hover:bg-[rgba(255,255,255,0.04)] hover:text-keyra-primary sm:px-3 sm:text-sm"
                  >
                    Access
                  </a>
                  <div className="my-1.5 w-px shrink-0 self-stretch bg-keyra-border" aria-hidden />
                </>
              ) : null}
              {!isAdminRoute ? (
                <Link href="/#get-protected" className="inline-flex min-w-0 shrink-0">
                  <span className="flex items-center whitespace-nowrap rounded-[var(--keyra-radius-pill)] bg-[var(--keyra-action)] px-2 py-2 text-xs font-medium leading-none text-keyra-primary ring-1 ring-[var(--keyra-action-border)] transition duration-300 ease-out hover:bg-[rgba(255,255,255,0.05)] sm:px-3 sm:text-sm">
                    <span className="sm:hidden">Get protected</span>
                    <span className="hidden sm:inline">Be Protected Online</span>
                  </span>
                </Link>
              ) : null}
            </div>
          )}

          <KeyraAppLauncher />
        </div>
      </div>
      {!isAdminRoute ? <AudienceLaneSwitcher /> : null}
    </header>
  );
}
