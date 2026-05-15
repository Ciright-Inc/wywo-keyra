"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ClusteredMapNode } from "@/lib/deployments/deployment-map-utils";
import { mapStatusVisual } from "@/lib/deployments/deployment-map-utils";

export function CountryNode({
  node,
  dimmed,
  selected,
  onHover,
  onLeave,
  onFocus,
  onBlur,
  onClick,
}: {
  node: ClusteredMapNode;
  dimmed: boolean;
  selected: boolean;
  onHover: (n: ClusteredMapNode) => void;
  onLeave: () => void;
  onFocus: (n: ClusteredMapNode) => void;
  onBlur: () => void;
  onClick: (n: ClusteredMapNode) => void;
}) {
  const reduce = useReducedMotion();
  const v = mapStatusVisual(node.status);
  const r = node.clusterSize > 1 ? 7 : 5;
  const label =
    node.clusterSize > 1
      ? `${node.clusterSize} deployments — ${node.regionName}`
      : `Map node: ${node.name} — ${node.regionName} — ${node.status.replace(/_/g, " ")}`;

  return (
    <g
      transform={`translate(${node.x.toFixed(2)} ${node.y.toFixed(2)})`}
      style={{ opacity: dimmed ? 0.22 : 1 }}
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
      <title>{label}</title>
      {!reduce ? (
        <motion.circle
          r={r + 10}
          fill="none"
          stroke={v.pulse}
          strokeWidth={1}
          initial={{ opacity: 0.12 }}
          animate={{ opacity: selected ? 0.5 : 0.26 }}
          transition={{ duration: 4.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
      ) : (
        <circle r={r + 8} fill="none" stroke={v.ring} strokeWidth={0.6} opacity={0.35} />
      )}
      <circle r={r + 3.5} fill="none" stroke={v.ring} strokeWidth={selected ? 1.4 : 0.9} opacity={selected ? 0.95 : 0.55} />
      <circle r={r} fill={v.core} filter="url(#keyraNodeBloom)" opacity={0.95} />
      {node.clusterSize > 1 ? (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          className="pointer-events-none select-none fill-slate-950 text-[9px] font-semibold"
          style={{ fontFamily: "ui-sans-serif, system-ui" }}
        >
          {node.clusterSize}
        </text>
      ) : null}
      <circle r={Math.max(r + 6, 14)} fill="transparent" className="cursor-pointer" />
    </g>
  );
}
