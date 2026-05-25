import type { AdminDataRoom, DataRoomDocumentKind, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { AdminDataRoomView } from "./dataRoomConstants";
import { parseMaterialSortOrder } from "@/lib/materials/materialSortOrder";

export function toAdminDataRoomView(row: AdminDataRoom): AdminDataRoomView {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url,
    s3Key: row.s3Key,
    mimeType: row.mimeType,
    documentKind: row.documentKind,
    fileName: row.fileName,
    fileSizeBytes: row.fileSizeBytes,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAdminDataRooms(options?: {
  documentKind?: DataRoomDocumentKind;
  newestFirst?: boolean;
}): Promise<AdminDataRoom[]> {
  const where: Prisma.AdminDataRoomWhereInput = { isActive: true };
  if (options?.documentKind) where.documentKind = options.documentKind;

  return prisma.adminDataRoom.findMany({
    where,
    orderBy: options?.newestFirst
      ? [{ createdAt: "desc" }, { sortOrder: "asc" }]
      : [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export type DataRoomInput = {
  title: string;
  description: string | null;
  url: string;
  s3Key: string;
  mimeType: string;
  documentKind: DataRoomDocumentKind;
  fileName: string;
  fileSizeBytes: number;
  sortOrder: number;
};

export async function ensureDataRoomSortOrderUnique(
  sortOrder: number,
  excludeId?: string,
): Promise<{ ok: true } | { error: string }> {
  const existing = await prisma.adminDataRoom.findFirst({
    where: {
      isActive: true,
      sortOrder,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { title: true },
  });

  if (existing) {
    return {
      error: `Sort order ${sortOrder} is already used by "${existing.title}". Choose a different number.`,
    };
  }

  return { ok: true };
}

type DataRoomInputDraft = Omit<DataRoomInput, "sortOrder" | "documentKind"> & {
  sortOrder?: unknown;
  documentKind?: DataRoomDocumentKind;
};

export function validateDataRoomInput(
  input: DataRoomInputDraft,
  options?: { requireFile?: boolean },
): { data: DataRoomInput } | { error: string } {
  const title = input.title?.trim() ?? "";
  if (!title) return { error: "Title is required." };

  const url = input.url?.trim() ?? "";
  const s3Key = input.s3Key?.trim() ?? "";
  const mimeType = input.mimeType?.trim() ?? "";
  const fileName = input.fileName?.trim() ?? "";
  const fileSizeBytes = input.fileSizeBytes ?? 0;

  if (options?.requireFile) {
    if (!url || !s3Key || !mimeType || !fileName) {
      return { error: "Upload a document before saving." };
    }
    if (!Number.isFinite(fileSizeBytes) || fileSizeBytes <= 0) {
      return { error: "Invalid file size." };
    }
  }

  if (!input.documentKind) return { error: "Document type could not be determined." };

  const description = input.description?.trim() || null;
  const sortParsed = parseMaterialSortOrder(input.sortOrder);
  if ("error" in sortParsed) return { error: sortParsed.error };

  return {
    data: {
      title,
      description,
      url,
      s3Key,
      mimeType,
      documentKind: input.documentKind,
      fileName,
      fileSizeBytes,
      sortOrder: sortParsed.sortOrder,
    },
  };
}
