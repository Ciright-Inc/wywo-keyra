"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MobileNav } from "./MobileNav";
import { KeyraLogo } from "@/components/brand/KeyraLogo";

const nav = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/trust", label: "Trust" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-keyra-border/20 bg-keyra-bg/95 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group shrink-0"
          aria-label="KEYRA home"
        >
          <KeyraLogo variant="header" showWordmark={false} />
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "text-keyra-accent"
                      : "text-keyra-muted hover:text-keyra-ink"
                  }`}
                >
                  {item.label}
                  {active ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-keyra-accent-soft"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <MobileNav />
          <div className="flex items-center gap-2">
            <Link
              href="/#waitlist"
              className="hidden rounded-full border border-keyra-border/25 bg-keyra-surface px-4 py-2 text-sm font-medium text-keyra-ink transition hover:border-keyra-accent/35 sm:inline-flex"
            >
              Join the waitlist
            </Link>
            <Link
              href="/#get-started"
              className="inline-flex rounded-full bg-keyra-accent px-3 py-2 text-sm font-semibold text-keyra-surface transition hover:bg-keyra-muted sm:px-4"
            >
              Get protected
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
