import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const entityType = url.searchParams.get("entityType") ?? undefined;
  const entityId = url.searchParams.get("entityId") ?? undefined;

  const [audit, history] = await Promise.all([
    prisma.auditEvent.findMany({
      where: {
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.statusHistory.findMany({
      where: {
        ...(entityId ? { targetId: entityId } : {}),
      },
      orderBy: { changedAt: "desc" },
      take: 200,
    }),
  ]);

  return NextResponse.json({ audit, statusHistory: history });
}
