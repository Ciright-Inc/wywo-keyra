import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { regionWhereFromAuth } from "@/lib/deployments/adminContext";
import { updateCountry } from "@/app/admin/deployments/actions";
import { Button } from "@/components/ui/Button";
import { AdminEditPageHeader } from "@/components/admin/AdminEditPageHeader";
import { DeploymentAdminRole } from "@prisma/client";
import { canPatchCountry, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import {
  adminCheckbox,
  adminFormCheckboxLabelWide,
  adminFormGrid,
  adminLabel,
  adminLegacyInput,
  adminPanel,
  adminSectionTitle,
} from "@/lib/admin/adminUiClasses";

type Params = { id: string };

const STATUS_OPTIONS = ["IDENTIFIED", "INSTITUTIONAL_AWARENESS", "TVIP", "OPERATIONAL"] as const;

function canViewCountry(auth: Awaited<ReturnType<typeof assertAdminServer>>, country: { id: string; regionId: string }) {
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
  return canPatchCountry(auth, country);
}

export default async function AdminCountryEditPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const auth = await assertAdminServer();
  const country = await prisma.countryDeployment.findUnique({
    where: { id },
    include: { region: true },
  });
  if (!country) notFound();
  if (!canViewCountry(auth, country)) notFound();

  const rw = await regionWhereFromAuth(auth);
  const regions = await prisma.region.findMany({
    where: rw ?? {},
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const canEdit =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" &&
      !isReadOnlyRole(auth) &&
      !isComplianceReviewer(auth) &&
      canPatchCountry(auth, country));

  const inputClass = adminLegacyInput;
  const selectClass = adminLegacyInput;

  return (
    <div>
      <AdminEditPageHeader title="Edit country" subtitle={country.name} backHref="/admin/deployments/countries" />

      <form action={updateCountry}>
        <input type="hidden" name="id" value={country.id} />

        <div className={`${adminPanel} mt-6`}>
          <h2 className={adminSectionTitle}>Country details</h2>
          <div className={adminFormGrid}>
            <label className={`${adminLabel} sm:col-span-2`}>
              Region
              <select name="regionId" required disabled={!canEdit} defaultValue={country.regionId} className={selectClass}>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.slug})
                  </option>
                ))}
              </select>
            </label>
            <label className={adminLabel}>
              Name
              <input name="name" defaultValue={country.name} required disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              ISO2
              <input name="iso2" defaultValue={country.iso2} required maxLength={2} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              ISO3
              <input name="iso3" defaultValue={country.iso3} required maxLength={3} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Flag asset key
              <input name="flagAssetKey" defaultValue={country.flagAssetKey} required disabled={!canEdit} className={inputClass} />
            </label>
            <label className={`${adminLabel} sm:col-span-2`}>
              Country subdomain
              <input name="countrySubdomain" defaultValue={country.countrySubdomain} required disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Status
              <select name="status" defaultValue={country.status} disabled={!canEdit} className={selectClass}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className={adminLabel}>
              Sort order
              <input name="sortOrder" type="number" defaultValue={country.sortOrder} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={`${adminLabel} sm:col-span-2`}>
              Population (optional)
              <input name="population" type="number" defaultValue={country.population ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={`${adminLabel} sm:col-span-2`}>
              Population display
              <input name="populationDisplay" defaultValue={country.populationDisplay ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={`${adminLabel} sm:col-span-2`}>
              Official reference domain
              <input name="officialReferenceDomain" defaultValue={country.officialReferenceDomain ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminFormCheckboxLabelWide}>
              <input name="isPublished" type="checkbox" defaultChecked={country.isPublished} disabled={!canEdit} className={adminCheckbox} />
              Published
            </label>
          </div>
        </div>

        <div className={`${adminPanel} mt-4`}>
          <h2 className={adminSectionTitle}>Public map &amp; operational profile</h2>
          <input type="hidden" name="countryMapFields" value="1" />
          <div className={adminFormGrid}>
            <label className={adminLabel}>
              Latitude (WGS84)
              <input name="latitude" type="text" inputMode="decimal" defaultValue={country.latitude ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Longitude (WGS84)
              <input name="longitude" type="text" inputMode="decimal" defaultValue={country.longitude ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Visual offset X (map px)
              <input name="visualOffsetX" type="text" inputMode="decimal" defaultValue={country.visualOffsetX} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Visual offset Y (map px)
              <input name="visualOffsetY" type="text" inputMode="decimal" defaultValue={country.visualOffsetY} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={`${adminLabel} sm:col-span-2`}>
              Deployment stage label
              <input name="deploymentStage" defaultValue={country.deploymentStage ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Infrastructure health (0–100)
              <input name="infrastructureHealth" type="number" defaultValue={country.infrastructureHealth ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Node health (0–100)
              <input name="nodeHealth" type="number" defaultValue={country.nodeHealth ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Uptime %
              <input name="uptimePercentage" type="text" inputMode="decimal" defaultValue={country.uptimePercentage ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Auth volume (roll-up)
              <input name="authVolume" type="number" defaultValue={country.authVolume ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Deployment maturity score
              <input name="deploymentScore" type="number" defaultValue={country.deploymentScore ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Connected apps count
              <input name="connectedAppsCount" type="number" defaultValue={country.connectedAppsCount ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={`${adminLabel} sm:col-span-2`}>
              Cluster region
              <input name="clusterRegion" defaultValue={country.clusterRegion ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={`${adminLabel} sm:col-span-2`}>
              Last sync (ISO local)
              <input
                name="lastSyncAt"
                type="datetime-local"
                defaultValue={country.lastSyncAt ? country.lastSyncAt.toISOString().slice(0, 16) : ""}
                disabled={!canEdit}
                className={inputClass}
              />
            </label>
            <label className={adminLabel}>
              SAT protocol coverage
              <input name="satProtocolCoverage" defaultValue={country.satProtocolCoverage ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              SIM / eSIM status
              <input name="simEsimStatus" defaultValue={country.simEsimStatus ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Government integration
              <input name="govIntegrationStatus" defaultValue={country.govIntegrationStatus ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              API status
              <input name="apiStatus" defaultValue={country.apiStatus ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Regulatory readiness
              <input name="regulatoryReadiness" defaultValue={country.regulatoryReadiness ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminLabel}>
              Risk status
              <input name="riskStatus" defaultValue={country.riskStatus ?? ""} disabled={!canEdit} className={inputClass} />
            </label>
            <label className={adminFormCheckboxLabelWide}>
              <input name="aiAgentEnabled" type="checkbox" defaultChecked={country.aiAgentEnabled} disabled={!canEdit} className={adminCheckbox} />
              AI agent enabled (public map)
            </label>
          </div>
        </div>

        <div className="mt-4">
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
  );
}
