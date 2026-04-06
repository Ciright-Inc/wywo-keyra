"use client";

import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { KeyraLogo } from "@/components/brand/KeyraLogo";
import { Button } from "@/components/ui/Button";

const nav = [
  { href: "/#product", label: "Product" },
  { href: "/#families", label: "Families" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#get-started", label: "Get Started" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-keyra-border bg-keyra-bg/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 w-full min-w-0 max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <Link
          href="/"
          className="group flex h-16 min-w-0 flex-1 items-center py-1"
          aria-label="Keyra home"
        >
          <KeyraLogo variant="header" showWordmark={false} />
        </Link>
        <div className="relative flex min-w-0 shrink-0 items-center justify-end gap-1.5 sm:gap-3">
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-keyra-primary transition-colors hover:text-keyra-text-2"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <MobileNav />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/#how-it-works"
              className="hidden sm:inline-flex"
            >
              <Button
                variant="secondary"
                className="h-10 whitespace-nowrap px-3 text-[13px] sm:px-4 sm:text-sm"
              >
                How it works
              </Button>
            </Link>
            <Link href="/#get-started" className="inline-flex">
              <Button className="h-10 whitespace-nowrap px-3 text-[13px] sm:px-4 sm:text-sm">
                Get Protected
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
