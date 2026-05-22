import type { Metadata } from "next";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { listAccessRequestsForAdmin } from "@/lib/deployments/adminContext";
import { AccessRequestsClient } from "./AccessRequestsClient";

export const metadata: Metadata = {
  title: "Access requests",
};

export default async function AdminAccessRequestsPage() {
  const auth = await assertAdminServer("/admin/deployments/access-requests");
  const requests = await listAccessRequestsForAdmin(auth);

  return (
    <AccessRequestsClient
      initialRequests={requests.map((r) => ({
        id: r.id,
        workEmail: r.workEmail,
        targetType: r.targetType,
        targetId: r.targetId,
        verificationStatus: r.verificationStatus,
        approvalStatus: r.approvalStatus,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
