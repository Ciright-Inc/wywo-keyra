import Link from "next/link";
import prisma from "@/lib/prisma";
import { keyraGlobalDeploymentUrl } from "@/lib/keyraAppUrls";
import { NEW_TAB_LINK } from "@/lib/newTabLink";

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
      <section className="ds-feature-card is-dashboard">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="ds-caption-uppercase">Deployment registry</p>
            <h1 className="ds-display-sm mt-2">Deployments overview</h1>
            <p className="ds-body-sm mt-3 max-w-2xl text-[var(--ds-body)]">
              Internal control surface for regions, countries, telcos, access policy, and public
              deployment visibility.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/admin/deployments/access-requests" className="ds-btn-primary is-sm">
              Review access
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="ds-feature-card is-dashboard block no-underline">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="ds-caption-uppercase">{stat.label}</p>
                <p className="ds-kpi-value mt-2">{stat.value}</p>
              </div>
              <span className="ds-badge-pill">Open</span>
            </div>
            <p className="ds-body-sm mt-4 text-[var(--ds-body)]">{stat.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="ds-admin-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="ds-title-sm">Registry automation</h2>
              <p className="ds-body-sm mt-1 text-[var(--ds-body)]">
                Use admin APIs for scripted deployment updates and verification workflows.
              </p>
            </div>
            <code className="ds-badge-pill font-mono normal-case tracking-normal">/api/admin/deployments/*</code>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link href="/admin/deployments/server-nodes" className="ds-btn-secondary is-sm justify-center">
              Server nodes
            </Link>
            <Link href="/admin/deployments/access-domain-rules" className="ds-btn-secondary is-sm justify-center">
              Access domains
            </Link>
            <Link href="/admin/deployments/audit" className="ds-btn-secondary is-sm justify-center">
              Audit trail
            </Link>
          </div>
        </div>

        <div className="ds-admin-panel bg-[var(--ds-canvas-soft)]">
          <p className="ds-caption-uppercase">Status</p>
          <h2 className="ds-title-sm mt-2">Public tree revalidation</h2>
          <p className="ds-body-sm mt-2 text-[var(--ds-body)]">
            Changes made here refresh the cached public deployment tree used by the global explorer.
          </p>
          <a href={keyraGlobalDeploymentUrl()} className="ds-btn-secondary is-sm mt-5 inline-flex" {...NEW_TAB_LINK}>
            View public map
          </a>
        </div>
      </section>
    </div>
  );
}
