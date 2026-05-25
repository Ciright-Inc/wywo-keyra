import type { MaterialMediaKind } from "@prisma/client";

export const ALL_MATERIAL_KINDS_FILTER = "ALL" as const;

export type MaterialKindFilter = typeof ALL_MATERIAL_KINDS_FILTER | MaterialMediaKind;

export const MATERIAL_KIND_LABELS: Record<MaterialMediaKind, string> = {
  IMAGE: "Image",
  VIDEO: "Video",
  GIF: "GIF",
  OTHER: "Other",
};

export type AdminMaterialView = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  s3Key: string;
  mimeType: string;
  mediaKind: MaterialMediaKind;
  fileName: string;
  fileSizeBytes: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
