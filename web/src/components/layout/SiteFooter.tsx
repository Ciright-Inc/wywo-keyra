import { getDefaultSiteFooterConfig } from "@/lib/siteFooter/defaults";
import type { SiteFooterConfig } from "@/lib/siteFooter/types";
import { SiteFooterView } from "./SiteFooterView";

async function loadPublicSiteFooterConfig(): Promise<SiteFooterConfig> {
  const base = (process.env.NEXT_PUBLIC_KEYRA_MARKETING_ORIGIN?.trim() || "https://keyra.ie").replace(
    /\/+$/,
    "",
  );

  try {
    const res = await fetch(`${base}/api/public/site-footer`, { next: { revalidate: 60 } });
    if (res.ok) return (await res.json()) as SiteFooterConfig;
  } catch {
    /* use defaults */
  }

  return getDefaultSiteFooterConfig();
}

export async function SiteFooter() {
  const config = await loadPublicSiteFooterConfig();
  return <SiteFooterView config={config} />;
}
