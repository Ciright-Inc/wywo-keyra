import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { countryWhereFromAuth } from "@/lib/deployments/adminContext";
import { updateTelco } from "@/app/admin/deployments/actions";
import { Button } from "@/components/ui/Button";
import { DeploymentAdminRole } from "@prisma/client";
import { canPatchTelco, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";

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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-keyra-primary">Telco</h1>
          <p className="mt-2 text-sm text-keyra-text-2">{telco.name}</p>
        </div>
        <Link href="/admin/deployments/telcos" className="text-sm text-keyra-accent underline-offset-4 hover:underline">
          Back to list
        </Link>
      </div>

      <form action={updateTelco} className="mt-8 keyra-card space-y-3 p-6">
        <input type="hidden" name="id" value={telco.id} />
        <label className="block text-sm text-keyra-text-2">
          Country
          <select
            name="countryId"
            required
            disabled={!canEdit}
            defaultValue={telco.countryId}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.iso2})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-keyra-text-2">
          Name
          <input
            name="name"
            defaultValue={telco.name}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Slug
          <input
            name="slug"
            defaultValue={telco.slug}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Telco subdomain
          <input
            name="telcoSubdomain"
            defaultValue={telco.telcoSubdomain}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Official domain
          <input
            name="officialDomain"
            defaultValue={telco.officialDomain ?? ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Status
          <select
            name="status"
            defaultValue={telco.status}
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
          Status change reason (optional)
          <input name="statusChangeReason" disabled={!canEdit} className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60" />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Status note
          <input
            name="statusNote"
            defaultValue={telco.statusNote ?? ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Subscribers
          <input
            name="subscribers"
            type="number"
            defaultValue={telco.subscribers ?? ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Subscribers display
          <input
            name="subscribersDisplay"
            defaultValue={telco.subscribersDisplay ?? ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Source label
          <input
            name="sourceLabel"
            defaultValue={telco.sourceLabel ?? ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Source URL
          <input
            name="sourceUrl"
            defaultValue={telco.sourceUrl ?? ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Source verified at (ISO)
          <input
            name="sourceVerifiedAt"
            type="datetime-local"
            defaultValue={telco.sourceVerifiedAt ? telco.sourceVerifiedAt.toISOString().slice(0, 16) : ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Sort order
          <input
            name="sortOrder"
            type="number"
            defaultValue={telco.sortOrder}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-keyra-text-2">
          <input name="isPublished" type="checkbox" defaultChecked={telco.isPublished} disabled={!canEdit} className="size-4" />
          Published
        </label>
        {canEdit ? <Button type="submit">Save</Button> : <p className="text-sm text-keyra-text-2">Read-only for your role.</p>}
      </form>
    </div>
  );
}
