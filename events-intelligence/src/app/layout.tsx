import type { Metadata } from "next";
import { PlausibleScripts } from "@/components/analytics/PlausibleScripts";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keyra Global Events Intelligence",
  description:
    "Mapping digital trust, cybersecurity, telecom, identity, AI, fintech, and app infrastructure events — organized by geopolitical region with SAT-Core alignment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IE" className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--fg)] antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <PlausibleScripts />
      </body>
    </html>
  );
}
