import { revalidatePath, revalidateTag } from "next/cache";
import { SITE_FOOTER_CACHE_TAG } from "./cacheTags";

export function revalidateSiteFooterCache(): void {
  try {
    revalidateTag(SITE_FOOTER_CACHE_TAG, "default");
    // Root layout embeds footer data in the RSC payload; purge it when CMS footer changes.
    revalidatePath("/", "layout");
  } catch {
    /* safe in route handlers and scripts */
  }
}
