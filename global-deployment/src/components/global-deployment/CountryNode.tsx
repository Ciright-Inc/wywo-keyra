"use client";

import { motion } from "framer-motion";
import { useDeferredReducedMotion } from "@/lib/useDeferredReducedMotion";
import type { ClusteredMapNode } from "@/lib/deployments/deployment-map-utils";
import { mapStatusVisual } from "@/lib/deployments/deployment-map-utils";

/** Map pin with tip anchored at (0, 0). */
function pinPath(height: number): string {
  const w = height * 0.38;
  const head = height * 0.82;
  return [
    `M 0 0`,
    `C ${w * 0.4} ${-head * 0.22} ${w} ${-head * 0.58} ${w} ${-head * 0.78}`,
    `A ${w} ${w} 0 1 0 ${-w} ${-head * 0.78}`,
    `C ${-w} ${-head * 0.58} ${-w * 0.4} ${-head * 0.22} 0 0`,
    `Z`,
  ].join(" ");
}

export function CountryNode({
  node,
  offsetX = 0,
  dimmed,
  selected,
  onHover,
  onLeave,
  onFocus,
  onBlur,
  onClick,
}: {
  node: ClusteredMapNode;
  offsetX?: number;
  dimmed: boolean;
  selected: boolean;
  onHover: (n: ClusteredMapNode) => void;
  onLeave: () => void;
  onFocus: (n: ClusteredMapNode) => void;
  onBlur: () => void;
  onClick: (n: ClusteredMapNode) => void;
}) {
  const reduce = useDeferredReducedMotion();
  const v = mapStatusVisual(node.status);
  const clustered = node.clusterSize > 1;
  const pinH = clustered ? 13 : 10.5;
  const label =
    node.clusterSize > 1
      ? `${node.clusterSize} deployments — ${node.regionName}`
      : `Map node: ${node.name} — ${node.regionName} — ${node.status.replace(/_/g, " ")}`;

  return (
    <g
      transform={`translate(${(node.x + offsetX).toFixed(2)} ${node.y.toFixed(2)})`}
      style={{ opacity: dimmed ? 0.3 : 1 }}
      className="outline-none"
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      onMouseEnter={() => onHover(node)}
      onMouseLeave={onLeave}
      onFocus={() => onFocus(node)}
      onBlur={onBlur}
      onClick={() => onClick(node)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(node);
        }
      }}
    >
      <ellipse cx={0} cy={1.6} rx={clustered ? 3.4 : 2.6} ry={1.1} fill="rgba(0,0,0,0.28)" />

      {selected ? (
        <circle cx={0} cy={-pinH * 0.52} r={clustered ? 7.2 : 6} fill="none" stroke={v.ring} strokeWidth={1.2} opacity={0.85} />
      ) : null}

      {!reduce && selected ? (
        <motion.circle
          cx={0}
          cy={-pinH * 0.52}
          r={clustered ? 8.4 : 7}
          fill="none"
          stroke={v.pulse}
          strokeWidth={0.9}
          initial={{ opacity: 0.15 }}
          animate={{ opacity: 0.38 }}
          transition={{ duration: 2.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
      ) : null}

      <path
        d={pinPath(pinH)}
        fill={v.core}
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={selected ? 1.15 : 0.9}
        strokeLinejoin="round"
      />

      <circle cx={0} cy={-pinH * 0.78} r={clustered ? 1.4 : 1.7} fill="rgba(255,255,255,0.92)" opacity={clustered ? 0.85 : 1} />

      {clustered ? (
        <text
          x={0}
          y={-pinH * 0.5}
          textAnchor="middle"
          dominantBaseline="central"
          className="pointer-events-none select-none fill-white text-[7px] font-bold"
          style={{ fontFamily: "ui-sans-serif, system-ui", paintOrder: "stroke fill" }}
          stroke="rgba(15,23,42,0.35)"
          strokeWidth={0.35}
        >
          {node.clusterSize}
        </text>
      ) : null}

      <circle r={Math.max(pinH + 4, 14)} fill="transparent" className="cursor-pointer" />
    </g>
  );
}
