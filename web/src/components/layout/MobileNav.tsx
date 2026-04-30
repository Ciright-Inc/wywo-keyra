"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/#problem", label: "Why identity" },
  { href: "/#missing-layer", label: "The shift" },
  { href: "/#for", label: "Who it's for" },
  { href: "/#global", label: "Global" },
  { href: "/#get-protected", label: "Be Protected Online" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-20 md:hidden">
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
            className="absolute left-0 right-0 top-full z-40 border-b border-keyra-border bg-keyra-bg/95 px-4 py-4 backdrop-blur-md"
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
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
