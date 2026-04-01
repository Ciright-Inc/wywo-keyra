"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/#product", label: "Product" },
  { href: "/#families", label: "Families" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#get-started", label: "Get Started" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="secondary"
        className="h-10 px-4 text-[14px]"
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
            className="absolute left-0 right-0 top-full z-40 border-b border-kerya-border bg-kerya-bg px-4 py-4"
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
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-kerya-text hover:bg-kerya-surface"
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
