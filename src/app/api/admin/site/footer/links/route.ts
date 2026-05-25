import { NextResponse } from "next/server";
import { SiteFooterLinkSection } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { parseBoolean, parseIntOrNull } from "@/app/api/admin/deployments/_parse";
import { requireSiteFooterWriteAuth } from "@/lib/siteFooter/adminAuth";
import { revalidateSiteFooterCache } from "@/lib/siteFooter/revalidate";
import { deleteSiteFooterLink, updateSiteFooterLink } from "@/lib/siteFooter/adminLinkMutations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseSection(raw: unknown): SiteFooterLinkSection | null {
  if (raw === "ON_THIS_SITE" || raw === "KEYRA_APPS") return raw;
  return null;
}

function linkIdFromRequest(req: Request): string | null {
  const fromQuery = new URL(req.url).searchParams.get("id")?.trim();
  return fromQuery && fromQuery.length > 0 ? fromQuery : null;
}

export async function POST(req: Request) {
  const auth = await requireSiteFooterWriteAuth(req);
  if (auth instanceof Response) return auth;

  try {
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
    const siteAppId =
      section === "ON_THIS_SITE"
        ? typeof body.siteAppId === "string" && body.siteAppId.trim().length > 0
          ? body.siteAppId.trim()
          : null
        : null;

    if (section === "ON_THIS_SITE" && !siteAppId) {
      return NextResponse.json({ error: "siteAppId is required for On this site links." }, { status: 400 });
    }

    const link = await prisma.siteFooterLink.create({
      data: {
        section,
        siteAppId,
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
  } catch (error) {
    console.error("[site-footer links POST]", error);
    return NextResponse.json({ error: "Could not create link." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireSiteFooterWriteAuth(req);
  if (auth instanceof Response) return auth;

  const id = linkIdFromRequest(req);
  if (!id) {
    return NextResponse.json({ error: "Link id is required." }, { status: 400 });
  }

  try {
    const body = await readJsonObject(req);
    return await updateSiteFooterLink(id, body);
  } catch (error) {
    console.error("[site-footer links PATCH]", error);
    return NextResponse.json({ error: "Could not update link." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireSiteFooterWriteAuth(req);
  if (auth instanceof Response) return auth;

  const id = linkIdFromRequest(req);
  if (!id) {
    return NextResponse.json({ error: "Link id is required." }, { status: 400 });
  }

  try {
    const expectedSiteAppId = new URL(req.url).searchParams.get("siteAppId");
    return await deleteSiteFooterLink(id, expectedSiteAppId);
  } catch (error) {
    console.error("[site-footer links DELETE]", error);
    return NextResponse.json({ error: "Could not delete link." }, { status: 500 });
  }
}
