"use client";

import type { LatestAuthRecord } from "@/lib/authenticationFeed/types";
import { protocolOpenAction } from "@/lib/authenticationFeed/protocolOpenBehavior";
import { resolvePublicFeedJson } from "@/lib/authenticationFeed/feedClientResolve";
import { FeedTurnstileGate } from "@/components/home/FeedTurnstileGate";
import { useCallback, useEffect, useRef, useState } from "react";

type SessionPayload = {
  feedEnabled: boolean;
  records: LatestAuthRecord[];
  nextCursor?: number;
  message?: string;
  fetchThreshold?: number;
  batchSize?: number;
  animationSpeedMs?: number;
};

type ProtocolDetail = {
  protocolName: string;
  protocolCode: string;
  protocolCategory: string;
  protocolMemo: string;
  protocolUrlEnabled: boolean;
  protocolUrl: string | null;
  allowProtocolLink: boolean;
  homePercentage: number;
  roamingPercentage: number;
  shortDescription?: string | null;
  longDescription?: string | null;
  securityClassification?: string | null;
  trustLevel?: number | null;
  riskReductionScore?: number | null;
  iconKey?: string | null;
  colorTheme?: string | null;
  flagEnterprise?: boolean;
  flagGovernment?: boolean;
  flagTelco?: boolean;
  flagConsumer?: boolean;
  flagAiAgent?: boolean;
  globalAvailability?: boolean;
  apiReady?: boolean;
  zeroKnowledgeCompatible?: boolean;
  simOrEsimRequired?: boolean;
  deviceBindingRequired?: boolean;
  active?: boolean;
};

const ROW_EST = 40;

function classificationBadgeClass(c: string | null | undefined): string {
  const u = (c ?? "").toUpperCase();
  if (u.includes("SOVEREIGN") || u === "CRITICAL") return "bg-red-500/15 text-red-100 ring-red-500/45";
  if (u.includes("HIGH") || u.includes("ELEVATED")) return "bg-amber-500/12 text-amber-100 ring-amber-500/40";
  if (u.includes("STANDARD")) return "bg-keyra-bg text-keyra-text-2 ring-keyra-border";
  return "bg-keyra-surface text-keyra-text-2 ring-keyra-border";
}

/** Fixed locale/options so SSR (Node) and the browser render the same time string. */
function formatFeedTime(isoOrMs: string) {
  const ms = Number(isoOrMs);
  const d = Number.isFinite(ms) ? new Date(ms) : new Date(isoOrMs);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function readSessionPayload(json: Record<string, unknown>): SessionPayload | null {
  if (typeof json.feedEnabled !== "boolean") return null;
  if (!Array.isArray(json.records)) return null;
  return json as unknown as SessionPayload;
}

function readBatchPayload(json: Record<string, unknown>): {
  feedEnabled: boolean;
  records: LatestAuthRecord[];
  nextCursor?: number;
  done?: boolean;
} | null {
  if (typeof json.feedEnabled !== "boolean") return null;
  if (!Array.isArray(json.records)) return null;
  return json as unknown as {
    feedEnabled: boolean;
    records: LatestAuthRecord[];
    nextCursor?: number;
    done?: boolean;
  };
}

export function LatestAuthenticationsFeed() {
  const needsTurnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
  const [captchaToken, setCaptchaToken] = useState<string | null>(needsTurnstile ? null : "ready");

  const [records, setRecords] = useState<LatestAuthRecord[]>([]);
  const [nextCursor, setNextCursor] = useState(0);
  const [threshold, setThreshold] = useState(30);
  const [feedEnabled, setFeedEnabled] = useState(true);
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [done, setDone] = useState(false);
  const [modal, setModal] = useState<ProtocolDetail | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootRef = useRef(false);

  const startSession = useCallback(async (turnstile?: string) => {
    setLoading(true);
    setHint(null);
    try {
      const url = new URL("/api/keyra/latest-authentications/session", window.location.origin);
      if (turnstile) url.searchParams.set("turnstileToken", turnstile);
      const res = await fetch(url.toString(), {
        credentials: "include",
      });
      const rawUnknown: unknown = await res.json();
      if (!res.ok) {
        const err =
          typeof rawUnknown === "object" &&
          rawUnknown !== null &&
          "error" in rawUnknown &&
          typeof (rawUnknown as { error?: string }).error === "string"
            ? (rawUnknown as { error: string }).error
            : "Could not start feed session.";
        setHint(err);
        setRecords([]);
        setFeedEnabled(false);
        return;
      }
      const resolved = await resolvePublicFeedJson(rawUnknown, "session");
      if (!resolved.ok) {
        setHint(resolved.error);
        setRecords([]);
        setFeedEnabled(false);
        return;
      }
      const data = readSessionPayload(resolved.json);
      if (!data) {
        setHint("Invalid feed session payload.");
        setFeedEnabled(false);
        return;
      }
      setFeedEnabled(data.feedEnabled !== false);
      if (!data.feedEnabled) {
        setRecords([]);
        setHint(data.message ?? "Feed is disabled or database unavailable.");
        return;
      }
      setRecords(data.records ?? []);
      setNextCursor(data.nextCursor ?? 1);
      setThreshold(data.fetchThreshold ?? 30);
    } catch {
      setHint("Network error loading feed.");
      setFeedEnabled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (captchaToken === null) return;
    if (bootRef.current) return;
    bootRef.current = true;
    const token = captchaToken === "ready" ? undefined : captchaToken;
    void startSession(token);
  }, [captchaToken, startSession]);

  const fetchNext = useCallback(async () => {
    if (!feedEnabled || done || loadingMore || nextCursor < 1) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/keyra/latest-authentications/batch?cursor=${nextCursor}`, {
        credentials: "include",
      });
      const rawUnknown: unknown = await res.json();
      if (!res.ok) {
        const err =
          typeof rawUnknown === "object" &&
          rawUnknown !== null &&
          "error" in rawUnknown &&
          typeof (rawUnknown as { error?: string }).error === "string"
            ? (rawUnknown as { error: string }).error
            : "Batch failed.";
        setHint(err);
        setDone(true);
        return;
      }
      const resolved = await resolvePublicFeedJson(rawUnknown, "batch");
      if (!resolved.ok) {
        setHint(resolved.error);
        setDone(true);
        return;
      }
      const data = readBatchPayload(resolved.json);
      if (!data) {
        setHint("Invalid batch payload.");
        setDone(true);
        return;
      }
      if (data.done) setDone(true);
      setRecords((prev) => [...prev, ...(data.records ?? [])]);
      if (typeof data.nextCursor === "number") setNextCursor(data.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  }, [feedEnabled, done, loadingMore, nextCursor]);

  useEffect(() => {
    if (loading || loadingMore || done || !feedEnabled) return;
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 8 && records.length > 0) {
      void fetchNext();
    }
  }, [records, loading, loadingMore, done, feedEnabled, fetchNext]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loadingMore || done || !feedEnabled) return;
    const remainingPx = el.scrollHeight - el.scrollTop - el.clientHeight;
    const approxRowsLeft = remainingPx / ROW_EST;
    if (approxRowsLeft < threshold) {
      void fetchNext();
    }
  }, [fetchNext, loadingMore, done, feedEnabled, threshold]);

  async function openProtocol(code: string) {
    try {
      const res = await fetch(`/api/keyra/sat-protocols/${encodeURIComponent(code)}`, {
        credentials: "omit",
      });
      const data = (await res.json()) as ProtocolDetail & { error?: string };
      if (!res.ok) {
        setModal({
          protocolName: code,
          protocolCode: code,
          protocolCategory: "",
          protocolMemo: data.error ?? "Protocol details unavailable.",
          protocolUrlEnabled: false,
          protocolUrl: null,
          allowProtocolLink: false,
          homePercentage: 50,
          roamingPercentage: 50,
          securityClassification: null,
          trustLevel: null,
        });
        return;
      }
      if (protocolOpenAction(data) === "external") {
        window.open(data.protocolUrl!, "_blank", "noopener,noreferrer");
        return;
      }
      setModal(data);
    } catch {
      setModal({
        protocolName: code,
        protocolCode: code,
        protocolCategory: "",
        protocolMemo: "Could not load protocol details.",
        protocolUrlEnabled: false,
        protocolUrl: null,
        allowProtocolLink: false,
        homePercentage: 50,
        roamingPercentage: 50,
        securityClassification: null,
        trustLevel: null,
      });
    }
  }

  if (needsTurnstile && captchaToken === null) {
    return (
      <div className="space-y-3">
        <FeedTurnstileGate onToken={(t) => setCaptchaToken(t)} />
        <p className="text-[10px] text-keyra-text-2">
          Turnstile verifies the browser before opening a feed session when server and site keys are configured.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2.5" aria-busy>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-2">
            <div className="h-9 flex-1 animate-pulse rounded bg-keyra-bg/80" />
            <div className="h-9 w-16 animate-pulse rounded bg-keyra-bg/60" />
            <div className="h-9 w-14 animate-pulse rounded bg-keyra-bg/60" />
          </div>
        ))}
      </div>
    );
  }

  if (!feedEnabled || records.length === 0) {
    return (
      <div className="text-[clamp(0.52rem,0.22vw+0.48rem,0.62rem)] text-keyra-text-2">
        {hint ??
          "Authentication feed will appear here when the database is configured and countries/protocols are seeded."}
      </div>
    );
  }

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="max-h-[min(240px,42vh)] space-y-1.5 overflow-y-auto pr-1 sm:max-h-[min(280px,50vh)]"
      >
        {records.map((row, idx) => (
          <div
            key={`${row.t}-${row.x}-${idx}`}
            className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_auto] items-start gap-1.5 border-b border-keyra-border/30 pb-1.5 text-[clamp(0.52rem,0.22vw+0.48rem,0.66rem)] text-keyra-primary last:border-0"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block size-1.5 shrink-0 rounded-full bg-keyra-accent/35 ring-1 ring-keyra-border"
                  aria-hidden
                />
                <div className="truncate font-medium">{row.c}</div>
              </div>
              <div className="truncate pl-2.5 text-[0.9em] text-keyra-text-2">
                {row.r} · {formatFeedTime(row.t)}
              </div>
            </div>
            <div className="min-w-0">
              <button
                type="button"
                className="w-full truncate text-left text-[clamp(0.48rem,0.2vw+0.43rem,0.58rem)] text-keyra-accent underline-offset-2 hover:underline"
                onClick={() => void openProtocol(row.pl)}
              >
                {row.p}
              </button>
              <div className="truncate text-[0.65em] text-keyra-text-2">{row.m}</div>
            </div>
            <div className="flex min-w-[7rem] flex-col items-end gap-0.5 text-right">
              <span className="rounded px-1 py-0.5 text-[0.75em] font-bold text-keyra-accent ring-1 ring-keyra-border">
                {row.hr}
              </span>
              <span className="text-[0.68em] font-medium text-keyra-accent/80">{row.st}</span>
              <span className="max-w-[9rem] truncate text-[0.72em] text-keyra-text-2">{row.x}</span>
            </div>
          </div>
        ))}
        {loadingMore ? (
          <div className="space-y-2 py-2" aria-busy>
            {[0, 1].map((i) => (
              <div key={i} className="h-3 animate-pulse rounded bg-keyra-bg/70" />
            ))}
          </div>
        ) : null}
      </div>

      {modal ? (
        <div className="keyra-modal-backdrop" role="dialog" aria-modal onClick={() => setModal(null)}>
          <div className="keyra-modal-panel max-h-[min(90vh,520px)] overflow-y-auto text-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{modal.protocolName}</h2>
                <p className="mt-1 text-xs uppercase tracking-wider text-keyra-text-2">
                  {modal.protocolCode} · {modal.protocolCategory}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ${classificationBadgeClass(modal.securityClassification)}`}
                  title="Security classification"
                >
                  {modal.securityClassification ?? "SAT"}
                </span>
                {typeof modal.trustLevel === "number" ? (
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-semibold ring-1 ring-keyra-border text-keyra-accent"
                    title="Trust level (1–5)"
                  >
                    Trust L{modal.trustLevel}
                  </span>
                ) : null}
                <span
                  className="rounded px-2 py-0.5 text-[10px] font-semibold ring-1 ring-emerald-500/40 text-emerald-200"
                  title="Protocol registry status"
                >
                  {modal.active === false ? "Inactive" : "Active"}
                </span>
                {modal.flagAiAgent ? (
                  <span className="rounded px-2 py-0.5 text-[10px] ring-1 ring-fuchsia-500/35 text-fuchsia-200">AI</span>
                ) : null}
                {modal.zeroKnowledgeCompatible ? (
                  <span className="rounded px-2 py-0.5 text-[10px] ring-1 ring-violet-500/35 text-violet-200">ZK</span>
                ) : null}
                {modal.simOrEsimRequired ? (
                  <span className="rounded px-2 py-0.5 text-[10px] ring-1 ring-sky-500/35 text-sky-200">SIM</span>
                ) : null}
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-keyra-text-2">
              {modal.longDescription?.trim() || modal.shortDescription?.trim() || modal.protocolMemo}
            </p>
            <p className="mt-3 text-xs text-keyra-text-2">
              H = home network ({modal.homePercentage.toFixed(0)}%) · R = roaming ({modal.roamingPercentage.toFixed(0)}%)
            </p>
            {modal.protocolUrlEnabled && modal.protocolUrl ? (
              <a
                href={modal.protocolUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-keyra-accent underline"
              >
                Open protocol reference
              </a>
            ) : null}
            <button
              type="button"
              className="mt-5 rounded-full border border-keyra-border px-4 py-2 text-xs font-semibold text-keyra-primary hover:bg-keyra-bg"
              onClick={() => setModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
