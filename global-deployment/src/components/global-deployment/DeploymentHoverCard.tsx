"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useDeferredReducedMotion } from "@/lib/useDeferredReducedMotion";
import { StatusBadge } from "@/components/global-deployment/StatusBadge";
import { flagEmojiFromIso2 } from "@/lib/deployments/flagEmoji";
import type { ClusteredMapNode } from "@/lib/deployments/deployment-map-utils";

const CARD_W = 248;
const CARD_H = 118;
const PAD = 14;

function clampPosition(clientX: number, clientY: number) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  let left = clientX + PAD;
  let top = clientY - CARD_H - PAD;

  if (top < PAD) top = clientY + PAD;
  if (left + CARD_W > vw - PAD) left = clientX - CARD_W - PAD;
  if (left < PAD) left = PAD;
  if (top + CARD_H > vh - PAD) top = vh - CARD_H - PAD;

  return { left, top };
}

export function DeploymentHoverCard({
  node,
  clientX,
  clientY,
  visible,
}: {
  node: ClusteredMapNode | null;
  clientX: number;
  clientY: number;
  visible: boolean;
}) {
  const reduce = useDeferredReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!visible) return;
    setPos(clampPosition(clientX, clientY));
  }, [clientX, clientY, visible]);

  if (!mounted || !node) return null;

  const c = node.country;
  const title = node.clusterSize > 1 ? `${node.clusterSize} markets` : c.name;

  return createPortal(
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="tooltip"
          id={`deployment-map-tooltip-${c.id}`}
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 2 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="pointer-events-none fixed z-[var(--keyra-z-toast)] w-[15.5rem] overflow-hidden rounded-[var(--keyra-radius-lg)] border border-keyra-border bg-keyra-bg/98 shadow-[0_16px_48px_rgba(15,23,42,0.18)] backdrop-blur-md"
          style={{ left: pos.left, top: pos.top }}
        >
          <div className="flex items-start gap-3 px-3.5 py-3">
            <span className="text-2xl leading-none" aria-hidden>
              {flagEmojiFromIso2(c.iso2)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-keyra-primary">{title}</p>
              <p className="mt-0.5 truncate text-[11px] text-keyra-text-2">{node.regionName}</p>
              <div className="mt-2">
                <StatusBadge status={c.status} compact />
              </div>
            </div>
          </div>
          <p className="border-t border-keyra-border px-3.5 py-2 text-[10px] text-keyra-text-2">Click marker for full deployment profile</p>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
