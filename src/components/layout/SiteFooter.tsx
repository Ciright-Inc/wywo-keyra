import { SiteFooterContent } from "@/components/layout/SiteFooterContent";
import { fetchSiteFooter, type SiteFooterPayload } from "@/lib/siteFooter";

export async function SiteFooter({ data }: { data?: SiteFooterPayload }) {
  const payload = data ?? (await fetchSiteFooter());
  return <SiteFooterContent data={payload} />;
}
