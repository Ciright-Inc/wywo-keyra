import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { HeaderNoSSR } from "@/components/layout/HeaderNoSSR";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { KeyraSessionProvider } from "@/contexts/KeyraSessionContext";
import {
  KEYRA_SESSION_COOKIE,
  parseSession,
  type KeyraSessionUser,
} from "@/lib/keyraSessionCookie";
import { LANE_HEADER, parseKeyraDesignLaneHeader } from "@/lib/keyraDesignLane";
import { ToastProvider } from "@/components/ui/Toast";
import { ElevenLabsHomeAgent } from "@/components/home/ElevenLabsHomeAgent";
import { PlausibleScripts } from "@/components/analytics/PlausibleScripts";
import { RailwayPlausibleScripts } from "@/components/analytics/RailwayPlausibleScripts";

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
    "Be Protected Online — calm, deterministic identity for people, businesses, and nations. Keyra restores trust infrastructure.",
  metadataBase: new URL("https://keyra.ie"),
  icons: {
    icon: "/kerya-logo.png",
    shortcut: "/kerya-logo.png",
    apple: "/kerya-logo.png",
  },
  openGraph: {
    title: "Keyra — Be Protected Online",
    description:
      "Be Protected Online — calm, deterministic identity for people, businesses, and nations. Keyra restores trust infrastructure.",
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

  const hdrs = await headers();
  const designLane = parseKeyraDesignLaneHeader(hdrs.get(LANE_HEADER));

  return (
    <html
      lang="en-IE"
      data-keyra-lane={designLane}
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <PlausibleScripts />
        <RailwayPlausibleScripts />
      </head>
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
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
