import { AppForm } from "../AppForm";
import { listDeploymentAppCategoryViews } from "@/lib/deploymentApps";
import { AdminEditPageHeader } from "@/components/admin/AdminEditPageHeader";
import { adminPanel } from "@/lib/admin/adminUiClasses";

export default async function NewDeploymentAppPage() {
  const categories = await listDeploymentAppCategoryViews();

  return (
    <div>
      <AdminEditPageHeader
        title="Create new app"
        subtitle="App directory"
        backHref="/admin/deployments/apps"
      />

      <div className={`${adminPanel} mt-6`}>
        <AppForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
