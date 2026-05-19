import { AdminSessionBar } from "@/components/layout/AdminSessionBar";
import { isAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn = await isAdmin();

  return (
    <div className="flex min-h-full flex-col bg-[var(--bg)] text-[var(--fg)] antialiased">
      {loggedIn ? <AdminSessionBar /> : null}
      <div className="flex-1">{children}</div>
    </div>
  );
}
