import { NextResponse } from "next/server";

/**
 * Echoes JSON so DevTools → Network (Fetch/XHR) shows the same `agentId` / `dynamicVariables`
 * we set on `<elevenlabs-convai>` (plus top-level `employee_name` and request headers for quick scans).
 * Enabled when `NODE_ENV === "development"` or `NEXT_PUBLIC_DEBUG_ELEVENLABS_SESSION=true`.
 * ElevenLabs itself talks over WebSocket/WebRTC, so those fields do not appear as a plain Keyra fetch.
 */
export async function POST(req: Request) {
  const mirrorOk =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEBUG_ELEVENLABS_SESSION === "true";
  if (!mirrorOk) {
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
