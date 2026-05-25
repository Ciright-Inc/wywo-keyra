"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GlobePulseLayer } from "@/components/home/globe/GlobePulseLayer";
import { createFallbackMap } from "./createFallbackMap";
import { EARTH_TEXTURE_URLS } from "./textureUrls";
import { loadTextureSafe } from "./loadTextureSafe";
import type { GlobePulse, GlobePulseLink } from "@/lib/globe/types";

const EARTH_RADIUS = 1;
const SEGMENTS = 96;
/** rad/s — slow idle spin (simsecure cinematic globe). */
const SPIN = 0.034;
const CLOUD_SPIN_EXTRA = 0.4;
const TEXTURE_LOAD_MS = 12_000;

function raceTextureLoad(p: Promise<THREE.Texture | null>): Promise<THREE.Texture | null> {
  return Promise.race([
    p,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), TEXTURE_LOAD_MS)),
  ]);
}

type LoadedMaps = {
  day: THREE.Texture;
  clouds: THREE.Texture | null;
  normal: THREE.Texture | null;
  specular: THREE.Texture | null;
};

type PhotorealEarthProps = {
  activePulses: GlobePulse[];
  activeLinks: GlobePulseLink[];
};

function PhotorealEarth({ activePulses, activeLinks }: PhotorealEarthProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const mapsRef = useRef<LoadedMaps | null>(null);
  const [maps, setMaps] = useState<LoadedMaps | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [dayRaw, clouds, normal, specular] = await Promise.all([
        raceTextureLoad(loadTextureSafe(EARTH_TEXTURE_URLS.day)),
        raceTextureLoad(loadTextureSafe(EARTH_TEXTURE_URLS.clouds)),
        raceTextureLoad(loadTextureSafe(EARTH_TEXTURE_URLS.normal, { sRGB: false })),
        raceTextureLoad(loadTextureSafe(EARTH_TEXTURE_URLS.specular, { sRGB: false })),
      ]);

      if (cancelled) {
        dayRaw?.dispose();
        clouds?.dispose();
        normal?.dispose();
        specular?.dispose();
        return;
      }

      const day = dayRaw ?? createFallbackMap();
      if (cancelled) {
        day.dispose();
        clouds?.dispose();
        normal?.dispose();
        specular?.dispose();
        return;
      }

      const next: LoadedMaps = { day, clouds, normal, specular };
      mapsRef.current = next;
      setMaps(next);
    }

    void load();

    return () => {
      cancelled = true;
      const m = mapsRef.current;
      if (m) {
        m.day.dispose();
        m.clouds?.dispose();
        m.normal?.dispose();
        m.specular?.dispose();
        mapsRef.current = null;
      }
    };
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y -= SPIN * delta;
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y -= SPIN * CLOUD_SPIN_EXTRA * delta;
    }
  });

  const specularColor = useMemo(() => new THREE.Color(0x888888), []);

  if (!maps) {
    return (
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 0.98, 48, 48]} />
        <meshBasicMaterial color="#e8e8e8" />
      </mesh>
    );
  }

  const { day, clouds, normal, specular } = maps;

  return (
    <group ref={groupRef} rotation={[0.11, -1.22, 0]}>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, SEGMENTS, SEGMENTS]} />
        <meshPhongMaterial
          map={day}
          normalMap={normal ?? undefined}
          specularMap={specular ?? undefined}
          specular={specularColor}
          shininess={12}
          emissive="#1a1a1a"
          emissiveIntensity={0.22}
        />
      </mesh>

      {clouds && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[EARTH_RADIUS * 1.01, 72, 72]} />
          <meshPhongMaterial
            map={clouds}
            transparent
            opacity={0.48}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      <GlobePulseLayer pulses={activePulses} links={activeLinks} radius={EARTH_RADIUS} />
    </group>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 3, 5]} intensity={1.35} />
      <pointLight position={[0, 0, 2.5]} intensity={0.6} color="#b8d4ff" />
    </>
  );
}

export type KeyraRealisticGlobeSceneProps = {
  opaque?: boolean;
  activePulses?: GlobePulse[];
  activeLinks?: GlobePulseLink[];
};

export default function KeyraRealisticGlobeScene({
  opaque = false,
  activePulses = [],
  activeLinks = [],
}: KeyraRealisticGlobeSceneProps) {
  const [controlsEnabled, setControlsEnabled] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setControlsEnabled(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.08, 2.42], fov: 42, near: 0.08, far: 32 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: !opaque,
        powerPreference: "high-performance",
      }}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background: opaque ? "#ffffff" : undefined,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0xffffff, opaque ? 1 : 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
    >
      <SceneLights />
      <PhotorealEarth activePulses={activePulses} activeLinks={activeLinks} />
      {controlsEnabled && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          rotateSpeed={0.4}
          dampingFactor={0.08}
          enableDamping
          minPolarAngle={0.72}
          maxPolarAngle={Math.PI - 0.72}
        />
      )}
    </Canvas>
  );
}
