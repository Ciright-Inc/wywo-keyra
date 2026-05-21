import { AppsDirectoryClient } from "./AppsDirectoryClient";
import { listDeploymentAppCategoryViews, listDeploymentApps, toDeploymentAppView } from "@/lib/deploymentApps";

export default async function AdminDeploymentAppsPage() {
  const [apps, categories] = await Promise.all([
    listDeploymentApps({ newestFirst: true }),
    listDeploymentAppCategoryViews(),
  ]);

  return (
    <AppsDirectoryClient
      initialApps={apps.map(toDeploymentAppView)}
      categories={categories.map((category) => category.name)}
    />
  );
}
