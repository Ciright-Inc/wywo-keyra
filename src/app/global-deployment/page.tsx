import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { keyraGlobalDeploymentUrl } from "@/lib/keyraAppUrls";

export const metadata: Metadata = {
  title: "Global deployment",
  description:
    "Explore Keyra’s published regional, country, and operator deployment posture — calm, structured, and institutionally grounded.",
};

/** Legacy path — map lives on governments.keyra.ie. */
export default function GlobalDeploymentPage() {
  redirect(keyraGlobalDeploymentUrl());
}
