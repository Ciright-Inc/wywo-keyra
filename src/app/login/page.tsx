import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buildGetStartedAccessUrl, keyraMarketingOrigin } from "@/lib/keyraAppUrls";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

/** Consumer “login” — send users to Get Started; they return via `return` when the flow allows. */
export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0]?.trim() ?? "";
  const protoHeader = h.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    protoHeader === "http" || protoHeader === "https"
      ? protoHeader
      : keyraMarketingOrigin().startsWith("https")
        ? "https"
        : "http";
  const path = sp.next?.startsWith("/") ? sp.next : "/";
  const returnUrl =
    host.length > 0 ? `${proto}://${host}${path}` : `${keyraMarketingOrigin()}${path === "/" ? "" : path}`;
  redirect(buildGetStartedAccessUrl(returnUrl));
}
