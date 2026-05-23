"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { KEYRA_HEADER_ACTION_MENU_ICON } from "./headerActionClasses";
import { keyraDeveloperPortalUrl } from "@/lib/keyraAppUrls";
import { useGetStartedAccessHref } from "@/lib/useGetStartedAccessHref";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useClientReady } from "@/lib/useClientReady";

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
  const clientReady = useClientReady();
  const accessHref = useGetStartedAccessHref();
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
      <button
        type="button"
        className={KEYRA_HEADER_ACTION_MENU_ICON}
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
              className="fixed inset-x-0 bottom-0 top-[var(--keyra-header-offset)] z-[var(--keyra-z-overlay)] cursor-pointer bg-black/40 backdrop-blur-[1px] lg:hidden"
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
              className="fixed left-0 right-0 top-[var(--keyra-header-offset)] z-[var(--keyra-z-drawer)] max-h-[min(75dvh,calc(100dvh-var(--keyra-header-offset)-1rem))] overflow-y-auto border-b border-keyra-border bg-keyra-bg/98 px-4 py-4 shadow-lg backdrop-blur-md lg:hidden"
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
                        prefetch={false}
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
                      <button
                        type="button"
                        className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-keyra-primary transition-colors duration-150 active:bg-keyra-surface hover:bg-keyra-surface"
                        onClick={async () => {
                          await logout();
                          setOpen(false);
                          if (clientReady) router.refresh();
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
