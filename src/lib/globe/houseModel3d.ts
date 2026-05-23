import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

let houseGeometry: THREE.BufferGeometry | null = null;

export function getHouseGeometry() {
  if (houseGeometry) return houseGeometry;

  const body = new THREE.BoxGeometry(1, 0.52, 0.72);
  body.translate(0, 0.26, 0);

  const roof = new THREE.ConeGeometry(0.78, 0.48, 4);
  roof.rotateY(Math.PI / 4);
  roof.translate(0, 0.52 + 0.24, 0);

  const chimney = new THREE.BoxGeometry(0.2, 0.3, 0.2);
  chimney.translate(0.34, 0.52 + 0.38, 0);

  houseGeometry = mergeGeometries([body, roof, chimney], false);
  return houseGeometry;
}
