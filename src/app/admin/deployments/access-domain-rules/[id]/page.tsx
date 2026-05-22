import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { countryWhereFromAuth } from "@/lib/deployments/adminContext";
import { updateAccessDomainRule } from "@/app/admin/deployments/actions";
import { Button } from "@/components/ui/Button";
import { AdminEditPageHeader } from "@/components/admin/AdminEditPageHeader";
import { DeploymentAdminRole } from "@prisma/client";
import { canMutateServerAsset, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import {
  adminCheckbox,
  adminFormCheckboxLabel,
  adminFormGrid,
  adminLabel,
  adminLegacyInput,
  adminPanel,
  adminSectionTitle,
} from "@/lib/admin/adminUiClasses";

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

  const cw = await countryWhereFromAuth(auth);
  const countries = await prisma.countryDeployment.findMany({
    where: cw ?? {},
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, iso2: true },
  });
  const telcos = await prisma.telcoDeployment.findMany({
    where: cw ? { countryId: { in: countries.map((c) => c.id) } } : {},
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, country: { select: { iso2: true } } },
  });

  const countryOptions = countries.map((c) => ({ id: c.id, label: `${c.name} (${c.iso2})` }));
  const telcoOptions = telcos.map((t) => ({ id: t.id, label: `${t.name} (${t.country.iso2})` }));

  const canEdit =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" &&
      !isReadOnlyRole(auth) &&
      !isComplianceReviewer(auth) &&
      (await canMutateServerAsset(auth, rule.targetType, rule.targetId, assetLoaders)));

  const inputClass = adminLegacyInput;
  const selectClass = adminLegacyInput;
  const targetCountryId = rule.targetType === "COUNTRY" ? rule.targetId : "";
  const targetTelcoId = rule.targetType === "TELCO" ? rule.targetId : "";

  return (
    <div>
      <AdminEditPageHeader
        title="Edit access domain rule"
        subtitle={rule.allowedEmailDomain}
        backHref="/admin/deployments/access-domain-rules"
      />

      <div className={`${adminPanel} mt-6`}>
        <h2 className={adminSectionTitle}>Rule details</h2>
        <form action={updateAccessDomainRule} className={adminFormGrid}>
          <input type="hidden" name="id" value={rule.id} />
          <label className={`${adminLabel} sm:col-span-2`}>
            Target type
            <select name="targetType" defaultValue={rule.targetType} disabled className={selectClass}>
              <option value="COUNTRY">COUNTRY</option>
              <option value="TELCO">TELCO</option>
            </select>
          </label>
          <label className={`${adminLabel} sm:col-span-2`}>
            Country target
            <select name="targetIdCountry" defaultValue={targetCountryId} disabled className={selectClass}>
              <option value="">—</option>
              {countryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className={`${adminLabel} sm:col-span-2`}>
            Telco target
            <select name="targetIdTelco" defaultValue={targetTelcoId} disabled className={selectClass}>
              <option value="">—</option>
              {telcoOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className={`${adminLabel} sm:col-span-2`}>
            Allowed email domain
            <input
              name="allowedEmailDomain"
              defaultValue={rule.allowedEmailDomain}
              required
              disabled={!canEdit}
              className={inputClass}
            />
          </label>
          <label className={adminLabel}>
            Verification method
            <select name="verificationMethod" defaultValue={rule.verificationMethod} disabled={!canEdit} className={selectClass}>
              <option value="EMAIL_OTP">EMAIL_OTP</option>
              <option value="SSO">SSO</option>
              <option value="INVITE_ONLY">INVITE_ONLY</option>
            </select>
          </label>
          <label className={adminFormCheckboxLabel}>
            <input name="isActive" type="checkbox" defaultChecked={rule.isActive} disabled={!canEdit} className={adminCheckbox} />
            Active
          </label>
          <div className="sm:col-span-2">
            {canEdit ? (
              <Button type="submit" variant="primary">
                Save changes
              </Button>
            ) : (
              <p className={adminLabel}>Read-only for your role.</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
