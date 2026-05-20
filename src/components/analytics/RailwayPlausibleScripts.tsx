import Script from "next/script";

const RAILWAY_PLAUSIBLE_SCRIPT_SRC =
  "https://nexa-people-production.up.railway.app/js/script.js";

/**
 * Plausible analytics for keyra.ie (hosted on Railway).
 * Loaded only in production so local/preview builds do not skew metrics.
 */
export function RailwayPlausibleScripts() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script
        src={RAILWAY_PLAUSIBLE_SCRIPT_SRC}
        data-domain="keyra.ie"
        data-api="https://nexa-people-production.up.railway.app/api/event"
        defer
        strategy="afterInteractive"
      />
      <Script id="railway-plausible-init" strategy="afterInteractive">
        {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
      </Script>
    </>
  );
}
