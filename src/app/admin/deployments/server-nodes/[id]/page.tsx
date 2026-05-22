import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { countryWhereFromAuth } from "@/lib/deployments/adminContext";
import { updateServerNode } from "@/app/admin/deployments/actions";
import { Button } from "@/components/ui/Button";
import { AdminEditPageHeader } from "@/components/admin/AdminEditPageHeader";
import { DeploymentAdminRole } from "@prisma/client";
import { canMutateServerAsset, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import {
  adminFormGrid,
  adminFormHelper,
  adminLabel,
  adminLegacyInput,
  adminPanel,
  adminSectionTitle,
  adminTextareaMono,
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

async function canViewNode(auth: Awaited<ReturnType<typeof assertAdminServer>>, node: { targetType: "COUNTRY" | "TELCO"; targetId: string }) {
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
  return canMutateServerAsset(auth, node.targetType, node.targetId, assetLoaders);
}

export default async function AdminServerNodeEditPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const auth = await assertAdminServer();
  const node = await prisma.serverNode.findUnique({ where: { id } });
  if (!node) notFound();
  if (!(await canViewNode(auth, node))) notFound();

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
      (await canMutateServerAsset(auth, node.targetType, node.targetId, assetLoaders)));

  const metadataStr =
    node.metadataJson && typeof node.metadataJson === "object"
      ? JSON.stringify(node.metadataJson, null, 2)
      : "";

  const inputClass = adminLegacyInput;
  const selectClass = adminLegacyInput;
  const targetCountryId = node.targetType === "COUNTRY" ? node.targetId : "";
  const targetTelcoId = node.targetType === "TELCO" ? node.targetId : "";

  return (
    <div>
      <AdminEditPageHeader title="Edit server node" subtitle={node.fqdn} backHref="/admin/deployments/server-nodes" />

      <div className={`${adminPanel} mt-6`}>
        <h2 className={adminSectionTitle}>Server node details</h2>
        <form action={updateServerNode} className={adminFormGrid}>
          <input type="hidden" name="id" value={node.id} />
          <label className={`${adminLabel} sm:col-span-2`}>
            Target type
            <select name="targetType" defaultValue={node.targetType} disabled className={selectClass}>
              <option value="COUNTRY">COUNTRY</option>
              <option value="TELCO">TELCO</option>
            </select>
          </label>
          <label className={`${adminLabel} sm:col-span-2`}>
            Target (country)
            <select name="targetIdCountry" defaultValue={targetCountryId} disabled className={selectClass}>
              <option value="">—</option>
              {countryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <p className={adminFormHelper}>
            For COUNTRY targets, pick the country above. For TELCO, pick a telco below (only one target applies).
          </p>
          <label className={`${adminLabel} sm:col-span-2`}>
            Target (telco)
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
            FQDN
            <input name="fqdn" defaultValue={node.fqdn} required disabled={!canEdit} className={inputClass} />
          </label>
          <label className={adminLabel}>
            Environment
            <select name="environment" defaultValue={node.environment} disabled={!canEdit} className={selectClass}>
              <option value="PROD">PROD</option>
              <option value="STAGE">STAGE</option>
              <option value="TEST">TEST</option>
            </select>
          </label>
          <label className={adminLabel}>
            Status
            <select name="status" defaultValue={node.status} disabled={!canEdit} className={selectClass}>
              <option value="IDENTIFIED">IDENTIFIED</option>
              <option value="INSTITUTIONAL_AWARENESS">INSTITUTIONAL_AWARENESS</option>
              <option value="TVIP">TVIP</option>
              <option value="OPERATIONAL">OPERATIONAL</option>
            </select>
          </label>
          <label className={`${adminLabel} sm:col-span-2`}>
            Healthcheck URL
            <input name="healthcheckUrl" defaultValue={node.healthcheckUrl ?? ""} disabled={!canEdit} className={inputClass} />
          </label>
          <label className={`${adminLabel} sm:col-span-2`}>
            Metadata JSON (optional)
            <textarea name="metadataJson" rows={3} defaultValue={metadataStr} disabled={!canEdit} className={adminTextareaMono} />
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
