import Link from "next/link";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { countryWhereFromAuth, telcoWhereFromAuth } from "@/lib/deployments/adminContext";
import { createServerNodeFromForm } from "@/app/admin/deployments/actions";
import { Button } from "@/components/ui/Button";
import { canViewScopedTarget, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";

const assetLoaders = {
  country: (cid: string) =>
    prisma.countryDeployment.findUnique({ where: { id: cid }, select: { id: true, regionId: true } }),
  telco: (tid: string) =>
    prisma.telcoDeployment.findUnique({
      where: { id: tid },
      select: { id: true, countryId: true, country: { select: { id: true, regionId: true } } },
    }),
};

export default async function AdminServerNodesPage() {
  const auth = await assertAdminServer();
  const raw = await prisma.serverNode.findMany({ orderBy: { updatedAt: "desc" }, take: 400 });
  const nodes = [];
  for (const n of raw) {
    if (await canViewScopedTarget(auth, n.targetType, n.targetId, assetLoaders)) {
      nodes.push(n);
    }
  }

  const cw = await countryWhereFromAuth(auth);
  const countries = await prisma.countryDeployment.findMany({
    where: cw ?? {},
    orderBy: { name: "asc" },
    select: { id: true, name: true, iso2: true },
  });
  const tw = await telcoWhereFromAuth(auth);
  const telcos = await prisma.telcoDeployment.findMany({
    where: tw ?? {},
    orderBy: { name: "asc" },
    include: { country: { select: { iso2: true } } },
  });

  const canMutate =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" && !isReadOnlyRole(auth) && !isComplianceReviewer(auth));

  const showCreate = canMutate && (countries.length > 0 || telcos.length > 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-keyra-primary">Server nodes</h1>
      <p className="mt-2 text-sm text-keyra-text-2">FQDN targets for country or telco assets you are allowed to see.</p>

      <div className="mt-8 overflow-x-auto rounded-[var(--keyra-radius-card)] border border-keyra-border">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-[rgba(255,255,255,0.03)] text-xs uppercase tracking-wider text-keyra-text-2">
            <tr>
              <th className="px-3 py-2">FQDN</th>
              <th className="px-3 py-2">Env</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-keyra-border">
            {nodes.map((n) => (
              <tr key={n.id}>
                <td className="px-3 py-3 text-keyra-primary">{n.fqdn}</td>
                <td className="px-3 py-3 text-keyra-text-2">{n.environment}</td>
                <td className="px-3 py-3 text-xs text-keyra-text-2">
                  {n.targetType} · {n.targetId}
                </td>
                <td className="px-3 py-3 text-keyra-text-2">{n.status}</td>
                <td className="px-3 py-3 text-right">
                  <Link href={`/admin/deployments/server-nodes/${n.id}`} className="text-keyra-accent underline-offset-4 hover:underline">
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
          <h2 className="text-lg font-semibold text-keyra-primary">Create server node</h2>
          <form action={createServerNodeFromForm} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Target type
              <select name="targetType" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary">
                <option value="COUNTRY">COUNTRY</option>
                <option value="TELCO">TELCO</option>
              </select>
            </label>
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Target (country)
              <select name="targetIdCountry" className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary">
                <option value="">—</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.iso2})
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs text-keyra-text-2 sm:col-span-2">
              For COUNTRY targets, pick the country above. For TELCO, pick a telco below (only one target applies).
            </p>
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Target (telco)
              <select name="targetIdTelco" className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary">
                <option value="">—</option>
                {telcos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.country.iso2})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              FQDN
              <input name="fqdn" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="text-sm text-keyra-text-2">
              Environment
              <select name="environment" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary">
                <option value="PROD">PROD</option>
                <option value="STAGE">STAGE</option>
                <option value="TEST">TEST</option>
              </select>
            </label>
            <label className="text-sm text-keyra-text-2">
              Status
              <select name="status" className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary">
                <option value="IDENTIFIED">IDENTIFIED</option>
                <option value="INSTITUTIONAL_AWARENESS">INSTITUTIONAL_AWARENESS</option>
                <option value="TVIP">TVIP</option>
                <option value="OPERATIONAL">OPERATIONAL</option>
              </select>
            </label>
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Healthcheck URL
              <input name="healthcheckUrl" className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Metadata JSON (optional)
              <textarea name="metadataJson" rows={3} className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 font-mono text-xs text-keyra-primary" />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" variant="primary">
                Create
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
