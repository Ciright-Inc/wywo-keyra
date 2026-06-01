import "server-only";

import {
  listDeploymentLauncherApps,
  listDeploymentLauncherPrivateApps,
  toDeploymentAppView,
} from "@/lib/deploymentApps";
import { resolveAdminAuthForPhone, resolveDeploymentAuth } from "@/lib/deployments/adminContext";
import { fetchAuthSessionSnapshot } from "@/lib/keyraProtection";
import { getKeyraAdminAppLinks } from "@/lib/keyraAppUrls";
import { isPostgresDatabaseUrlConfigured } from "@/lib/postgresEnv";

export type LauncherAppEntry = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type DeploymentLauncherPayload = {
  apps: LauncherAppEntry[];
  privateApps: LauncherAppEntry[];
};

function launcherAppsFromStaticLinks(): LauncherAppEntry[] {
  return getKeyraAdminAppLinks().map((app) => ({
    id: app.id,
    label: app.label,
    description: app.description,
    href: app.href,
  }));
}

function toLauncherEntry(app: ReturnType<typeof toDeploymentAppView>): LauncherAppEntry {
  return {
    id: app.id,
    label: app.label,
    description: app.description,
    href: app.href,
  };
}

async function canIncludePrivateLauncherApps(req: Request): Promise<boolean> {
  const fromDeploymentAuth = await resolveDeploymentAuth(req);
  if (fromDeploymentAuth) return true;

  const auth = await fetchAuthSessionSnapshot(req);
  if (!auth.authenticated || !auth.phoneE164) return false;

  const admin = await resolveAdminAuthForPhone(auth.phoneE164);
  return admin !== null;
}

/** Shared 9-dot launcher payload — public apps; private apps when caller is a deployment admin. */
export async function buildDeploymentLauncherPayload(req: Request): Promise<DeploymentLauncherPayload> {
  let apps = launcherAppsFromStaticLinks();
  let privateApps: LauncherAppEntry[] = [];

  if (isPostgresDatabaseUrlConfigured()) {
    try {
      apps = (await listDeploymentLauncherApps()).map((app) => toLauncherEntry(toDeploymentAppView(app)));
      if (await canIncludePrivateLauncherApps(req)) {
        privateApps = (await listDeploymentLauncherPrivateApps()).map((app) =>
          toLauncherEntry(toDeploymentAppView(app)),
        );
      }
    } catch (err) {
      console.warn(
        "[deploymentLauncher] Database unavailable — serving static app links.",
        err,
      );
    }
  }

  return { apps, privateApps };
}
