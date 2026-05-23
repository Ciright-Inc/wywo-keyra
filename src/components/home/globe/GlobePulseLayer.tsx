"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  getBatchDotFade,
  getHomeMarkerPhase,
  getLinkDrawProgress,
  getRoamingLinkDrawProgress,
  isLinkVisibleForPulses,
  isRoamingLinkVisible,
} from "@/lib/globe/globePulseBatch";
import {
  buildGreatCircleArc,
  easeOutCubic,
  getEmergenceState,
  getEmergePhase,
  getPulseTip,
  sampleDotsAlongArc,
  sliceArcByProgress,
} from "@/lib/globe/globePulsePositions";
import { getHouseGeometry } from "@/lib/globe/houseModel3d";
import { PROTOCOL_DOT_COLORS } from "@/lib/globe/protocolColors";
import type { GlobePulse, GlobePulseLink } from "@/lib/globe/types";

const GLOBE_RADIUS = 1;
const MAX_POINTS = 40;
const LINK_DOT_SPACING = 0.022;
const LINK_DOT_SIZE = 0.024;
const HOME_3D_SCALE_MULT = 5.5;

let linkDotTexture: THREE.CanvasTexture | null = null;

function getLinkDotTexture() {
  if (linkDotTexture) return linkDotTexture;
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.9)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  linkDotTexture = new THREE.CanvasTexture(canvas);
  return linkDotTexture;
}

const UP = new THREE.Vector3(0, 1, 0);
const coreGeometry = new THREE.SphereGeometry(1, 16, 16);
const ringGeometry = new THREE.SphereGeometry(1, 12, 8);

function ColoredEmergingCore({
  color,
  pulses,
  radius = GLOBE_RADIUS,
}: {
  color: string;
  pulses: GlobePulse[];
  radius?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const threeColor = useMemo(() => new THREE.Color(color), [color]);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: threeColor,
        emissive: threeColor,
        emissiveIntensity: 1.4,
        transparent: true,
        opacity: 0.95,
        metalness: 0.15,
        roughness: 0.25,
        depthWrite: false,
        toneMapped: false,
      }),
    [threeColor],
  );

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const now = performance.now();
    let count = 0;
    let peakGlow = 0;

    for (let index = 0; index < pulses.length && count < MAX_POINTS; index += 1) {
      const pulse = pulses[index]!;
      if (pulse.color !== color) continue;

      const fade = getBatchDotFade(pulse.startedAt, now);
      if (fade <= 0) continue;

      const state = getEmergenceState(
        pulse.lat,
        pulse.lon,
        radius,
        getEmergePhase(pulse.startedAt, now),
      );
      const coreScale = (0.008 + state.glow * 0.006) * (0.35 + state.grow * 0.65) * fade;
      peakGlow = Math.max(peakGlow, state.glow * fade);

      dummy.position.copy(state.tip);
      dummy.quaternion.setFromUnitVectors(UP, state.normal);
      dummy.scale.setScalar(coreScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(count, dummy.matrix);
      count += 1;
    }

    material.emissiveIntensity = 0.9 + peakGlow * 1.4;
    material.opacity = 0.55 + peakGlow * 0.4;
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[coreGeometry, material, MAX_POINTS]} frustumCulled={false} />
  );
}

function ColoredSurfaceRing({
  color,
  pulses,
  radius = GLOBE_RADIUS,
}: {
  color: string;
  pulses: GlobePulse[];
  radius?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const threeColor = useMemo(() => new THREE.Color(color), [color]);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: threeColor,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [threeColor],
  );

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const now = performance.now();
    let count = 0;
    let peakRing = 0;

    for (let index = 0; index < pulses.length && count < MAX_POINTS; index += 1) {
      const pulse = pulses[index]!;
      if (pulse.color !== color) continue;

      const fade = getBatchDotFade(pulse.startedAt, now);
      if (fade <= 0) continue;

      const state = getEmergenceState(
        pulse.lat,
        pulse.lon,
        radius,
        getEmergePhase(pulse.startedAt, now),
      );
      const ringExpand = state.grow;
      const ringScale = (0.01 + ringExpand * 0.045) * fade;
      peakRing = Math.max(peakRing, fade * state.glow);

      dummy.position.copy(state.surface);
      dummy.quaternion.setFromUnitVectors(UP, state.normal);
      dummy.scale.set(ringScale, 0.0035, ringScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(count, dummy.matrix);
      count += 1;
    }

    material.opacity = 0.08 + peakRing * 0.38;
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[ringGeometry, material, MAX_POINTS]} frustumCulled={false} />
  );
}

function HomeCountryHouse({ pulse, radius = GLOBE_RADIUS }: { pulse: GlobePulse; radius?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => getHouseGeometry(), []);
  const protocolColor = useMemo(() => new THREE.Color(pulse.color || "#00C853"), [pulse.color]);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: protocolColor,
        emissive: protocolColor,
        emissiveIntensity: 1.35,
        transparent: true,
        opacity: 0.95,
        metalness: 0.12,
        roughness: 0.28,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
      }),
    [protocolColor],
  );

  useFrame(() => {
    const group = groupRef.current;
    if (!group || typeof pulse.homeLat !== "number" || typeof pulse.homeLon !== "number") {
      return;
    }

    const now = performance.now();
    const fade = getBatchDotFade(pulse.startedAt, now);
    const drawProgress = getRoamingLinkDrawProgress(pulse.startedAt, now);
    const housePhase = getHomeMarkerPhase(drawProgress);

    if (fade <= 0 || housePhase <= 0) {
      group.visible = false;
      return;
    }

    group.visible = true;
    const state = getEmergenceState(pulse.homeLat, pulse.homeLon, radius, easeOutCubic(housePhase));
    const coreScale = (0.008 + state.glow * 0.006) * (0.35 + state.grow * 0.65) * fade;
    const scale = coreScale * HOME_3D_SCALE_MULT;

    group.position.copy(state.tip);
    group.quaternion.setFromUnitVectors(UP, state.normal);
    group.scale.setScalar(scale);
    material.opacity = Math.min(1, 0.65 + housePhase * fade * 0.35);
    material.emissiveIntensity = 0.95 + state.glow * housePhase * 0.65;
  });

  return (
    <group ref={groupRef} visible={false} renderOrder={6}>
      <mesh geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

function HomeCountryMarkers({ pulses, radius = GLOBE_RADIUS }: { pulses: GlobePulse[]; radius?: number }) {
  const roaming = useMemo(
    () =>
      pulses.filter(
        (pulse) =>
          pulse.awayFromHome &&
          typeof pulse.homeLat === "number" &&
          typeof pulse.homeLon === "number",
      ),
    [pulses],
  );

  if (!roaming.length) return null;

  return (
    <group renderOrder={6}>
      {roaming.map((pulse) => (
        <HomeCountryHouse key={`home-${pulse.id}`} pulse={pulse} radius={radius} />
      ))}
    </group>
  );
}

function EmergingDotsByColor({ pulses, radius = GLOBE_RADIUS }: { pulses: GlobePulse[]; radius?: number }) {
  return (
    <>
      {PROTOCOL_DOT_COLORS.map((color) => (
        <group key={color}>
          <ColoredSurfaceRing color={color} pulses={pulses} radius={radius} />
          <ColoredEmergingCore color={color} pulses={pulses} radius={radius} />
        </group>
      ))}
    </>
  );
}

function PulseLinkLine({
  link,
  pulseById,
  radius,
}: {
  link: GlobePulseLink;
  pulseById: Map<string, GlobePulse>;
  radius: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const fromTip = useMemo(() => new THREE.Vector3(), []);
  const toTip = useMemo(() => new THREE.Vector3(), []);
  const fullArc = useRef<THREE.Vector3[]>([]);
  const drawArc = useRef<THREE.Vector3[]>([]);
  const dotPositions = useRef<THREE.Vector3[]>([]);
  const lineColor = useMemo(() => new THREE.Color(link.color || "#00C853"), [link.color]);
  const dotTexture = useMemo(() => getLinkDotTexture(), []);
  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: dotTexture,
        color: lineColor,
        size: LINK_DOT_SIZE,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        alphaTest: 0.08,
        toneMapped: false,
      }),
    [dotTexture, lineColor],
  );

  useFrame(() => {
    const now = performance.now();
    const pointsMesh = pointsRef.current;
    if (!pointsMesh) return;

    const fromPulse = pulseById.get(link.fromId);
    if (!fromPulse) {
      pointsMesh.visible = false;
      return;
    }

    if (link.isRoamingHome) {
      if (
        !isRoamingLinkVisible(fromPulse.startedAt, now) ||
        typeof fromPulse.homeLat !== "number" ||
        typeof fromPulse.homeLon !== "number"
      ) {
        pointsMesh.visible = false;
        return;
      }

      pointsMesh.visible = true;
      material.color.set(fromPulse.color || link.color || "#00C853");
      material.opacity = 0.92 * getBatchDotFade(fromPulse.startedAt, now);
      getPulseTip(fromPulse.lat, fromPulse.lon, radius, getEmergePhase(fromPulse.startedAt, now), fromTip);
      getPulseTip(fromPulse.homeLat, fromPulse.homeLon, radius, 1, toTip);

      buildGreatCircleArc(fromTip, toTip, fullArc.current);
      const drawProgress = getRoamingLinkDrawProgress(fromPulse.startedAt, now);
      const arc =
        drawProgress >= 1
          ? fullArc.current
          : sliceArcByProgress(fullArc.current, easeOutCubic(drawProgress), drawArc.current);

      sampleDotsAlongArc(arc, LINK_DOT_SPACING, dotPositions.current);
      geometry.setFromPoints(dotPositions.current);
      geometry.attributes.position!.needsUpdate = true;
      return;
    }

    const toPulse = link.toId ? pulseById.get(link.toId) : undefined;
    if (!toPulse || !isLinkVisibleForPulses(fromPulse.startedAt, toPulse.startedAt, now)) {
      pointsMesh.visible = false;
      return;
    }

    pointsMesh.visible = true;
    const endpointFade = Math.min(
      getBatchDotFade(fromPulse.startedAt, now),
      getBatchDotFade(toPulse.startedAt, now),
    );
    material.opacity = 0.92 * endpointFade;
    getPulseTip(fromPulse.lat, fromPulse.lon, radius, getEmergePhase(fromPulse.startedAt, now), fromTip);
    getPulseTip(toPulse.lat, toPulse.lon, radius, getEmergePhase(toPulse.startedAt, now), toTip);

    buildGreatCircleArc(fromTip, toTip, fullArc.current);
    const drawProgress = getLinkDrawProgress(fromPulse.startedAt, toPulse.startedAt, now);
    const arc =
      drawProgress >= 1
        ? fullArc.current
        : sliceArcByProgress(fullArc.current, easeOutCubic(drawProgress), drawArc.current);

    sampleDotsAlongArc(arc, LINK_DOT_SPACING, dotPositions.current);
    geometry.setFromPoints(dotPositions.current);
    geometry.attributes.position!.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} renderOrder={2} />
  );
}

function PulseConnectionLines({
  links,
  pulses,
  radius,
}: {
  links: GlobePulseLink[];
  pulses: GlobePulse[];
  radius: number;
}) {
  if (!links.length) return null;

  const pulseById = useMemo(() => new Map(pulses.map((pulse) => [pulse.id, pulse])), [pulses]);

  return (
    <group renderOrder={2}>
      {links.map((link) => (
        <PulseLinkLine key={link.id} link={link} pulseById={pulseById} radius={radius} />
      ))}
    </group>
  );
}

export function GlobePulseLayer({
  pulses,
  links,
  radius = GLOBE_RADIUS,
}: {
  pulses: GlobePulse[];
  links: GlobePulseLink[];
  radius?: number;
}) {
  return (
    <group>
      <PulseConnectionLines links={links} pulses={pulses} radius={radius} />
      <HomeCountryMarkers pulses={pulses} radius={radius} />
      <EmergingDotsByColor pulses={pulses} radius={radius} />
    </group>
  );
}
