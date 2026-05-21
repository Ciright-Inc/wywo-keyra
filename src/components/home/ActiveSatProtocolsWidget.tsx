"use client";

import { useCallback, useEffect, useState } from "react";

type ActiveProtocol = {
  protocolCode: string;
  protocolName: string;
  protocolCategory: string;
  colorTheme: string | null;
  iconKey: string | null;
};

export function ActiveSatProtocolsWidget() {
  const [protocols, setProtocols] = useState<ActiveProtocol[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/keyra/sat-protocols", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { protocols?: ActiveProtocol[] };
      setProtocols(Array.isArray(data.protocols) ? data.protocols : []);
    } catch {
      setProtocols([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  return (
    <>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
        SAT protocols
      </p>
      <div className="mt-3 max-h-36 space-y-2.5 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-[12px] text-slate-400">Loading…</p>
        ) : protocols.length === 0 ? (
          <p className="text-[12px] text-slate-400">No active protocols</p>
        ) : (
          protocols.map((protocol) => (
            <div key={protocol.protocolCode} className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <span className="text-[12px] text-slate-500">
                {protocol.protocolName} • {protocol.protocolCategory}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
