"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginFlow({ configuredPassword }: { configuredPassword: string }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [session, setSession] = useState<"checking" | "guest" | "admin">("checking");

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { admin?: boolean }) => setSession(d.admin ? "admin" : "guest"))
      .catch(() => setSession("guest"));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) setErr("Incorrect password or admin not configured.");
    else {
      router.replace("/admin");
      router.refresh();
    }
  }

  if (session === "checking") {
    return (
      <div className="mx-auto max-w-sm px-5 py-20">
        <p className="text-sm text-[var(--muted)]">Checking session…</p>
      </div>
    );
  }

  if (session === "admin") {
    return (
      <div className="mx-auto max-w-sm px-5 py-20">
        <h1 className="text-2xl font-light text-[var(--fg)]">Already signed in</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          You have an active operator console session. Continue below or use{" "}
          <span className="font-medium text-[var(--fg)]">Log out</span> in the bar above.
        </p>
        <Link
          href="/admin"
          className="mt-8 inline-flex rounded-full bg-[var(--fg)] px-5 py-2 text-sm font-medium text-[var(--bg)]"
        >
          Open operator console
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="text-2xl font-light text-[var(--fg)]">Admin login</h1>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Operator password:{" "}
        <code className="break-all rounded bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[var(--fg)]">
          {configuredPassword ? configuredPassword : "— not set (ADMIN_PASSWORD empty) —"}
        </code>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded-full bg-[var(--fg)] px-5 py-2 text-sm text-[var(--bg)]">
          Sign in
        </button>
      </form>
      {err ? <p className="mt-4 text-sm text-red-600">{err}</p> : null}
    </div>
  );
}
