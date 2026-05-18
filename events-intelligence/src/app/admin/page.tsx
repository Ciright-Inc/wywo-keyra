"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  slug: string;
  name: string;
  approvedPublic: boolean;
  tier: string;
  featured: boolean;
  keyraPriorityScore: number;
  startDate: string;
};

export default function AdminHomePage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    const q = pendingOnly ? "?pending=1" : "";
    const res = await fetch(`/api/admin/events${q}`, { credentials: "include" });
    if (res.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    const data = (await res.json()) as { events: Row[] };
    setRows(data.events);
  }, [pendingOnly]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchRows();
    });
  }, [fetchRows]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    window.location.href = "/admin/login";
  }

  async function quickToggle(id: string, field: "approvedPublic" | "featured", value: boolean) {
    await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    await fetchRows();
  }

  async function onImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    if (!(file instanceof File)) return;
    const up = new FormData();
    up.append("file", file);
    const res = await fetch("/api/admin/import", { method: "POST", body: up, credentials: "include" });
    const data = await res.json();
    setMessage(JSON.stringify(data));
    await fetchRows();
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-light text-[var(--fg)]">Operator console</h1>
        <button type="button" onClick={logout} className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Log out
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input type="checkbox" checked={pendingOnly} onChange={(e) => setPendingOnly(e.target.checked)} />
          Pending approval only
        </label>
        <Link href="/events" className="text-sm underline-offset-4 hover:underline">
          View public site
        </Link>
      </div>

      <section className="mt-10 rounded-3xl border border-[var(--line)] bg-[var(--elevated)] p-6">
        <h2 className="text-sm font-medium text-[var(--fg)]">Bulk CSV import</h2>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Headers (lowercase): name, geopoliticalregion, continent, country, city, startdate, enddate,
          industries (pipe-separated enums), satcoreproblems (pipe), tier, approvedpublic, featured, etc.
        </p>
        <form onSubmit={onImport} className="mt-4 flex flex-wrap items-end gap-4">
          <input name="file" type="file" accept=".csv,text/csv" required />
          <button type="submit" className="rounded-full bg-[var(--fg)] px-4 py-2 text-xs text-[var(--bg)]">
            Upload
          </button>
        </form>
        {message ? <pre className="mt-4 max-h-40 overflow-auto text-[11px] text-[var(--muted)]">{message}</pre> : null}
      </section>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-[0.2em] text-[var(--muted-2)]">
              <th className="py-3 pr-4">Event</th>
              <th className="py-3 pr-4">Score</th>
              <th className="py-3 pr-4">Tier</th>
              <th className="py-3 pr-4">Public</th>
              <th className="py-3 pr-4">Featured</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="border-b border-[var(--line)]">
                <td className="py-3 pr-4">
                  <Link href={`/events/${r.slug}`} className="font-medium hover:underline">
                    {r.name}
                  </Link>
                  <div className="font-mono text-[10px] text-[var(--muted-2)]">{r.slug}</div>
                </td>
                <td className="py-3 pr-4">{r.keyraPriorityScore}</td>
                <td className="py-3 pr-4">{r.tier}</td>
                <td className="py-3 pr-4">{r.approvedPublic ? "yes" : "no"}</td>
                <td className="py-3 pr-4">{r.featured ? "yes" : "no"}</td>
                <td className="py-3 space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="text-xs underline"
                    onClick={() => quickToggle(r.id, "approvedPublic", !r.approvedPublic)}
                  >
                    Toggle public
                  </button>
                  <button
                    type="button"
                    className="text-xs underline"
                    onClick={() => quickToggle(r.id, "featured", !r.featured)}
                  >
                    Toggle featured
                  </button>
                  <Link href={`/admin/events/${r.id}`} className="text-xs underline">
                    Edit JSON
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows && rows.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">No rows loaded.</p>
      ) : null}
    </div>
  );
}
