import { allowRateLimit, rateLimitKeyFromRequest } from "@/lib/apiRateLimit";
import { verifyTurnstileIfConfigured } from "@/lib/turnstileVerify";

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

/** Silent success for bots that fill hidden fields */
export function honeypotTripped(body: Record<string, unknown>): boolean {
  const hp = body._honeypot;
  return typeof hp === "string" && hp.trim().length > 0;
}

export function rateLimitResponse(
  req: Request,
  routeKey: string,
  limit: number = LIMIT,
  windowMs: number = WINDOW_MS,
): Response | null {
  const ip = rateLimitKeyFromRequest(req);
  const key = `${ip}:${routeKey}`;
  if (!allowRateLimit(key, limit, windowMs)) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }
  return null;
}

export async function verifyCaptcha(body: Record<string, unknown>): Promise<Response | null> {
  const token =
    typeof body.turnstileToken === "string" ? body.turnstileToken : undefined;
  const r = await verifyTurnstileIfConfigured(token);
  if (!r.ok) {
    return Response.json({ error: r.error ?? "Captcha verification failed." }, { status: 400 });
  }
  return null;
}
