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
    <header className="sticky top-0 z-50 border-b border-kerya-border bg-kerya-bg">
      <div className="relative mx-auto flex h-28 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
        <Link
          href="/"
          className="group shrink-0"
          aria-label="KEYRA home"
        >
          <KeyraLogo variant="header" showWordmark={false} />
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative rounded-lg px-3 py-2 text-sm font-medium text-kerya-text-2 transition-colors hover:text-kerya-text"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <MobileNav />
          <div className="flex items-center gap-2">
            <Link
              href="/#how-it-works"
              className="hidden sm:inline-flex"
            >
              <Button variant="secondary" className="h-10 px-4 text-[14px]">
                How it works
              </Button>
            </Link>
            <Link
              href="/#get-started"
              className="inline-flex"
            >
              <Button className="h-10 px-4 text-[14px]">Get Protected</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
