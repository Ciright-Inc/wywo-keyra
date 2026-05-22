export type AdminToastAction = "created" | "saved" | "deleted" | "updated" | "approved" | "rejected";

export type AdminToastEntity =
  | "region"
  | "country"
  | "telco"
  | "server-node"
  | "access-domain-rule"
  | "app"
  | "app-category"
  | "admin-user"
  | "auth-country"
  | "auth-protocol"
  | "auth-settings"
  | "access-request";

const ENTITY_LABELS: Record<AdminToastEntity, string> = {
  region: "Region",
  country: "Country",
  telco: "Telco",
  "server-node": "Server node",
  "access-domain-rule": "Access domain rule",
  app: "App",
  "app-category": "Category",
  "admin-user": "Admin user",
  "auth-country": "Authentication country",
  "auth-protocol": "SAT protocol",
  "auth-settings": "Feed settings",
  "access-request": "Access request",
};

type ToastPayload = { title: string; message?: string };

export function adminActionToast(
  action: AdminToastAction,
  entity: AdminToastEntity,
  options?: { name?: string; count?: number },
): ToastPayload {
  const label = ENTITY_LABELS[entity];
  const name = options?.name?.trim();
  const count = options?.count;

  switch (action) {
    case "created":
      return {
        title: `${label} created successfully`,
        message: name ? `"${name}" has been added.` : "Your changes are now live.",
      };
    case "saved":
      if (count && count > 1) {
        return {
          title: "Changes saved successfully",
          message: `${count} ${label.toLowerCase()}${count === 1 ? "" : "s"} updated.`,
        };
      }
      return {
        title: "Changes saved successfully",
        message: name ? `"${name}" has been updated.` : "Your changes are now live.",
      };
    case "updated":
      return {
        title: "Updated successfully",
        message: name ? `"${name}" has been updated.` : undefined,
      };
    case "deleted":
      if (count && count > 1) {
        return {
          title: "Deleted successfully",
          message: `${count} items removed.`,
        };
      }
      return {
        title: `${label} deleted successfully`,
        message: name ? `"${name}" has been removed.` : undefined,
      };
    case "approved":
      return {
        title: "Access request approved",
        message: name ? `"${name}" can now proceed.` : undefined,
      };
    case "rejected":
      return {
        title: "Access request rejected",
        message: name ? `"${name}" was not approved.` : undefined,
      };
  }
}

export function adminToastQuery(
  action: AdminToastAction,
  entity: AdminToastEntity,
  options?: { name?: string },
): string {
  const params = new URLSearchParams({ toast: action, entity });
  if (options?.name) params.set("name", options.name);
  return params.toString();
}

export function toastFromAdminQuery(params: URLSearchParams): ToastPayload | null {
  const action = params.get("toast") as AdminToastAction | null;
  const entity = params.get("entity") as AdminToastEntity | null;
  const name = params.get("name");
  if (!action || !entity || !ENTITY_LABELS[entity]) return null;
  return adminActionToast(action, entity, name ? { name: decodeURIComponent(name) } : undefined);
}

export function showAdminActionToast(
  toast: { success: (title: string, message?: string) => void },
  action: AdminToastAction,
  entity: AdminToastEntity,
  options?: { name?: string; count?: number },
) {
  const payload = adminActionToast(action, entity, options);
  toast.success(payload.title, payload.message);
}
