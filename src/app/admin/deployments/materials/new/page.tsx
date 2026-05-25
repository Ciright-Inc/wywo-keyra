import { redirect } from "next/navigation";

/** Upload is inline on the materials directory; keep route for old bookmarks. */
export default function NewAdminMaterialPage() {
  redirect("/admin/deployments/materials");
}
