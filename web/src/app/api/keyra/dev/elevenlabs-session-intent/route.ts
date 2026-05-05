import { NextResponse } from "next/server";

/**
 * Development-only: echoes JSON so DevTools → Network (Fetch/XHR) shows the same
 * `agentId` / `dynamicVariables` used for the convai embed or React `startSession`.
 * `inspect_phone` / `inspect_phone_number` / `inspect_userId` at the top level for quick checks.
 * ElevenLabs itself talks over WebSocket/WebRTC, so those fields do not appear as a plain fetch.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, echo: body }, { status: 200 });
}
