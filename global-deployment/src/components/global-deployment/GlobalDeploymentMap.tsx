"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { WheelEvent } from "react";
import { useDeferredReducedMotion } from "@/lib/useDeferredReducedMotion";
import { WORLD_REGION_PATHS } from "@/lib/deployments/worldRegionPaths";
import { WORLD_COUNTRY_PATHS, WORLD_MAP_VIEWBOX_WIRE } from "@/lib/deployments/worldWireframePaths.generated";
import {
  MAP_H,
  MAP_SURFACE,
  MAP_TEXTURE_URL,
  MAP_W,
  deploymentNetworkArcs,
  mapCountryDimOverlay,
  type ClusteredMapNode,
  type DeploymentMapFlatNode,
} from "@/lib/deployments/deployment-map-utils";
import { CountryNode } from "@/components/global-deployment/CountryNode";
import { DeploymentHoverCard } from "@/components/global-deployment/DeploymentHoverCard";
import { KeyraTrustLoader } from "@/components/ui/KeyraTrustLoader";
import type { UseDeploymentMapDataReturn } from "@/components/global-deployment/useDeploymentMapData";

const SCALE_X = MAP_W / 960;
const SCALE_Y = MAP_H / 480;
const CX = MAP_W / 2;
const CY = MAP_H / 2;
/** Tile the equirectangular world horizontally so pan/zoom never shows empty sides. */
const WORLD_X_OFFSETS = [-MAP_W, 0, MAP_W] as const;

function wrapPanX(x: number, zoom: number): number {
  const period = MAP_W * zoom;
  if (period <= 0) return x;
  let wrapped = x % period;
  if (wrapped > period / 2) wrapped -= period;
  if (wrapped < -period / 2) wrapped += period;
  return wrapped;
}

function worldLayerTransform(offsetX: number): string {
  return offsetX === 0 ? "" : `translate(${offsetX} 0)`;
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
  onCountryInspect,
  inspectCountryId,
  embedded = false,
}: {
  mapData: Pick<UseDeploymentMapDataReturn, "tree" | "clusteredNodes" | "dimmedIsoKeys" | "allNodes" | "zoom" | "setZoom">;
  selectedMapKey: string | null;
  onSelectMapKey?: (mapKey: string | null) => void;
  onCountryInspect: (countryId: string | null) => void;
  inspectCountryId: string | null;
  embedded?: boolean;
}) {
  const reduce = useDeferredReducedMotion();
  const { clusteredNodes, dimmedIsoKeys, allNodes, tree, zoom, setZoom } = mapData;
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ active: boolean; sx: number; sy: number; px: number; py: number } | null>(null);
  const [ptr, setPtr] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<ClusteredMapNode | null>(null);
  const [hoverVisible, setHoverVisible] = useState(false);
  const [mapTextureReady, setMapTextureReady] = useState(false);
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  useLayoutEffect(() => {
    panRef.current = pan;
    zoomRef.current = zoom;
  }, [pan, zoom]);

  const regionKeys = useMemo(() => {
    const allowed = new Set(tree.mapKeys);
    return Object.keys(WORLD_REGION_PATHS).filter((k) => allowed.has(k));
  }, [tree.mapKeys]);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setMapTextureReady(true);
    };
    img.onerror = () => {
      if (!cancelled) setMapTextureReady(true);
    };
    img.src = MAP_TEXTURE_URL;
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleForArcs = useMemo(() => {
    if (!selectedMapKey) return allNodes;
    return allNodes.filter((n) => n.mapKey === selectedMapKey);
  }, [allNodes, selectedMapKey]);

  const arcs = useMemo(() => deploymentNetworkArcs(visibleForArcs), [visibleForArcs]);

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
      const nextPan = { x: p0.x + (targetPan.x - p0.x) * e, y: p0.y + (targetPan.y - p0.y) * e };
      setPan(t < 1 ? nextPan : { ...nextPan, x: wrapPanX(nextPan.x, targetZ) });
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

  const sceneTransform = `translate(${pan.x},${pan.y}) translate(${CX},${CY}) scale(${zoom}) translate(${-CX},${-CY})`;

  return (
    <div className={embedded ? "space-y-2" : "space-y-3"}>
      <div
        className={
          embedded
            ? "relative overflow-hidden rounded-[var(--keyra-radius-lg)]"
            : "relative overflow-hidden rounded-[var(--keyra-radius-sheet)] border border-keyra-border"
        }
        style={{ background: MAP_SURFACE.oceanDeep }}
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
          setPan((p) => ({ ...p, x: wrapPanX(p.x, zoomRef.current) }));
        }}
        onPointerLeave={() => {
          drag.current = null;
          setHoverVisible(false);
        }}
        onWheel={onWheel}
      >
        {!mapTextureReady ? (
          <KeyraTrustLoader
            variant="overlay"
            label="Loading map"
            className="bg-[rgba(6,14,24,0.82)] backdrop-blur-[2px]"
          />
        ) : null}

        <div className="pointer-events-none absolute left-3 top-3 z-20 max-w-[min(18rem,calc(100%-1.5rem))] rounded-lg border border-white/15 bg-[rgba(8,18,32,0.78)] px-3 py-2 text-[11px] text-sky-50 backdrop-blur-md">
          {hovered ? (
            <span className="font-medium text-white">
              {hovered.clusterSize > 1 ? `${hovered.clusterSize} markets` : hovered.name}
              <span className="font-normal text-sky-100/75"> · {hovered.regionName}</span>
            </span>
          ) : (
            <span className="text-sky-100/85">Hover a deployment node · scroll to zoom · drag to pan</span>
          )}
        </div>

        <div className="pointer-events-none absolute right-2 top-2 z-20 flex flex-col gap-1 sm:right-3 sm:top-3">
          <button
            type="button"
            aria-label="Zoom in"
            className="pointer-events-auto rounded-md border border-white/15 bg-[rgba(8,18,32,0.78)] px-2 py-1 text-xs text-sky-50 hover:bg-[rgba(18,38,58,0.92)]"
            onClick={() => setZoom((z) => Math.min(2.4, z + 0.12))}
          >
            +
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            className="pointer-events-auto rounded-md border border-white/15 bg-[rgba(8,18,32,0.78)] px-2 py-1 text-xs text-sky-50 hover:bg-[rgba(18,38,58,0.92)]"
            onClick={() => setZoom((z) => Math.max(0.72, z - 0.12))}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Reset map view"
            className="pointer-events-auto rounded-md border border-white/15 bg-[rgba(8,18,32,0.78)] px-2 py-1 text-[10px] text-sky-100 hover:bg-[rgba(18,38,58,0.92)]"
            onClick={resetView}
          >
            Reset
          </button>
        </div>

        <svg
          viewBox={WORLD_MAP_VIEWBOX_WIRE}
          className="block h-auto w-full touch-none select-none"
          role="img"
          aria-label="World deployment map"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            drag.current = { active: true, sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
            (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
          }}
        >
          <defs>
            <filter id="keyraNodeBloom" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="keyraArcGlow" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="keyraMapAtmosphere" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(120,180,255,0.12)" />
              <stop offset="18%" stopColor="rgba(0,0,0,0)" />
              <stop offset="82%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.28)" />
            </linearGradient>
            <radialGradient id="keyraMapVignette" cx="50%" cy="48%" r="68%">
              <stop offset="55%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.38)" />
            </radialGradient>
          </defs>

          <g transform={sceneTransform}>
            {WORLD_X_OFFSETS.map((offsetX) => (
              <g key={`world-${offsetX}`} transform={worldLayerTransform(offsetX)}>
                <image href={MAP_TEXTURE_URL} x={0} y={0} width={MAP_W} height={MAP_H} preserveAspectRatio="xMidYMid slice" />

                {Object.entries(WORLD_COUNTRY_PATHS).map(([iso, d]) => {
                  const overlay = mapCountryDimOverlay(iso, dimmedIsoKeys);
                  if (!overlay) return null;
                  return (
                    <path key={`dim-${offsetX}-${iso}`} d={d} fill={overlay} stroke="none" className="transition-opacity duration-500" />
                  );
                })}

                {offsetX === 0 ? (
                  <>
                    <rect width={MAP_W} height={MAP_H} fill="url(#keyraMapAtmosphere)" pointerEvents="none" />
                    <rect width={MAP_W} height={MAP_H} fill="url(#keyraMapVignette)" pointerEvents="none" />
                  </>
                ) : null}
              </g>
            ))}

            <g transform={`scale(${SCALE_X} ${SCALE_Y})`} className="pointer-events-none">
              {regionKeys.map((key) => {
                const meta = WORLD_REGION_PATHS[key];
                if (!meta || selectedMapKey !== key) return null;
                return (
                  <path
                    key={key}
                    d={meta.d}
                    aria-hidden
                    fill={MAP_SURFACE.regionFill}
                    stroke={MAP_SURFACE.regionStroke}
                    strokeWidth={1.2}
                    strokeDasharray="5 4"
                  />
                );
              })}
            </g>

            {!reduce
              ? arcs.map((arc) => (
                  <g key={arc.key}>
                    <path
                      d={arc.d}
                      fill="none"
                      stroke={MAP_SURFACE.arcGlow}
                      strokeWidth={2.4}
                      opacity={0.55}
                      filter="url(#keyraArcGlow)"
                    />
                    <path d={arc.d} fill="none" stroke={MAP_SURFACE.arc} strokeWidth={0.9} opacity={0.82} />
                  </g>
                ))
              : null}

            {WORLD_X_OFFSETS.map((offsetX) =>
              clusteredNodes.map((n) => {
                const dim = Boolean(dimmedIsoKeys && !dimmedIsoKeys.has(n.iso2));
                const selected = inspectCountryId === n.id;
                return (
                  <CountryNode
                    key={`${offsetX}-${n.clusterSize > 1 ? `c-${n.x}-${n.y}-${n.clusterSize}` : n.id}`}
                    node={n}
                    offsetX={offsetX}
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
                          x: wrapPanX(p.x + (CX - node.x) * 0.12, zoomRef.current),
                          y: p.y + (CY - node.y) * 0.12,
                        }));
                        return;
                      }
                      onCountryInspect(node.country.id);
                    }}
                  />
                );
              }),
            )}
          </g>
        </svg>

        <DeploymentHoverCard node={hovered} clientX={ptr.x} clientY={ptr.y} visible={hoverVisible && Boolean(hovered)} />
      </div>

      {!embedded ? (
        <p className="text-center text-[10px] text-zinc-500">
          Satellite imagery basemap · deployment positions from published registry coordinates.
        </p>
      ) : null}
    </div>
  );
}
