"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin/deployments";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [legacyToken, setLegacyToken] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-6xl items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--keyra-action)]/45 blur-3xl" />
        <div className="absolute bottom-8 right-10 h-64 w-64 rounded-full bg-keyra-primary/[0.06] blur-3xl" />
      </div>

      <div className="grid w-full items-stretch overflow-hidden rounded-[2rem] border border-keyra-border bg-keyra-surface/80 shadow-[0_28px_90px_rgba(0,0,0,0.10)] backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden border-r border-keyra-border bg-keyra-bg/60 p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-keyra-border bg-keyra-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-keyra-text-2">
              Keyra admin
            </div>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-keyra-primary">
              Secure access for deployment operations.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-keyra-text-2">
              Sign in with your Keyra admin identity. Admin access is limited to users returned by the
              configured login service with sphere type 1.
            </p>
          </div>

          <div className="grid gap-3">
            {["External identity check", "Admin session cookie", "Deployment console access"].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-keyra-border bg-keyra-surface/70 px-4 py-3 text-sm font-medium text-keyra-primary"
              >
                <span className="size-2 rounded-full bg-keyra-primary" aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl border border-keyra-border bg-keyra-bg text-sm font-semibold text-keyra-primary shadow-sm">
                KE
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-keyra-text-2">Admin sign in</p>
                <h2 className="text-2xl font-semibold text-keyra-primary">Welcome back</h2>
              </div>
            </div>

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
                      : { username: username.trim(), password };
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
              <label className="block text-sm font-medium text-keyra-text-2">
                Username
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  autoComplete="username"
                  placeholder="Enter admin username"
                  className="mt-2 h-12 w-full rounded-2xl border border-keyra-border bg-keyra-bg px-4 text-sm text-keyra-primary shadow-sm outline-none transition focus:border-black/20 focus-visible:keyra-focus"
                />
              </label>

              <label className="block text-sm font-medium text-keyra-text-2">
                Password
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter password"
                  className="mt-2 h-12 w-full rounded-2xl border border-keyra-border bg-keyra-bg px-4 text-sm text-keyra-primary shadow-sm outline-none transition focus:border-black/20 focus-visible:keyra-focus"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowAdvanced((value) => !value)}
                className="text-xs font-medium text-keyra-text-2 underline-offset-4 transition hover:text-keyra-primary hover:underline"
              >
                {showAdvanced ? "Hide break-glass access" : "Use break-glass token"}
              </button>

              {showAdvanced ? (
                <div className="rounded-2xl border border-keyra-border bg-keyra-bg p-4">
                  <label className="block text-sm font-medium text-keyra-text-2">
                    Break-glass token
                    <input
                      value={legacyToken}
                      onChange={(e) => setLegacyToken(e.target.value)}
                      type="password"
                      autoComplete="off"
                      placeholder="KEYRA_ADMIN_TOKEN value"
                      className="mt-2 h-11 w-full rounded-xl border border-keyra-border bg-keyra-surface px-3 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
                    />
                  </label>
                  <p className="mt-2 text-xs leading-5 text-keyra-text-2">
                    If this field is filled, username and password are ignored and the existing service
                    session flow is used.
                  </p>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <Button type="submit" disabled={busy} className="w-full shadow-sm">
                {busy ? "Signing in..." : "Sign in to admin"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
