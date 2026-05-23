import { getAdminAuth } from "@/lib/assertAdminServer";
import { isGlobal, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import { getAdminSiteFooterConfig } from "@/lib/siteFooter/queries";
import { FooterManageClient } from "./FooterManageClient";

export default async function AdminSiteFooterPage() {
  const auth = await getAdminAuth();
  const config = await getAdminSiteFooterConfig();
  const readOnly = !auth || isReadOnlyRole(auth) || !isGlobal(auth);

  return <FooterManageClient initialConfig={config} readOnly={readOnly} />;
}
