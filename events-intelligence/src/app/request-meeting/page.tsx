"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function InnerForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const presetEvent = sp.get("event") ?? "";
  const updateEvent = sp.get("update") ?? "";
  const mode = updateEvent ? "update" : "meeting";

  const [status, setStatus] = useState<string | null>(null);

  async function onMeetingSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      organization: String(fd.get("organization") ?? ""),
      role: String(fd.get("role") ?? ""),
      meetingIntent: String(fd.get("meetingIntent") ?? ""),
      notes: String(fd.get("notes") ?? ""),
      eventSlug: String(fd.get("eventSlug") ?? presetEvent),
    };
    const res = await fetch("/api/meeting-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setStatus(res.ok ? "Received — Keyra field ops will route this." : "Submit failed — try again shortly.");
    if (res.ok) {
      e.currentTarget.reset();
      router.refresh();
    }
  }

  async function onUpdateSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      submitterEmail: String(fd.get("submitterEmail") ?? ""),
      updateSummary: String(fd.get("updateSummary") ?? ""),
      sourceUrl: String(fd.get("sourceUrl") ?? ""),
      eventSlug: String(fd.get("eventSlug") ?? updateEvent),
    };
    const res = await fetch("/api/event-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setStatus(res.ok ? "Update queued for verification." : "Submit failed.");
    if (res.ok) {
      e.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-14">
      <h1 className="text-4xl font-light text-[var(--fg)]">
        {mode === "update" ? "Submit event intelligence update" : "Request a Keyra meeting"}
      </h1>
      <p className="mt-4 text-sm text-[var(--muted)]">
        This intake feeds the operator console — no spam, no directory clutter on the public surface.
      </p>

      {mode === "meeting" ? (
        <form onSubmit={onMeetingSubmit} className="mt-10 space-y-4">
          <input type="hidden" name="eventSlug" defaultValue={presetEvent} />
          <label className="block text-sm">
            <span className="text-[var(--muted-2)]">Name</span>
            <input name="name" required className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-2)]">Email</span>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-2)]">Organization</span>
            <input name="organization" className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-2)]">Role</span>
            <input name="role" className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-2)]">Meeting intent</span>
            <textarea
              name="meetingIntent"
              required
              rows={4}
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-2)]">Notes</span>
            <textarea name="notes" rows={3} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <button type="submit" className="rounded-full bg-[var(--fg)] px-6 py-2 text-sm text-[var(--bg)]">
            Send request
          </button>
        </form>
      ) : (
        <form onSubmit={onUpdateSubmit} className="mt-10 space-y-4">
          <input type="hidden" name="eventSlug" defaultValue={updateEvent} />
          <label className="block text-sm">
            <span className="text-[var(--muted-2)]">Your email</span>
            <input
              name="submitterEmail"
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-2)]">What changed?</span>
            <textarea
              name="updateSummary"
              required
              rows={5}
              className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted-2)]">Source URL</span>
            <input name="sourceUrl" className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <button type="submit" className="rounded-full bg-[var(--fg)] px-6 py-2 text-sm text-[var(--bg)]">
            Submit update
          </button>
        </form>
      )}

      {status ? <p className="mt-6 text-sm text-[var(--muted)]">{status}</p> : null}
    </div>
  );
}

export default function RequestMeetingPage() {
  return (
    <Suspense fallback={<div className="p-14 text-sm text-[var(--muted)]">Loading…</div>}>
      <InnerForm />
    </Suspense>
  );
}
