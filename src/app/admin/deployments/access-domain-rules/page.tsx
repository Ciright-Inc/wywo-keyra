import Link from "next/link";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { countryWhereFromAuth, telcoWhereFromAuth } from "@/lib/deployments/adminContext";
import { createAccessDomainRuleFromForm } from "@/app/admin/deployments/actions";
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

export default async function AdminAccessDomainRulesPage() {
  const auth = await assertAdminServer();
  const raw = await prisma.accessDomainRule.findMany({ orderBy: { updatedAt: "desc" }, take: 500 });
  const rules = [];
  for (const r of raw) {
    if (await canViewScopedTarget(auth, r.targetType, r.targetId, assetLoaders)) {
      rules.push(r);
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
      <h1 className="text-2xl font-semibold text-keyra-primary">Access domain rules</h1>
      <p className="mt-2 text-sm text-keyra-text-2">Approved corporate email domains for governed access.</p>

      <div className="mt-8 overflow-x-auto rounded-[var(--keyra-radius-card)] border border-keyra-border">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-[rgba(255,255,255,0.03)] text-xs uppercase tracking-wider text-keyra-text-2">
            <tr>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Domain</th>
              <th className="px-3 py-2">Method</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2 text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-keyra-border">
            {rules.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-3 text-xs text-keyra-text-2">
                  {r.targetType} · {r.targetId}
                </td>
                <td className="px-3 py-3 text-keyra-primary">{r.allowedEmailDomain}</td>
                <td className="px-3 py-3 text-keyra-text-2">{r.verificationMethod}</td>
                <td className="px-3 py-3 text-keyra-text-2">{r.isActive ? "Yes" : "No"}</td>
                <td className="px-3 py-3 text-right">
                  <Link href={`/admin/deployments/access-domain-rules/${r.id}`} className="text-keyra-accent underline-offset-4 hover:underline">
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
          <h2 className="text-lg font-semibold text-keyra-primary">Create rule</h2>
          <form action={createAccessDomainRuleFromForm} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Target type
              <select name="targetType" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary">
                <option value="COUNTRY">COUNTRY</option>
                <option value="TELCO">TELCO</option>
              </select>
            </label>
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Country target
              <select name="targetIdCountry" className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary">
                <option value="">—</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.iso2})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-keyra-text-2 sm:col-span-2">
              Telco target
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
              Allowed email domain
              <input name="allowedEmailDomain" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
            </label>
            <label className="text-sm text-keyra-text-2">
              Verification method
              <select name="verificationMethod" className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary">
                <option value="EMAIL_OTP">EMAIL_OTP</option>
                <option value="SSO">SSO</option>
                <option value="INVITE_ONLY">INVITE_ONLY</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-keyra-text-2">
              <input name="isActive" type="checkbox" defaultChecked className="size-4" />
              Active
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
