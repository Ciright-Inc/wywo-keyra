import { NextResponse } from "next/server";
import { SiteFooterLinkSection } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { parseBoolean, parseIntOrNull } from "@/app/api/admin/deployments/_parse";
import { requireSiteFooterWriteAuth } from "@/lib/siteFooter/adminAuth";
import { revalidateSiteFooterCache } from "@/lib/siteFooter/revalidate";

function parseSection(raw: unknown): SiteFooterLinkSection | null {
  if (raw === "ON_THIS_SITE" || raw === "KEYRA_APPS") return raw;
  return null;
}

export async function POST(req: Request) {
  const auth = await requireSiteFooterWriteAuth(req);
  if (auth instanceof Response) return auth;

  const body = await readJsonObject(req);
  const section = parseSection(body.section);
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const href = typeof body.href === "string" ? body.href.trim() : "";

  if (!section) {
    return NextResponse.json({ error: "Valid section is required." }, { status: 400 });
  }
  if (!label || !href) {
    return NextResponse.json({ error: "Label and href are required." }, { status: 400 });
  }

  const description =
    typeof body.description === "string" && body.description.trim().length > 0
      ? body.description.trim()
      : null;
  const internalPath =
    typeof body.internalPath === "string" && body.internalPath.trim().length > 0
      ? body.internalPath.trim()
      : null;
  const isExternal = parseBoolean(body.isExternal) ?? Boolean(!internalPath && href.startsWith("http"));
  const sortOrder = parseIntOrNull(body.sortOrder) ?? 100;
  const isPublished = parseBoolean(body.isPublished) ?? true;

  const link = await prisma.siteFooterLink.create({
    data: {
      section,
      label,
      href,
      description,
      internalPath,
      isExternal,
      sortOrder,
      isPublished,
    },
  });

  revalidateSiteFooterCache();
  return NextResponse.json({ link }, { status: 201 });
}
