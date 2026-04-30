import Link from "next/link";
import { KeyraLogo } from "@/components/brand/KeyraLogo";

const links = [
  { href: "/#problem", label: "Why identity" },
  { href: "/#missing-layer", label: "The shift" },
  { href: "/#for", label: "Who it's for" },
  { href: "/#global", label: "Global" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact us" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-keyra-border bg-keyra-bg">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <Link href="/" className="group inline-flex" aria-label="Keyra home">
            <KeyraLogo variant="footer" showWordmark={false} />
          </Link>
          <div className="flex w-full flex-col items-start gap-4 md:w-auto md:items-end">
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
            <div className="flex items-center justify-end">
              <elevenlabs-convai
                agent-id="agent_4401kbnjtddpfsc9b97n73asggc1"
                variant="tiny"
                dismissible="true"
              />
            </div>
          </div>
        </div>
        <p className="mt-8 border-t border-keyra-border pt-6 text-xs text-keyra-text-2">
          Be Protected Online.
        </p>
      </div>
    </footer>
  );
}
