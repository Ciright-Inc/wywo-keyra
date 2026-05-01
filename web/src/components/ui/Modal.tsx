"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "./cn";

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
  const ariaLabel = title ?? "Dialog";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close dialog backdrop"
            className="absolute inset-0 bg-keyra-bg/90 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            className={cn(
              layout === "legacy"
                ? "absolute left-1/2 top-1/2 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--keyra-radius-sheet)] bg-keyra-surface p-6 shadow-[var(--keyra-shadow-hover)]"
                : "absolute left-1/2 top-1/2 flex max-h-[min(92vh,880px)] w-[min(94vw,680px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[var(--keyra-radius-sheet)] bg-keyra-surface shadow-[var(--keyra-shadow-hover)]",
              panelClassName,
            )}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {layout === "legacy" ? (
              <>
                {title ? (
                  <p className="text-[18px] font-semibold text-keyra-primary">
                    {title}
                  </p>
                ) : null}
                <div className={cn("text-keyra-text", title ? "mt-4" : "")}>
                  {children}
                </div>
                {footer ? <div className="mt-6">{footer}</div> : null}
              </>
            ) : (
              <>
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-keyra-border px-6 py-5">
                  <div className="min-w-0">
                    {title ? (
                      <p className="text-[18px] font-semibold text-keyra-primary">
                        {title}
                      </p>
                    ) : null}
                    {subtitle ? (
                      <div className="mt-2 text-[14px] leading-relaxed text-keyra-text-2">
                        {subtitle}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="rounded-lg px-2 py-1 text-[22px] leading-none text-keyra-text-2 transition hover:bg-[rgba(255,255,255,0.06)] hover:text-keyra-primary"
                    aria-label="Close"
                    onClick={onClose}
                  >
                    ×
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-keyra-text">
                  {children}
                </div>
                {footer ? (
                  <div className="shrink-0 border-t border-keyra-border px-6 py-4">
                    {footer}
                  </div>
                ) : null}
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
