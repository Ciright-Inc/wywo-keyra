import Script from "next/script";

const PLAUSIBLE_SCRIPT_SRC =
  "https://plausible.ciright.com/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js";

/**
 * Self-hosted Plausible for keyra.ie (dashboard at Ciright Plausible).
 * Loaded only in production so local/preview builds do not skew metrics.
 */
export function PlausibleScripts() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script
        src={PLAUSIBLE_SCRIPT_SRC}
        data-domain="keyra.ie"
        strategy="afterInteractive"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
      </Script>
    </>
  );
}
