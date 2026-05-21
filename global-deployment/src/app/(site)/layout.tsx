import { HeaderNoSSR } from "@/components/layout/HeaderNoSSR";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { KeyraSessionProvider } from "@/contexts/KeyraSessionContext";

export const dynamic = "force-dynamic";

export default function SiteShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <KeyraSessionProvider initialUser={null}>
      <HeaderNoSSR />
      <main className="min-w-0 flex-1">{children}</main>
      <SiteFooter />
    </KeyraSessionProvider>
  );
}
