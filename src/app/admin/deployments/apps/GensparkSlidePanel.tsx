"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CONTENT_ANCHOR_IDS = ["admin-main-content", "admin-deployments-main"] as const;

/** Genspark presentation listens for these postMessage types while Play Slides is active. */
const GENSPARK_SLIDE_NEXT = "SLIDE_NEXT";
const GENSPARK_SLIDE_PREV = "SLIDE_PREV";
const GENSPARK_AUTO_ADVANCE_MS = 5000;

function resolveAnchorRect(): DOMRect | null {
  for (const id of CONTENT_ANCHOR_IDS) {
    const el = document.getElementById(id);
    if (el) return el.getBoundingClientRect();
  }

  const content = document.querySelector(".admin-dashboard__content");
  if (content instanceof HTMLElement) return content.getBoundingClientRect();

  return null;
}

function isIframePresentationFullscreen(iframe: HTMLIFrameElement | null): boolean {
  if (!iframe) return false;
  const fs =
    document.fullscreenElement ??
    (document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement ??
    null;
  return fs === iframe || iframe.contains(fs) || fs?.contains(iframe) === true;
}

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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setAnchorRect(null);
      return;
    }

    function updateRect() {
      setAnchorRect(resolveAnchorRect());
    }

    updateRect();
    const raf = window.requestAnimationFrame(updateRect);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.cancelAnimationFrame(raf);
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

    let autoAdvanceTimer: number | null = null;

    function postToGenspark(type: typeof GENSPARK_SLIDE_NEXT | typeof GENSPARK_SLIDE_PREV) {
      iframeRef.current?.contentWindow?.postMessage({ type }, "*");
    }

    function stopAutoAdvance() {
      if (autoAdvanceTimer !== null) {
        window.clearInterval(autoAdvanceTimer);
        autoAdvanceTimer = null;
      }
    }

    function startAutoAdvance() {
      if (reduce || autoAdvanceTimer !== null) return;
      autoAdvanceTimer = window.setInterval(() => {
        postToGenspark(GENSPARK_SLIDE_NEXT);
      }, GENSPARK_AUTO_ADVANCE_MS);
    }

    function syncAutoAdvance() {
      if (isIframePresentationFullscreen(iframeRef.current)) {
        startAutoAdvance();
      } else {
        stopAutoAdvance();
      }
    }

    function onFullscreenChange() {
      syncAutoAdvance();
    }

    function isAnyFullscreen() {
      return Boolean(
        document.fullscreenElement ??
          (document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement,
      );
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isAnyFullscreen()) return;
        onClose();
        return;
      }

      if (!isIframePresentationFullscreen(iframeRef.current)) return;

      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        postToGenspark(GENSPARK_SLIDE_NEXT);
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        postToGenspark(GENSPARK_SLIDE_PREV);
      }
    }

    const pollId = window.setInterval(syncAutoAdvance, 1000);

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onKeyDown);
    syncAutoAdvance();

    return () => {
      window.clearInterval(pollId);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onKeyDown);
      stopAutoAdvance();
    };
  }, [open, onClose, reduce]);

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
                ref={iframeRef}
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
