import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { updateRegion } from "@/app/admin/deployments/actions";
import { Button } from "@/components/ui/Button";
import { DeploymentAdminRole } from "@prisma/client";
import { canPatchRegion, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";

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

  return (
    <div>
      <h1 className="text-2xl font-semibold text-keyra-primary">Edit region</h1>
      <p className="mt-2 text-sm text-keyra-text-2">{region.name}</p>

      <form action={updateRegion} className="mt-8 keyra-card space-y-3 p-6">
        <input type="hidden" name="id" value={region.id} />
        <label className="block text-sm text-keyra-text-2">
          Name
          <input
            name="name"
            defaultValue={region.name}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Slug
          <input
            name="slug"
            defaultValue={region.slug}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Map key
          <input
            name="mapKey"
            defaultValue={region.mapKey}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Continent code
          <input
            name="continentCode"
            defaultValue={region.continentCode}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Subregion code
          <input
            name="subregionCode"
            defaultValue={region.subregionCode}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Sort order
          <input
            name="sortOrder"
            defaultValue={String(region.sortOrder)}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-keyra-text-2">
          <input name="isPublished" type="checkbox" defaultChecked={region.isPublished} disabled={!canEdit} className="size-4" />
          Published
        </label>
        {canEdit ? <Button type="submit">Save</Button> : <p className="text-sm text-keyra-text-2">Read-only for your role.</p>}
      </form>
    </div>
  );
}
