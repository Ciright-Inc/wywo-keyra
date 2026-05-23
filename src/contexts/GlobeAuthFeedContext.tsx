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

type RecordsSyncListener = (records: LatestAuthRecord[]) => void;

type GlobeAuthFeedContextValue = {
  /** Mirror every row currently shown in Latest authentications onto the globe. */
  syncRecords: (records: LatestAuthRecord[]) => void;
  subscribeRecordsSync: (listener: RecordsSyncListener) => () => void;
};

const GlobeAuthFeedContext = createContext<GlobeAuthFeedContextValue | null>(null);

export function GlobeAuthFeedProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef(new Set<RecordsSyncListener>());

  const subscribeRecordsSync = useCallback((listener: RecordsSyncListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const syncRecords = useCallback((records: LatestAuthRecord[]) => {
    for (const listener of listenersRef.current) {
      listener(records);
    }
  }, []);

  const value = useMemo(
    () => ({ syncRecords, subscribeRecordsSync }),
    [syncRecords, subscribeRecordsSync],
  );

  return (
    <GlobeAuthFeedContext.Provider value={value}>{children}</GlobeAuthFeedContext.Provider>
  );
}

export function useGlobeAuthFeedContext() {
  return useContext(GlobeAuthFeedContext);
}
