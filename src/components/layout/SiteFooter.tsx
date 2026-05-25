import { getPublicSiteFooterConfig } from "@/lib/siteFooter/queries";
import { SiteFooterView } from "./SiteFooterView";

export async function SiteFooter() {
  const config = await getPublicSiteFooterConfig();
  return <SiteFooterView config={config} />;
}
