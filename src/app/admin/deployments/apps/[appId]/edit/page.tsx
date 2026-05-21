import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ensureDeploymentAppsSeeded, listDeploymentAppCategoryViews, toDeploymentAppView } from "@/lib/deploymentApps";
import { AppForm } from "../../AppForm";

type Params = {
  appId: string;
};

export default async function EditDeploymentAppPage({ params }: { params: Promise<Params> }) {
  const { appId } = await params;
  await ensureDeploymentAppsSeeded();
  const [app, categories] = await Promise.all([
    prisma.deploymentApp.findFirst({ where: { id: appId, isActive: true } }),
    listDeploymentAppCategoryViews(),
  ]);
  if (!app) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/deployments/apps"
        className="text-sm font-medium text-keyra-text-2 underline-offset-4 transition hover:text-keyra-primary hover:underline"
      >
        &lt;- Back to apps
      </Link>

      <div className="mt-6 rounded-3xl border border-keyra-border bg-keyra-surface p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-keyra-text-2">App directory</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-keyra-primary">Edit app</h1>
        <p className="mt-3 text-sm leading-6 text-keyra-text-2">
          Update the app details. Saved changes are stored in the database.
        </p>

        <AppForm mode="edit" app={toDeploymentAppView(app)} categories={categories} />
      </div>
    </div>
  );
}
