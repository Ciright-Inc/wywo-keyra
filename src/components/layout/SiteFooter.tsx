import Link from "next/link";
import { KeyraLogo } from "@/components/brand/KeyraLogo";

const links = [
  { href: "/about", label: "About KEYRA" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/privacy", label: "Privacy" },
  { href: "/trust", label: "Trust" },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-keyra-border bg-keyra-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="group inline-flex" aria-label="KEYRA home">
              <KeyraLogo variant="footer" />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-keyra-muted">
              The trust layer of the internet — for you and the people you care
              about.
            </p>
          </div>
          <nav
            className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3"
            aria-label="Footer"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-keyra-muted transition hover:text-keyra-accent"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-12 border-t border-keyra-border pt-8 text-center text-xs text-keyra-muted">
          KEYRA — The Trust Layer of the Internet
        </p>
      </div>
    </footer>
  );
}
