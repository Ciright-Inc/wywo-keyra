import { StatusHistoryTargetType } from "@prisma/client";
import prisma from "@/lib/prisma";

const MAX_REASON = 280;

export type PublicStatusHistoryEntry = {
  changedAt: string;
  previousStatus: string | null;
  nextStatus: string;
  reason: string | null;
};

export async function listPublicCountryStatusHistory(countryDeploymentId: string): Promise<PublicStatusHistoryEntry[]> {
  const rows = await prisma.statusHistory.findMany({
    where: { targetType: StatusHistoryTargetType.COUNTRY, targetId: countryDeploymentId },
    orderBy: { changedAt: "desc" },
    take: 48,
    select: {
      changedAt: true,
      previousStatus: true,
      nextStatus: true,
      reason: true,
    },
  });

  return rows.map((r) => {
    let reason: string | null = r.reason?.trim() || null;
    if (reason && reason.length > MAX_REASON) reason = `${reason.slice(0, MAX_REASON)}…`;
    return {
      changedAt: r.changedAt.toISOString(),
      previousStatus: r.previousStatus,
      nextStatus: r.nextStatus,
      reason,
    };
  });
}
