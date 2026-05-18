"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

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

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="text-2xl font-light text-[var(--fg)]">Admin login</h1>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Uses cookie session · configure ADMIN_PASSWORD and ADMIN_SESSION_SECRET in{" "}
        <code className="font-mono">.env</code>.
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
