"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "keyra_events_visitor";

function getVisitorKey(): string {
  if (typeof window === "undefined") return "";
  let k = window.localStorage.getItem(STORAGE_KEY);
  if (!k || k.length < 16) {
    k =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(STORAGE_KEY, k);
  }
  return k;
}

export function EventDetailActions({ eventSlug, eventId }: { eventSlug: string; eventId: string }) {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    getVisitorKey();
  }, []);

  async function addToPlan() {
    const visitorKey = getVisitorKey();
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorKey, eventId }),
    });
    if (!res.ok) setMsg("Could not add to plan.");
    else setMsg("Saved to your global event plan on this browser.");
  }

  return (
    <section className="mt-12 space-y-6 rounded-3xl border border-[var(--line)] bg-[var(--elevated)] p-8">
      <h2 className="text-lg font-medium text-[var(--fg)]">Field actions</h2>
      <div className="flex flex-wrap gap-4">
        <Link
          href={`/request-meeting?event=${encodeURIComponent(eventSlug)}`}
          className="rounded-full bg-[var(--fg)] px-5 py-2 text-sm font-medium text-[var(--bg)]"
        >
          Request Keyra meeting
        </Link>
        <button
          type="button"
          onClick={addToPlan}
          className="rounded-full border border-[var(--line)] px-5 py-2 text-sm text-[var(--fg)] hover:bg-[var(--surface)]"
        >
          Add to global event plan
        </button>
        <Link
          href={`/request-meeting?update=${encodeURIComponent(eventSlug)}`}
          className="rounded-full border border-dashed border-[var(--muted)] px-5 py-2 text-sm text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)]"
        >
          Submit event update
        </Link>
      </div>
      {msg ? <p className="text-xs text-[var(--muted)]">{msg}</p> : null}
      <p className="text-xs text-[var(--muted-2)]">
        Global plan is stored locally per browser (visitor key). Authenticated CRM sync can layer on later.
      </p>
    </section>
  );
}
