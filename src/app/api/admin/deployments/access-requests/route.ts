import { NextResponse } from "next/server";
import { RequestApprovalStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { canApproveAccessRequestRow, requireDeploymentAuth } from "@/lib/deployments/adminContext";

function isApprovalStatus(v: string): v is RequestApprovalStatus {
  return Object.values(RequestApprovalStatus).includes(v as RequestApprovalStatus);
}

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("approvalStatus") ?? undefined;
  const statusWhere =
    statusParam && isApprovalStatus(statusParam)
      ? { approvalStatus: statusParam }
      : {};

  const rows = await prisma.serverAccessRequest.findMany({
    where: statusWhere,
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const visible = (
    await Promise.all(
      rows.map(async (r) => ({
        r,
        ok: await canApproveAccessRequestRow(auth, {
          targetType: r.targetType,
          targetId: r.targetId,
        }),
      })),
    )
  )
    .filter((x) => x.ok)
    .map((x) => x.r);

  return NextResponse.json({ requests: visible });
}
