import { NextResponse } from "next/server";
import { SiteSocialPlatform } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { parseBoolean, parseIntOrNull } from "@/app/api/admin/deployments/_parse";
import { requireSiteFooterWriteAuth } from "@/lib/siteFooter/adminAuth";
import { revalidateSiteFooterCache } from "@/lib/siteFooter/revalidate";
import { SITE_SOCIAL_PLATFORMS } from "@/lib/siteFooter/socialIcons";

export const dynamic = "force-dynamic";

type Params = { id: string };

function parsePlatform(raw: unknown): SiteSocialPlatform | null {
  if (typeof raw !== "string") return null;
  return SITE_SOCIAL_PLATFORMS.includes(raw as SiteSocialPlatform)
    ? (raw as SiteSocialPlatform)
    : null;
}

export async function PATCH(req: Request, context: { params: Promise<Params> }) {
  const auth = await requireSiteFooterWriteAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const existing = await prisma.siteFooterSocialLink.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await readJsonObject(req);
  const data: Record<string, unknown> = {};

  if (body.platform !== undefined) {
    const platform = parsePlatform(body.platform);
    if (!platform) return NextResponse.json({ error: "Invalid platform." }, { status: 400 });
    data.platform = platform;
  }
  if (typeof body.label === "string") {
    const trimmed = body.label.trim();
    if (!trimmed) return NextResponse.json({ error: "Label is required." }, { status: 400 });
    data.label = trimmed;
  }
  if (typeof body.url === "string") {
    const trimmed = body.url.trim();
    if (!trimmed) return NextResponse.json({ error: "URL is required." }, { status: 400 });
    data.url = trimmed;
  }
  if (body.sortOrder !== undefined) {
    const sortOrder = parseIntOrNull(body.sortOrder);
    if (sortOrder === null) return NextResponse.json({ error: "Invalid sort order." }, { status: 400 });
    data.sortOrder = sortOrder;
  }
  if (body.isPublished !== undefined) {
    data.isPublished = parseBoolean(body.isPublished);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const social = await prisma.siteFooterSocialLink.update({ where: { id }, data });
  revalidateSiteFooterCache();
  return NextResponse.json({ social });
}

export async function DELETE(_req: Request, context: { params: Promise<Params> }) {
  const auth = await requireSiteFooterWriteAuth(_req);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const existing = await prisma.siteFooterSocialLink.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.siteFooterSocialLink.delete({ where: { id } });
  revalidateSiteFooterCache();
  return NextResponse.json({ ok: true });
}
