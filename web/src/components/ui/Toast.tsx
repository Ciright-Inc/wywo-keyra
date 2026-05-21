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
 * Toast — transient notification stack docked top-right (below site header).
 *
 * Spec: agent.md TR-2 (12px radius), TR-6 (single soft shadow), TR-7 (semantic
 * color goes on the left accent bar / icon only, never on the toast body or text).
 *
 * Use `useToast()` everywhere — do not add alternate toast libraries or inline banners.
 */
export type ToastKind = "success" | "error" | "info";

export type ToastInput = {
  kind: ToastKind;
  title: string;
  message?: string;
};

type ToastItem = ToastInput & { id: string };

type ToastApi = {
  push: (t: ToastInput) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export const TOAST_AUTO_DISMISS_MS = 3200;
export const TOAST_MAX_VISIBLE = 3;

/** Left-accent color carries the semantic meaning — body/text stay neutral. */
const accentBarClass: Record<ToastKind, string> = {
  success: "before:bg-[var(--ds-success)]",
  error: "before:bg-[var(--ds-error)]",
  info: "before:bg-[var(--ds-ink)]",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: ToastInput) => {
    const id = crypto.randomUUID();
    const item: ToastItem = { id, ...t };
    setItems((prev) => [item, ...prev].slice(0, TOAST_MAX_VISIBLE));
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, TOAST_AUTO_DISMISS_MS);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      push,
      success: (title, message) => push({ kind: "success", title, message }),
      error: (title, message) => push({ kind: "error", title, message }),
      info: (title, message) => push({ kind: "info", title, message }),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed top-20 right-5 z-[var(--keyra-z-toast)] w-[min(92vw,360px)] space-y-2"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "pointer-events-auto relative overflow-hidden rounded-[var(--ds-radius-lg)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-surface-card)] p-4 pl-5 shadow-[var(--ds-shadow-soft)]",
                "before:absolute before:inset-y-0 before:left-0 before:w-1",
                accentBarClass[t.kind],
              )}
              role={t.kind === "error" ? "alert" : "status"}
            >
              <p className="ds-title-sm">{t.title}</p>
              {t.message ? (
                <p className="ds-body-sm mt-1 text-[var(--ds-body)]">{t.message}</p>
              ) : null}
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
