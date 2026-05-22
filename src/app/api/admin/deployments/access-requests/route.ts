import { NextResponse } from "next/server";
import { RequestApprovalStatus } from "@prisma/client";
import { listAccessRequestsForAdmin, requireDeploymentAuth } from "@/lib/deployments/adminContext";

function isApprovalStatus(v: string): v is RequestApprovalStatus {
  return Object.values(RequestApprovalStatus).includes(v as RequestApprovalStatus);
}

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("approvalStatus") ?? undefined;
  const approvalStatus =
    statusParam && isApprovalStatus(statusParam) ? statusParam : undefined;

  const visible = await listAccessRequestsForAdmin(auth, approvalStatus);

  return NextResponse.json({
    requests: visible.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
