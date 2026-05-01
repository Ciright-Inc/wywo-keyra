/**
 * Optional Cloudflare Turnstile verification (server).
 * When TURNSTILE_SECRET_KEY is unset, verification is skipped.
 */

export async function verifyTurnstileIfConfigured(token: string | undefined): Promise<{
  ok: boolean;
  error?: string;
}> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return { ok: true };

  if (!token?.trim()) {
    return { ok: false, error: "Captcha verification required." };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token.trim());

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    },
  );

  if (!res.ok) {
    return { ok: false, error: "Captcha verification failed." };
  }

  const json = (await res.json()) as { success?: boolean };
  if (!json.success) {
    return { ok: false, error: "Captcha verification failed." };
  }

  return { ok: true };
}
