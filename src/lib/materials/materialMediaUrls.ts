import type { AdminMaterialView } from "./materialConstants";

/** Authenticated admin proxy — works when the S3 bucket blocks public access. */
export function buildAdminMaterialMediaUrl(s3Key: string): string {
  const key = s3Key.trim();
  if (!key) return "";
  return `/api/admin/deployments/materials/file?key=${encodeURIComponent(key)}`;
}

export function isAllowedMaterialS3Key(s3Key: string, prefix = "keyra-materials"): boolean {
  const key = s3Key.trim();
  if (!key || key.includes("..") || key.startsWith("/")) return false;
  const base = prefix.replace(/\/$/, "");
  return key === base || key.startsWith(`${base}/`);
}

/** Use proxy URL for admin UI; keep canonical S3 URL in the database. */
export function enrichAdminMaterialView(view: AdminMaterialView): AdminMaterialView {
  if (!view.s3Key.trim()) return view;
  return { ...view, url: buildAdminMaterialMediaUrl(view.s3Key) };
}
