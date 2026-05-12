"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin/deployments";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [legacyToken, setLegacyToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-keyra-primary">Keyra admin</h1>
      <p className="mt-2 text-sm text-keyra-text-2">
        Sign in with a seeded admin email and password, or use the break-glass token that matches{" "}
        <code className="text-keyra-primary">KEYRA_ADMIN_TOKEN</code>.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const body =
              legacyToken.trim().length > 0
                ? { token: legacyToken.trim() }
                : { email: email.trim().toLowerCase(), password };
            const res = await fetch("/api/admin/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            if (!res.ok) {
              const j: unknown = await res.json().catch(() => null);
              const msg =
                typeof j === "object" &&
                j !== null &&
                "error" in j &&
                typeof (j as { error?: unknown }).error === "string"
                  ? (j as { error: string }).error
                  : "Sign-in failed.";
              setError(msg);
              return;
            }
            router.replace(next);
            router.refresh();
          } catch {
            setError("Unable to sign in.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="block text-sm text-keyra-text-2">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="username"
            className="mt-2 w-full rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
          />
        </label>
        <label className="block text-sm text-keyra-text-2">
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            className="mt-2 w-full rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
          />
        </label>

        <p className="text-xs text-keyra-text-2">
          Email: <span className="text-keyra-primary">global@seed.keyra</span>
          <br />
          Password: <span className="text-keyra-primary">ChangeMeSeed!123</span>
        </p>

        <div className="border-t border-keyra-border pt-4">
          <label className="block text-sm text-keyra-text-2">
            Break-glass token (optional)
            <input
              value={legacyToken}
              onChange={(e) => setLegacyToken(e.target.value)}
              type="password"
              autoComplete="off"
              placeholder="KEYRA_ADMIN_TOKEN value"
              className="mt-2 w-full rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
            />
          </label>
          <p className="mt-1 text-xs text-keyra-text-2">
            If this field is filled, email and password are ignored and a service JWT is issued.
          </p>
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Continue"}
        </Button>
      </form>
    </div>
  );
}
