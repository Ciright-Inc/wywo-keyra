import type { DataRoomDocumentKind } from "@prisma/client";

export const DATA_ROOM_FILE_ACCEPT =
  ".pdf,.txt,.csv,.md,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,application/pdf,text/*,application/msword,application/vnd.*";

export const DATA_ROOM_MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export const DATA_ROOM_FILE_TYPE_ERROR =
  "Only document files are allowed (PDF, text, Word, Excel, PowerPoint, and similar). Images and videos cannot be uploaded here.";

const EXTENSION_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
  csv: "text/csv",
  md: "text/markdown",
  rtf: "application/rtf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

const BLOCKED_PREFIXES = ["image/", "video/", "audio/"];

function normalizeMime(mimeType: string): string {
  return mimeType.toLowerCase().split(";")[0]?.trim() ?? "";
}

function fileExtension(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop() ?? fileName;
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(dot + 1).toLowerCase() : "";
}

export function isAllowedDataRoomMimeType(mimeType: string): boolean {
  const mime = normalizeMime(mimeType);
  if (!mime || mime === "application/octet-stream") return false;
  if (BLOCKED_PREFIXES.some((p) => mime.startsWith(p))) return false;
  if (mime === "application/pdf") return true;
  if (mime.startsWith("text/")) return true;
  if (mime.includes("word") || mime.includes("document") || mime.includes("msword")) return true;
  if (mime.includes("sheet") || mime.includes("excel")) return true;
  if (mime.includes("presentation") || mime.includes("powerpoint")) return true;
  if (mime === "application/rtf") return true;
  return false;
}

export function resolveDataRoomMimeType(file: Pick<File, "name" | "type">): string | null {
  const declared = normalizeMime(file.type ?? "");
  if (isAllowedDataRoomMimeType(declared)) return declared;

  const fromExt = EXTENSION_TO_MIME[fileExtension(file.name)];
  if (fromExt && isAllowedDataRoomMimeType(fromExt)) return fromExt;

  return null;
}

export function validateDataRoomFile(
  file: Pick<File, "name" | "type" | "size">,
): { ok: true; mimeType: string } | { ok: false; error: string } {
  const mimeType = resolveDataRoomMimeType(file);
  if (!mimeType) {
    return { ok: false, error: DATA_ROOM_FILE_TYPE_ERROR };
  }
  if (file.size > DATA_ROOM_MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `File exceeds maximum size of ${DATA_ROOM_MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`,
    };
  }
  return { ok: true, mimeType };
}

export function inferDataRoomDocumentKind(mimeType: string): DataRoomDocumentKind {
  const mime = normalizeMime(mimeType);
  if (mime === "application/pdf") return "PDF";
  if (mime.startsWith("text/")) return "TEXT";
  if (mime.includes("word") || mime.includes("msword") || mime === "application/rtf") return "WORD";
  if (mime.includes("sheet") || mime.includes("excel")) return "SPREADSHEET";
  if (mime.includes("presentation") || mime.includes("powerpoint")) return "PRESENTATION";
  return "OTHER";
}

export function formatDataRoomFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}

export function canInlinePreviewDataRoom(mimeType: string, documentKind: DataRoomDocumentKind): boolean {
  const mime = normalizeMime(mimeType);
  return documentKind === "PDF" || mime === "application/pdf" || documentKind === "TEXT" || mime.startsWith("text/");
}
