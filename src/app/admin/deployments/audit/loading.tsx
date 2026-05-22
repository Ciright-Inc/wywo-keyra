import { AdminDirectorySkeleton } from "@/components/admin/AdminDirectorySkeleton";

export default function Loading() {
  return <AdminDirectorySkeleton tab="deployments-audit" rows={5} />;
}
