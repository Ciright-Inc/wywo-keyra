"use client";

import dynamic from "next/dynamic";

const SiteHeader = dynamic(() => import("./SiteHeader").then((m) => m.SiteHeader), {
  ssr: false,
});

export function HeaderNoSSR() {
  return <SiteHeader />;
}

