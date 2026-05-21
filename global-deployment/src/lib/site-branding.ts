function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

/** Public origin for this standalone global deployment site. */
export function globalDeploymentOrigin(): string {
  return trimSlash(
    process.env.NEXT_PUBLIC_GLOBAL_DEPLOYMENT_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      "http://localhost:3050",
  );
}

/** Main Keyra marketing site (keyra.ie). */
export function keyraMarketingOrigin(): string {
  return trimSlash(
    process.env.NEXT_PUBLIC_KEYRA_SITE_URL?.trim() ||
      "https://keyra.ie",
  );
}

export function keyraMarketingPath(path: string): string {
  const base = keyraMarketingOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Primary header / favicon logo — matches keyra.ie. */
export const SITE_LOGO_SRC = "/kerya-logo.png";
