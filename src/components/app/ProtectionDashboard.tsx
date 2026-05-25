"use client";

import type { ProtectionDashboard } from "@/lib/keyraProtection";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { IconDevices, IconShieldCheck } from "@/components/ui/Icons";
import { Modal } from "@/components/ui/Modal";
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

type SecurityTier = ProtectionDashboard["securityScore"]["tier"];

const tierMeta: Record<
  SecurityTier,
  { label: string; badge: string; fill: string }
> = {
  excellent: {
    label: "Excellent",
    badge: "bg-emerald-50 text-emerald-800",
    fill: "#059669",
  },
  good: {
    label: "Good",
    badge: "bg-sky-50 text-sky-800",
    fill: "#0284c7",
  },
  fair: {
    label: "Fair",
    badge: "bg-amber-50 text-amber-900",
    fill: "#d97706",
  },
  needs_attention: {
    label: "Needs attention",
    badge: "bg-orange-50 text-orange-900",
    fill: "#ea580c",
  },
};

function SecurityScoreGauge({
  percent,
  tier,
}: {
  percent: number;
  tier: SecurityTier;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const arcLen = (clamped / 100) * 126;
  const { fill } = tierMeta[tier];

  return (
    <div
      className="h-[76px] w-[120px] shrink-0"
      role="img"
      aria-label={`Security score ${clamped} percent`}
    >
      <svg viewBox="0 0 120 76" className="size-full" aria-hidden>
        <path
          d="M 16 60 A 44 44 0 0 1 104 60"
          fill="none"
          stroke="var(--color-hairline-strong)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M 16 60 A 44 44 0 0 1 104 60"
          fill="none"
          stroke={fill}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${arcLen} 126`}
        />
        <text
          x="60"
          y="54"
          textAnchor="middle"
          fill="var(--color-ink)"
          style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-inter), Inter, sans-serif" }}
        >
          {clamped}%
        </text>
      </svg>
    </div>
  );
}

const PANEL_LIST_SLOTS = 3;

const identityWatchChecks = [
  "Email addresses linked to your account",
  "Password and credential pairs",
  "Usernames on known breach databases",
];

const scoreIncludedFactors = [
  { id: "session", label: "Authenticated session" },
  { id: "monitoring", label: "Protection monitoring active" },
  { id: "devices", label: "Device tracking enabled" },
];

type PanelStat = { label: string; value: string };

function ProtectionPanelStatGrid({ stats }: { stats: [PanelStat, PanelStat] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3"
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-keyra-text-2">
            {stat.label}
          </p>
          <p className="mt-1 text-[14px] font-medium text-keyra-primary">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function ProtectionPanelHero({
  visual,
  badge,
  badgeClass,
  meta,
  summary,
  progressPercent,
  progressFill,
  progressLabel,
}: {
  visual: ReactNode;
  badge: string;
  badgeClass: string;
  meta: string;
  summary: string;
  progressPercent: number;
  progressFill: string;
  progressLabel: string;
}) {
  return (
    <div className="flex items-start gap-5">
      {visual}
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
              badgeClass,
            )}
          >
            {badge}
          </span>
          <span className="text-[13px] text-keyra-text-2">{meta}</span>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-keyra-text-2">{summary}</p>
        <div
          className="mt-4 h-1 overflow-hidden rounded-full bg-[var(--color-hairline)]"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={progressLabel}
        >
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${progressPercent}%`, backgroundColor: progressFill }}
          />
        </div>
      </div>
    </div>
  );
}

function ProtectionPanelList({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ul className="flex min-h-[10.75rem] flex-col justify-start gap-2">{children}</ul>
  );
}

function ProtectionPanelListRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "flex min-h-[3.25rem] items-center gap-3 rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3 text-[14px]",
        className,
      )}
    >
      {children}
    </li>
  );
}

function ProtectionPanelCard({
  header,
  hero,
  stats,
  list,
  footer,
}: {
  header: ReactNode;
  hero: ReactNode;
  stats: ReactNode;
  list: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Card className="flex h-full flex-col">
      {header}
      <div className="mt-6 flex flex-1 flex-col gap-6">
        {hero}
        {stats}
        {list}
        <div className="mt-auto shrink-0">{footer}</div>
      </div>
    </Card>
  );
}

type SecurityScoreRow = {
  id: string;
  label: string;
  href?: string;
  points?: number;
  done: boolean;
};

function buildSecurityScoreRows(
  score: ProtectionDashboard["securityScore"],
): SecurityScoreRow[] {
  const pending: SecurityScoreRow[] = score.recommendations.map((rec) => ({
    id: rec.id,
    label: rec.label,
    href: rec.href,
    points: rec.points,
    done: false,
  }));
  const rows: SecurityScoreRow[] = [...pending];
  for (const factor of scoreIncludedFactors) {
    if (rows.length >= PANEL_LIST_SLOTS) break;
    if (pending.some((p) => p.id === factor.id)) continue;
    rows.push({ id: factor.id, label: factor.label, done: true });
  }
  return rows.slice(0, PANEL_LIST_SLOTS);
}

function IdentityWatchPanel({
  watch,
  scanning,
  onScan,
}: {
  watch: ProtectionDashboard["identityWatch"];
  scanning: boolean;
  onScan: () => void;
}) {
  const isClear = watch.status === "clear";
  const statusBadge = isClear
    ? "bg-emerald-50 text-emerald-800"
    : "bg-red-50 text-red-800";
  const fill = isClear ? "#059669" : "#dc2626";

  return (
    <ProtectionPanelCard
      header={
        <CardHeader
          title="Identity Watch"
          description="Keyra monitors your credentials on the dark web."
          icon={<IconGlobeSearch className="h-5 w-5" />}
        />
      }
      hero={
        <ProtectionPanelHero
          visual={
            <div
              className={cn(
                "flex h-[76px] w-[120px] shrink-0 flex-col items-center justify-center rounded-[var(--keyra-radius-card)]",
                isClear ? "bg-emerald-50" : "bg-red-50",
              )}
            >
              <IconGlobeSearch
                className={cn("h-8 w-8", isClear ? "text-emerald-600" : "text-red-600")}
              />
              <span
                className={cn(
                  "mt-1.5 text-[11px] font-semibold uppercase tracking-wide",
                  isClear ? "text-emerald-800" : "text-red-800",
                )}
              >
                {isClear ? "Clear" : "Alert"}
              </span>
            </div>
          }
          badge={isClear ? "No breaches found" : "Review needed"}
          badgeClass={statusBadge}
          meta={watch.monitoringActive ? "Monitoring on" : "Monitoring paused"}
          summary={watch.statusLabel}
          progressPercent={isClear ? 100 : 40}
          progressFill={fill}
          progressLabel="Identity watch coverage"
        />
      }
      stats={
        <ProtectionPanelStatGrid
          stats={[
            { label: "Last scan", value: watch.lastScanLabel ?? "Not yet" },
            {
              label: "Coverage",
              value: watch.monitoringActive ? "24/7 active" : "Sign in to enable",
            },
          ]}
        />
      }
      list={
        <ProtectionPanelList>
          {identityWatchChecks.map((item) => (
            <ProtectionPanelListRow key={item} className="text-keyra-text-2">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  isClear ? "bg-emerald-500" : "bg-amber-500",
                )}
                aria-hidden
              />
              <span>{item}</span>
            </ProtectionPanelListRow>
          ))}
        </ProtectionPanelList>
      }
      footer={
        <Button onClick={onScan} disabled={scanning}>
          {scanning ? "Scanning…" : "Run New Scan"}
        </Button>
      }
    />
  );
}

function SecurityScorePanel({
  score,
}: {
  score: ProtectionDashboard["securityScore"];
}) {
  const { label, badge, fill } = tierMeta[score.tier];
  const remaining = Math.max(0, 100 - score.percent);
  const rows = buildSecurityScoreRows(score);

  return (
    <ProtectionPanelCard
      header={
        <CardHeader
          title="Security Score"
          description="Based on your live Keyra profile and sign-in."
          icon={<IconShieldCheck className="h-5 w-5" />}
        />
      }
      hero={
        <ProtectionPanelHero
          visual={<SecurityScoreGauge percent={score.percent} tier={score.tier} />}
          badge={label}
          badgeClass={badge}
          meta={
            remaining > 0 ? `${remaining}% to full score` : "Full score reached"
          }
          summary={score.summary}
          progressPercent={score.percent}
          progressFill={fill}
          progressLabel="Protection strength"
        />
      }
      stats={
        <ProtectionPanelStatGrid
          stats={[
            { label: "Current score", value: `${score.percent}%` },
            { label: "Status", value: label },
          ]}
        />
      }
      list={
        <ProtectionPanelList>
          {rows.map((row) =>
            row.done ? (
              <ProtectionPanelListRow key={row.id} className="text-keyra-text-2">
                <span className="size-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                <span>{row.label}</span>
              </ProtectionPanelListRow>
            ) : (
              <li key={row.id}>
                <Link
                  href={row.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[3.25rem] items-center justify-between gap-3 rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3 text-[14px] transition-colors hover:bg-[var(--color-surface-strong)]"
                >
                  <span className="min-w-0 font-medium text-keyra-primary">{row.label}</span>
                  <span className="shrink-0 text-[12px] font-medium text-keyra-text-2">
                    +{row.points}%
                  </span>
                </Link>
              </li>
            ),
          )}
        </ProtectionPanelList>
      }
      footer={
        <ButtonLink href="/verify" variant="secondary">
          Improve score
        </ButtonLink>
      }
    />
  );
}

function protectionFetchHeaders(): HeadersInit {
  const headers: Record<string, string> = {};
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    headers["X-Keyra-Client-UA"] = navigator.userAgent;
  }
  return headers;
}

export function ProtectionDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const loginNext = pathname?.startsWith("/") ? pathname : "/";
  const toast = useToast();
  const [data, setData] = useState<ProtectionDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [locking, setLocking] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");
  const [showAddLocation, setShowAddLocation] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/keyra/protection", {
        credentials: "include",
        headers: protectionFetchHeaders(),
      });
      if (res.status === 401) {
        router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
        return;
      }
      if (!res.ok) throw new Error("Could not load protection data.");
      setData((await res.json()) as ProtectionDashboard);
    } catch (err) {
      toast.error(
        "Protection",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }, [toast, router, loginNext]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runScan() {
    setScanning(true);
    try {
      const res = await fetch("/api/keyra/protection/scan", {
        method: "POST",
        credentials: "include",
        headers: protectionFetchHeaders(),
      });
      if (!res.ok) throw new Error("Scan failed.");
      await load();
      toast.success("Scan complete", "No compromised credentials found.");
    } catch (err) {
      toast.error("Scan", err instanceof Error ? err.message : "Scan failed.");
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
      toast.success("Location added", label);
    } catch (err) {
      toast.error(
        "Location",
        err instanceof Error ? err.message : "Could not add location.",
      );
    }
  }

  async function lockAllDevices() {
    setShowLockConfirm(false);
    setLocking(true);
    try {
      const res = await fetch("/api/keyra/protection/emergency/lock", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Lock failed.");
      toast.success(
        "All devices locked",
        "You have been signed out on every device. Sign in again when you are ready.",
      );
      router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
    } catch (err) {
      toast.error(
        "Emergency lock",
        err instanceof Error ? err.message : "Lock failed.",
      );
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

      <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-2">
        <IdentityWatchPanel
          watch={data.identityWatch}
          scanning={scanning}
          onScan={() => void runScan()}
        />

        <SecurityScorePanel score={data.securityScore} />

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
            description="One-tap action to lock your account on all devices."
            icon={<IconSiren className="h-5 w-5 text-red-600" />}
          />
          <div className="mt-6">
            <Button
              variant="destructive"
              className="!border-red-200 !bg-red-600 !text-white hover:!bg-red-700"
              disabled={!data.emergency.lockAvailable || locking}
              onClick={() => setShowLockConfirm(true)}
            >
              {locking ? "Locking…" : "Lock All Devices"}
            </Button>
          </div>
          <p className="mt-4 text-[13px] text-keyra-text-2">
            Lock signs you out on all devices.
          </p>
        </Card>

        <Modal
          open={showLockConfirm}
          onClose={() => !locking && setShowLockConfirm(false)}
          title="Lock all devices?"
          footer={
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={locking}
                onClick={() => setShowLockConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="!border-red-200 !bg-red-600 !text-white hover:!bg-red-700"
                disabled={locking}
                onClick={() => void lockAllDevices()}
              >
                {locking ? "Locking…" : "Lock all devices"}
              </Button>
            </div>
          }
        >
          <p className="ds-body-sm text-[var(--ds-body)]">
            This signs you out of Keyra on every browser and device, including this one. You will
            need to sign in again to continue.
          </p>
        </Modal>

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
