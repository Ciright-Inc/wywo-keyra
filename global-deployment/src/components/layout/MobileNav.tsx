"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { buildGetStartedAccessUrl, keyraDeveloperPortalUrl, keyraMarketingOrigin } from "@/lib/keyraAppUrls";
import { globalDeploymentOrigin } from "@/lib/site-branding";

type NavLink = { href: string; label: string; external?: boolean };

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
