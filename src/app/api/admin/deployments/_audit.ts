import type { DeploymentStatus, Prisma, StatusHistoryTargetType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { emitDeploymentEvent } from "@/lib/deployments/emitDeploymentEvent";
import { revalidatePublicDeployments } from "@/lib/deployments/revalidatePublicDeployments";

export const ADMIN_ACTOR_ID = process.env.KEYRA_ADMIN_ACTOR_ID?.trim() || "admin";
export const ADMIN_ACTOR_ROLE = process.env.KEYRA_ADMIN_ACTOR_ROLE?.trim() || "Global Admin";

export async function writeAudit(params: {
  entityType: string;
  entityId: string;
  action: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  await prisma.auditEvent.create({
    data: {
      actorId: ADMIN_ACTOR_ID,
      actorRole: ADMIN_ACTOR_ROLE,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      payloadJson: (params.payload ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function writeStatusHistory(params: {
  targetType: StatusHistoryTargetType;
  targetId: string;
  previousStatus: DeploymentStatus | null;
  nextStatus: DeploymentStatus;
  reason?: string | null;
}): Promise<void> {
  await prisma.statusHistory.create({
    data: {
      targetType: params.targetType,
      targetId: params.targetId,
      previousStatus: params.previousStatus,
      nextStatus: params.nextStatus,
      changedBy: ADMIN_ACTOR_ID,
      reason: params.reason ?? null,
    },
  });
}

export function notifyDeploymentStatusChanged(params: {
  entityType: string;
  entityId: string;
  previousStatus: DeploymentStatus | null;
  nextStatus: DeploymentStatus;
}): void {
  emitDeploymentEvent({
    name: "deployment.status_changed",
    occurredAt: new Date().toISOString(),
    entityType: params.entityType,
    entityId: params.entityId,
    payload: {
      previousStatus: params.previousStatus,
      nextStatus: params.nextStatus,
    },
  });
}

export function revalidateDeploymentsAfterMutation(): void {
  revalidatePublicDeployments();
}
