import Script from "next/script";

const PLAUSIBLE_SCRIPT_SRC =
  "https://plausible.ciright.com/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js";

/**
 * Same Plausible property as keyra.ie main site (events subsite rolls up under the Keyra domain in Plausible).
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
