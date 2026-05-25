import Script from "next/script";
import { headers } from "next/headers";
import {
  getAdminAnalyticsDomain,
  KEYRA_PATHNAME_HEADER,
  resolveRequestHostname,
  shouldLoadAdminAnalytics,
} from "@/lib/adminHost";

const ADMIN_ANALYTICS_SCRIPT_SRC = "https://analytics.ciright.com/js/script.js";
const ADMIN_ANALYTICS_API = "https://analytics.ciright.com/api/event";

function adminAnalyticsForced(): boolean {
  const v = process.env.KEYRA_ADMIN_ANALYTICS_FORCE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * Nexa People analytics for admin — admin.keyra.ie and keyra.ie/admin (www too).
 * Must load before RailwayPlausibleScripts: script.js uses a single global tracker.
 */
export async function AdminAnalyticsScripts() {
  const hdrs = await headers();
  const requestHost = resolveRequestHostname(
    hdrs.get("host"),
    hdrs.get("x-forwarded-host"),
  );
  const pathname = hdrs.get(KEYRA_PATHNAME_HEADER) ?? "/";
  const force = adminAnalyticsForced();

  if (!shouldLoadAdminAnalytics(requestHost, pathname, { force })) {
    return null;
  }

  const analyticsDomain = getAdminAnalyticsDomain();

  return (
    <Script
      id="nexa-admin-analytics"
      src={ADMIN_ANALYTICS_SCRIPT_SRC}
      data-domain={analyticsDomain}
      data-api={ADMIN_ANALYTICS_API}
      defer
      strategy="beforeInteractive"
    />
  );
}
