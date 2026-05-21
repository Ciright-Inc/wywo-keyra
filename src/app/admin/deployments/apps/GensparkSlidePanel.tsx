"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const CONTENT_ANCHOR_ID = "admin-deployments-main";

type Props = {
  open: boolean;
  url: string | null;
  label: string;
  onClose: () => void;
};

export function GensparkSlidePanel({ open, url, label, onClose }: Props) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function updateRect() {
      const el = document.getElementById(CONTENT_ANCHOR_ID);
      setAnchorRect(el?.getBoundingClientRect() ?? null);
    }

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open, url]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted || !open || !url || !anchorRect) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div
          className="fixed z-[100]"
          style={{
            top: anchorRect.top,
            left: anchorRect.left,
            width: anchorRect.width,
            height: anchorRect.height,
          }}
        >
          <motion.button
            type="button"
            aria-label="Close slide panel"
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-keyra-border bg-keyra-bg shadow-[-24px_0_80px_rgba(0,0,0,0.12)]"
            initial={reduce ? { x: 0 } : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduce ? { x: 0 } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex min-h-0 flex-1 flex-col">
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute right-3 top-2.5 z-10 inline-flex size-6 items-center justify-center rounded border border-keyra-border bg-keyra-bg p-0 text-keyra-primary transition hover:border-black/20 hover:bg-keyra-surface"
              >
                <span className="text-[17px] leading-none">×</span>
              </button>
              <iframe
                title={label}
                src={url}
                className="min-h-0 flex-1 w-full border-0 bg-white"
                allow="autoplay; fullscreen; clipboard-read; clipboard-write; presentation"
              />
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
