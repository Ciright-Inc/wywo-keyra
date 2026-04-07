import { headers } from "next/headers";
import DeviceVerifyClient from "./DeviceVerifyClient";
import { ensureApiOriginUrl } from "@/lib/ensureApiOriginUrl";

export const dynamic = "force-dynamic";

export default async function VerifyDevicePage() {
  const authBase = ensureApiOriginUrl(process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL);
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const keyraOrigin = host ? `${proto}://${host}` : "";

  /** Same IPification env as token exchange (auth backend). Avoids duplicate IPIFICATION_* on Keyra for hosted QR. */
  const authorizePostAction = authBase
    ? `${authBase}/auth/ipification/browser-start`
    : keyraOrigin
      ? `${keyraOrigin}/api/verify-device/ipification-authorize`
      : "/api/verify-device/ipification-authorize";

  return <DeviceVerifyClient authorizePostAction={authorizePostAction} />;
}
