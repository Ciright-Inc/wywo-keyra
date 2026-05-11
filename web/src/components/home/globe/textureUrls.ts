/** three.js example planet textures (same imagery the official examples use). */
const REV = "r184";

export const EARTH_TEXTURE_BASE = `https://raw.githubusercontent.com/mrdoob/three.js/${REV}/examples/textures/planets`;

export const EARTH_TEXTURE_URLS = {
  day: `${EARTH_TEXTURE_BASE}/earth_atmos_2048.jpg`,
  clouds: `${EARTH_TEXTURE_BASE}/earth_clouds_1024.png`,
  normal: `${EARTH_TEXTURE_BASE}/earth_normal_2048.jpg`,
  specular: `${EARTH_TEXTURE_BASE}/earth_specular_2048.jpg`,
} as const;
