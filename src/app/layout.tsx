import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
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
    default: "Keyra — Be Protected Online",
    template: "%s | Keyra",
  },
  description:
    "Be Protected Online. The identity trust layer of the internet — for people, businesses, and nations.",
  metadataBase: new URL("https://keyra.ie"),
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Keyra — Be Protected Online",
    description:
      "Be Protected Online. The identity trust layer of the internet — for people, businesses, and nations.",
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
          <div className="border-t border-keyra-border bg-keyra-bg">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
              <p className="text-xs text-keyra-text-2">Be Protected Online.</p>
            </div>
          </div>
          <Script
            src="https://unpkg.com/@elevenlabs/convai-widget-embed"
            strategy="lazyOnload"
          />
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
