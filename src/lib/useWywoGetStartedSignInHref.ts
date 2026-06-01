"use client";

import { useEffect, useState } from "react";
import { buildWywoGetStartedSignInUrl, keyraWywoUrl } from "@/lib/keyraAppUrls";

const WYWO_LANDING_PATH = "/wywo";

/**
 * WYWO sign-in href — mirrors `useGetStartedAccessHref` on keyra.ie:
 * stable SSR/first-paint href from env, then the live browser origin after mount.
 * Return target uses the Keyra cookie family when on *.keyra.ie, else session bridge.
 */
export function useWywoGetStartedSignInHref() {
  const [href, setHref] = useState(() =>
    buildWywoGetStartedSignInUrl(keyraWywoUrl(), WYWO_LANDING_PATH),
  );

  useEffect(() => {
    setHref(buildWywoGetStartedSignInUrl(window.location.origin, WYWO_LANDING_PATH));
  }, []);

  return href;
}
