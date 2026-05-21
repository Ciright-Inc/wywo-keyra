"use client";

import type { KeyraSessionUser } from "@/lib/keyraSessionCookie";
import { formatPhoneDisplay } from "@/lib/keyraSessionDisplay";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const AUTH_CHANNEL = "keyra-auth";
const SESSION_TIMEOUT_MS = 4000;

const defaultUser: KeyraSessionUser = {
  phoneE164: "",
};

type AuthSessionPayload = {
  authenticated: boolean;
  user?: { phone?: string; username?: string | null; fullName?: string | null } | null;
};

function authSessionDisplayName(
  user: NonNullable<AuthSessionPayload["user"]>,
): string | undefined {
  const username = typeof user.username === "string" ? user.username.trim() : "";
  if (username) return username;
  const fullName = typeof user.fullName === "string" ? user.fullName.trim() : "";
  if (fullName) return fullName;
  return undefined;
}

async function clearKeyraCookieSession(): Promise<void> {
  try {
    await fetch("/api/keyra/session/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // ignore
  }
}

async function fetchSessionUser(signal?: AbortSignal): Promise<KeyraSessionUser | null> {
  let payload: AuthSessionPayload | null = null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SESSION_TIMEOUT_MS);

  try {
    const res = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      signal: controller.signal,
    });
    if (res.ok) {
      payload = await res.json();
    }
  } catch {
    // continue to fallback
  } finally {
    clearTimeout(timeout);
  }

  const authBackendUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL : "";
  if ((!payload?.authenticated || !payload?.user) && authBackendUrl?.trim()) {
    try {
      const base = authBackendUrl.replace(/\/+$/, "");
      const res2 = await fetch(`${base}/auth/session`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        signal,
      });
      if (res2.ok) {
        payload = await res2.json();
      }
    } catch {
      // keep payload
    }
  }

  if (!payload?.authenticated || !payload?.user?.phone) {
    return null;
  }

  const phone = payload.user.phone.startsWith("+") ? payload.user.phone : `+${payload.user.phone}`;
  return {
    phoneE164: phone,
    displayName: authSessionDisplayName(payload.user),
  };
}

type KeyraSessionContextValue = {
  user: KeyraSessionUser | null;
  isAuthenticated: boolean;
  initialized: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (next: Partial<KeyraSessionUser> | null) => void;
  /** Name if set, otherwise formatted phone */
  headerLabel: string | null;
};

const KeyraSessionContext = createContext<KeyraSessionContextValue | null>(null);

export function KeyraSessionProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  /** Parsed from httpOnly cookie on the server — keeps SSR and hydration aligned */
  initialUser?: KeyraSessionUser | null;
}) {
  const [user, setUserState] = useState<KeyraSessionUser | null>(initialUser);
  const [initialized, setInitialized] = useState(false);
  const fetchingRef = useRef(false);

  const fetchSession = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SESSION_TIMEOUT_MS);
    try {
      const next = await fetchSessionUser(controller.signal);
      setUserState((prev) => {
        if (next === null) return null;
        if (
          prev &&
          next.phoneE164 === prev.phoneE164 &&
          next.displayName === prev.displayName &&
          next.email === prev.email &&
          next.country === prev.country
        ) {
          return prev;
        }
        return next;
      });
    } catch {
      setUserState((prev) => (prev !== null ? null : prev));
    } finally {
      clearTimeout(timeout);
      fetchingRef.current = false;
      setInitialized(true);
    }
  }, []);

  const setUser = useCallback((next: Partial<KeyraSessionUser> | null) => {
    if (!next) {
      setUserState(null);
      return;
    }
    setUserState((prev) => ({
      ...defaultUser,
      ...(prev && typeof prev === "object" ? prev : {}),
      ...(typeof next === "object" ? next : {}),
    }));
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchSession();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchSession]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        fetchingRef.current = false;
      }
      void fetchSession();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [fetchSession]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let interval: ReturnType<typeof setInterval>;
    const schedulePoll = () => {
      clearInterval(interval);
      if (document.visibilityState === "visible") {
        interval = setInterval(fetchSession, 30000);
      }
    };
    schedulePoll();
    document.addEventListener("visibilitychange", schedulePoll);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", schedulePoll);
    };
  }, [fetchSession]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let channel: BroadcastChannel | undefined;
    try {
      channel = new BroadcastChannel(AUTH_CHANNEL);
      channel.onmessage = (e) => {
        if (e?.data?.type === "logout") setUserState(null);
      };
    } catch {
      // BroadcastChannel not supported
    }
    return () => channel?.close();
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }),
      clearKeyraCookieSession(),
    ]);
    setUserState(null);
    try {
      new BroadcastChannel(AUTH_CHANNEL).postMessage({ type: "logout" });
    } catch {
      // ignore
    }
  }, []);

  const isAuthenticated = !!user;

  const headerLabel = useMemo(() => {
    if (!user) return null;
    const name = user.displayName?.trim();
    if (name) return name;
    return formatPhoneDisplay(user.phoneE164);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      initialized,
      refresh: fetchSession,
      logout,
      setUser,
      headerLabel,
    }),
    [user, isAuthenticated, initialized, fetchSession, logout, setUser, headerLabel],
  );

  return (
    <KeyraSessionContext.Provider value={value}>{children}</KeyraSessionContext.Provider>
  );
}

export function useKeyraSession() {
  const ctx = useContext(KeyraSessionContext);
  if (!ctx) {
    throw new Error("useKeyraSession must be used within KeyraSessionProvider");
  }
  return ctx;
}

