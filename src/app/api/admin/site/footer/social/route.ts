import { NextResponse } from "next/server";
import { SiteSocialPlatform } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { parseBoolean, parseIntOrNull } from "@/app/api/admin/deployments/_parse";
import { requireSiteFooterWriteAuth } from "@/lib/siteFooter/adminAuth";
import { revalidateSiteFooterCache } from "@/lib/siteFooter/revalidate";
import { SITE_SOCIAL_PLATFORMS } from "@/lib/siteFooter/socialIcons";

function parsePlatform(raw: unknown): SiteSocialPlatform | null {
  if (typeof raw !== "string") return null;
  return SITE_SOCIAL_PLATFORMS.includes(raw as SiteSocialPlatform)
    ? (raw as SiteSocialPlatform)
    : null;
}

export async function POST(req: Request) {
  const auth = await requireSiteFooterWriteAuth(req);
  if (auth instanceof Response) return auth;

  const body = await readJsonObject(req);
  const platform = parsePlatform(body.platform) ?? SiteSocialPlatform.CUSTOM;
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (!label || !url) {
    return NextResponse.json({ error: "Label and URL are required." }, { status: 400 });
  }

  const sortOrder = parseIntOrNull(body.sortOrder) ?? 100;
  const isPublished = parseBoolean(body.isPublished) ?? true;

  const social = await prisma.siteFooterSocialLink.create({
    data: { platform, label, url, sortOrder, isPublished },
  });

  revalidateSiteFooterCache();
  return NextResponse.json({ social }, { status: 201 });
}
