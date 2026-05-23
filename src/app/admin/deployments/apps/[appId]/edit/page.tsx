import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  ensureDeploymentAppsSeeded,
  listDeploymentAppCategoryViews,
  listDeploymentApps,
  toDeploymentAppView,
} from "@/lib/deploymentApps";
import { AppEditClient } from "../../AppEditClient";

type Params = {
  appId: string;
};

export default async function EditDeploymentAppPage({ params }: { params: Promise<Params> }) {
  const { appId } = await params;
  await ensureDeploymentAppsSeeded();
  const [app, categories, siblingApps] = await Promise.all([
    prisma.deploymentApp.findUnique({ where: { id: appId } }),
    listDeploymentAppCategoryViews(),
    listDeploymentApps({ newestFirst: true, includeInactive: true }),
  ]);
  if (!app) notFound();

  return (
    <AppEditClient
      initialApp={toDeploymentAppView(app)}
      categories={categories}
      siblingApps={siblingApps.map((row) => ({ id: row.id, label: row.label }))}
    />
  );
}
