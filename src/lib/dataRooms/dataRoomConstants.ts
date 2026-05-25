import type { DataRoomDocumentKind } from "@prisma/client";

export const ALL_DOCUMENT_KINDS_FILTER = "ALL" as const;

export type DocumentKindFilter = typeof ALL_DOCUMENT_KINDS_FILTER | DataRoomDocumentKind;

export const DOCUMENT_KIND_LABELS: Record<DataRoomDocumentKind, string> = {
  PDF: "PDF",
  TEXT: "Text",
  WORD: "Word",
  SPREADSHEET: "Spreadsheet",
  PRESENTATION: "Presentation",
  OTHER: "Document",
};

export type AdminDataRoomView = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  s3Key: string;
  mimeType: string;
  documentKind: DataRoomDocumentKind;
  fileName: string;
  fileSizeBytes: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
