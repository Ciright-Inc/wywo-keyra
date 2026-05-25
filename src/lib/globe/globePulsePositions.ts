import * as THREE from "three";
import { latLonToVec3 } from "@/components/home/globe/latLonToVec3";
import { isLandAt } from "@/lib/globe/landDetection";

export function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function getEmergePhase(dotStartedAt: number, now = performance.now()) {
  return Math.min((now - dotStartedAt) / 500, 1);
}

export function vec3ToLatLon(vec: THREE.Vector3) {
  const n = vec.clone().normalize();
  const lat = 90 - (Math.acos(THREE.MathUtils.clamp(n.y, -1, 1)) * 180) / Math.PI;
  const lon = (Math.atan2(n.z, -n.x) * 180) / Math.PI - 180;
  return { lat, lon };
}

export function randomHomeFromSignIn(
  signInLat: number,
  signInLon: number,
  landMask: ImageData | null = null,
  { minDeg = 32, maxDeg = 148 } = {},
) {
  const origin = latLonToVec3(signInLat, signInLon, 1).normalize();
  const axis = new THREE.Vector3();
  const perp = new THREE.Vector3();
  const homeVec = new THREE.Vector3();

  for (let attempt = 0; attempt < 56; attempt += 1) {
    axis.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    if (Math.abs(axis.dot(origin)) > 0.9) {
      perp.crossVectors(origin, new THREE.Vector3(0, 1, 0));
      if (perp.lengthSq() < 1e-4) perp.set(1, 0, 0);
      axis.crossVectors(origin, perp.normalize()).normalize();
    }

    const angleRad = ((minDeg + Math.random() * (maxDeg - minDeg)) * Math.PI) / 180;
    const q = new THREE.Quaternion().setFromAxisAngle(axis, angleRad);
    homeVec.copy(origin).applyQuaternion(q).normalize();

    const separationDeg =
      (Math.acos(THREE.MathUtils.clamp(origin.dot(homeVec), -1, 1)) * 180) / Math.PI;
    if (separationDeg < minDeg * 0.9) continue;

    const { lat, lon } = vec3ToLatLon(homeVec);
    if (isLandAt(landMask, lat, lon)) {
      return { lat, lon, distanceDeg: separationDeg };
    }
  }

  perp.crossVectors(origin, new THREE.Vector3(0, 1, 0));
  if (perp.lengthSq() < 1e-4) perp.set(1, 0, 0);
  axis.crossVectors(origin, perp.normalize()).normalize();
  const midRad = (((minDeg + maxDeg) / 2) * Math.PI) / 180;
  const q = new THREE.Quaternion().setFromAxisAngle(axis, midRad);
  const fallback = vec3ToLatLon(origin.clone().applyQuaternion(q).normalize());
  return { ...fallback, distanceDeg: (minDeg + maxDeg) / 2 };
}

const ARC_SEGMENT_COUNT = 48;

export function getPulseTip(
  lat: number,
  lon: number,
  radius: number,
  emergePhase: number,
  target = new THREE.Vector3(),
) {
  const surface = latLonToVec3(lat, lon, radius * 1.001);
  const normal = surface.clone().normalize();
  const eased = easeOutCubic(Math.min(emergePhase, 1));
  return target.copy(surface).addScaledVector(normal, eased * 0.038);
}

export function buildGreatCircleArc(fromTip: THREE.Vector3, toTip: THREE.Vector3, out: THREE.Vector3[] = []) {
  out.length = 0;
  const startN = fromTip.clone().normalize();
  const endN = toTip.clone().normalize();
  const r0 = fromTip.length();
  const r1 = toTip.length();
  const dot = Math.min(1, Math.max(-1, startN.dot(endN)));
  const omega = Math.acos(dot);

  if (omega < 1e-5) {
    out.push(fromTip.clone(), toTip.clone());
    return out;
  }

  const sinOmega = Math.sin(omega);
  for (let i = 0; i <= ARC_SEGMENT_COUNT; i += 1) {
    const t = i / ARC_SEGMENT_COUNT;
    const w0 = Math.sin((1 - t) * omega) / sinOmega;
    const w1 = Math.sin(t * omega) / sinOmega;
    const radial = r0 + (r1 - r0) * t;
    out.push(
      new THREE.Vector3(
        (startN.x * w0 + endN.x * w1) * radial,
        (startN.y * w0 + endN.y * w1) * radial,
        (startN.z * w0 + endN.z * w1) * radial,
      ),
    );
  }
  return out;
}

export function sampleDotsAlongArc(arc: THREE.Vector3[], spacing: number, out: THREE.Vector3[] = []) {
  out.length = 0;
  if (!arc.length) return out;
  if (arc.length === 1) {
    out.push(arc[0]!.clone());
    return out;
  }

  let distAlong = 0;
  let nextDotAt = 0;
  out.push(arc[0]!.clone());

  for (let i = 1; i < arc.length; i += 1) {
    const a = arc[i - 1]!;
    const b = arc[i]!;
    const segLen = a.distanceTo(b);
    if (segLen < 1e-6) continue;

    while (distAlong + segLen >= nextDotAt + spacing) {
      nextDotAt += spacing;
      const t = (nextDotAt - distAlong) / segLen;
      out.push(a.clone().lerp(b, t));
    }
    distAlong += segLen;
  }

  const end = arc[arc.length - 1]!;
  if (out[out.length - 1]!.distanceTo(end) > spacing * 0.35) {
    out.push(end.clone());
  }
  return out;
}

export function sliceArcByProgress(arc: THREE.Vector3[], progress: number, out: THREE.Vector3[] = []) {
  out.length = 0;
  if (!arc.length) return out;
  if (progress >= 1) {
    for (let i = 0; i < arc.length; i += 1) out.push(arc[i]!);
    return out;
  }
  if (progress <= 0) {
    out.push(arc[0]!.clone(), arc[0]!.clone());
    return out;
  }

  let total = 0;
  for (let i = 1; i < arc.length; i += 1) {
    total += arc[i]!.distanceTo(arc[i - 1]!);
  }
  const target = total * progress;
  let walked = 0;
  out.push(arc[0]!.clone());

  for (let i = 1; i < arc.length; i += 1) {
    const seg = arc[i]!.distanceTo(arc[i - 1]!);
    if (walked + seg >= target) {
      const localT = (target - walked) / seg;
      out.push(arc[i - 1]!.clone().lerp(arc[i]!, localT));
      return out;
    }
    walked += seg;
    out.push(arc[i]!.clone());
  }
  return out;
}

export function getEmergenceState(lat: number, lon: number, radius: number, emergePhase: number) {
  const surface = latLonToVec3(lat, lon, radius * 1.001);
  const normal = surface.clone().normalize();
  const eased = easeOutCubic(Math.min(emergePhase, 1));
  const rise = eased * 0.038;

  return {
    surface,
    normal,
    tip: surface.clone().addScaledVector(normal, rise),
    grow: eased,
    glow: 0.55 + eased * 0.45,
  };
}
