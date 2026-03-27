import Link from "next/link";
import { KeyraLogo } from "@/components/brand/KeyraLogo";

const enterpriseCapabilities = [
  {
    title: "Deploy your own KEYRA application",
    body: "Launch a branded trust layer designed for your enterprise users and journeys.",
  },
  {
    title: "Embed the KEYRA SDK",
    body: "Add trusted identity and session protection to web, mobile, and custom internal systems.",
  },
  {
    title: "Support multiple personas",
    body: "Securely support employees, customers, providers, applicants, partners, and media users.",
  },
  {
    title: "Control identity by session",
    body: "Manage role-aware access transitions inside active sessions with confidence and continuity.",
  },
  {
    title: "Unify enterprise trust",
    body: "Create one identity control plane across every application and digital surface.",
  },
];

const navGroups = [
  {
    title: "Platform",
    links: [
      { href: "/", label: "KEYRA Consumer" },
      { href: "/contact", label: "KEYRA Enterprise" },
      { href: "/contact", label: "SDK" },
      { href: "/how-it-works", label: "Identity Management" },
      { href: "/trust", label: "Session Trust" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/contact", label: "Employees" },
      { href: "/contact", label: "Customers" },
      { href: "/contact", label: "Service Providers" },
      { href: "/contact", label: "Applicants" },
      { href: "/contact", label: "Press & Media" },
      { href: "/contact", label: "Custom Applications" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About KEYRA" },
      { href: "/trust", label: "Trust" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-keyra-border/20 bg-keyra-surface">
      <div className="border-b border-keyra-border/20 bg-keyra-accent-soft">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-keyra-accent">
            KEYRA Enterprise
          </p>
          <h2 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-keyra-ink sm:text-4xl">
            One trust layer for every enterprise application, role, and session
          </h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <p className="leading-relaxed text-keyra-muted">
              KEYRA Enterprise enables your organization to deploy its own
              KEYRA-powered trust experience across web applications, mobile
              applications, employee systems, customer account access, and
              service provider environments.
            </p>
            <p className="leading-relaxed text-keyra-muted">
              Embed the KEYRA SDK into existing platforms, custom applications,
              and internal systems, including legacy and web-only environments
              where no mobile app exists today. The result is one trusted
              identity layer with stronger access confidence and session control
              across the business.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-keyra-border/25 bg-keyra-surface p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-keyra-muted">
              A single person can engage your enterprise in different roles. An
              employee, then a customer. A provider, then an applicant. A media
              contact, then a partner. KEYRA enables secure persona switching
              so each user can enter the right role and receive the correct
              experience in that moment.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enterpriseCapabilities.map((capability) => (
              <article
                key={capability.title}
                className="rounded-2xl border border-keyra-border/25 bg-keyra-surface p-5"
              >
                <h3 className="text-sm font-semibold tracking-wide text-keyra-ink">
                  {capability.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-keyra-muted">
                  {capability.body}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex rounded-full bg-keyra-accent px-6 py-3 text-sm font-semibold text-keyra-surface transition hover:bg-keyra-muted"
            >
              Explore KEYRA Enterprise
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-full border border-keyra-border/25 bg-keyra-surface px-6 py-3 text-sm font-semibold text-keyra-ink transition hover:border-keyra-accent/35"
            >
              Deploy the SDK
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-full border border-keyra-border/25 bg-keyra-surface px-6 py-3 text-sm font-semibold text-keyra-ink transition hover:border-keyra-accent/35"
            >
              Talk to Enterprise Team
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-full border border-keyra-border/25 bg-keyra-surface px-6 py-3 text-sm font-semibold text-keyra-ink transition hover:border-keyra-accent/35"
            >
              See Enterprise Architecture
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="group inline-flex" aria-label="KEYRA home">
              <KeyraLogo variant="footer" showWordmark={false} />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-keyra-muted">
              KEYRA Enterprise establishes a unified identity and trust layer
              across customer apps, employee systems, partner access, recruiting
              workflows, and press environments.
            </p>
          </div>

          <nav
            className="grid flex-1 gap-8 sm:grid-cols-3"
            aria-label="Enterprise footer navigation"
          >
            {navGroups.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold text-keyra-ink">
                  {group.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-keyra-muted transition hover:text-keyra-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p className="mt-10 border-t border-keyra-border/20 pt-8 text-center text-xs text-keyra-muted">
          KEYRA Enterprise — the trust layer for every application, every role,
          every session.
        </p>
      </div>
    </footer>
  );
}
