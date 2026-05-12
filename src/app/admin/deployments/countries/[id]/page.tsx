import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { regionWhereFromAuth } from "@/lib/deployments/adminContext";
import { updateCountry } from "@/app/admin/deployments/actions";
import { Button } from "@/components/ui/Button";
import { DeploymentAdminRole } from "@prisma/client";
import { canPatchCountry, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";

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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-keyra-primary">Country</h1>
          <p className="mt-2 text-sm text-keyra-text-2">{country.name}</p>
        </div>
        <Link href="/admin/deployments/countries" className="text-sm text-keyra-accent underline-offset-4 hover:underline">
          Back to list
        </Link>
      </div>

      <form action={updateCountry} className="mt-8 keyra-card space-y-3 p-6">
        <input type="hidden" name="id" value={country.id} />
        <label className="block text-sm text-keyra-text-2">
          Region
          <select
            name="regionId"
            required
            disabled={!canEdit}
            defaultValue={country.regionId}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-keyra-text-2">
          Name
          <input
            name="name"
            defaultValue={country.name}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          ISO2
          <input
            name="iso2"
            defaultValue={country.iso2}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          ISO3
          <input
            name="iso3"
            defaultValue={country.iso3}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Flag asset key
          <input
            name="flagAssetKey"
            defaultValue={country.flagAssetKey}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Country subdomain
          <input
            name="countrySubdomain"
            defaultValue={country.countrySubdomain}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Official reference domain
          <input
            name="officialReferenceDomain"
            defaultValue={country.officialReferenceDomain ?? ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Status
          <select
            name="status"
            defaultValue={country.status}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-keyra-text-2">
          Status change reason (optional, when status changes)
          <input
            name="statusChangeReason"
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Status note
          <input
            name="statusNote"
            defaultValue={country.statusNote ?? ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Population
          <input
            name="population"
            type="number"
            defaultValue={country.population ?? ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Population display
          <input
            name="populationDisplay"
            defaultValue={country.populationDisplay ?? ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Source label
          <input
            name="sourceLabel"
            defaultValue={country.sourceLabel ?? ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Source URL
          <input
            name="sourceUrl"
            defaultValue={country.sourceUrl ?? ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Source verified at (ISO)
          <input
            name="sourceVerifiedAt"
            type="datetime-local"
            defaultValue={
              country.sourceVerifiedAt ? country.sourceVerifiedAt.toISOString().slice(0, 16) : ""
            }
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Sort order
          <input
            name="sortOrder"
            type="number"
            defaultValue={country.sortOrder}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-keyra-text-2">
          <input name="isPublished" type="checkbox" defaultChecked={country.isPublished} disabled={!canEdit} className="size-4" />
          Published
        </label>
        {canEdit ? <Button type="submit">Save</Button> : <p className="text-sm text-keyra-text-2">Read-only for your role.</p>}
      </form>
    </div>
  );
}
