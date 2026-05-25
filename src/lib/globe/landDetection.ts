import { EARTH_TEXTURE_URLS } from "@/components/home/globe/textureUrls";

const LAND_BOUNDS = [
  { latMin: 24, latMax: 72, lonMin: -170, lonMax: -52 },
  { latMin: -56, latMax: 15, lonMin: -82, lonMax: -34 },
  { latMin: 35, latMax: 72, lonMin: -25, lonMax: 45 },
  { latMin: -35, latMax: 37, lonMin: -20, lonMax: 52 },
  { latMin: 12, latMax: 42, lonMin: 42, lonMax: 65 },
  { latMin: 5, latMax: 55, lonMin: 65, lonMax: 145 },
  { latMin: -11, latMax: 25, lonMin: 95, lonMax: 145 },
  { latMin: -48, latMax: -10, lonMin: 112, lonMax: 154 },
  { latMin: 50, latMax: 72, lonMin: 45, lonMax: 145 },
  { latMin: 60, latMax: 72, lonMin: -25, lonMax: 60 },
];

let landMaskPromise: Promise<ImageData | null> | null = null;

export function preloadLandMask(): Promise<ImageData | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!landMaskPromise) {
    landMaskPromise = new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 1024;
          canvas.height = 512;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = EARTH_TEXTURE_URLS.day;
    });
  }
  return landMaskPromise;
}

function isLandBounds(lat: number, lon: number): boolean {
  return LAND_BOUNDS.some(
    (region) =>
      lat >= region.latMin &&
      lat <= region.latMax &&
      lon >= region.lonMin &&
      lon <= region.lonMax,
  );
}

export function isLandAt(landMask: ImageData | null, lat: number, lon: number): boolean {
  if (!landMask?.data) return isLandBounds(lat, lon);

  const width = landMask.width;
  const height = landMask.height;
  const x = Math.floor(((lon + 180) / 360) * (width - 1));
  const y = Math.floor(((90 - lat) / 180) * (height - 1));
  const index = (y * width + x) * 4;
  const r = landMask.data[index]!;
  const g = landMask.data[index + 1]!;
  const b = landMask.data[index + 2]!;

  return !(b > r + 28 && b > g + 18);
}

export function randomLandCoordinates(landMask: ImageData | null = null, maxAttempts = 64) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const u = Math.random();
    const v = Math.random();
    const lat = (Math.asin(2 * v - 1) * 180) / Math.PI;
    const lon = u * 360 - 180;
    if (isLandAt(landMask, lat, lon)) {
      return { lat, lon };
    }
  }

  const region = LAND_BOUNDS[Math.floor(Math.random() * LAND_BOUNDS.length)]!;
  return {
    lat: region.latMin + Math.random() * (region.latMax - region.latMin),
    lon: region.lonMin + Math.random() * (region.lonMax - region.lonMin),
  };
}
