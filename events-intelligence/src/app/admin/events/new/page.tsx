"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  CONTINENT_LABELS,
  CONTINENT_ORDER,
  INDUSTRY_LABELS,
  INDUSTRY_ORDER,
  REGION_LABELS,
  REGION_ORDER,
  SAT_LABELS,
} from "@/lib/constants";
import type { Continent, Industry, SatCoreProblem } from "@prisma/client";

const SAT_KEYS = Object.keys(SAT_LABELS) as SatCoreProblem[];

export default function AdminNewEventPage() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const industries = fd.getAll("industry").map(String) as Industry[];
    const satCoreProblems = fd.getAll("sat").map(String) as SatCoreProblem[];

    const targetCompanies = String(fd.get("targetCompanies") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      parentEventBrand: String(fd.get("parentEventBrand") ?? "").trim() || undefined,
      geopoliticalRegion: String(fd.get("geopoliticalRegion") ?? "").trim(),
      continent: String(fd.get("continent") ?? "").trim(),
      country: String(fd.get("country") ?? "").trim(),
      city: String(fd.get("city") ?? "").trim(),
      venue: String(fd.get("venue") ?? "").trim() || undefined,
      startDate: String(fd.get("startDate") ?? ""),
      endDate: String(fd.get("endDate") ?? ""),
      yearsRunning: fd.get("yearsRunning") ? Number(fd.get("yearsRunning")) : undefined,
      estimatedAttendees: fd.get("estimatedAttendees") ? Number(fd.get("estimatedAttendees")) : undefined,
      estimatedExhibitors: fd.get("estimatedExhibitors") ? Number(fd.get("estimatedExhibitors")) : undefined,
      estimatedSpeakers: fd.get("estimatedSpeakers") ? Number(fd.get("estimatedSpeakers")) : undefined,
      governmentAttendance: fd.get("governmentAttendance") === "on",
      carrierAttendance: fd.get("carrierAttendance") === "on",
      bankingFintechAttendance: fd.get("bankingFintechAttendance") === "on",
      developerAttendance: fd.get("developerAttendance") === "on",
      cybersecurityRelevance: Number(fd.get("cybersecurityRelevance") ?? 0),
      identityRelevance: Number(fd.get("identityRelevance") ?? 0),
      telecomRelevance: Number(fd.get("telecomRelevance") ?? 0),
      aiRelevance: Number(fd.get("aiRelevance") ?? 0),
      appSecurityRelevance: Number(fd.get("appSecurityRelevance") ?? 0),
      governmentRelevance: Number(fd.get("governmentRelevance") ?? 0),
      bankingRelevance: Number(fd.get("bankingRelevance") ?? 0),
      tier: String(fd.get("tier") ?? "TIER_3"),
      approvedPublic: fd.get("approvedPublic") === "on",
      featured: fd.get("featured") === "on",
      summary: String(fd.get("summary") ?? "").trim() || undefined,
      whyItMatters: String(fd.get("whyItMatters") ?? "").trim() || undefined,
      whoAttends: String(fd.get("whoAttends") ?? "").trim() || undefined,
      problemKeyraSolves: String(fd.get("problemKeyraSolves") ?? "").trim() || undefined,
      satCoreAlignment: String(fd.get("satCoreAlignment") ?? "").trim() || undefined,
      recommendedAction: String(fd.get("recommendedAction") ?? "").trim() || undefined,
      targetMeetingType: String(fd.get("targetMeetingType") ?? "").trim() || undefined,
      targetMeetingList: String(fd.get("targetMeetingList") ?? "").trim() || undefined,
      eventWebsite: String(fd.get("eventWebsite") ?? "").trim() || undefined,
      sourceUrl: String(fd.get("sourceUrl") ?? "").trim() || undefined,
      keyraOwner: String(fd.get("keyraOwner") ?? "").trim() || undefined,
      primaryBuyerPersona: String(fd.get("primaryBuyerPersona") ?? "").trim() || undefined,
      secondaryBuyerPersona: String(fd.get("secondaryBuyerPersona") ?? "").trim() || undefined,
      targetCompanies,
      industries,
      satCoreProblems,
    };

    const res = await fetch("/api/admin/events", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      window.location.href = "/admin/login";
      return;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMsg(typeof err.error === "string" ? err.error : "Create failed");
      return;
    }

    const data = (await res.json()) as { event: { id: string } };
    setMsg("Created.");
    router.replace(`/admin/events/${data.event.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-light text-[var(--fg)]">New event</h1>
        <Link href="/admin" className="text-sm underline">
          ← Console
        </Link>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Posts to <code className="font-mono">POST /api/admin/events</code>. Score recomputes automatically.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-8">
        <fieldset className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--elevated)] p-6">
          <legend className="text-sm font-medium text-[var(--fg)]">Required</legend>
          <label className="block text-sm">
            Name
            <input name="name" required className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Parent brand
            <input name="parentEventBrand" className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              Geopolitical region
              <select
                name="geopoliticalRegion"
                required
                className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                defaultValue=""
              >
                <option value="" disabled>
                  Select…
                </option>
                {REGION_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {REGION_LABELS[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Continent
              <select
                name="continent"
                required
                className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                defaultValue=""
              >
                <option value="" disabled>
                  Select…
                </option>
                {CONTINENT_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {CONTINENT_LABELS[c as Continent]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm">
            Country
            <input name="country" required className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            City
            <input name="city" required className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Venue
            <input name="venue" className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              Start date
              <input name="startDate" type="date" required className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
            </label>
            <label className="block text-sm">
              End date
              <input name="endDate" type="date" required className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--elevated)] p-6">
          <legend className="text-sm font-medium text-[var(--fg)]">Scale & tier</legend>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm">
              Years running
              <input name="yearsRunning" type="number" min={0} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
            </label>
            <label className="block text-sm">
              Attendees
              <input name="estimatedAttendees" type="number" min={0} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
            </label>
            <label className="block text-sm">
              Exhibitors
              <input name="estimatedExhibitors" type="number" min={0} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
            </label>
            <label className="block text-sm">
              Speakers
              <input name="estimatedSpeakers" type="number" min={0} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
            </label>
            <label className="block text-sm md:col-span-2">
              Tier
              <select name="tier" className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" defaultValue="TIER_3">
                <option value="TIER_1">Tier 1 — Global strategic</option>
                <option value="TIER_2">Tier 2 — Regional high-value</option>
                <option value="TIER_3">Tier 3 — Niche / local</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
            <label className="flex items-center gap-2">
              <input name="governmentAttendance" type="checkbox" /> Government attendance
            </label>
            <label className="flex items-center gap-2">
              <input name="carrierAttendance" type="checkbox" /> Carrier attendance
            </label>
            <label className="flex items-center gap-2">
              <input name="bankingFintechAttendance" type="checkbox" /> Banking / fintech
            </label>
            <label className="flex items-center gap-2">
              <input name="developerAttendance" type="checkbox" /> Developers
            </label>
            <label className="flex items-center gap-2">
              <input name="approvedPublic" type="checkbox" /> Approved public
            </label>
            <label className="flex items-center gap-2">
              <input name="featured" type="checkbox" /> Featured home
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--elevated)] p-6">
          <legend className="text-sm font-medium text-[var(--fg)]">Relevance 0–100</legend>
          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                ["cybersecurityRelevance", "Cybersecurity"],
                ["identityRelevance", "Identity"],
                ["telecomRelevance", "Telecom"],
                ["aiRelevance", "AI"],
                ["appSecurityRelevance", "App security"],
                ["governmentRelevance", "Government"],
                ["bankingRelevance", "Banking / fintech"],
              ] as const
            ).map(([name, label]) => (
              <label key={name} className="block text-sm">
                {label}
                <input
                  name={name}
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={50}
                  className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-[var(--line)] bg-[var(--elevated)] p-6">
          <legend className="text-sm font-medium text-[var(--fg)]">Industries</legend>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {INDUSTRY_ORDER.map((ind) => (
              <label key={ind} className="flex items-center gap-2 text-xs">
                <input name="industry" type="checkbox" value={ind} /> {INDUSTRY_LABELS[ind]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-[var(--line)] bg-[var(--elevated)] p-6">
          <legend className="text-sm font-medium text-[var(--fg)]">SAT-Core problems</legend>
          <div className="mt-4 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
            {SAT_KEYS.map((s) => (
              <label key={s} className="flex items-center gap-2 text-xs">
                <input name="sat" type="checkbox" value={s} /> {SAT_LABELS[s]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--elevated)] p-6">
          <legend className="text-sm font-medium text-[var(--fg)]">Narrative & URLs</legend>
          <label className="block text-sm">
            Summary
            <textarea name="summary" rows={3} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Why it matters
            <textarea name="whyItMatters" rows={3} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Who attends
            <textarea name="whoAttends" rows={3} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            What Keyra solves there
            <textarea name="problemKeyraSolves" rows={3} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            SAT-Core alignment
            <textarea name="satCoreAlignment" rows={3} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Recommended action
            <textarea name="recommendedAction" rows={2} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Target meeting type
            <input name="targetMeetingType" className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Target meeting list
            <textarea name="targetMeetingList" rows={2} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Event website
            <input name="eventWebsite" type="url" className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Source URL
            <input name="sourceUrl" type="url" className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="block text-sm">
            Keyra owner
            <input name="keyraOwner" className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              Primary persona
              <input name="primaryBuyerPersona" className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
            </label>
            <label className="block text-sm">
              Secondary persona
              <input name="secondaryBuyerPersona" className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
            </label>
          </div>
          <label className="block text-sm">
            Target companies (comma-separated)
            <input name="targetCompanies" className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2" />
          </label>
        </fieldset>

        <button type="submit" className="rounded-full bg-[var(--fg)] px-6 py-2.5 text-sm font-medium text-[var(--bg)]">
          Create event
        </button>
        {msg ? <p className="text-sm text-[var(--muted)]">{msg}</p> : null}
      </form>
    </div>
  );
}
