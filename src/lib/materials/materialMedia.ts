import type { MaterialMediaKind } from "@prisma/client";

/** File picker: any image or video type the browser recognises. */
export const MATERIAL_FILE_ACCEPT = "image/*,video/*";

/** Extension → MIME when the browser reports an empty or generic type. */
const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  jpe: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  heic: "image/heic",
  heif: "image/heif",
  ico: "image/x-icon",
  jfif: "image/jpeg",
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  ogv: "video/ogg",
  ogg: "video/ogg",
  mov: "video/quicktime",
  qt: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  mpeg: "video/mpeg",
  mpg: "video/mpeg",
  mp2: "video/mpeg",
  "3gp": "video/3gpp",
  "3g2": "video/3gpp2",
  wmv: "video/x-ms-wmv",
  flv: "video/x-flv",
};

/** Max upload size: 100 MB (videos); images/gifs typically much smaller. */
export const MATERIAL_MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export const MATERIAL_FILE_TYPE_ERROR =
  "Only image and video files are allowed. Choose a photo or video file — not PDF, Word, ZIP, or other documents.";

function normalizeMime(mimeType: string): string {
  return mimeType.toLowerCase().split(";")[0]?.trim() ?? "";
}

function fileExtension(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop() ?? fileName;
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(dot + 1).toLowerCase() : "";
}

export function isAllowedMaterialMimeType(mimeType: string): boolean {
  const mime = normalizeMime(mimeType);
  if (!mime || mime === "application/octet-stream") return false;
  return mime.startsWith("image/") || mime.startsWith("video/");
}

/** Resolve a trusted image/video MIME from browser type and/or file extension. */
export function resolveMaterialMimeType(file: Pick<File, "name" | "type">): string | null {
  const declared = normalizeMime(file.type ?? "");
  if (isAllowedMaterialMimeType(declared)) return declared;

  const fromExt = EXTENSION_TO_MIME[fileExtension(file.name)];
  if (fromExt && isAllowedMaterialMimeType(fromExt)) return fromExt;

  return null;
}

export function validateMaterialFile(
  file: Pick<File, "name" | "type" | "size">,
): { ok: true; mimeType: string } | { ok: false; error: string } {
  const mimeType = resolveMaterialMimeType(file);
  if (!mimeType) {
    return { ok: false, error: MATERIAL_FILE_TYPE_ERROR };
  }
  if (file.size > MATERIAL_MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `File exceeds maximum size of ${MATERIAL_MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`,
    };
  }
  return { ok: true, mimeType };
}

export function inferMaterialMediaKind(mimeType: string): MaterialMediaKind {
  const mime = normalizeMime(mimeType);
  if (mime === "image/gif") return "GIF";
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  return "OTHER";
}

export function formatMaterialFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}
