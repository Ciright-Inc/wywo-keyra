import { allowRateLimit, rateLimitKeyFromRequest } from "@/lib/apiRateLimit";

const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 24;

export async function readJsonObject(req: Request): Promise<Record<string, unknown>> {
  try {
    const j: unknown = await req.json();
    return typeof j === "object" && j !== null && !Array.isArray(j)
      ? (j as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function rateLimitResponse(req: Request, routeKey: string): Response | null {
  const ip = rateLimitKeyFromRequest(req);
  const key = `${ip}:${routeKey}`;
  if (!allowRateLimit(key, LIMIT, WINDOW_MS)) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }
  return null;
}
