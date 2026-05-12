import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function AdminDeploymentsHome() {
  const [regions, countries, telcos, pendingRequests] = await Promise.all([
    prisma.region.count(),
    prisma.countryDeployment.count(),
    prisma.telcoDeployment.count(),
    prisma.serverAccessRequest.count({ where: { approvalStatus: "PENDING" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-keyra-primary">Deployments overview</h1>
      <p className="mt-2 text-sm text-keyra-text-2">
        Internal control surface for the public deployment registry. Changes revalidate the cached public tree.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="keyra-card p-5">
          <p className="text-xs uppercase tracking-wider text-keyra-text-2">Regions</p>
          <p className="mt-2 text-3xl font-semibold text-keyra-primary">{regions}</p>
        </div>
        <div className="keyra-card p-5">
          <p className="text-xs uppercase tracking-wider text-keyra-text-2">Countries</p>
          <p className="mt-2 text-3xl font-semibold text-keyra-primary">{countries}</p>
        </div>
        <div className="keyra-card p-5">
          <p className="text-xs uppercase tracking-wider text-keyra-text-2">Telcos</p>
          <p className="mt-2 text-3xl font-semibold text-keyra-primary">{telcos}</p>
        </div>
        <div className="keyra-card p-5">
          <p className="text-xs uppercase tracking-wider text-keyra-text-2">Pending access requests</p>
          <p className="mt-2 text-3xl font-semibold text-keyra-primary">{pendingRequests}</p>
        </div>
      </div>

      <div className="mt-10 text-sm text-keyra-text-2">
        <p>
          REST endpoints are available under{" "}
          <code className="text-keyra-primary">/api/admin/deployments/*</code> for automation.
        </p>
        <p className="mt-3">
          Public explorer:{" "}
          <Link className="text-keyra-accent underline-offset-4 hover:underline" href="/global-deployment">
            /global-deployment
          </Link>
        </p>
      </div>
    </div>
  );
}
