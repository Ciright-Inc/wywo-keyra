import { redirect } from "next/navigation";
import { keyraDeveloperPortalUrl } from "@/lib/keyraAppUrls";

/** Developer docs live on developer.keyra.ie — legacy /developers path redirects there. */
export default function DevelopersRedirectPage() {
  redirect(keyraDeveloperPortalUrl());
}
