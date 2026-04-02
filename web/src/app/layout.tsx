import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KERYA — Protected",
    template: "%s | KERYA",
  },
  description:
    "KERYA makes protection simple for you, your family, and everything that matters.",
  metadataBase: new URL("https://keyra.ie"),
  icons: {
    icon: "/keyra-logo.png",
    shortcut: "/keyra-logo.png",
    apple: "/keyra-logo.png",
  },
  openGraph: {
    title: "KERYA — Protected",
    description:
      "Simple, modern protection for individuals and families.",
    url: "https://keyra.ie",
    siteName: "KERYA",
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
    <html lang="en-IE" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ToastProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
