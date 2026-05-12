import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { updateServerNode } from "@/app/admin/deployments/actions";
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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-keyra-primary">Server node</h1>
          <p className="mt-2 text-xs text-keyra-text-2">
            {node.targetType} · {node.targetId}
          </p>
        </div>
        <Link href="/admin/deployments/server-nodes" className="text-sm text-keyra-accent underline-offset-4 hover:underline">
          Back to list
        </Link>
      </div>

      <form action={updateServerNode} className="mt-8 keyra-card space-y-3 p-6">
        <input type="hidden" name="id" value={node.id} />
        <label className="block text-sm text-keyra-text-2">
          FQDN
          <input
            name="fqdn"
            defaultValue={node.fqdn}
            required
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Environment
          <select
            name="environment"
            defaultValue={node.environment}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          >
            <option value="PROD">PROD</option>
            <option value="STAGE">STAGE</option>
            <option value="TEST">TEST</option>
          </select>
        </label>
        <label className="block text-sm text-keyra-text-2">
          Status
          <select
            name="status"
            defaultValue={node.status}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          >
            <option value="IDENTIFIED">IDENTIFIED</option>
            <option value="INSTITUTIONAL_AWARENESS">INSTITUTIONAL_AWARENESS</option>
            <option value="TVIP">TVIP</option>
            <option value="OPERATIONAL">OPERATIONAL</option>
          </select>
        </label>
        <label className="block text-sm text-keyra-text-2">
          Healthcheck URL
          <input
            name="healthcheckUrl"
            defaultValue={node.healthcheckUrl ?? ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Last heartbeat (ISO)
          <input
            name="lastHeartbeatAt"
            type="datetime-local"
            defaultValue={node.lastHeartbeatAt ? node.lastHeartbeatAt.toISOString().slice(0, 16) : ""}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Metadata JSON
          <textarea
            name="metadataJson"
            rows={5}
            defaultValue={metadataStr}
            disabled={!canEdit}
            className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 font-mono text-xs text-keyra-primary disabled:opacity-60"
          />
        </label>
        {canEdit ? <Button type="submit">Save</Button> : <p className="text-sm text-keyra-text-2">Read-only for your role.</p>}
      </form>
    </div>
  );
}
