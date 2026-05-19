import type { Metadata } from "next";
import { PlausibleScripts } from "@/components/analytics/PlausibleScripts";
import { SITE_LOGO_SRC } from "@/lib/site-branding";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keyra Global Events Intelligence",
  description:
    "Mapping digital trust, cybersecurity, telecom, identity, AI, fintech, and app infrastructure events — organized by geopolitical region with SAT-Core alignment.",
  icons: {
    icon: SITE_LOGO_SRC,
    apple: SITE_LOGO_SRC,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IE" className="h-full">
      <body className="flex min-h-full flex-col bg-[var(--bg)] text-[var(--fg)] antialiased">
        {children}
        <PlausibleScripts />
      </body>
    </html>
  );
}
