import { NextResponse } from "next/server";
import { buildIpificationAuthUrlFromConfig, resolveIpificationOAuthConfig } from "@/lib/ipificationAuthUrl";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" };

function hostnameFromBaseUrl(baseUrl: string): string {
  try {
    return new URL(baseUrl).hostname;
  } catch {
    return "invalid";
  }
}

/** Sanity check: open in browser or curl to confirm runtime env (no secrets). */
export async function GET() {
  const cfg = resolveIpificationOAuthConfig();
  const raw = typeof process !== "undefined" ? process.env["IPIFICATION_BASE_URL"] : "";
  return NextResponse.json(
    {
      ipificationBaseEnvPresent: Boolean(String(raw ?? "").trim()),
      authorizeApiHostname: cfg ? hostnameFromBaseUrl(cfg.baseUrl) : null,
      oauthConfigured: Boolean(cfg),
      deployCommit:
        process.env["RAILWAY_GIT_COMMIT_SHA"] ||
        process.env["SOURCE_VERSION"] ||
        process.env["VERCEL_GIT_COMMIT_SHA"] ||
        null,
    },
    { headers: noStore },
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: noStore });
  }
  const phone = typeof (body as { phone?: string }).phone === "string" ? (body as { phone: string }).phone.trim() : "";
  const linkId =
    typeof (body as { linkId?: string }).linkId === "string" ? (body as { linkId: string }).linkId.trim() : "";
  if (!phone || !linkId) {
    return NextResponse.json({ error: "phone_and_linkId_required" }, { status: 400, headers: noStore });
  }

  const cfg = resolveIpificationOAuthConfig();
  if (!cfg) {
    return NextResponse.json({ error: "ipification_not_configured" }, { status: 503, headers: noStore });
  }

  const authorizeUrl = buildIpificationAuthUrlFromConfig(cfg, { phone, linkId });
  const host = hostnameFromBaseUrl(cfg.baseUrl);
  return NextResponse.json(
    { authorizeUrl },
    {
      headers: {
        ...noStore,
        "X-Keyra-Ipification-Host": host,
      },
    },
  );
}
