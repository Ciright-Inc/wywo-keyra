import { NextRequest, NextResponse } from "next/server";

/** Params we forward to /callback (avoid leaking unrelated form fields). */
const FORWARD = new Set([
  "code",
  "state",
  "error",
  "error_description",
  "scope",
  "session_state",
]);

function redirectToCallback(req: NextRequest, params: URLSearchParams) {
  const dest = new URL("/callback", req.nextUrl.origin);
  params.forEach((value, key) => {
    if (FORWARD.has(key)) {
      dest.searchParams.set(key, value);
    }
  });
  return NextResponse.redirect(dest, 303);
}

function pickForwarded(src: URLSearchParams) {
  const out = new URLSearchParams();
  src.forEach((value, key) => {
    if (FORWARD.has(key)) out.set(key, value);
  });
  return out;
}

/**
 * IPification may redirect with ?code= (GET) or POST application/x-www-form-urlencoded (form_post).
 * A Next.js page cannot read POST bodies; this route normalizes both to GET /callback?...
 *
 * Set IPIFICATION_REDIRECT_URI (auth backend) to:
 *   https://keyra.ie/api/ipification/oidc-return
 * and register that exact URL in the IPification client.
 */
export async function GET(req: NextRequest) {
  return redirectToCallback(req, pickForwarded(req.nextUrl.searchParams));
}

export async function POST(req: NextRequest) {
  const merged = new URLSearchParams();
  const ct = (req.headers.get("content-type") || "").toLowerCase();
  try {
    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      fd.forEach((v, k) => {
        if (typeof v === "string") merged.set(k, v);
      });
    } else {
      const raw = await req.text();
      if (raw) {
        new URLSearchParams(raw).forEach((v, k) => merged.set(k, v));
      }
    }
  } catch (err) {
    console.warn("[oidc-return] body parse error", err);
    return new NextResponse("Invalid callback body", { status: 400 });
  }
  const out = pickForwarded(merged);
  if (!out.get("code") && !out.get("error")) {
    console.warn(
      "[oidc-return] missing code/error; content-type:",
      ct || "(none)",
      "keys:",
      [...merged.keys()].join(",") || "(empty body)",
    );
    return new NextResponse("Missing OAuth code or error from IPification", { status: 400 });
  }
  return redirectToCallback(req, out);
}
