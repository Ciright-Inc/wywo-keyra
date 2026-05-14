import { redirect } from "next/navigation";

export default function AuthenticationAdminIndex() {
  redirect("/admin/authentication/countries");
}
