import Link from "next/link";
import { KeyraLogo } from "@/components/brand/KeyraLogo";

const links = [
  { href: "/#product", label: "Product" },
  { href: "/#families", label: "Families" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#get-started", label: "Get Started" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact us" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-keyra-border bg-keyra-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <Link href="/" className="group inline-flex" aria-label="Keyra home">
            <KeyraLogo variant="footer" showWordmark={false} />
          </Link>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-keyra-text-2 transition hover:text-keyra-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 border-t border-keyra-border pt-6 text-xs text-keyra-text-2">
          Keyra = Protection
        </p>
      </div>
    </footer>
  );
}
