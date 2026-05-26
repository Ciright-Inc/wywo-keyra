import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type AuditInput = {
  messageId?: string | null;
  actorUid?: string | null;
  actorPhone?: string | null;
  action: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string | null;
  deviceId?: string | null;
};

function auditJson(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return typeof value === "string" ? value : JSON.stringify(value);
}

export async function recordWywoAudit(input: AuditInput): Promise<void> {
  await prisma.keyraWywoAuditLog.create({
    data: {
      messageId: input.messageId ?? null,
      actorUid: input.actorUid ?? null,
      actorPhone: input.actorPhone ?? null,
      action: input.action,
      oldValueJson: auditJson(input.oldValue),
      newValueJson: auditJson(input.newValue),
      ipAddress: input.ipAddress ?? null,
      deviceId: input.deviceId ?? null,
    },
  });
}

export async function listAuditLogs(opts?: {
  messageId?: string;
  actorPhone?: string;
  action?: string;
  limit?: number;
}) {
  const where: Prisma.KeyraWywoAuditLogWhereInput = {};
  if (opts?.messageId) where.messageId = opts.messageId;
  if (opts?.actorPhone) where.actorPhone = opts.actorPhone;
  if (opts?.action) where.action = opts.action;
  return prisma.keyraWywoAuditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(opts?.limit ?? 100, 1), 500),
  });
}
