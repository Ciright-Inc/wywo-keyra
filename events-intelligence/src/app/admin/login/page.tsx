import { AdminLoginFlow } from "./AdminLoginFlow";

export default function AdminLoginPage() {
  const configuredPassword = process.env.ADMIN_PASSWORD ?? "";
  return <AdminLoginFlow configuredPassword={configuredPassword} />;
}
