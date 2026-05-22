import { AppForm } from "../AppForm";
import { listDeploymentAppCategoryViews } from "@/lib/deploymentApps";
import { AdminEditPageHeader } from "@/components/admin/AdminEditPageHeader";
import { adminPanel } from "@/lib/admin/adminUiClasses";

export default async function NewDeploymentAppPage() {
  const categories = await listDeploymentAppCategoryViews();

  return (
    <div className="max-w-3xl">
      <AdminEditPageHeader
        title="Create new app"
        subtitle="App directory"
        backHref="/admin/deployments/apps"
        backLabel="Back to apps"
      />

      <div className={`${adminPanel} mt-6`}>
        <AppForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
