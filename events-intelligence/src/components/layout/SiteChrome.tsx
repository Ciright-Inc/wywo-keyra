import Link from "next/link";
import { KeyraEcosystemFooterPublic } from "@/components/layout/KeyraEcosystemFooterPublic";
import { SITE_LOGO_SRC } from "@/lib/site-branding";

export { SITE_LOGO_SRC };

const links = [
  { href: "/map", label: "Global Map" },
  { href: "/regions", label: "Regions" },
  { href: "/countries", label: "Countries" },
  { href: "/industries", label: "Industries" },
  { href: "/events", label: "Events" },
  { href: "/sat-core", label: "SAT-Core Alignment" },
  { href: "/priority", label: "Priority Events" },
  { href: "/request-meeting", label: "Request Meeting" },
  { href: "/admin/login", label: "Admin Login" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Keyra Global Events Intelligence — home"
        >
          <span className="flex h-[80px] w-[120px] shrink-0 items-center justify-start overflow-hidden">
            <img
              src={SITE_LOGO_SRC}
              alt="Keyra"
              width={316}
              height={212}
              decoding="async"
              fetchPriority="high"
              className="box-border h-[80px] max-h-[80px] w-[120px] max-w-[120px] object-contain object-left"
            />
          </span>
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--muted)]">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-2 py-1 transition hover:bg-[var(--elevated)] hover:text-[var(--fg)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="keyra-site-footer mt-auto border-t border-[var(--keyra-border)]">
      <KeyraEcosystemFooterPublic />
    </footer>
  );
}
