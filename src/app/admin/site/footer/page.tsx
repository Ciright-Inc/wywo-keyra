import { getAdminAuth } from "@/lib/assertAdminServer";
import { isGlobal, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import { listDeploymentApps } from "@/lib/deploymentApps";
import { buildFooterSiteAppOptions } from "@/lib/siteFooter/siteAppScope";
import { getAdminSiteFooterConfig } from "@/lib/siteFooter/queries";
import { FooterManageClient } from "./FooterManageClient";

export default async function AdminSiteFooterPage() {
  const auth = await getAdminAuth();
  const [config, deploymentApps] = await Promise.all([
    getAdminSiteFooterConfig(),
    listDeploymentApps({ includeInactive: true, includePrivate: true }),
  ]);
  const readOnly = !auth || isReadOnlyRole(auth) || !isGlobal(auth);
  const footerSiteApps = buildFooterSiteAppOptions(deploymentApps);

  return (
    <FooterManageClient
      initialConfig={config}
      readOnly={readOnly}
      footerSiteApps={footerSiteApps}
    />
  );
}
