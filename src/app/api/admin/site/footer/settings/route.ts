import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { SITE_FOOTER_SETTINGS_ID } from "@/lib/siteFooter/defaults";
import { requireSiteFooterWriteAuth } from "@/lib/siteFooter/adminAuth";
import { revalidateSiteFooterCache } from "@/lib/siteFooter/revalidate";

export async function PATCH(req: Request) {
  const auth = await requireSiteFooterWriteAuth(req);
  if (auth instanceof Response) return auth;

  const body = await readJsonObject(req);
  const data: Record<string, string | null> = {};

  if (typeof body.logoSrc === "string") {
    const trimmed = body.logoSrc.trim();
    data.logoSrc = trimmed.length > 0 ? trimmed : null;
  }
  if (typeof body.description === "string") {
    const trimmed = body.description.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Description is required." }, { status: 400 });
    }
    data.description = trimmed;
  }
  if (typeof body.onThisSiteLabel === "string") {
    const trimmed = body.onThisSiteLabel.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "On this site label is required." }, { status: 400 });
    }
    data.onThisSiteLabel = trimmed;
  }
  if (typeof body.keyraAppsLabel === "string") {
    const trimmed = body.keyraAppsLabel.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Keyra apps label is required." }, { status: 400 });
    }
    data.keyraAppsLabel = trimmed;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const settings = await prisma.siteFooterSettings.upsert({
    where: { id: SITE_FOOTER_SETTINGS_ID },
    create: {
      id: SITE_FOOTER_SETTINGS_ID,
      description: typeof data.description === "string" ? data.description : "",
      logoSrc: data.logoSrc ?? null,
      onThisSiteLabel: typeof data.onThisSiteLabel === "string" ? data.onThisSiteLabel : "On this site",
      keyraAppsLabel: typeof data.keyraAppsLabel === "string" ? data.keyraAppsLabel : "Keyra apps",
    },
    update: data,
  });

  revalidateSiteFooterCache();
  return NextResponse.json({ settings });
}
