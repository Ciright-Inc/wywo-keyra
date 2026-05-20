"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "./cn";

/**
 * Toast — transient notification stack docked bottom-right.
 *
 * Spec: agent.md TR-2 (12px radius), TR-6 (single soft shadow), TR-7 (semantic
 * color goes on the left accent bar / icon only, never on the toast body or text).
 */
type ToastKind = "success" | "error" | "info";

type ToastItem = {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
};

type ToastApi = {
  push: (t: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/** Left-accent color carries the semantic meaning — body/text stay neutral. */
const accentBarClass: Record<ToastKind, string> = {
  success: "before:bg-[var(--ds-success)]",
  error: "before:bg-[var(--ds-error)]",
  info: "before:bg-[var(--ds-ink)]",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    const item: ToastItem = { id, ...t };
    setItems((prev) => [item, ...prev].slice(0, 3));
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const api = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-5 right-5 z-[60] w-[min(92vw,360px)] space-y-2">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "relative overflow-hidden rounded-[var(--ds-radius-lg)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-surface-card)] p-4 pl-5 shadow-[var(--ds-shadow-soft)]",
                "before:absolute before:inset-y-0 before:left-0 before:w-1",
                accentBarClass[t.kind],
              )}
              role={t.kind === "error" ? "alert" : "status"}
            >
              <p className="ds-title-sm">{t.title}</p>
              {t.message ? <p className="mt-1 ds-body-sm">{t.message}</p> : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
