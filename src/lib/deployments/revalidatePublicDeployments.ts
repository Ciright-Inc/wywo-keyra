import { revalidateTag } from "next/cache";
import { PUBLIC_DEPLOYMENTS_CACHE_TAG } from "@/lib/deployments/cacheTags";

export function revalidatePublicDeployments(): void {
  revalidateTag(PUBLIC_DEPLOYMENTS_CACHE_TAG, "default");
}
