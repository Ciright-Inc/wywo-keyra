"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function AdminEventEditorPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const router = useRouter();
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/events/${id}`, { credentials: "include" });
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      setText(JSON.stringify(data.event, null, 2));
    }
    void load();
  }, [id]);

  async function save(e: FormEvent) {
    e.preventDefault();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(text) as Record<string, unknown>;
    } catch {
      setMsg("Invalid JSON");
      return;
    }
    const allowed = { ...body };
    delete allowed.id;
    delete allowed.createdAt;
    delete allowed.lastUpdated;
    const res = await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(allowed),
    });
    setMsg(res.ok ? "Saved" : "Save failed");
    if (res.ok) router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light">Edit event</h1>
        <Link href="/admin" className="text-sm underline">
          ← Console
        </Link>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        JSON mirrors the public API shape. Arrays: <code className="font-mono">industries</code>,{" "}
        <code className="font-mono">satCoreProblems</code> use Prisma enum strings.
      </p>
      <form onSubmit={save} className="mt-6 space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={28}
          className="w-full rounded-2xl border border-[var(--line)] bg-[var(--elevated)] p-4 font-mono text-[11px]"
        />
        <button type="submit" className="rounded-full bg-[var(--fg)] px-5 py-2 text-sm text-[var(--bg)]">
          Save changes
        </button>
      </form>
      {msg ? <p className="mt-4 text-sm">{msg}</p> : null}
    </div>
  );
}
