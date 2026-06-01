import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  buildGetStartedAccessUrl,
  buildWywoPostAuthReturnUrl,
  keyraMarketingOrigin,
  normalizeKeyraReturnUrl,
} from "@/lib/keyraAppUrls";
import { devSessionPhoneFallback } from "@/lib/keyraSessionEstablish";

type Props = {
  searchParams: Promise<{ next?: string; returnTo?: string }>;
};

function loginNextPath(sp: { next?: string; returnTo?: string }): string {
  const raw = sp.next?.trim() || sp.returnTo?.trim() || "/";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

/** Consumer “login” — Get Started in production; localhost session bridge in dev. */
export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const path = loginNextPath(sp);

  // Local dev: skip get-started.keyra.ie — cookies cannot cross localhost ↔ production.
  if (devSessionPhoneFallback()) {
    redirect(`/api/keyra/session/continue?next=${encodeURIComponent(path)}`);
  }

  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0]?.trim() ?? "";
  const protoHeader = h.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    protoHeader === "http" || protoHeader === "https"
      ? protoHeader
      : keyraMarketingOrigin().startsWith("https")
        ? "https"
        : "http";
  const origin = host.length > 0 ? `${proto}://${host}` : keyraMarketingOrigin();
  const returnTarget = buildWywoPostAuthReturnUrl(origin, path);
  const returnUrl = normalizeKeyraReturnUrl(returnTarget);
  redirect(buildGetStartedAccessUrl(returnUrl));
}
