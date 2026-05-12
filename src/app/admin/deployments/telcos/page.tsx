import Link from "next/link";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { countryWhereFromAuth, telcoWhereFromAuth } from "@/lib/deployments/adminContext";
import { createTelco } from "@/app/admin/deployments/actions";
import { Button } from "@/components/ui/Button";
import { isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";

const STATUS_OPTIONS = ["IDENTIFIED", "INSTITUTIONAL_AWARENESS", "TVIP", "OPERATIONAL"] as const;

export default async function AdminTelcosPage() {
  const auth = await assertAdminServer();
  const tw = await telcoWhereFromAuth(auth);
  const telcos = await prisma.telcoDeployment.findMany({
    where: tw ?? {},
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { country: { select: { name: true, iso2: true, id: true } } },
  });

  const cw = await countryWhereFromAuth(auth);
  const countries = await prisma.countryDeployment.findMany({
    where: cw ?? {},
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, iso2: true },
  });

  const canMutate =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" && !isReadOnlyRole(auth) && !isComplianceReviewer(auth));

  const showCreate = canMutate && countries.length > 0;

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-keyra-primary">Telcos</h1>
          <p className="mt-2 text-sm text-keyra-text-2">Scoped list with in-browser create and edit where permitted.</p>
        </div>
        <Link
          href="/api/admin/deployments/telcos/csv"
          prefetch={false}
          className="text-sm text-keyra-accent underline-offset-4 hover:underline"
        >
          Download CSV
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-[var(--keyra-radius-card)] border border-keyra-border">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-[rgba(255,255,255,0.03)] text-xs uppercase tracking-wider text-keyra-text-2">
            <tr>
              <th className="px-3 py-2">Telco</th>
              <th className="px-3 py-2">Country</th>
              <th className="px-3 py-2">Subdomain</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Published</th>
              <th className="px-3 py-2 text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-keyra-border">
            {telcos.map((t) => (
              <tr key={t.id}>
                <td className="px-3 py-3 text-keyra-primary">{t.name}</td>
                <td className="px-3 py-3 text-keyra-text-2">
                  {t.country.name} ({t.country.iso2})
                </td>
                <td className="px-3 py-3 text-xs text-keyra-text-2">{t.telcoSubdomain}</td>
                <td className="px-3 py-3 text-keyra-text-2">{t.status}</td>
                <td className="px-3 py-3 text-keyra-text-2">{t.isPublished ? "Yes" : "No"}</td>
                <td className="px-3 py-3 text-right">
                  <Link href={`/admin/deployments/telcos/${t.id}`} className="text-keyra-accent underline-offset-4 hover:underline">
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
          <h2 className="text-lg font-semibold text-keyra-primary">Create telco</h2>
          <form action={createTelco} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Country
              <select
                name="countryId"
                required
                className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary"
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.iso2})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-keyra-text-2">
              Name
              <input name="name" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="text-sm text-keyra-text-2">
              Slug
              <input name="slug" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Telco subdomain (optional — derived from country + slug if empty)
              <input name="telcoSubdomain" className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
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
        CSV import: POST the CSV body to <code className="text-keyra-primary">/api/admin/deployments/telcos/csv</code>.
      </p>
    </div>
  );
}
