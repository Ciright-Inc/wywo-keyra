import { listAuthenticationCountriesForAdmin } from "@/lib/authenticationFeed/adminListQueries";
import { AuthenticationCountriesClient } from "./AuthenticationCountriesClient";

export default async function AdminAuthCountriesPage() {
  const initialCountries = await listAuthenticationCountriesForAdmin({ sort: "priority" });

  return <AuthenticationCountriesClient initialCountries={initialCountries} />;
}
