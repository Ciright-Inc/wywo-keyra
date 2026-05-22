"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "./AccountMenu";
import { KeyraAppLauncher } from "./KeyraAppLauncher";
import { MobileNav } from "./MobileNav";
import { KeyraLogo } from "@/components/brand/KeyraLogo";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { buildGetStartedAccessUrl, keyraDeveloperPortalUrl, keyraMarketingOrigin } from "@/lib/keyraAppUrls";
import { useMemo, useEffect, useState } from "react";
import {
  KEYRA_HEADER_ACTION_ACCESS,
  KEYRA_HEADER_ACTIONS_GROUP,
} from "./headerActionClasses";

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
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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
  const nav = useMemo(() => buildNav(), []);

  async function handleAdminSignOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <header className="keyra-site-header-shell z-[var(--keyra-z-header)] w-full shrink-0">
      <div
        className={
          isAdminRoute
            ? "relative flex w-full min-w-0 items-center justify-between px-4 py-1 sm:px-6 lg:h-14 lg:px-8 lg:py-0 xl:px-10"
            : "relative mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 gap-y-0 px-3 py-0.5 sm:px-6 lg:h-14 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)_auto] lg:items-center lg:gap-x-0 lg:gap-y-0 lg:py-0"
        }
      >
        <Link
          href="/"
          prefetch={false}
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
            className="relative hidden min-h-0 min-w-0 lg:col-start-2 lg:row-start-1 lg:flex lg:items-center lg:justify-end lg:mr-0"
            aria-label="Primary"
            style={{ lineHeight: "1.5" }}
          >
            <div className="flex max-w-full flex-nowrap items-center justify-center gap-2 overflow-visible whitespace-nowrap px-2">
              {nav.map((item) => {
                const isActive =
                  !item.external &&
                  (item.href === pathname ||
                    item.href === `${pathname}${currentHash}` ||
                    (pathname === "/" && !currentHash && item.href === "/#problem"));
                const linkClass = `relative inline-flex items-center justify-center whitespace-nowrap rounded-[9999px] px-4 py-2 text-sm font-medium leading-relaxed text-keyra-primary/90 transition-colors duration-150 ease-out active:bg-black/[0.06] ${
                  isActive
                    ? "bg-black/[0.06] ring-1 ring-black/[0.12] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                    : "hover:bg-black/[0.03]"
                }`;
                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (item.external || !item.href.startsWith("/#")) return;
                  e.preventDefault();
                  const hash = item.href.replace("/#", "");
                  if (pathname !== "/") {
                    window.location.href = `/#${hash}`;
                  } else {
                    window.location.hash = hash;
                  }
                };
                if (item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {item.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={handleClick}
                    className={linkClass}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        ) : null}

        <div
          className={
            isAdminRoute
              ? "relative z-10 flex min-w-0 shrink-0 items-center justify-end gap-0 py-0.5 xl:gap-0"
              : "relative z-10 flex w-full min-w-0 shrink-0 flex-wrap items-center justify-end gap-x-1 gap-y-1 py-0.5 lg:col-start-3 lg:row-start-1 lg:w-auto lg:flex-nowrap lg:justify-end lg:gap-0 lg:py-0.5 lg:pl-0 xl:gap-0 xl:pl-0"
          }
        >
          {!isAdminRoute ? (
            <>
              <div className={KEYRA_HEADER_ACTIONS_GROUP}>
                <MobileNav />
                {!user ? (
                  <a
                    href={accessHref}
                    className={`${KEYRA_HEADER_ACTION_ACCESS} no-underline`}
                  >
                    Access
                  </a>
                ) : null}
              </div>
              <AccountMenu />
            </>
          ) : null}

          {isAdminLoginRoute ? null : isProtectedAdminRoute ? (
            <div
              className="mr-1.5 flex min-w-0 shrink-0 items-center sm:mr-2"
              aria-label="Admin session"
            >
              <button
                type="button"
                onClick={handleAdminSignOut}
                className="flex shrink-0 items-center whitespace-nowrap px-1.5 py-2 text-xs font-medium leading-none text-keyra-accent transition-colors duration-150 ease-out active:bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] hover:text-keyra-primary sm:px-2 sm:text-sm"
              >
                Sign out
              </button>
            </div>
          ) : null}

          <KeyraAppLauncher />
        </div>
      </div>
    </header>
  );
}
