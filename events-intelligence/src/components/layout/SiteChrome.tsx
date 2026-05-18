import Link from "next/link";

const links = [
  { href: "/map", label: "Global Map" },
  { href: "/regions", label: "Regions" },
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
        <Link href="/" className="group">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--muted)]">events.keyra.ie</p>
          <p className="text-lg font-medium tracking-tight text-[var(--fg)] group-hover:opacity-80">
            Keyra Global Events Intelligence
          </p>
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
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--surface)] py-10 text-sm text-[var(--muted)]">
      <div className="mx-auto max-w-6xl px-5">
        <p className="max-w-2xl leading-relaxed">
          Field intelligence for where governments, carriers, banks, platforms, and developers align on
          trust, authentication, identity, fraud resistance, and secure access — not a conference list,
          a decision map.
        </p>
        <p className="mt-6 text-xs uppercase tracking-[0.25em] text-[var(--muted-2)]">
          Keyra · SAT-Core alignment layer
        </p>
      </div>
    </footer>
  );
}
