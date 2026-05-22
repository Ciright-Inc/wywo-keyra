"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { buildGetStartedAccessUrl, keyraDeveloperPortalUrl, keyraMarketingOrigin } from "@/lib/keyraAppUrls";
import { globalDeploymentOrigin } from "@/lib/site-branding";

type NavLink = { href: string; label: string; external?: boolean };

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function buildLinks(marketing: string): NavLink[] {
  return [
    { href: `${marketing}/#problem`, label: "Why identity" },
    { href: `${marketing}/#missing-layer`, label: "The shift" },
    { href: `${marketing}/#for`, label: "Who it's for" },
    { href: `${marketing}/#global`, label: "Global" },
    { href: keyraDeveloperPortalUrl(), label: "Developers", external: true },
    { href: `${marketing}/`, label: "Be Protected Online" },
  ];
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user } = useKeyraSession();
  const marketing = keyraMarketingOrigin();
  const accessHref = useMemo(
    () => buildGetStartedAccessUrl(`${globalDeploymentOrigin()}/`),
    [],
  );
  const links = useMemo(() => buildLinks(marketing), [marketing]);

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
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[var(--keyra-radius-pill)] border border-keyra-border bg-white text-keyra-primary transition-colors duration-150 ease-out hover:border-black/14 hover:bg-black/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/35 active:border-[rgba(255,255,255,0.14)]"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <HamburgerIcon />
      </button>
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="mobile-nav-backdrop"
              className="fixed inset-x-0 bottom-0 top-44 z-[var(--keyra-z-overlay)] bg-black/40 backdrop-blur-[1px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <motion.nav
              key="mobile-nav-panel"
              id="mobile-nav-panel"
              className="fixed left-0 right-0 top-44 z-[var(--keyra-z-drawer)] max-h-[min(75dvh,calc(100dvh-11rem))] overflow-y-auto border-b border-keyra-border bg-keyra-bg/98 px-4 py-4 shadow-lg backdrop-blur-md lg:hidden"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              aria-label="Mobile primary"
            >
              <ul className="flex flex-col gap-1">
                {links.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-keyra-primary hover:bg-keyra-surface"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                {!user ? (
                  <li>
                    <a
                      href={accessHref}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-keyra-accent hover:bg-keyra-surface"
                    >
                      Access
                    </a>
                  </li>
                ) : null}
              </ul>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
