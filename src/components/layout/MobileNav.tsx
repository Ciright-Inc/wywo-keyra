"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { useRouter } from "next/navigation";

const links = [
  { href: "/#problem", label: "Why identity" },
  { href: "/#missing-layer", label: "The shift" },
  { href: "/#for", label: "Who it's for" },
  { href: "/#global", label: "Global" },
  { href: "/#get-protected", label: "Be Protected Online" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useKeyraSession();
  const router = useRouter();

  return (
    <div className="relative z-20 lg:hidden">
      <Button
        type="button"
        variant="secondary"
        className="h-10 shrink-0 px-3 text-[13px] sm:px-4 sm:text-sm"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((o) => !o)}
      >
        Menu
      </Button>
      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-nav-panel"
            className="absolute left-0 right-0 top-full z-[60] border-b border-keyra-border bg-keyra-bg/95 px-4 py-4 shadow-lg backdrop-blur-md"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            aria-label="Mobile primary"
          >
            <ul className="flex flex-col gap-1">
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-keyra-primary hover:bg-keyra-surface"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {!user ? (
                <li>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-keyra-accent hover:bg-keyra-surface"
                  >
                    Sign in
                  </Link>
                </li>
              ) : null}
              {user ? (
                <>
                  <li>
                    <Link
                      href="/app/profile"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-keyra-primary hover:bg-keyra-surface"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-keyra-primary hover:bg-keyra-surface"
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
        ) : null}
      </AnimatePresence>
    </div>
  );
}
