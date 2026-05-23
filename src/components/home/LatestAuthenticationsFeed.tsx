"use client";

import type { LatestAuthRecord } from "@/lib/authenticationFeed/types";
import { protocolOpenAction } from "@/lib/authenticationFeed/protocolOpenBehavior";
import { resolvePublicFeedJson } from "@/lib/authenticationFeed/feedClientResolve";
import { makeFeedRng, pickRandom } from "@/lib/authenticationFeed/random";
import { FeedTurnstileGate } from "@/components/home/FeedTurnstileGate";
import { useGlobeAuthFeedContext } from "@/contexts/GlobeAuthFeedContext";
import { cn } from "@/components/ui/cn";
import { IconSatSignal } from "@/components/ui/Icons";
import { useCallback, useEffect, useRef, useState } from "react";

type FeedVariant = "default" | "hero" | "bento";

function feedUi(variant: FeedVariant) {
  const compact = variant === "hero" || variant === "bento";
  return {
    muted: compact ? "text-[var(--color-body)]" : "text-keyra-text-2",
    primary: compact ? "text-[var(--color-ink)]" : "text-keyra-primary",
    accent: compact ? "text-[var(--color-ink)]" : "text-keyra-accent",
    accentMuted: compact ? "text-[var(--color-body)]" : "text-keyra-accent/80",
    border: compact ? "border-[var(--color-hairline)]" : "border-keyra-border/30",
    dot: compact
      ? "size-1.5 shrink-0 rounded-full bg-[var(--color-ink)] ring-2 ring-[rgba(0,0,0,0.08)]"
      : "inline-block size-1.5 shrink-0 rounded-full bg-keyra-accent/35 ring-1 ring-keyra-border",
    skeleton: compact ? "bg-[var(--color-surface-strong)]" : "bg-keyra-bg/80",
    skeletonLight: compact ? "bg-[var(--color-canvas-soft)]" : "bg-keyra-bg/60",
    scroll: compact
      ? variant === "bento"
        ? "max-h-32 flex-1 space-y-0 overflow-y-auto pr-1 sm:max-h-36"
        : "max-h-36 space-y-0 overflow-y-auto pr-1 sm:max-h-40"
      : "max-h-[min(240px,42vh)] space-y-1.5 overflow-y-auto pr-1 sm:max-h-[min(280px,50vh)]",
    row: compact
      ? "border-b py-2.5 text-[12px] last:border-0 max-[420px]:flex max-[420px]:flex-col max-[420px]:gap-1.5 min-[421px]:grid min-[421px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] min-[421px]:items-center min-[421px]:gap-2"
      : "grid grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_auto] items-start gap-1.5 border-b pb-1.5 text-[clamp(0.52rem,0.22vw+0.48rem,0.66rem)] last:border-0",
    hrBadge: compact
      ? "rounded-full border border-[var(--color-hairline-strong)] bg-[var(--color-canvas-soft)] px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wide text-[var(--color-ink)]"
      : "rounded px-1 py-0.5 text-[0.75em] font-bold ring-1 ring-keyra-border",
    empty: compact
      ? "keyra-bento-body text-[12px]"
      : "text-[clamp(0.52rem,0.22vw+0.48rem,0.62rem)] text-keyra-text-2",
  };
}

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
const SESSION_FETCH_MS = 12_000;
const LIVE_BATCH_LIMIT = 1;
const CATALOG_TICK_MS = 1_800;
/** Floor for live poll interval — avoids hammering batch API / rate limits. */
const LIVE_POLL_MIN_MS = 1_200;
const RATE_LIMIT_BACKOFF_MS = 30_000;

function maxVisibleRows(variant: FeedVariant) {
  if (variant === "bento") return 10;
  if (variant === "hero") return 14;
  return 24;
}

/** When the live feed session is unavailable, show active countries × protocols from public catalog APIs. */
async function fetchCatalogAuthRows(limit = 8): Promise<LatestAuthRecord[]> {
  try {
    const [cRes, pRes] = await Promise.all([
      fetch("/api/keyra/authentication-countries", { cache: "no-store" }),
      fetch("/api/keyra/sat-protocols", { cache: "no-store" }),
    ]);
    if (!cRes.ok || !pRes.ok) return [];
    const cJson = (await cRes.json()) as {
      countries?: { countryName: string; region: string; subRegion: string | null }[];
    };
    const pJson = (await pRes.json()) as {
      protocols?: { protocolCode: string; protocolName: string; protocolCategory: string }[];
    };
    const countries = cJson.countries ?? [];
    const protocols = pJson.protocols ?? [];
    if (!countries.length || !protocols.length) return [];

    const now = Date.now();
    const count = Math.min(limit, countries.length, protocols.length);
    const random = makeFeedRng();
    const rows: LatestAuthRecord[] = [];
    for (let i = 0; i < count; i++) {
      const country = pickRandom(countries, random)!;
      const protocol = pickRandom(protocols, random)!;
      rows.push({
        t: new Date(now - (i + 1) * 15_000).toISOString(),
        c: country.countryName,
        r: (country.subRegion?.trim() || country.region).trim(),
        p: protocol.protocolName,
        pl: protocol.protocolCode,
        m: protocol.protocolCode,
        hr: random() < 0.33 ? "R" : "H",
        x: `REF-${protocol.protocolCode}`,
        st: "S.A.T.",
      });
    }
    return rows;
  } catch {
    return [];
  }
}

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

export function LatestAuthenticationsFeed({ variant = "default" }: { variant?: FeedVariant }) {
  const globeAuthFeed = useGlobeAuthFeedContext();
  const ui = feedUi(variant);
  const isCompact = variant === "hero" || variant === "bento";
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
  const [animationSpeedMs, setAnimationSpeedMs] = useState(400);
  const [isCatalogFallback, setIsCatalogFallback] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextCursorRef = useRef(0);
  const feedEnabledRef = useRef(true);
  const doneRef = useRef(false);
  const livePollRef = useRef(false);
  const rateLimitUntilRef = useRef(0);
  const catalogPoolRef = useRef<LatestAuthRecord[]>([]);
  const catalogIndexRef = useRef(0);

  useEffect(() => {
    if (!globeAuthFeed) return;
    if (!feedEnabled || records.length === 0) {
      globeAuthFeed.syncRecords([]);
      return;
    }
    globeAuthFeed.syncRecords(records);
  }, [records, feedEnabled, globeAuthFeed]);

  const applyCatalogFallback = useCallback(async (): Promise<boolean> => {
    const rows = await fetchCatalogAuthRows(8);
    if (!rows.length) return false;
    catalogPoolRef.current = rows;
    catalogIndexRef.current = rows.length;
    setIsCatalogFallback(true);
    setFeedEnabled(true);
    feedEnabledRef.current = true;
    setRecords(rows);
    setNextCursor(0);
    nextCursorRef.current = 0;
    setDone(true);
    doneRef.current = true;
    setHint(null);
    setAnimationSpeedMs(CATALOG_TICK_MS);
    return true;
  }, []);

  const failFeed = useCallback(
    async (message: string) => {
      if (await applyCatalogFallback()) return;
      setHint(message);
      setRecords([]);
      setFeedEnabled(false);
      feedEnabledRef.current = false;
    },
    [applyCatalogFallback],
  );

  const startSession = useCallback(async (turnstile?: string, options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    setHint(null);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), SESSION_FETCH_MS);
    try {
      const url = new URL("/api/keyra/latest-authentications/session", window.location.origin);
      if (turnstile) url.searchParams.set("turnstileToken", turnstile);
      const res = await fetch(url.toString(), {
        credentials: "include",
        signal: controller.signal,
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
        await failFeed(err);
        return;
      }
      const resolved = await resolvePublicFeedJson(rawUnknown, "session");
      if (!resolved.ok) {
        await failFeed(resolved.error);
        return;
      }
      const data = readSessionPayload(resolved.json);
      if (!data) {
        await failFeed("Invalid feed session payload.");
        return;
      }
      setFeedEnabled(data.feedEnabled !== false);
      if (!data.feedEnabled) {
        await failFeed(data.message ?? "Feed is disabled or database unavailable.");
        return;
      }
      const rows = data.records ?? [];
      if (!rows.length) {
        if (await applyCatalogFallback()) return;
        setRecords([]);
        setHint("No authentication events yet. Enable countries and protocols in admin.");
        return;
      }
      setIsCatalogFallback(false);
      const cursor = data.nextCursor ?? 1;
      setRecords(rows);
      setNextCursor(cursor);
      nextCursorRef.current = cursor;
      setThreshold(data.fetchThreshold ?? 30);
      const sessionDone = cursor < 1;
      setDone(sessionDone);
      doneRef.current = sessionDone;
      feedEnabledRef.current = true;
      if (typeof data.animationSpeedMs === "number" && data.animationSpeedMs >= 50) {
        setAnimationSpeedMs(data.animationSpeedMs);
      }
    } catch (err) {
      const timedOut = err instanceof DOMException && err.name === "AbortError";
      await failFeed(
        timedOut
          ? "Authentication feed timed out. Check DATABASE_URL and run npm run db:seed:auth-feed."
          : "Network error loading feed.",
      );
    } finally {
      window.clearTimeout(timeoutId);
      if (!options?.silent) setLoading(false);
    }
  }, [applyCatalogFallback, failFeed]);

  useEffect(() => {
    if (captchaToken === null) return;
    let cancelled = false;
    const token = captchaToken === "ready" ? undefined : captchaToken;
    // Yield until App Router finishes hydration (avoids Next.js 16 action-queue races).
    const id = window.setTimeout(() => {
      if (!cancelled) void startSession(token);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [captchaToken, startSession]);

  const fetchBatch = useCallback(
    async (
      cursor: number,
      { limit, mode }: { limit?: number; mode: "append" | "prepend" },
    ): Promise<boolean> => {
      const params = new URLSearchParams({ cursor: String(cursor) });
      if (limit != null && limit >= 1) params.set("limit", String(limit));

      try {
        const res = await fetch(`/api/keyra/latest-authentications/batch?${params}`, {
          credentials: "include",
          cache: "no-store",
        });
        const rawUnknown: unknown = await res.json();

        if (res.status === 401) return false;

        if (res.status === 429) {
          rateLimitUntilRef.current = Date.now() + RATE_LIMIT_BACKOFF_MS;
          setHint("Feed paused briefly (too many requests). Resuming shortly.");
          return false;
        }

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
          doneRef.current = true;
          return false;
        }

        const resolved = await resolvePublicFeedJson(rawUnknown, "batch");
        if (!resolved.ok) {
          setHint(resolved.error);
          setDone(true);
          doneRef.current = true;
          return false;
        }

        const data = readBatchPayload(resolved.json);
        if (!data) {
          setHint("Invalid batch payload.");
          setDone(true);
          doneRef.current = true;
          return false;
        }

        if (data.done) {
          setDone(true);
          doneRef.current = true;
        }

        const incoming = data.records ?? [];
        if (incoming.length) {
          setRecords((prev) => {
            if (mode === "prepend") {
              return [...incoming, ...prev].slice(0, maxVisibleRows(variant));
            }
            return [...prev, ...incoming];
          });
        }

        if (typeof data.nextCursor === "number") {
          setNextCursor(data.nextCursor);
          nextCursorRef.current = data.nextCursor;
        }

        return true;
      } catch {
        setHint("Network error loading authentication feed.");
        return false;
      }
    },
    [variant],
  );

  const fetchNext = useCallback(async () => {
    if (!feedEnabled || done || loadingMore || nextCursor < 1) return;
    setLoadingMore(true);
    try {
      await fetchBatch(nextCursor, { mode: "append" });
    } finally {
      setLoadingMore(false);
    }
  }, [feedEnabled, done, loadingMore, nextCursor, fetchBatch]);

  const fetchLiveTick = useCallback(async () => {
    if (livePollRef.current || loading || !feedEnabledRef.current || doneRef.current) return;
    if (Date.now() < rateLimitUntilRef.current) return;
    const cursor = nextCursorRef.current;
    if (cursor < 1) return;

    livePollRef.current = true;
    try {
      const ok = await fetchBatch(cursor, { limit: LIVE_BATCH_LIMIT, mode: "prepend" });
      if (!ok) {
        const token = captchaToken === "ready" ? undefined : captchaToken ?? undefined;
        await startSession(token, { silent: true });
      }
    } finally {
      livePollRef.current = false;
    }
  }, [loading, fetchBatch, captchaToken, startSession]);

  useEffect(() => {
    if (loading || !feedEnabled || isCatalogFallback) return undefined;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intervalMs = reducedMotion
      ? Math.max(animationSpeedMs * 4, 2000)
      : Math.max(animationSpeedMs, LIVE_POLL_MIN_MS);

    const id = window.setInterval(() => {
      void fetchLiveTick();
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [loading, feedEnabled, isCatalogFallback, animationSpeedMs, fetchLiveTick]);

  useEffect(() => {
    if (loading || !isCatalogFallback) return undefined;
    const pool = catalogPoolRef.current;
    if (!pool.length) return undefined;

    const tickRandom = makeFeedRng();
    const id = window.setInterval(() => {
      const source = pickRandom(pool, tickRandom)!;
      catalogIndexRef.current += 1;
      const row: LatestAuthRecord = {
        ...source,
        t: new Date().toISOString(),
        x: `REF-${source.pl}-${catalogIndexRef.current}`,
      };
      setRecords((prev) => [row, ...prev].slice(0, maxVisibleRows(variant)));
    }, animationSpeedMs);

    return () => window.clearInterval(id);
  }, [loading, isCatalogFallback, animationSpeedMs, variant]);

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
        <p className={cn("text-[10px]", ui.muted)}>
          Turnstile verifies the browser before opening a feed session when server and site keys are configured.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-0" aria-busy aria-label="Loading latest authentications">
        {[0, 1, 2, 3, 4].map((i) =>
          isCompact ? (
            <div
              key={i}
              className={cn(
                "grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] items-center gap-2 border-b py-2.5 last:border-0",
                ui.border,
              )}
            >
              <div className="flex items-center gap-2">
                <span className="keyra-bento-icon !h-6 !w-6 opacity-40" aria-hidden>
                  <IconSatSignal className="h-3 w-3" />
                </span>
                <div className={cn("h-3 flex-1 max-w-[75%] animate-pulse rounded", ui.skeleton)} />
              </div>
              <div className={cn("h-3 max-w-[70%] animate-pulse rounded", ui.skeleton)} />
              <div className={cn("h-5 w-11 animate-pulse rounded-full", ui.skeletonLight)} />
            </div>
          ) : (
            <div key={i} className="flex gap-2 py-1">
              <div className={cn("h-9 flex-1 animate-pulse rounded", ui.skeleton)} />
              <div className={cn("h-9 w-16 animate-pulse rounded", ui.skeletonLight)} />
              <div className={cn("h-9 w-14 animate-pulse rounded", ui.skeletonLight)} />
            </div>
          ),
        )}
      </div>
    );
  }

  if (!feedEnabled || records.length === 0) {
    return (
      <div className={ui.empty} role="status">
        <p>{hint ?? "Authentication feed will appear here when the database is configured and countries/protocols are seeded."}</p>
        <p className={cn("mt-2 opacity-80", ui.muted)}>
          Local: run <code className="text-[0.95em]">npm run db:seed:local-latest-auth</code>, restart{" "}
          <code className="text-[0.95em]">npm run dev</code>, then hard-refresh.
        </p>
      </div>
    );
  }

  return (
    <>
      <div ref={scrollRef} onScroll={onScroll} className={ui.scroll}>
        {records.map((row, idx) => (
          <div
            key={`${row.t}-${row.x}-${idx}`}
            className={cn(ui.row, ui.border, ui.primary)}
          >
            <div className="min-w-0">
              {isCompact ? (
                <div className="flex items-center gap-2">
                  <span className={ui.dot} aria-hidden />
                  <span className="truncate font-medium">{row.c}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className={ui.dot} aria-hidden />
                    <div className="truncate font-medium">{row.c}</div>
                  </div>
                  <div className={cn("truncate pl-2.5 text-[0.9em]", ui.muted)}>
                    {row.r} · {formatFeedTime(row.t)}
                  </div>
                </>
              )}
            </div>
            <div className="min-w-0">
              {isCompact ? (
                <button
                  type="button"
                  className={cn(
                    "w-full truncate text-left font-mono text-[11px] underline-offset-2 hover:underline",
                    ui.muted,
                    variant === "bento" ? "hover:text-[var(--color-ink)]" : "hover:text-[var(--color-text-link)]",
                  )}
                  onClick={() => void openProtocol(row.pl)}
                >
                  {row.m}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={cn(
                      "w-full truncate text-left text-[clamp(0.48rem,0.2vw+0.43rem,0.58rem)] underline-offset-2 hover:underline",
                      ui.accent,
                    )}
                    onClick={() => void openProtocol(row.pl)}
                  >
                    {row.p}
                  </button>
                  <div className={cn("truncate text-[0.65em]", ui.muted)}>{row.m}</div>
                </>
              )}
            </div>
            <div
              className={cn(
                isCompact
                  ? "flex shrink-0 items-center justify-end"
                  : "flex min-w-0 flex-col items-end gap-0.5 text-right sm:min-w-[7rem]",
              )}
            >
              {isCompact ? (
                <span className={ui.hrBadge}>{row.st}</span>
              ) : (
                <>
                  <span className={cn(ui.hrBadge, ui.accent)}>{row.hr}</span>
                  <span className={cn("text-[0.68em] font-medium", ui.accentMuted)}>{row.st}</span>
                  <span className={cn("max-w-[9rem] truncate text-[0.72em]", ui.muted)}>{row.x}</span>
                </>
              )}
            </div>
          </div>
        ))}
        {loadingMore ? (
          <div className="space-y-2 py-2" aria-busy>
            {[0, 1].map((i) => (
              <div key={i} className={cn("h-3 animate-pulse rounded", ui.skeleton)} />
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
