import IpificationCallbackClient from "./IpificationCallbackClient";

export const dynamic = "force-dynamic";

/** IPification redirect target; must match simsecure-auth IPIFICATION_REDIRECT_URI (e.g. https://keyra.ie/callback). */
export default function CallbackPage() {
  return <IpificationCallbackClient />;
}
