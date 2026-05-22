"use client";

import { lockDocumentScroll } from "@/lib/documentScrollLock";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

/**
 * Modal — single dialog primitive used across the app.
 *
 * Spec: agent.md TR-2 (12px radius), TR-5 (no glassmorphism — solid scrim, no backdrop-blur),
 * TR-6 (the single soft shadow).
 *
 * Layouts:
 *  • `legacy` — compact centered panel with optional title + footer.
 *  • `sheet`  — taller multi-section panel with sticky header + scroll body + sticky footer.
 *
 * Both surfaces use `--ds-surface-card` (#fff), 1px hairline border, 12px radius,
 * `--ds-shadow-soft` elevation. Backdrop is a solid 55%-black scrim — no blur.
 */
type ModalLayout = "legacy" | "sheet";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  layout = "legacy",
  panelClassName,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  layout?: ModalLayout;
  panelClassName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const ariaLabel = title ?? "Dialog";
  const panelBase =
    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-[var(--ds-hairline-strong)] bg-[var(--ds-surface-card)] text-[var(--ds-ink)] shadow-[var(--ds-shadow-soft)] rounded-[var(--ds-radius-lg)]";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    return lockDocumentScroll();
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[var(--keyra-z-modal,500)] overscroll-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onWheel={(event) => {
            if (event.target === event.currentTarget) event.preventDefault();
          }}
          onTouchMove={(event) => {
            if (event.target === event.currentTarget) event.preventDefault();
          }}
        >
          {/* Solid scrim, no backdrop-filter (TR-5). */}
          <button
            type="button"
            aria-label="Close dialog backdrop"
            className="absolute inset-0 bg-black/55"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            className={cn(
              panelBase,
              layout === "legacy"
                ? "w-[min(92vw,520px)] p-6"
                : "flex max-h-[min(92vh,880px)] w-[min(94vw,680px)] flex-col overflow-hidden",
              panelClassName,
            )}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
          >
            {layout === "legacy" ? (
              <>
                {title ? <p className="ds-title-md">{title}</p> : null}
                <div className={cn("text-[var(--ds-body)]", title ? "mt-4" : "")}>
                  {children}
                </div>
                {footer ? <div className="mt-6">{footer}</div> : null}
              </>
            ) : (
              <>
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--ds-hairline-strong)] px-6 py-5">
                  <div className="min-w-0">
                    {title ? <p className="ds-title-md">{title}</p> : null}
                    {subtitle ? <div className="mt-2 ds-body-sm">{subtitle}</div> : null}
                  </div>
                  <button
                    type="button"
                    className="ds-btn-icon -mr-2"
                    aria-label="Close"
                    onClick={onClose}
                  >
                    {/* Plain glyph — Material Symbols Outlined isn't bundled in this build path. */}
                    <span className="text-[20px] leading-none">×</span>
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-[var(--ds-ink)]">
                  {children}
                </div>
                {footer ? (
                  <div className="shrink-0 border-t border-[var(--ds-hairline-strong)] px-6 py-4">
                    {footer}
                  </div>
                ) : null}
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
