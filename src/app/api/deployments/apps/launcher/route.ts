import { NextResponse } from "next/server";
import { listDeploymentApps, toDeploymentAppView } from "@/lib/deploymentApps";
import { getKeyraAdminAppLinks } from "@/lib/keyraAppUrls";
import { isPostgresDatabaseUrlConfigured } from "@/lib/postgresEnv";

function corsHeaders(origin: string | null): HeadersInit {
  if (!origin) return {};
  const allowed =
    origin.endsWith(".keyra.ie") ||
    origin === "https://keyra.ie" ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:");
  if (!allowed) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

function launcherAppsFromStaticLinks() {
  return getKeyraAdminAppLinks().map((app) => ({
    id: app.id,
    label: app.label,
    description: app.description,
    href: app.href,
  }));
}

/** Public read-only app list for the 9-dot launcher (non-private apps only). */
export async function GET(req: Request) {
  let apps = launcherAppsFromStaticLinks();

  if (isPostgresDatabaseUrlConfigured()) {
    try {
      apps = (await listDeploymentApps({ includePrivate: false })).map((app) => {
        const view = toDeploymentAppView(app);
        return {
          id: view.id,
          label: view.label,
          description: view.description,
          href: view.href,
        };
      });
    } catch (err) {
      console.warn(
        "[api/deployments/apps/launcher] Database unavailable — serving static app links.",
        err,
      );
    }
  }

  const body = { apps };

  return NextResponse.json(body, {
    headers: {
      ...corsHeaders(req.headers.get("origin")),
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
