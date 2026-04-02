import Link from "next/link";
import { KeyraLogo } from "@/components/brand/KeyraLogo";

const links = [
  { href: "/#product", label: "Product" },
  { href: "/#families", label: "Families" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#get-started", label: "Get Started" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-kerya-border bg-kerya-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <Link href="/" className="group inline-flex" aria-label="KEYRA home">
            <KeyraLogo variant="footer" showWordmark={false} />
          </Link>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-kerya-text-2 transition hover:text-kerya-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 border-t border-kerya-border pt-6 text-xs text-kerya-text-2">
          KEYRA = Protection
        </p>
      </div>
    </footer>
  );
}
