"use client";

import * as THREE from "three";

/** Procedural map when remote Earth textures fail to load. */
export function createFallbackMap(): THREE.Texture {
  if (typeof document === "undefined") {
    const data = new Uint8Array([45, 90, 135, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const grd = ctx.createLinearGradient(0, 0, 0, size / 2);
  grd.addColorStop(0, "#1a2f45");
  grd.addColorStop(0.35, "#2d5a87");
  grd.addColorStop(0.48, "#3d7a4a");
  grd.addColorStop(0.52, "#2d6b5e");
  grd.addColorStop(0.65, "#2d5a87");
  grd.addColorStop(1, "#1a2f45");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size / 2);

  const overlay = ctx.createLinearGradient(0, 0, size, 0);
  overlay.addColorStop(0, "rgba(0,0,0,0)");
  overlay.addColorStop(0.3, "rgba(20,40,30,0.06)");
  overlay.addColorStop(0.5, "rgba(0,0,0,0)");
  overlay.addColorStop(0.7, "rgba(20,30,50,0.05)");
  overlay.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, size, size / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
