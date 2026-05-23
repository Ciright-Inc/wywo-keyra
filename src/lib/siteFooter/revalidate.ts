import { revalidateTag } from "next/cache";
import { SITE_FOOTER_CACHE_TAG } from "./cacheTags";

export function revalidateSiteFooterCache(): void {
  revalidateTag(SITE_FOOTER_CACHE_TAG, "default");
}
