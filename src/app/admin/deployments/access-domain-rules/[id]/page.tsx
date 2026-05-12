import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { updateAccessDomainRule } from "@/app/admin/deployments/actions";
import { Button } from "@/components/ui/Button";
import { DeploymentAdminRole } from "@prisma/client";
import { canMutateServerAsset, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";

type Params = { id: string };

const assetLoaders = {
  country: (cid: string) =>
    prisma.countryDeployment.findUnique({ where: { id: cid }, select: { id: true, regionId: true } }),
  telco: (tid: string) =>
    prisma.telcoDeployment.findUnique({
      where: { id: tid },
      select: { id: true, countryId: true, country: { select: { id: true, regionId: true } } },
    }),
};

async function canViewRule(auth: Awaited<ReturnType<typeof assertAdminServer>>, rule: { targetType: "COUNTRY" | "TELCO"; targetId: string }) {
  if (auth.kind === "legacy_super") return true;
  if (auth.kind !== "user") return false;
  const r = auth.user.role;
  if (
    r === DeploymentAdminRole.GLOBAL_ADMIN ||
    r === DeploymentAdminRole.READ_ONLY ||
    r === DeploymentAdminRole.COMPLIANCE_REVIEWER
  ) {
    return true;
  }
  return canMutateServerAsset(auth, rule.targetType, rule.targetId, assetLoaders);
}

export default async function AdminAccessDomainRuleEditPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const auth = await assertAdminServer();
  const rule = await prisma.accessDomainRule.findUnique({ where: { id } });
  if (!rule) notFound();
  if (!(await canViewRule(auth, rule))) notFound();

  const canEdit =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" &&
      !isReadOnlyRole(auth) &&
      !isComplianceReviewer(auth) &&
      (await canMutateServerAsset(auth, rule.targetType, rule.targetId, assetLoaders)));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-keyra-primary">Access domain rule</h1>
          <p className="mt-2 text-xs text-keyra-text-2">
            {rule.targetType} · {rule.targetId}
          </p>
        </div>
        <Link href="/admin/deployments/access-domain-rules" className="text-sm text-keyra-accent underline-offset-4 hover:underline">
          Back to list
        </Link>
      </div>

      <form action={updateAccessDomainRule} className="mt-8 keyra-card space-y-3 p-6">
        <input type="hidden" name="id" value={rule.id} />
        <label className="block text-sm text-keyra-text-2">
          Allowed email domain
          <input
            name="allowedEmailDomain"
            defaultValue={rule.allowedEmailDomain}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Verification method
          <select
            name="verificationMethod"
            defaultValue={rule.verificationMethod}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          >
            <option value="EMAIL_OTP">EMAIL_OTP</option>
            <option value="SSO">SSO</option>
            <option value="INVITE_ONLY">INVITE_ONLY</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-keyra-text-2">
          <input name="isActive" type="checkbox" defaultChecked={rule.isActive} disabled={!canEdit} className="size-4" />
          Active
        </label>
        {canEdit ? <Button type="submit">Save</Button> : <p className="text-sm text-keyra-text-2">Read-only for your role.</p>}
      </form>
    </div>
  );
}
