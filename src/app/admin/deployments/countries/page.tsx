import Link from "next/link";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { countryWhereFromAuth, regionWhereFromAuth } from "@/lib/deployments/adminContext";
import { createCountry } from "@/app/admin/deployments/actions";
import { Button } from "@/components/ui/Button";
import { DeploymentAdminRole } from "@prisma/client";
import { isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";

const STATUS_OPTIONS = ["IDENTIFIED", "INSTITUTIONAL_AWARENESS", "TVIP", "OPERATIONAL"] as const;

export default async function AdminCountriesPage() {
  const auth = await assertAdminServer();
  const cw = await countryWhereFromAuth(auth);
  const countries = await prisma.countryDeployment.findMany({
    where: cw ?? {},
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { region: { select: { name: true, slug: true } } },
  });

  const rw = await regionWhereFromAuth(auth);
  const regions = await prisma.region.findMany({
    where: rw ?? {},
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const canMutate =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" && !isReadOnlyRole(auth) && !isComplianceReviewer(auth));

  const showCreate =
    canMutate &&
    regions.length > 0 &&
    (auth.kind === "legacy_super" ||
      (auth.kind === "user" &&
        (auth.user.role === DeploymentAdminRole.GLOBAL_ADMIN ||
          auth.user.role === DeploymentAdminRole.REGIONAL_ADMIN)));

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-keyra-primary">Countries</h1>
          <p className="mt-2 text-sm text-keyra-text-2">Scoped to your admin role. Edit rows you are permitted to change.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/api/admin/deployments/countries/csv"
            prefetch={false}
            className="text-keyra-accent underline-offset-4 hover:underline"
          >
            Download CSV
          </Link>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-[var(--keyra-radius-card)] border border-keyra-border">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-[rgba(255,255,255,0.03)] text-xs uppercase tracking-wider text-keyra-text-2">
            <tr>
              <th className="px-3 py-2">Country</th>
              <th className="px-3 py-2">ISO2</th>
              <th className="px-3 py-2">Subdomain</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Published</th>
              <th className="px-3 py-2 text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-keyra-border">
            {countries.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-3 text-keyra-primary">{c.name}</td>
                <td className="px-3 py-3 text-keyra-text-2">{c.iso2}</td>
                <td className="px-3 py-3 text-xs text-keyra-text-2">{c.countrySubdomain}</td>
                <td className="px-3 py-3 text-keyra-text-2">{c.status}</td>
                <td className="px-3 py-3 text-keyra-text-2">{c.isPublished ? "Yes" : "No"}</td>
                <td className="px-3 py-3 text-right">
                  <Link href={`/admin/deployments/countries/${c.id}`} className="text-keyra-accent underline-offset-4 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate ? (
        <div className="mt-10 keyra-card p-6">
          <h2 className="text-lg font-semibold text-keyra-primary">Create country</h2>
          <form action={createCountry} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Region
              <select
                name="regionId"
                required
                className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.slug})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-keyra-text-2">
              Name
              <input name="name" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="text-sm text-keyra-text-2">
              ISO2
              <input name="iso2" required maxLength={2} className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="text-sm text-keyra-text-2">
              ISO3
              <input name="iso3" required maxLength={3} className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="text-sm text-keyra-text-2">
              Flag asset key
              <input name="flagAssetKey" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Country subdomain
              <input name="countrySubdomain" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="text-sm text-keyra-text-2">
              Status
              <select name="status" className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-keyra-text-2">
              Sort order
              <input name="sortOrder" type="number" defaultValue={0} className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Population (optional)
              <input name="population" type="number" className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Population display
              <input name="populationDisplay" className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Official reference domain
              <input name="officialReferenceDomain" className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="flex items-center gap-2 text-sm text-keyra-text-2 sm:col-span-2">
              <input name="isPublished" type="checkbox" className="size-4" />
              Published
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" variant="primary">
                Create
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      <p className="mt-6 text-xs text-keyra-text-2">
        CSV import: POST the CSV body to <code className="text-keyra-primary">/api/admin/deployments/countries/csv</code> with an
        authenticated admin session.
      </p>
    </div>
  );
}
