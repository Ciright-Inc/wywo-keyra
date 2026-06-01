"use client";

import { useState } from "react";
import { WywoPhoneField } from "./WywoPhoneField";

type Props = {
  onSuccess: () => void;
};

/**
 * Local / direct phone login — sets keyra_session via existing Keyra session API
 * (same cookie as the rest of the site, no Get Started redirect).
 */
export function WywoSlipPhoneLogin({ onSuccess }: Props) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/keyra/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phoneNumber: phone.trim() }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `Sign in failed (${res.status})`);
      }
      const phoneE164 = phone.trim().startsWith("+") ? phone.trim() : `+${phone.trim()}`;
      await fetch("/api/keyra/session/sync", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneE164 }),
      });
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="wywo-slip-phone-login" onSubmit={(e) => void onSubmit(e)}>
      <p className="ds-caption-uppercase wywo-slip-phone-login__label">Sign in with your phone</p>
      <WywoPhoneField
        id="wywo-slip-login-phone"
        value={phone}
        onChange={setPhone}
        placeholder="Mobile number"
        required
      />
      {error ? <p className="wywo-slip-phone-login__error">{error}</p> : null}
      <button type="submit" className="ds-btn-primary wywo-slip-phone-login__btn" disabled={loading}>
        {loading ? "Signing in…" : "Continue"}
      </button>
      <p className="ds-caption wywo-slip-phone-login__hint">
        Uses your Keyra identity on this site (30‑day session). On production, Get Started verification
        applies.
      </p>
    </form>
  );
}
