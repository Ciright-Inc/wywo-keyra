import { NextResponse } from "next/server";
import { buildIpificationAuthUrlFromConfig, resolveIpificationOAuthConfig } from "@/lib/ipificationAuthUrl";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const phone = typeof (body as { phone?: string }).phone === "string" ? (body as { phone: string }).phone.trim() : "";
  const linkId =
    typeof (body as { linkId?: string }).linkId === "string" ? (body as { linkId: string }).linkId.trim() : "";
  if (!phone || !linkId) {
    return NextResponse.json({ error: "phone_and_linkId_required" }, { status: 400 });
  }

  const cfg = resolveIpificationOAuthConfig();
  if (!cfg) {
    return NextResponse.json({ error: "ipification_not_configured" }, { status: 503 });
  }

  const authorizeUrl = buildIpificationAuthUrlFromConfig(cfg, { phone, linkId });
  return NextResponse.json({ authorizeUrl });
}
