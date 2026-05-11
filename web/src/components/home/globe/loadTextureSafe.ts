"use client";

import * as THREE from "three";

export function loadTextureSafe(
  url: string,
  options: { sRGB?: boolean; anisotropy?: number } = {},
): Promise<THREE.Texture | null> {
  const { sRGB = true, anisotropy = 16 } = options;

  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        if (!tex) {
          resolve(null);
          return;
        }
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        if (sRGB) tex.colorSpace = THREE.SRGBColorSpace;
        if (typeof anisotropy === "number") tex.anisotropy = Math.min(anisotropy, 16);
        tex.needsUpdate = true;
        resolve(tex);
      },
      undefined,
      () => resolve(null),
    );
  });
}
