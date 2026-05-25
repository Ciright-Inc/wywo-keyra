import { NextResponse } from "next/server";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { requireSiteFooterWriteAuth } from "@/lib/siteFooter/adminAuth";
import { deleteSiteFooterLink, updateSiteFooterLink } from "@/lib/siteFooter/adminLinkMutations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { id: string };

export async function PATCH(req: Request, context: { params: Promise<Params> }) {
  const auth = await requireSiteFooterWriteAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  try {
    const body = await readJsonObject(req);
    return await updateSiteFooterLink(id, body);
  } catch (error) {
    console.error("[site-footer links/[id] PATCH]", error);
    return NextResponse.json({ error: "Could not update link." }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<Params> }) {
  const auth = await requireSiteFooterWriteAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const expectedSiteAppId = new URL(req.url).searchParams.get("siteAppId");

  try {
    return await deleteSiteFooterLink(id, expectedSiteAppId);
  } catch (error) {
    console.error("[site-footer links/[id] DELETE]", error);
    return NextResponse.json({ error: "Could not delete link." }, { status: 500 });
  }
}
