import { listSatProtocolsForAdmin } from "@/lib/authenticationFeed/adminListQueries";
import { AuthenticationProtocolsClient } from "./AuthenticationProtocolsClient";

export default async function AdminSatProtocolsPage() {
  const initialProtocols = await listSatProtocolsForAdmin({
    active: "all",
    sort: "displayOrder:asc",
  });

  return <AuthenticationProtocolsClient initialProtocols={initialProtocols} />;
}
