import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { updateRegion } from "@/app/admin/deployments/actions";
import { Button } from "@/components/ui/Button";
import { AdminEditPageHeader } from "@/components/admin/AdminEditPageHeader";
import { DeploymentAdminRole } from "@prisma/client";
import { canPatchRegion, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import {
  adminFormCheckboxLabelWide,
  adminFormGrid,
  adminLabel,
  adminLegacyInput,
  adminPanel,
  adminSectionTitle,
  adminCheckbox,
} from "@/lib/admin/adminUiClasses";

type Params = { id: string };

function canViewRegion(auth: Awaited<ReturnType<typeof assertAdminServer>>, regionId: string) {
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
  return canPatchRegion(auth, regionId);
}

export default async function AdminRegionEditPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const auth = await assertAdminServer();
  const region = await prisma.region.findUnique({ where: { id } });
  if (!region) notFound();
  if (!canViewRegion(auth, region.id)) notFound();

  const canEdit =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" && !isReadOnlyRole(auth) && !isComplianceReviewer(auth) && canPatchRegion(auth, region.id));

  const inputClass = adminLegacyInput;

  return (
    <div>
      <AdminEditPageHeader title="Edit region" subtitle={region.name} backHref="/admin/deployments/regions" />

      <div className={`${adminPanel} mt-6`}>
        <h2 className={adminSectionTitle}>Region details</h2>
        <form action={updateRegion} className={adminFormGrid}>
          <input type="hidden" name="id" value={region.id} />
          <label className={`${adminLabel} sm:col-span-2`}>
            Name
            <input name="name" defaultValue={region.name} required disabled={!canEdit} className={inputClass} />
          </label>
          <label className={adminLabel}>
            Slug
            <input name="slug" defaultValue={region.slug} required disabled={!canEdit} className={inputClass} />
          </label>
          <label className={adminLabel}>
            Map key
            <input name="mapKey" defaultValue={region.mapKey} required disabled={!canEdit} className={inputClass} />
          </label>
          <label className={adminLabel}>
            Continent code (M49)
            <input
              name="continentCode"
              defaultValue={region.continentCode}
              required
              disabled={!canEdit}
              className={inputClass}
            />
          </label>
          <label className={adminLabel}>
            Subregion code (M49)
            <input
              name="subregionCode"
              defaultValue={region.subregionCode}
              required
              disabled={!canEdit}
              className={inputClass}
            />
          </label>
          <label className={adminLabel}>
            Sort order
            <input name="sortOrder" defaultValue={String(region.sortOrder)} disabled={!canEdit} className={inputClass} />
          </label>
          <label className={adminFormCheckboxLabelWide}>
            <input
              name="isPublished"
              type="checkbox"
              defaultChecked={region.isPublished}
              disabled={!canEdit}
              className={adminCheckbox}
            />
            Published
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
