import { NextResponse } from "next/server";
import { buildDeploymentLauncherPayload } from "@/lib/deploymentLauncher";
import { launcherCorsHeaders } from "@/lib/deploymentLauncherCors";

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: launcherCorsHeaders(req.headers.get("origin")),
  });
}

/**
 * Canonical 9-dot launcher API for the Keyra ecosystem.
 * Returns `{ apps }` (public) and `{ privateApps }` when the request carries an admin session.
 */
export async function GET(req: Request) {
  const payload = await buildDeploymentLauncherPayload(req);
  const hasPrivate = payload.privateApps.length > 0;

  return NextResponse.json(payload, {
    headers: {
      ...launcherCorsHeaders(req.headers.get("origin")),
      "Cache-Control": hasPrivate
        ? "private, no-store, max-age=0"
        : "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
