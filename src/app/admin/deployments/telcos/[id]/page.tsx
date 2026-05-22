import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { countryWhereFromAuth } from "@/lib/deployments/adminContext";
import { updateTelco } from "@/app/admin/deployments/actions";
import { Button } from "@/components/ui/Button";
import { AdminEditPageHeader } from "@/components/admin/AdminEditPageHeader";
import { DeploymentAdminRole } from "@prisma/client";
import { canPatchTelco, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import {
  adminBody,
  adminCheckbox,
  adminFormCheckboxLabel,
  adminFormStack,
  adminLabel,
  adminLegacyInput,
  adminPanel,
  adminSectionTitle,
} from "@/lib/admin/adminUiClasses";

type Params = { id: string };

const STATUS_OPTIONS = ["IDENTIFIED", "INSTITUTIONAL_AWARENESS", "TVIP", "OPERATIONAL"] as const;

function canViewTelco(
  auth: Awaited<ReturnType<typeof assertAdminServer>>,
  telco: { id: string; countryId: string },
  country: { id: string; regionId: string },
) {
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
  return canPatchTelco(auth, telco, country);
}

export default async function AdminTelcoEditPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const auth = await assertAdminServer();
  const telco = await prisma.telcoDeployment.findUnique({
    where: { id },
    include: { country: true },
  });
  if (!telco) notFound();
  if (!canViewTelco(auth, telco, telco.country)) notFound();

  const cw = await countryWhereFromAuth(auth);
  const countries = await prisma.countryDeployment.findMany({
    where: cw ?? {},
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, iso2: true },
  });

  const canEdit =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" &&
      !isReadOnlyRole(auth) &&
      !isComplianceReviewer(auth) &&
      canPatchTelco(auth, telco, telco.country));

  const inputClass = adminLegacyInput;
  const selectClass = adminLegacyInput;

  return (
    <div>
      <AdminEditPageHeader title="Edit telco" subtitle={telco.name} backHref="/admin/deployments/telcos" />

      <div className={`${adminPanel} mt-6`}>
        <h2 className={adminSectionTitle}>Telco details</h2>
        <p className={`${adminBody} mt-1 text-[var(--ds-body)]`}>
          Same fields as create. Leave Telco subdomain empty to derive it from the country and slug.
        </p>

        <form action={updateTelco} className={adminFormStack}>
          <input type="hidden" name="id" value={telco.id} />
          <label className={adminLabel}>
            Country
            <select name="countryId" required disabled={!canEdit} defaultValue={telco.countryId} className={selectClass}>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.iso2})
                </option>
              ))}
            </select>
          </label>
          <label className={adminLabel}>
            Name
            <input name="name" defaultValue={telco.name} required disabled={!canEdit} className={inputClass} />
          </label>
          <label className={adminLabel}>
            Slug
            <input name="slug" defaultValue={telco.slug} required disabled={!canEdit} placeholder="telco-slug" className={inputClass} />
          </label>
          <label className={adminLabel}>
            Telco subdomain
            <input
              name="telcoSubdomain"
              defaultValue={telco.telcoSubdomain}
              disabled={!canEdit}
              placeholder="Optional — derived from country + slug if empty"
              className={inputClass}
            />
          </label>
          <label className={adminLabel}>
            Official domain
            <input
              name="officialDomain"
              defaultValue={telco.officialDomain ?? ""}
              disabled={!canEdit}
              placeholder="example.com"
              className={inputClass}
            />
          </label>
          <label className={adminLabel}>
            Status
            <select name="status" defaultValue={telco.status} disabled={!canEdit} className={selectClass}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className={adminLabel}>
            Status change reason (optional)
            <input
              name="statusChangeReason"
              disabled={!canEdit}
              placeholder="Recorded on initial status history for this telco"
              className={inputClass}
            />
          </label>
          <label className={adminLabel}>
            Status note
            <input name="statusNote" defaultValue={telco.statusNote ?? ""} disabled={!canEdit} className={inputClass} />
          </label>
          <label className={adminLabel}>
            Subscribers
            <input
              name="subscribers"
              type="number"
              min={0}
              defaultValue={telco.subscribers ?? ""}
              disabled={!canEdit}
              placeholder="Numeric count"
              className={inputClass}
            />
          </label>
          <label className={adminLabel}>
            Subscribers display
            <input
              name="subscribersDisplay"
              defaultValue={telco.subscribersDisplay ?? ""}
              disabled={!canEdit}
              placeholder='e.g. "120M+"'
              className={inputClass}
            />
          </label>
          <label className={adminLabel}>
            Source label
            <input name="sourceLabel" defaultValue={telco.sourceLabel ?? ""} disabled={!canEdit} className={inputClass} />
          </label>
          <label className={adminLabel}>
            Source URL
            <input name="sourceUrl" type="url" defaultValue={telco.sourceUrl ?? ""} disabled={!canEdit} className={inputClass} />
          </label>
          <label className={adminLabel}>
            Source verified at (ISO)
            <input
              name="sourceVerifiedAt"
              type="datetime-local"
              defaultValue={telco.sourceVerifiedAt ? telco.sourceVerifiedAt.toISOString().slice(0, 16) : ""}
              disabled={!canEdit}
              className={inputClass}
            />
          </label>
          <label className={adminLabel}>
            Sort order
            <input name="sortOrder" type="number" defaultValue={telco.sortOrder} disabled={!canEdit} className={inputClass} />
          </label>
          <label className={adminFormCheckboxLabel}>
            <input name="isPublished" type="checkbox" defaultChecked={telco.isPublished} disabled={!canEdit} className={adminCheckbox} />
            Published
          </label>
          <div className="pt-2">
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
