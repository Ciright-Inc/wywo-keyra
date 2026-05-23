import { AppsDirectoryClient } from "./AppsDirectoryClient";
import { listDeploymentAppCategoryViews, listDeploymentApps, toDeploymentAppView } from "@/lib/deploymentApps";

export const dynamic = "force-dynamic";

export default async function AdminDeploymentAppsPage() {
  const [apps, categories] = await Promise.all([
    listDeploymentApps({ newestFirst: true, includeInactive: true }),
    listDeploymentAppCategoryViews(),
  ]);

  const initialApps = apps.map(toDeploymentAppView);
  const appsStateKey = initialApps.map((app) => `${app.id}:${app.isActive ? 1 : 0}`).join("|");

  return (
    <AppsDirectoryClient
      key={appsStateKey}
      initialApps={initialApps}
      categories={categories.map((category) => category.name)}
    />
  );
}
