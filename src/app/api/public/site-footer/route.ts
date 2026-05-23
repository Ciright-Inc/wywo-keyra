import { NextResponse } from "next/server";
import { getPublicSiteFooterConfig } from "@/lib/siteFooter/queries";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
} as const;

/** Published site footer content for keyra.ie and connected marketing sites. */
export async function GET() {
  const footer = await getPublicSiteFooterConfig();
  return NextResponse.json(footer, { headers: CACHE_HEADERS });
}
