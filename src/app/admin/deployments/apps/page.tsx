import { AppsDirectoryClient } from "./AppsDirectoryClient";
import { listDeploymentApps, toDeploymentAppView } from "@/lib/deploymentApps";

export default async function AdminDeploymentAppsPage() {
  const apps = await listDeploymentApps();
  return <AppsDirectoryClient initialApps={apps.map(toDeploymentAppView)} />;
}
