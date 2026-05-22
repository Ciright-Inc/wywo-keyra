import { getAuthenticationFeedSettingsForAdmin } from "@/lib/authenticationFeed/adminListQueries";
import { AuthenticationFeedSettingsClient } from "./AuthenticationFeedSettingsClient";

export default async function AdminAuthFeedSettingsPage() {
  const initialSettings = await getAuthenticationFeedSettingsForAdmin();

  return <AuthenticationFeedSettingsClient initialSettings={initialSettings} />;
}
