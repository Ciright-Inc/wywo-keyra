import { redirect } from "next/navigation";
import { keyraGlobalDeploymentUrl } from "@/lib/keyraAppUrls";

/** Global deployment lives on its own site — redirect legacy path on keyra.ie. */
export default function GlobalDeploymentRedirectPage() {
  redirect(keyraGlobalDeploymentUrl());
}
