import { NextResponse } from "next/server";
import { getAdminSiteFooterConfig } from "@/lib/siteFooter/queries";
import { requireSiteFooterReadAuth } from "@/lib/siteFooter/adminAuth";

export async function GET(req: Request) {
  const auth = await requireSiteFooterReadAuth(req);
  if (auth instanceof Response) return auth;

  const footer = await getAdminSiteFooterConfig();
  return NextResponse.json(footer);
}
