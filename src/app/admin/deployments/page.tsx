import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function AdminDeploymentsHome() {
  const [regions, countries, telcos, pendingRequests] = await Promise.all([
    prisma.region.count(),
    prisma.countryDeployment.count(),
    prisma.telcoDeployment.count(),
    prisma.serverAccessRequest.count({ where: { approvalStatus: "PENDING" } }),
  ]);

  const stats = [
    { label: "Regions", value: regions, href: "/admin/deployments/regions", description: "Published market groups" },
    { label: "Countries", value: countries, href: "/admin/deployments/countries", description: "Country deployment records" },
    { label: "Telcos", value: telcos, href: "/admin/deployments/telcos", description: "Operator integrations" },
    { label: "Pending requests", value: pendingRequests, href: "/admin/deployments/access-requests", description: "Access reviews waiting" },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-keyra-border bg-keyra-surface px-6 py-7 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.08),transparent_68%)]" />
        <div className="pointer-events-none absolute -bottom-24 left-12 size-44 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.05),transparent_70%)]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-keyra-text-2">
              Deployment registry
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl">
              Deployments overview
            </h1>
            <p className="mt-3 text-sm leading-6 text-keyra-text-2">
              Internal control surface for regions, countries, telcos, access policy, and public
              deployment visibility.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/global-deployment"
              className="rounded-full border border-keyra-border bg-keyra-bg px-4 py-2 text-sm font-medium text-keyra-primary transition hover:border-black/20 hover:bg-keyra-surface"
            >
              Public explorer
            </Link>
            <Link
              href="/admin/deployments/access-requests"
              className="rounded-full bg-[var(--keyra-action)] px-4 py-2 text-sm font-medium text-keyra-primary ring-1 ring-[var(--keyra-action-border)] transition hover:bg-keyra-surface"
            >
              Review access
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl border border-keyra-border bg-keyra-surface/75 p-5 transition hover:-translate-y-0.5 hover:border-black/20 hover:bg-keyra-surface hover:shadow-[0_18px_48px_rgba(0,0,0,0.07)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-keyra-text-2">
                  {stat.label}
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-tight text-keyra-primary">
                  {stat.value}
                </p>
              </div>
              <span className="rounded-full border border-keyra-border px-2 py-1 text-xs text-keyra-text-2 transition group-hover:border-black/25 group-hover:text-keyra-primary">
                Open
              </span>
            </div>
            <p className="mt-4 text-sm text-keyra-text-2">{stat.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="rounded-2xl border border-keyra-border bg-keyra-surface/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-keyra-primary">Registry automation</h2>
              <p className="mt-1 text-sm text-keyra-text-2">
                Use admin APIs for scripted deployment updates and verification workflows.
              </p>
            </div>
            <code className="rounded-full border border-keyra-border bg-keyra-bg px-3 py-1.5 text-xs text-keyra-primary">
              /api/admin/deployments/*
            </code>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link href="/admin/deployments/server-nodes" className="rounded-xl border border-keyra-border bg-keyra-bg px-4 py-3 text-sm font-medium text-keyra-primary transition hover:border-black/20">
              Server nodes
            </Link>
            <Link href="/admin/deployments/access-domain-rules" className="rounded-xl border border-keyra-border bg-keyra-bg px-4 py-3 text-sm font-medium text-keyra-primary transition hover:border-black/20">
              Access domains
            </Link>
            <Link href="/admin/deployments/audit" className="rounded-xl border border-keyra-border bg-keyra-bg px-4 py-3 text-sm font-medium text-keyra-primary transition hover:border-black/20">
              Audit trail
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-keyra-border bg-keyra-bg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-keyra-text-2">Status</p>
          <h2 className="mt-3 text-lg font-semibold text-keyra-primary">Public tree revalidation</h2>
          <p className="mt-2 text-sm leading-6 text-keyra-text-2">
            Changes made here refresh the cached public deployment tree used by the global explorer.
          </p>
          <Link
            href="/global-deployment"
            className="mt-5 inline-flex rounded-full border border-keyra-border bg-keyra-surface px-4 py-2 text-sm font-medium text-keyra-primary transition hover:border-black/20"
          >
            View public map
          </Link>
        </div>
      </section>
    </div>
  );
}
