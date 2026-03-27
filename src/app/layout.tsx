import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KEYRA — The Trust Layer of the Internet",
    template: "%s | KEYRA",
  },
  description:
    "KEYRA helps protect you, your identity, and your digital life by making sure it is really you online. Safe, simple, secure.",
  metadataBase: new URL("https://keyra.ie"),
  openGraph: {
    title: "KEYRA — The Trust Layer of the Internet",
    description:
      "Consumer-first identity protection: enrol, verify, and manage trusted access with clarity and confidence.",
    url: "https://keyra.ie",
    siteName: "KEYRA",
    locale: "en_IE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IE" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
