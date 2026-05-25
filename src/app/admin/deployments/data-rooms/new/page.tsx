import { redirect } from "next/navigation";

/** Upload is inline on the data rooms directory; keep route for old bookmarks. */
export default function AdminDataRoomNewPage() {
  redirect("/admin/deployments/data-rooms");
}
