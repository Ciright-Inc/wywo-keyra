export function launcherCorsHeaders(origin: string | null): HeadersInit {
  if (!origin) return {};
  const allowed =
    origin.endsWith(".keyra.ie") ||
    origin === "https://keyra.ie" ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:");
  if (!allowed) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}
