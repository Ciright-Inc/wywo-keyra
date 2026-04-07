import { headers } from "next/headers";
import DeviceVerifyClient from "./DeviceVerifyClient";

export const dynamic = "force-dynamic";

export default async function VerifyDevicePage() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const authorizePostAction = host
    ? `${proto}://${host}/api/verify-device/ipification-authorize`
    : "/api/verify-device/ipification-authorize";

  return <DeviceVerifyClient authorizePostAction={authorizePostAction} />;
}
