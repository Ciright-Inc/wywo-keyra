"use client";

import type { KeyraSessionUser } from "@/lib/keyraSessionCookie";
import { formatPhoneDisplay } from "@/lib/keyraSessionDisplay";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

async function fetchSessionUser(): Promise<KeyraSessionUser | null> {
  try {
    const res = await fetch("/api/keyra/session/me", { credentials: "include" });
    const data = (await res.json()) as { user: KeyraSessionUser | null };
    return data.user ?? null;
  } catch {
    return null;
  }
}

type KeyraSessionContextValue = {
  user: KeyraSessionUser | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
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
  const [user, setUser] = useState<KeyraSessionUser | null>(initialUser);

  const refresh = useCallback(async () => {
    setUser(await fetchSessionUser());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchSessionUser().then((next) => {
      if (!cancelled) setUser(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPageShow = () => {
      void refresh();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/keyra/session/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }, []);

  const headerLabel = useMemo(() => {
    if (!user) return null;
    const name = user.displayName?.trim();
    if (name) return name;
    return formatPhoneDisplay(user.phoneE164);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      refresh,
      logout,
      headerLabel,
    }),
    [user, refresh, logout, headerLabel],
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
