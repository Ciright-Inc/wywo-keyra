import Script from "next/script";
import { headers } from "next/headers";
import { hostnameFromHostHeader } from "@/lib/adminHost";

/** Nexa People / Ciright analytics — admin dashboard host only. */
const ADMIN_ANALYTICS_DOMAIN = "admin.keyra.ie";
const ADMIN_ANALYTICS_SCRIPT_SRC = "https://analytics.ciright.com/js/script.js";
const ADMIN_ANALYTICS_API = "https://analytics.ciright.com/api/event";

function shouldLoadAdminAnalytics(hostHeader: string | null): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  return hostnameFromHostHeader(hostHeader) === ADMIN_ANALYTICS_DOMAIN;
}

/**
 * Nexa People analytics for the admin dashboard (admin.keyra.ie only).
 * Paste-equivalent of the Ciright hosted script; omitted on localhost and marketing host.
 */
export async function AdminAnalyticsScripts() {
  const hdrs = await headers();
  if (!shouldLoadAdminAnalytics(hdrs.get("host"))) {
    return null;
  }

  return (
    <Script
      src={ADMIN_ANALYTICS_SCRIPT_SRC}
      data-domain={ADMIN_ANALYTICS_DOMAIN}
      data-api={ADMIN_ANALYTICS_API}
      defer
      strategy="afterInteractive"
    />
  );
}
