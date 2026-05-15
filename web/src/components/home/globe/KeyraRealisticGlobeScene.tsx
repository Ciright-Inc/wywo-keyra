"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { createFallbackMap } from "./createFallbackMap";
import { EARTH_TEXTURE_URLS } from "./textureUrls";
import { latLonToVec3 } from "./latLonToVec3";
import { loadTextureSafe } from "./loadTextureSafe";

const EARTH_RADIUS = 1;
const SEGMENTS = 96;
/** rad/s — slow idle spin (similar to simsecure cinematic globe). */
const SPIN = 0.034;
const CLOUD_SPIN_EXTRA = 0.4;
const TEXTURE_LOAD_MS = 12_000;

function raceTextureLoad(p: Promise<THREE.Texture | null>): Promise<THREE.Texture | null> {
  return Promise.race([
    p,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), TEXTURE_LOAD_MS)),
  ]);
}

const MARKER_LAT_LON: [number, number][] = [
  [-26.2041, 28.0473], // Johannesburg
  [-22.5597, 17.0832], // Windhoek
  [40.7128, -74.006], // New York
  [51.5074, -0.1278], // London
  [48.8566, 2.3522], // Paris
  [52.52, 13.405], // Berlin
  [30.0444, 31.2357], // Cairo
  [6.5244, 3.3792], // Lagos
  [-1.2921, 36.8219], // Nairobi
  [25.2048, 55.2708], // Dubai
  [28.6139, 77.209], // Delhi
  [35.6762, 139.6503], // Tokyo
  [-33.8688, 151.2093], // Sydney
  [-23.5505, -46.6333], // São Paulo
  [19.4326, -99.1332], // Mexico City
  [55.7558, 37.6173], // Moscow
  [39.9042, 116.4074], // Beijing
  [1.3521, 103.8198], // Singapore
  [59.3293, 18.0686], // Stockholm
];

type LoadedMaps = {
  day: THREE.Texture;
  clouds: THREE.Texture | null;
  normal: THREE.Texture | null;
  specular: THREE.Texture | null;
};

function PhotorealEarth() {
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

  const markerNodes = useMemo(
    () =>
      MARKER_LAT_LON.map(([lat, lon], i) => {
        const p = latLonToVec3(lat, lon, EARTH_RADIUS * 1.012);
        return (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.01, 12, 12]} />
            <meshStandardMaterial
              color="#031208"
              emissive="#22ff88"
              emissiveIntensity={2.4}
              roughness={0.35}
              metalness={0}
              transparent
              opacity={0.5}
            />
          </mesh>
        );
      }),
    [],
  );

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

      {markerNodes}
    </group>
  );
}

function SceneLights() {
  return (
    <>
      {/* Strong fill: terminator is from fixed scene lights + spin, not live sun angle per region. */}
      <ambientLight intensity={0.48} color="#f0f0f0" />
      <hemisphereLight args={["#ffffff", "#d4d4d4", 0.5]} />
      <directionalLight
        castShadow={false}
        position={[4.8, 0.6, 2.2]}
        intensity={1.45}
        color="#ffffff"
      />
      <directionalLight position={[-2.8, 0.35, -2.2]} intensity={0.4} color="#a3a3a3" />
    </>
  );
}

export default function KeyraRealisticGlobeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.08, 2.42], fov: 42, near: 0.08, far: 32 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ width: "100%", height: "100%", display: "block" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
    >
      <SceneLights />
      <PhotorealEarth />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        rotateSpeed={0.65}
        dampingFactor={0.075}
        enableDamping
        minPolarAngle={0.72}
        maxPolarAngle={Math.PI - 0.72}
      />
    </Canvas>
  );
}
