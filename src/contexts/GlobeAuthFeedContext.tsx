"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { LatestAuthRecord } from "@/lib/authenticationFeed/types";

type AuthFeedListener = (record: LatestAuthRecord) => void;

type GlobeAuthFeedContextValue = {
  notifyNewAuth: (record: LatestAuthRecord) => void;
  subscribe: (listener: AuthFeedListener) => () => void;
};

const GlobeAuthFeedContext = createContext<GlobeAuthFeedContextValue | null>(null);

export function GlobeAuthFeedProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef(new Set<AuthFeedListener>());

  const subscribe = useCallback((listener: AuthFeedListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const notifyNewAuth = useCallback((record: LatestAuthRecord) => {
    for (const listener of listenersRef.current) {
      listener(record);
    }
  }, []);

  const value = useMemo(
    () => ({ notifyNewAuth, subscribe }),
    [notifyNewAuth, subscribe],
  );

  return (
    <GlobeAuthFeedContext.Provider value={value}>{children}</GlobeAuthFeedContext.Provider>
  );
}

export function useGlobeAuthFeedContext() {
  return useContext(GlobeAuthFeedContext);
}
