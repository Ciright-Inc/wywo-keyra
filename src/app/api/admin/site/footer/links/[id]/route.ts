import { NextResponse } from "next/server";
import { SiteFooterLinkSection } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { parseBoolean, parseIntOrNull } from "@/app/api/admin/deployments/_parse";
import { requireSiteFooterWriteAuth } from "@/lib/siteFooter/adminAuth";
import { revalidateSiteFooterCache } from "@/lib/siteFooter/revalidate";

type Params = { id: string };

function parseSection(raw: unknown): SiteFooterLinkSection | null {
  if (raw === "ON_THIS_SITE" || raw === "KEYRA_APPS") return raw;
  return null;
}

export async function PATCH(req: Request, context: { params: Promise<Params> }) {
  const auth = await requireSiteFooterWriteAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const existing = await prisma.siteFooterLink.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await readJsonObject(req);
  const data: Record<string, unknown> = {};

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
    data.isExternal = parseBoolean(body.isExternal);
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

  const link = await prisma.siteFooterLink.update({ where: { id }, data });
  revalidateSiteFooterCache();
  return NextResponse.json({ link });
}

export async function DELETE(_req: Request, context: { params: Promise<Params> }) {
  const auth = await requireSiteFooterWriteAuth(_req);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const existing = await prisma.siteFooterLink.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.siteFooterLink.delete({ where: { id } });
  revalidateSiteFooterCache();
  return NextResponse.json({ ok: true });
}
