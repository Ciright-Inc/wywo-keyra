import { NextResponse } from "next/server";
import type { SiteFooterLinkSection } from "@prisma/client";
import prisma from "@/lib/prisma";
import { parseBoolean, parseIntOrNull } from "@/app/api/admin/deployments/_parse";
import { revalidateSiteFooterCache } from "@/lib/siteFooter/revalidate";

function parseSection(raw: unknown): SiteFooterLinkSection | null {
  if (raw === "ON_THIS_SITE" || raw === "KEYRA_APPS") return raw;
  return null;
}

export async function updateSiteFooterLink(
  id: string,
  body: Record<string, unknown>,
): Promise<NextResponse> {
  const existing = await prisma.siteFooterLink.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const expectedSiteAppId =
    typeof body.expectedSiteAppId === "string" && body.expectedSiteAppId.trim().length > 0
      ? body.expectedSiteAppId.trim()
      : null;

  if (
    expectedSiteAppId &&
    existing.section === "ON_THIS_SITE" &&
    existing.siteAppId !== expectedSiteAppId
  ) {
    return NextResponse.json({ error: "Link does not belong to the selected app." }, { status: 409 });
  }

  const data: {
    section?: SiteFooterLinkSection;
    siteAppId?: string | null;
    label?: string;
    href?: string;
    description?: string | null;
    internalPath?: string | null;
    isExternal?: boolean;
    sortOrder?: number;
    isPublished?: boolean;
  } = {};

  const section = parseSection(body.section);
  if (body.section !== undefined) {
    if (!section) return NextResponse.json({ error: "Invalid section." }, { status: 400 });
    data.section = section;
  }
  if (typeof body.label === "string") {
    const trimmed = body.label.trim();
    if (!trimmed) return NextResponse.json({ error: "Label is required." }, { status: 400 });
    data.label = trimmed;
  }
  if (typeof body.href === "string") {
    const trimmed = body.href.trim();
    if (!trimmed) return NextResponse.json({ error: "Href is required." }, { status: 400 });
    data.href = trimmed;
  }
  if (body.description !== undefined) {
    data.description =
      typeof body.description === "string" && body.description.trim().length > 0
        ? body.description.trim()
        : null;
  }
  if (body.internalPath !== undefined) {
    data.internalPath =
      typeof body.internalPath === "string" && body.internalPath.trim().length > 0
        ? body.internalPath.trim()
        : null;
  }
  if (body.isExternal !== undefined) {
    const isExternal = parseBoolean(body.isExternal);
    if (isExternal !== null) data.isExternal = isExternal;
  }
  if (body.sortOrder !== undefined) {
    const sortOrder = parseIntOrNull(body.sortOrder);
    if (sortOrder === null) return NextResponse.json({ error: "Invalid sort order." }, { status: 400 });
    data.sortOrder = sortOrder;
  }
  if (body.isPublished !== undefined) {
    const isPublished = parseBoolean(body.isPublished);
    if (isPublished !== null) data.isPublished = isPublished;
  }

  const resolvedSection = data.section ?? existing.section;
  if (resolvedSection === "ON_THIS_SITE") {
    const siteAppId =
      typeof body.siteAppId === "string" && body.siteAppId.trim().length > 0
        ? body.siteAppId.trim()
        : existing.siteAppId;
    if (!siteAppId) {
      return NextResponse.json({ error: "siteAppId is required for On this site links." }, { status: 400 });
    }
    data.siteAppId = siteAppId;
  } else if (data.section === "KEYRA_APPS") {
    data.siteAppId = null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const link = await prisma.siteFooterLink.update({ where: { id }, data });
  revalidateSiteFooterCache();
  return NextResponse.json({ link });
}

export async function deleteSiteFooterLink(
  id: string,
  expectedSiteAppId?: string | null,
): Promise<NextResponse> {
  const existing = await prisma.siteFooterLink.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (
    expectedSiteAppId &&
    existing.section === "ON_THIS_SITE" &&
    existing.siteAppId !== expectedSiteAppId
  ) {
    return NextResponse.json({ error: "Link does not belong to the selected app." }, { status: 409 });
  }

  await prisma.siteFooterLink.delete({ where: { id } });
  revalidateSiteFooterCache();
  return NextResponse.json({ ok: true });
}
