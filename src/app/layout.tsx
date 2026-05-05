import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { cookies } from "next/headers";
import "./globals.css";
import { HeaderNoSSR } from "@/components/layout/HeaderNoSSR";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { KeyraSessionProvider } from "@/contexts/KeyraSessionContext";
import {
  KEYRA_SESSION_COOKIE,
  parseSession,
  type KeyraSessionUser,
} from "@/lib/keyraSessionCookie";
import { ToastProvider } from "@/components/ui/Toast";
import { ElevenLabsHomeAgent } from "@/components/home/ElevenLabsHomeAgent";

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
    icon: "/kerya-logo.png",
    shortcut: "/kerya-logo.png",
    apple: "/kerya-logo.png",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const raw = jar.get(KEYRA_SESSION_COOKIE)?.value;
  const initialUser: KeyraSessionUser | null = raw ? parseSession(raw) : null;

  return (
    <html
      lang="en-IE"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full min-w-0 flex-col font-sans"
        suppressHydrationWarning
      >
        <ToastProvider>
          <KeyraSessionProvider initialUser={initialUser}>
            <HeaderNoSSR />
            <main className="min-w-0 flex-1">{children}</main>
            <ElevenLabsHomeAgent />
          </KeyraSessionProvider>
          <div className="border-t border-keyra-border bg-keyra-bg">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
              <p className="text-xs text-keyra-text-2">Be Protected Online.</p>
            </div>
          </div>
          <Script
            src="https://unpkg.com/@elevenlabs/convai-widget-embed"
            strategy="afterInteractive"
          />
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
