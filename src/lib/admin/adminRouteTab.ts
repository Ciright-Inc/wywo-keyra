import type { AdminSkeletonTab } from "@/components/admin/AdminDirectorySkeleton";

const HREF_TO_TAB: Record<string, AdminSkeletonTab> = {
  "/admin/deployments": "deployments-overview",
  "/admin/deployments/regions": "deployments-regions",
  "/admin/deployments/countries": "deployments-countries",
  "/admin/deployments/telcos": "deployments-telcos",
  "/admin/deployments/apps": "deployments-apps",
  "/admin/deployments/server-nodes": "deployments-server-nodes",
  "/admin/deployments/access-domain-rules": "deployments-access-domain-rules",
  "/admin/deployments/access-requests": "deployments-access-requests",
  "/admin/deployments/admin-users": "deployments-admin-users",
  "/admin/deployments/audit": "deployments-audit",
  "/admin/authentication": "auth-countries",
  "/admin/authentication/countries": "auth-countries",
  "/admin/authentication/protocols": "auth-protocols",
  "/admin/authentication/settings": "auth-settings",
};

export function adminTabForHref(href: string): AdminSkeletonTab | null {
  return HREF_TO_TAB[href] ?? null;
}

export function adminHrefMatchesPathname(href: string, pathname: string): boolean {
  if (href === "/admin/deployments") return pathname === href;
  if (href === "/admin/authentication") {
    return pathname === href || pathname.startsWith("/admin/authentication/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
