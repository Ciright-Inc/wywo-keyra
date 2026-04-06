import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Keyra — Protected",
    template: "%s | Keyra",
  },
  description:
    "Keyra makes protection simple for you, your family, and everything that matters.",
  metadataBase: new URL("https://keyra.ie"),
  icons: {
    icon: "/keyra-logo.png",
    shortcut: "/keyra-logo.png",
    apple: "/keyra-logo.png",
  },
  openGraph: {
    title: "Keyra — Protected",
    description:
      "Simple, modern protection for individuals and families.",
    url: "https://keyra.ie",
    siteName: "Keyra",
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
      <body className="flex min-h-full min-w-0 flex-col font-sans">
        <ToastProvider>
          <SiteHeader />
          <main className="min-w-0 flex-1">{children}</main>
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
