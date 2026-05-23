import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { KeyraAppChrome } from "@/components/layout/KeyraAppChrome";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { KeyraSessionProvider } from "@/contexts/KeyraSessionContext";
import {
  KEYRA_SESSION_COOKIE,
  parseSession,
  type KeyraSessionUser,
} from "@/lib/keyraSessionCookie";
import { KEYRA_FAVICON_SRC } from "@/lib/keyraBrandAssets";
import { LANE_HEADER, parseKeyraDesignLaneHeader } from "@/lib/keyraDesignLane";
import { ToastProvider } from "@/components/ui/Toast";
import { PlausibleScripts } from "@/components/analytics/PlausibleScripts";
import { RailwayPlausibleScripts } from "@/components/analytics/RailwayPlausibleScripts";
import { AdminAnalyticsScripts } from "@/components/analytics/AdminAnalyticsScripts";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/**
 * Montserrat — accent face for numerics, IDs, timestamps (agent.md §0.1).
 * Loaded with Inter; `--font-montserrat` is exposed for `.ds-numeric`.
 */
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
    icon: KEYRA_FAVICON_SRC,
    shortcut: KEYRA_FAVICON_SRC,
    apple: KEYRA_FAVICON_SRC,
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
      className={`${inter.variable} ${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Material Symbols Outlined — single icon family for the whole app (agent.md TR-10).
            Render with `<span className="material-symbols-outlined">name</span>`.
            `display=optional` avoids invisible-text FOUT on slow networks. */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=optional"
        />
        <PlausibleScripts />
        <RailwayPlausibleScripts />
        <AdminAnalyticsScripts />
      </head>
      <body
        className="flex min-h-full min-w-0 flex-col font-sans"
        suppressHydrationWarning
      >
        <ToastProvider>
          <KeyraSessionProvider initialUser={initialUser}>
            <KeyraAppChrome footer={<SiteFooter />}>{children}</KeyraAppChrome>
          </KeyraSessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
