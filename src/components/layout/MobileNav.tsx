"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { buildGetStartedAccessUrl, keyraDeveloperPortalUrl, keyraMarketingOrigin } from "@/lib/keyraAppUrls";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

type NavLink = { href: string; label: string; external?: boolean };

function buildLinks(): NavLink[] {
  return [
    { href: "/#problem", label: "Why identity" },
    { href: "/#missing-layer", label: "The shift" },
    { href: "/#for", label: "Who it's for" },
    { href: "/#global", label: "Global" },
    { href: keyraDeveloperPortalUrl(), label: "Developers", external: true },
    { href: "/", label: "Be Protected Online" },
  ];
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useKeyraSession();
  const router = useRouter();
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
  const links = useMemo(() => buildLinks(), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="relative z-10 shrink-0 lg:hidden">
      <Button
        type="button"
        variant="secondary"
        className="h-10 shrink-0 px-2.5 text-[13px] sm:px-4 sm:text-sm"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((o) => !o)}
      >
        Menu
      </Button>
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="mobile-nav-backdrop"
              className="fixed inset-x-0 bottom-0 top-44 z-[var(--keyra-z-overlay)] cursor-pointer bg-black/40 backdrop-blur-[1px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <motion.nav
              key="mobile-nav-panel"
              id="mobile-nav-panel"
              className="fixed left-0 right-0 top-44 z-[var(--keyra-z-drawer)] max-h-[min(75dvh,calc(100dvh-11rem))] overflow-y-auto border-b border-keyra-border bg-keyra-bg/98 px-4 py-4 shadow-lg backdrop-blur-md lg:hidden"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              aria-label="Mobile primary"
            >
              <ul className="flex flex-col gap-1">
                {links.map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-keyra-primary transition-colors duration-150 active:bg-keyra-surface hover:bg-keyra-surface"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-keyra-primary transition-colors duration-150 active:bg-keyra-surface hover:bg-keyra-surface"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
                {!user ? (
                  <li>
                    <a
                      href={accessHref}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-keyra-accent transition-colors duration-150 active:bg-keyra-surface hover:bg-keyra-surface"
                    >
                      Access
                    </a>
                  </li>
                ) : null}
                {user ? (
                  <>
                    <li>
                      <Link
                        href="/app/profile"
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-keyra-primary transition-colors duration-150 active:bg-keyra-surface hover:bg-keyra-surface"
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-keyra-primary transition-colors duration-150 active:bg-keyra-surface hover:bg-keyra-surface"
                        onClick={async () => {
                          await logout();
                          setOpen(false);
                          router.refresh();
                        }}
                      >
                        Log out
                      </button>
                    </li>
                  </>
                ) : null}
              </ul>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
