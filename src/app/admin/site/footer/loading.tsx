import { AdminDirectorySkeleton } from "@/components/admin/AdminDirectorySkeleton";

export default function AdminSiteFooterLoading() {
  return <AdminDirectorySkeleton tab="deployments-access-domain-rules" tableOnly rows={8} />;
}
