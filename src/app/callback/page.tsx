import IpificationCallbackClient from "./IpificationCallbackClient";

export const dynamic = "force-dynamic";

/** Browser lands here after /api/ipification/oidc-return forwards OAuth params (recommended redirect_uri). */
export default function CallbackPage() {
  return <IpificationCallbackClient />;
}
