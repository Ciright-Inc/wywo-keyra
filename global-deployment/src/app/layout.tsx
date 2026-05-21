import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Keyra — Global Deployment",
    template: "%s | Keyra",
  },
  description:
    "Explore Keyra's published regional, country, and operator deployment posture — calm, structured, and institutionally grounded.",
  metadataBase: new URL("https://keyra.ie"),
  icons: {
    icon: "/kerya-logo.png",
    shortcut: "/kerya-logo.png",
    apple: "/kerya-logo.png",
  },
  openGraph: {
    title: "Keyra — Global Deployment",
    description:
      "Explore Keyra's published regional, country, and operator deployment posture — calm, structured, and institutionally grounded.",
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
    <html
      lang="en-IE"
      data-keyra-lane="enterprise"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full min-w-0 flex-col font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
