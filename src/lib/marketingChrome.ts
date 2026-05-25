const MINIMAL_PATH_PREFIXES = ["/verify-device", "/hosted-login", "/callback"];

/** Pages that hide marketing header + footer (auth flows, admin shell). */
export function isMinimalMarketingChrome(pathname: string): boolean {
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !pathname.startsWith("/admin/login/")
  ) {
    return true;
  }
  return MINIMAL_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
