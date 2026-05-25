import type { AdminDataRoomView } from "./dataRoomConstants";

/** Authenticated admin proxy — works when the S3 bucket blocks public access. */
export function buildAdminDataRoomFileUrl(s3Key: string): string {
  const key = s3Key.trim();
  if (!key) return "";
  return `/api/admin/deployments/data-rooms/file?key=${encodeURIComponent(key)}`;
}

export function isAllowedDataRoomS3Key(s3Key: string, prefix = "keyra-data-rooms"): boolean {
  const key = s3Key.trim();
  if (!key || key.includes("..") || key.startsWith("/")) return false;
  const base = prefix.replace(/\/$/, "");
  return key === base || key.startsWith(`${base}/`);
}

export function enrichAdminDataRoomView(view: AdminDataRoomView): AdminDataRoomView {
  if (!view.s3Key.trim()) return view;
  return { ...view, url: buildAdminDataRoomFileUrl(view.s3Key) };
}

/** Admin UI + iframe preview — never use raw S3 URLs when a key is known (private buckets). */
export function getDataRoomPreviewUrl(s3Key: string, fallbackUrl = ""): string {
  const key = s3Key.trim();
  if (key) return buildAdminDataRoomFileUrl(key);
  return fallbackUrl;
}
