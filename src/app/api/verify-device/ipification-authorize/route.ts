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
      phoneVerifyBaseEnvPresent: Boolean(String(raw ?? "").trim()),
      phoneVerifyApiHostname: cfg ? hostnameFromBaseUrl(cfg.baseUrl) : null,
      phoneVerifyConfigured: Boolean(cfg),
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
  const contentType = req.headers.get("content-type") || "";
  const wantsJson = contentType.includes("application/json");

  let phone = "";
  let linkId = "";

  if (wantsJson) {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: noStore });
    }
    phone = typeof (body as { phone?: string }).phone === "string" ? (body as { phone: string }).phone.trim() : "";
    linkId =
      typeof (body as { linkId?: string }).linkId === "string" ? (body as { linkId: string }).linkId.trim() : "";
  } else {
    try {
      const form = await req.formData();
      phone = String(form.get("phone") ?? "").trim();
      linkId = String(form.get("linkId") ?? "").trim();
    } catch {
      return new NextResponse("Bad form body", { status: 400, headers: { "Content-Type": "text/plain", ...noStore } });
    }
  }

  if (!phone || !linkId) {
    if (wantsJson) {
      return NextResponse.json({ error: "phone_and_linkId_required" }, { status: 400, headers: noStore });
    }
    return new NextResponse("Phone and link are required.", { status: 400, headers: { "Content-Type": "text/plain", ...noStore } });
  }

  const cfg = resolveIpificationOAuthConfig();
  if (!cfg) {
    if (wantsJson) {
      return NextResponse.json({ error: "phone_verify_not_configured" }, { status: 503, headers: noStore });
    }
    return new NextResponse("Phone verification is not configured on this server.", {
      status: 503,
      headers: { "Content-Type": "text/plain", ...noStore },
    });
  }

  const authorizeUrl = buildIpificationAuthUrlFromConfig(cfg, { phone, linkId });
  const host = hostnameFromBaseUrl(cfg.baseUrl);

  if (!wantsJson) {
    return NextResponse.redirect(authorizeUrl, {
      status: 303,
      headers: {
        ...noStore,
        "X-Keyra-Phone-Verify-Host": host,
      },
    });
  }

  return NextResponse.json(
    { authorizeUrl },
    {
      headers: {
        ...noStore,
        "X-Keyra-Phone-Verify-Host": host,
      },
    },
  );
}
