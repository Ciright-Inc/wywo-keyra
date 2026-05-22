"use client";

import type { ProtectionDashboard } from "@/lib/keyraProtection";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { IconDevices } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";

function deviceDisplayName(label: string): string {
  const sep = label.lastIndexOf(" • ");
  return sep >= 0 ? label.slice(0, sep) : label;
}

function IconGlobeSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      <circle cx="17" cy="17" r="3" />
      <path d="m19 19 2 2" />
    </svg>
  );
}

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconSiren({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 3v2M5 6l1.5 1.5M19 6l-1.5 1.5M4 13H2M22 13h-2" />
      <path d="M8 14a4 4 0 0 1 8 0v5H8v-5Z" />
      <path d="M7 19h10" />
    </svg>
  );
}

function SecurityScoreGauge({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const angle = -180 + (clamped / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const cx = 60;
  const cy = 58;
  const r = 42;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 72" className="h-[72px] w-[120px] shrink-0" aria-hidden>
        <path
          d="M 18 58 A 42 42 0 0 1 102 58"
          fill="none"
          stroke="var(--keyra-border)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 18 58 A 42 42 0 0 1 102 58"
          fill="none"
          stroke="var(--keyra-accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * 132} 132`}
        />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--keyra-primary)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4" fill="var(--keyra-primary)" />
      </svg>
      <p className="text-[40px] font-bold leading-none tracking-tight text-keyra-primary">
        {clamped}%
      </p>
    </div>
  );
}

export function ProtectionDashboard() {
  const router = useRouter();
  const { push } = useToast();
  const [data, setData] = useState<ProtectionDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [locking, setLocking] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");
  const [showAddLocation, setShowAddLocation] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/keyra/protection", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/login?next=/app");
        return;
      }
      if (!res.ok) throw new Error("Could not load protection data.");
      setData((await res.json()) as ProtectionDashboard);
    } catch (err) {
      push({
        kind: "error",
        title: "Protection",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }, [push, router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runScan() {
    setScanning(true);
    try {
      const res = await fetch("/api/keyra/protection/scan", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Scan failed.");
      await load();
      push({ kind: "success", title: "Scan complete", message: "No compromised credentials found." });
    } catch (err) {
      push({
        kind: "error",
        title: "Scan",
        message: err instanceof Error ? err.message : "Scan failed.",
      });
    } finally {
      setScanning(false);
    }
  }

  async function addLocation(e: React.FormEvent) {
    e.preventDefault();
    const label = locationLabel.trim();
    if (!label) return;
    try {
      const res = await fetch("/api/keyra/protection/locations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (!res.ok) throw new Error("Could not add location.");
      setLocationLabel("");
      setShowAddLocation(false);
      await load();
      push({ kind: "success", title: "Location added", message: label });
    } catch (err) {
      push({
        kind: "error",
        title: "Location",
        message: err instanceof Error ? err.message : "Could not add location.",
      });
    }
  }

  async function lockAllDevices() {
    if (!confirm("Sign out all devices and lock your Keyra session?")) return;
    setLocking(true);
    try {
      const res = await fetch("/api/keyra/protection/emergency/lock", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Lock failed.");
      push({ kind: "success", title: "Devices locked", message: "You have been signed out everywhere." });
      router.replace("/login?next=/app");
    } catch (err) {
      push({
        kind: "error",
        title: "Emergency lock",
        message: err instanceof Error ? err.message : "Lock failed.",
      });
    } finally {
      setLocking(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-6xl text-[14px] text-keyra-text-2">Loading your protection…</div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl">
        <p className="text-keyra-text-2">Protection data is unavailable. Try again shortly.</p>
        <Button className="mt-4" variant="secondary" onClick={() => void load()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight text-keyra-primary sm:text-[36px] lg:text-[44px]">
        Protection
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-keyra-text-2 sm:text-[18px]">
        Live view of your identity watch, security score, signed-in devices, trusted locations, and emergency controls.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Identity Watch"
            description="Keyra monitors your credentials on the dark web."
            icon={<IconGlobeSearch className="h-5 w-5" />}
          />
          <div
            className={cn(
              "mt-6 flex items-center gap-2 rounded-[var(--keyra-radius-card)] px-4 py-3 text-[14px]",
              data.identityWatch.status === "clear"
                ? "bg-keyra-bg text-keyra-text-2"
                : "bg-red-50 text-red-800",
            )}
          >
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full",
                data.identityWatch.status === "clear" ? "bg-emerald-500" : "bg-red-500",
              )}
              aria-hidden
            />
            <span>{data.identityWatch.statusLabel}</span>
          </div>
          <div className="mt-6">
            <Button onClick={() => void runScan()} disabled={scanning}>
              {scanning ? "Scanning…" : "Run New Scan"}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Security Score" description="Based on your live Keyra profile and sign-in." />
          <div className="mt-6">
            <SecurityScoreGauge percent={data.securityScore.percent} />
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-keyra-text-2">
            {data.securityScore.summary}
          </p>
          {data.securityScore.recommendations.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {data.securityScore.recommendations.map((rec) => (
                <li key={rec.id}>
                  <Link
                    href={rec.href}
                    className="text-[14px] font-medium text-keyra-accent underline-offset-2 hover:underline"
                  >
                    {rec.label}
                  </Link>
                  <span className="ml-2 text-[12px] text-keyra-text-2">+{rec.points}%</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-4 text-[14px]">
            <Link href="/app/profile" className="font-medium text-keyra-accent underline-offset-2 hover:underline">
              View recommendations
            </Link>
            <Link href="/verify" className="font-medium text-keyra-primary underline-offset-2 hover:underline">
              Improve score
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Trusted Locations"
            description="Manage safe access points for easier log-ins."
            icon={<IconMapPin className="h-5 w-5" />}
          />
          <ul className="mt-6 space-y-3 text-[14px] text-keyra-text-2">
            {data.trustedLocations.length === 0 ? (
              <li className="rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3">
                No locations yet — add one or set your country in profile.
              </li>
            ) : (
              data.trustedLocations.map((loc) => (
                <li
                  key={loc.id}
                  className="flex items-center justify-between gap-2 rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3"
                >
                  <span>{loc.label}</span>
                  <span className="shrink-0 text-[12px] text-keyra-text-2">{loc.lastSeenLabel}</span>
                </li>
              ))
            )}
          </ul>
          {showAddLocation ? (
            <form onSubmit={(e) => void addLocation(e)} className="mt-4 flex flex-wrap gap-2">
              <input
                type="text"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="e.g. Home Office"
                className="min-w-0 flex-1 rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-surface px-3 py-2 text-[14px]"
                maxLength={120}
              />
              <Button type="submit" size="sm">
                Save
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddLocation(false)}>
                Cancel
              </Button>
            </form>
          ) : (
            <div className="mt-6">
              <Button variant="secondary" onClick={() => setShowAddLocation(true)}>
                Add New Location
              </Button>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Emergency Services"
            description="One-tap actions for account lock or recovery."
            icon={<IconSiren className="h-5 w-5 text-red-600" />}
          />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              variant="destructive"
              className="!border-red-200 !bg-red-600 !text-white hover:!bg-red-700"
              disabled={!data.emergency.lockAvailable || locking}
              onClick={() => void lockAllDevices()}
            >
              {locking ? "Locking…" : "Lock All Devices"}
            </Button>
            <Link href="/verify" className="inline-flex">
              <Button variant="secondary">Begin Recovery</Button>
            </Link>
          </div>
          <p className="mt-4 text-[13px] text-keyra-text-2">
            Lock signs you out on all devices. Recovery starts a fresh verification on this device.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Signed-in devices"
            description="Browsers and devices where you are signed in to Keyra."
            icon={<IconDevices className="h-5 w-5" />}
          />
          <ul className="mt-6 space-y-3 text-[14px] text-keyra-text-2">
            {data.devices.length === 0 ? (
              <li className="rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3">
                No devices recorded yet. Open Keyra on this browser while signed in to register this device.
              </li>
            ) : (
              data.devices.map((device) => (
                <li
                  key={device.id}
                  className="flex flex-col gap-2 rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        device.isCurrent ? "bg-emerald-500" : "bg-keyra-border",
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-keyra-primary">{deviceDisplayName(device.label)}</p>
                      <p className="text-[12px] text-keyra-text-2">{device.deviceKind}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        device.isCurrent
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-keyra-surface text-keyra-text-2 ring-1 ring-keyra-border",
                      )}
                    >
                      {device.isCurrent ? "This device" : "Seen"}
                    </span>
                    <span className="text-[12px] text-keyra-text-2">{device.lastActiveLabel}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
          <p className="mt-4 text-[13px] text-keyra-text-2">
            Devices are tracked when you use Keyra while signed in. Use{" "}
            <span className="font-medium text-keyra-primary">Lock All Devices</span> above to sign out everywhere.
          </p>
        </Card>
      </div>
    </div>
  );
}
