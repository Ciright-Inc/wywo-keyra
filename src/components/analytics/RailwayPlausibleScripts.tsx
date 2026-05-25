import Script from "next/script";
import { headers } from "next/headers";
import {
  KEYRA_PATHNAME_HEADER,
  resolveRequestHostname,
  shouldLoadAdminAnalytics,
} from "@/lib/adminHost";

const RAILWAY_PLAUSIBLE_SCRIPT_SRC =
  "https://analytics.ciright.com/js/script.js";

/**
 * Nexa analytics for keyra.ie (marketing host).
 * Skipped on admin.keyra.ie / keyra.ie/admin — those use AdminAnalyticsScripts instead.
 * (Same script.js sets a global lock; loading keyra.ie first blocks admin tracking.)
 */
export async function RailwayPlausibleScripts() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const hdrs = await headers();
  const requestHost = resolveRequestHostname(
    hdrs.get("host"),
    hdrs.get("x-forwarded-host"),
  );
  const pathname = hdrs.get(KEYRA_PATHNAME_HEADER) ?? "/";

  if (shouldLoadAdminAnalytics(requestHost, pathname)) {
    return null;
  }

  return (
    <>
      <Script
        src={RAILWAY_PLAUSIBLE_SCRIPT_SRC}
        data-domain="keyra.ie"
        data-api="https://analytics.ciright.com/api/event"
        defer
        strategy="afterInteractive"
      />
      <Script id="railway-plausible-init" strategy="afterInteractive">
        {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
      </Script>
    </>
  );
}
