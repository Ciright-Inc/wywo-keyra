"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { WheelEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { WORLD_REGION_PATHS } from "@/lib/deployments/worldRegionPaths";
import { WORLD_COUNTRY_PATHS, WORLD_MAP_VIEWBOX_WIRE } from "@/lib/deployments/worldWireframePaths.generated";
import {
  MAP_H,
  MAP_W,
  type ClusteredMapNode,
  type DeploymentMapFlatNode,
} from "@/lib/deployments/deployment-map-utils";
import { CountryNode } from "@/components/global-deployment/CountryNode";
import { DeploymentHoverCard } from "@/components/global-deployment/DeploymentHoverCard";
import type { UseDeploymentMapDataReturn } from "@/components/global-deployment/useDeploymentMapData";

const SCALE_X = MAP_W / 960;
const SCALE_Y = MAP_H / 480;
const CX = MAP_W / 2;
const CY = MAP_H / 2;

function networkSegments(nodes: DeploymentMapFlatNode[], max = 72): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  const out: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  const thresh = 110;
  outer: for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]!;
      const b = nodes[j]!;
      if (a.mapKey !== b.mapKey) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      if (dx * dx + dy * dy > thresh * thresh) continue;
      out.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      if (out.length >= max) break outer;
    }
  }
  return out;
}

function useCoarseMapLayout(): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const fn = () => setCoarse(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return coarse;
}

function bboxForNodes(nodes: DeploymentMapFlatNode[], pad: number) {
  if (!nodes.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x);
    maxY = Math.max(maxY, n.y);
  }
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;
  const bw = Math.max(72, maxX - minX);
  const bh = Math.max(56, maxY - minY);
  const bx = (minX + maxX) / 2;
  const by = (minY + maxY) / 2;
  return { bx, by, bw, bh };
}

export function GlobalDeploymentMap({
  mapData,
  selectedMapKey,
  onSelectMapKey,
  onCountryInspect,
  inspectCountryId,
}: {
  mapData: Pick<UseDeploymentMapDataReturn, "tree" | "clusteredNodes" | "dimmedIsoKeys" | "allNodes" | "zoom" | "setZoom">;
  selectedMapKey: string | null;
  onSelectMapKey: (mapKey: string | null) => void;
  onCountryInspect: (countryId: string | null) => void;
  inspectCountryId: string | null;
}) {
  const reduce = useReducedMotion();
  const coarseMap = useCoarseMapLayout();
  const { clusteredNodes, dimmedIsoKeys, allNodes, tree, zoom, setZoom } = mapData;
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ active: boolean; sx: number; sy: number; px: number; py: number } | null>(null);
  const [ptr, setPtr] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<ClusteredMapNode | null>(null);
  const [hoverVisible, setHoverVisible] = useState(false);
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  useLayoutEffect(() => {
    panRef.current = pan;
    zoomRef.current = zoom;
  }, [pan, zoom]);

  const visibleForLines = useMemo(() => {
    if (!selectedMapKey) return allNodes;
    return allNodes.filter((n) => n.mapKey === selectedMapKey);
  }, [allNodes, selectedMapKey]);

  const lines = useMemo(() => networkSegments(visibleForLines), [visibleForLines]);

  const regionKeys = useMemo(() => {
    const allowed = new Set(tree.mapKeys);
    return Object.keys(WORLD_REGION_PATHS).filter((k) => allowed.has(k));
  }, [tree.mapKeys]);

  const flySignature = useMemo(() => {
    if (!selectedMapKey) return "";
    const nodes = allNodes.filter((n) => n.mapKey === selectedMapKey);
    const b = bboxForNodes(nodes, 48);
    if (!b) return `${selectedMapKey}|empty`;
    return `${selectedMapKey}|${nodes.length}|${b.bx.toFixed(0)}|${b.by.toFixed(0)}|${b.bw.toFixed(0)}|${b.bh.toFixed(0)}`;
  }, [selectedMapKey, allNodes]);

  useEffect(() => {
    if (!selectedMapKey) return;
    const nodes = allNodes.filter((n) => n.mapKey === selectedMapKey);
    const box = bboxForNodes(nodes, 48);
    if (!box) return;

    const targetZ = Math.min(2.35, Math.max(0.78, Math.min((MAP_W / box.bw) * 0.82, (MAP_H / box.bh) * 0.82)));
    const targetPan = { x: -targetZ * (box.bx - CX), y: -targetZ * (box.by - CY) };

    if (reduce) {
      queueMicrotask(() => {
        setZoom(targetZ);
        setPan(targetPan);
      });
      return;
    }

    const z0 = zoomRef.current;
    const p0 = { ...panRef.current };
    const start = performance.now();
    const duration = 520;
    let raf = 0;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - (1 - t) ** 3;
      setZoom(z0 + (targetZ - z0) * e);
      setPan({ x: p0.x + (targetPan.x - p0.x) * e, y: p0.y + (targetPan.y - p0.y) * e });
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [flySignature, selectedMapKey, reduce, allNodes, setZoom]);

  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.06 : 0.06;
      setZoom((z) => Math.min(2.4, Math.max(0.72, Number((z + delta).toFixed(3)))));
    },
    [setZoom],
  );

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [setZoom]);

  const pathStrokeOpacity = useCallback(
    (iso2: string) => {
      if (!dimmedIsoKeys) return 0.2;
      return dimmedIsoKeys.has(iso2) ? 0.26 : 0.07;
    },
    [dimmedIsoKeys],
  );

  const sceneTransform = `translate(${pan.x},${pan.y}) translate(${CX},${CY}) scale(${zoom}) translate(${-CX},${-CY})`;

  return (
    <div className="space-y-3">
      <div
        className="relative overflow-hidden rounded-[var(--keyra-radius-sheet)] border border-keyra-border"
        style={{ background: "#020617" }}
        onPointerMove={(e) => {
          setPtr({ x: e.clientX, y: e.clientY });
          if (!drag.current?.active) return;
          setPan({
            x: drag.current.px + (e.clientX - drag.current.sx),
            y: drag.current.py + (e.clientY - drag.current.sy),
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerLeave={() => {
          drag.current = null;
          setHoverVisible(false);
        }}
        onWheel={onWheel}
      >
        <div className="pointer-events-none absolute left-3 top-3 z-20 max-w-[min(18rem,calc(100%-1.5rem))] rounded-lg border border-cyan-500/10 bg-slate-950/55 px-3 py-2 text-[11px] text-slate-300 backdrop-blur-md">
          {hovered ? (
            <span className="font-medium text-slate-100">
              {hovered.clusterSize > 1 ? `${hovered.clusterSize} deployments` : hovered.name}
            </span>
          ) : (
            <span className="text-slate-400">
              Hover a deployment node · scroll to zoom · drag to pan
              {coarseMap ? " · coastlines simplified on small screens" : ""}
            </span>
          )}
        </div>

        <div className="pointer-events-none absolute right-2 top-2 z-20 flex flex-col gap-1 sm:right-3 sm:top-3">
          <button
            type="button"
            aria-label="Zoom in"
            className="pointer-events-auto rounded-md border border-white/10 bg-slate-950/60 px-2 py-1 text-xs text-slate-200 hover:bg-white/5"
            onClick={() => setZoom((z) => Math.min(2.4, z + 0.12))}
          >
            +
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            className="pointer-events-auto rounded-md border border-white/10 bg-slate-950/60 px-2 py-1 text-xs text-slate-200 hover:bg-white/5"
            onClick={() => setZoom((z) => Math.max(0.72, z - 0.12))}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Reset map view"
            className="pointer-events-auto rounded-md border border-white/10 bg-slate-950/60 px-2 py-1 text-[10px] text-slate-300 hover:bg-white/5"
            onClick={resetView}
          >
            Reset
          </button>
        </div>

        <svg
          viewBox={WORLD_MAP_VIEWBOX_WIRE}
          className="block h-auto w-full touch-none select-none"
          role="img"
          aria-label="World deployment wireframe map"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            drag.current = { active: true, sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
            (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
          }}
        >
          <defs>
            <radialGradient id="keyraMapGlow" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="rgba(56,189,248,0.09)" />
              <stop offset="55%" stopColor="rgba(15,23,42,0)" />
            </radialGradient>
            <pattern id="keyraFineGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,163,184,0.06)" strokeWidth="0.4" />
            </pattern>
            <filter id="keyraNodeBloom" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width={MAP_W} height={MAP_H} fill="#020617" />
          <rect width={MAP_W} height={MAP_H} fill="url(#keyraMapGlow)" />
          <rect width={MAP_W} height={MAP_H} fill="url(#keyraFineGrid)" opacity={0.55} />

          {!reduce ? (
            <g opacity={0.35}>
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="12 8"
                dur="48s"
                repeatCount="indefinite"
              />
              <rect x={-40} y={-40} width={MAP_W + 80} height={MAP_H + 80} fill="url(#keyraFineGrid)" opacity={0.2} />
            </g>
          ) : null}

          <g transform={sceneTransform}>
            {lines.map((ln, i) => (
              <line
                key={i}
                x1={ln.x1}
                y1={ln.y1}
                x2={ln.x2}
                y2={ln.y2}
                stroke="rgba(56,189,248,0.05)"
                strokeWidth={0.6}
              />
            ))}

            {!coarseMap
              ? Object.entries(WORLD_COUNTRY_PATHS).map(([iso, d]) => (
                  <path
                    key={iso}
                    d={d}
                    fill="none"
                    stroke="rgba(148,163,184,0.35)"
                    strokeWidth={0.35}
                    opacity={pathStrokeOpacity(iso)}
                    className="transition-opacity duration-500"
                  />
                ))
              : null}

            <g transform={`scale(${SCALE_X} ${SCALE_Y})`}>
              {regionKeys.map((key) => {
                const meta = WORLD_REGION_PATHS[key];
                if (!meta) return null;
                const active = selectedMapKey === key;
                return (
                  <path
                    key={key}
                    d={meta.d}
                    tabIndex={0}
                    role="button"
                    aria-pressed={active}
                    aria-label={`${meta.label} region filter`}
                    className="cursor-pointer outline-none"
                    fill={active ? "rgba(56,189,248,0.07)" : "rgba(148,163,184,0.02)"}
                    stroke={active ? "rgba(56,189,248,0.22)" : "rgba(148,163,184,0.08)"}
                    strokeWidth={active ? 1.2 : 0.6}
                    onClick={() => onSelectMapKey(active ? null : key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectMapKey(active ? null : key);
                      }
                    }}
                  />
                );
              })}
            </g>

            {!reduce ? (
              <circle cx={140} cy={120} r={1.2} fill="rgba(56,189,248,0.35)">
                <animate attributeName="opacity" values="0.15;0.45;0.15" dur="6s" repeatCount="indefinite" />
              </circle>
            ) : null}
            {!reduce ? (
              <circle cx={820} cy={360} r={0.9} fill="rgba(129,140,248,0.35)">
                <animate attributeName="opacity" values="0.1;0.35;0.1" dur="7.5s" repeatCount="indefinite" />
              </circle>
            ) : null}

            {clusteredNodes.map((n) => {
              const dim = Boolean(dimmedIsoKeys && !dimmedIsoKeys.has(n.iso2));
              const selected = inspectCountryId === n.id;
              return (
                <CountryNode
                  key={n.clusterSize > 1 ? `c-${n.x}-${n.y}-${n.clusterSize}` : n.id}
                  node={n}
                  dimmed={dim}
                  selected={selected}
                  onHover={(node) => {
                    setHovered(node);
                    setHoverVisible(true);
                  }}
                  onLeave={() => {
                    setHovered(null);
                    setHoverVisible(false);
                  }}
                  onFocus={(node) => {
                    setHovered(node);
                    setHoverVisible(true);
                  }}
                  onBlur={() => {
                    setHovered(null);
                    setHoverVisible(false);
                  }}
                  onClick={(node) => {
                    if (node.clusterSize > 1) {
                      setZoom((z) => Math.min(2.2, z + 0.25));
                      setPan((p) => ({
                        x: p.x + (CX - node.x) * 0.12,
                        y: p.y + (CY - node.y) * 0.12,
                      }));
                      return;
                    }
                    onCountryInspect(node.country.id);
                  }}
                />
              );
            })}
          </g>
        </svg>

        <DeploymentHoverCard node={hovered} clientX={ptr.x} clientY={ptr.y} visible={hoverVisible && Boolean(hovered)} />
      </div>

      <p className="text-center text-[10px] text-slate-500">
        Equirectangular wireframe · positions from published registry coordinates (or reference centroids when unset).
      </p>
    </div>
  );
}
