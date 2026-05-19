import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";

/** Avoid DB access during `next build` (CI/build containers cannot reach Railway private Postgres). */
export const dynamic = "force-dynamic";

export default function SiteShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
