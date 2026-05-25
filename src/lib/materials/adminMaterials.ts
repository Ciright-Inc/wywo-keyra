import type { AdminMaterial, MaterialMediaKind, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { AdminMaterialView } from "./materialConstants";
import { parseMaterialSortOrder } from "./materialSortOrder";

export { parseMaterialSortOrder } from "./materialSortOrder";

export function toAdminMaterialView(row: AdminMaterial): AdminMaterialView {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url,
    s3Key: row.s3Key,
    mimeType: row.mimeType,
    mediaKind: row.mediaKind,
    fileName: row.fileName,
    fileSizeBytes: row.fileSizeBytes,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAdminMaterials(options?: {
  mediaKind?: MaterialMediaKind;
  newestFirst?: boolean;
}): Promise<AdminMaterial[]> {
  const where: Prisma.AdminMaterialWhereInput = { isActive: true };
  if (options?.mediaKind) where.mediaKind = options.mediaKind;

  return prisma.adminMaterial.findMany({
    where,
    orderBy: options?.newestFirst
      ? [{ createdAt: "desc" }, { sortOrder: "asc" }]
      : [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export type MaterialInput = {
  title: string;
  description: string | null;
  url: string;
  s3Key: string;
  mimeType: string;
  mediaKind: MaterialMediaKind;
  fileName: string;
  fileSizeBytes: number;
  sortOrder: number;
};

export async function ensureMaterialSortOrderUnique(
  sortOrder: number,
  excludeId?: string,
): Promise<{ ok: true } | { error: string }> {
  const existing = await prisma.adminMaterial.findFirst({
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

type MaterialInputDraft = Omit<MaterialInput, "sortOrder" | "mediaKind"> & {
  sortOrder?: unknown;
  mediaKind?: MaterialMediaKind;
};

export function validateMaterialInput(
  input: MaterialInputDraft,
  options?: { requireFile?: boolean },
): { data: MaterialInput } | { error: string } {
  const title = input.title?.trim() ?? "";
  if (!title) return { error: "Title is required." };

  const url = input.url?.trim() ?? "";
  const s3Key = input.s3Key?.trim() ?? "";
  const mimeType = input.mimeType?.trim() ?? "";
  const fileName = input.fileName?.trim() ?? "";
  const fileSizeBytes = input.fileSizeBytes ?? 0;

  if (options?.requireFile) {
    if (!url || !s3Key || !mimeType || !fileName) {
      return { error: "Upload a media file before saving." };
    }
    if (!Number.isFinite(fileSizeBytes) || fileSizeBytes <= 0) {
      return { error: "Invalid file size." };
    }
  }

  if (!input.mediaKind) return { error: "Media type could not be determined." };

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
      mediaKind: input.mediaKind,
      fileName,
      fileSizeBytes,
      sortOrder: sortParsed.sortOrder,
    },
  };
}
