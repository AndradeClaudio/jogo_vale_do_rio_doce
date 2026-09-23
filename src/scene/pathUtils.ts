import * as THREE from 'three';
import { MAX_WAYPOINT_INDEX } from '../data/riverLayout';

// Traçado sinuoso do leito do Rio Doce em Minas Gerais
const CONTROL_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(-18, 0, 14), // 0: Mariana
  new THREE.Vector3(-14, 0, 11), // 1: Lixo (Garrafa)
  new THREE.Vector3(-9, 0, 12.5), // 2: Povoado Lavras (Agricultor)
  new THREE.Vector3(-3, 0, 9.5), // 3: Lixo (Pneu)
  new THREE.Vector3(3, 0, 11), // 4: Watu (Artesã)
  new THREE.Vector3(9, 0, 8), // 5: Porto Mariana (Pescador)
  new THREE.Vector3(14.5, 0, 4.5), // 6: Memória (Guia)
  new THREE.Vector3(13, 0, -0.5), // 7: Lixo (Entulho)
  new THREE.Vector3(7, 0, -2.5), // 8: Aldeia Krenak (Líder)
  new THREE.Vector3(1, 0, -4), // 9: PERD (Guia PERD)
  new THREE.Vector3(-5.5, 0, -3), // 10: Lagoas (Biólogo)
  new THREE.Vector3(-12, 0, -6), // 11: Hidrografia (Pesquisador)
  new THREE.Vector3(-8.5, 0, -10.5), // 12: Agroflorestas (Agricultor)
  new THREE.Vector3(-1, 0, -12.5), // 13: Saberes Krenak (Artesã)
  new THREE.Vector3(7.5, 0, -11), // 14: Lixo (Plásticos)
  new THREE.Vector3(16.5, 0, -12.5), // 15: Foz / Grande Encontro
];

export const RIVER_CURVE = new THREE.CatmullRomCurve3(CONTROL_POINTS, false, 'centripetal');

// Direção do sol compartilhada pelo céu (Sky) e pela luz direcional da cena
export const SUN_POSITION: [number, number, number] = [55, 42, 18];

export const WAYPOINT_POSITIONS: THREE.Vector3[] = Array.from(
  { length: MAX_WAYPOINT_INDEX + 1 },
  (_, i) => RIVER_CURVE.getPointAt(i / MAX_WAYPOINT_INDEX),
);

function clampIndex(index: number): number {
  return Math.max(0, Math.min(MAX_WAYPOINT_INDEX, index));
}

export function getWaypointPosition(index: number): THREE.Vector3 {
  return WAYPOINT_POSITIONS[clampIndex(index)];
}

export function getWaypointTangent(index: number): THREE.Vector3 {
  return RIVER_CURVE.getTangentAt(clampIndex(index) / MAX_WAYPOINT_INDEX);
}

export function getPointBetweenWaypoints(from: number, to: number, progress: number): THREE.Vector3 {
  const uFrom = clampIndex(from) / MAX_WAYPOINT_INDEX;
  const uTo = clampIndex(to) / MAX_WAYPOINT_INDEX;
  const u = THREE.MathUtils.lerp(uFrom, uTo, progress);
  return RIVER_CURVE.getPointAt(u);
}

export function getTangentBetweenWaypoints(from: number, to: number, progress: number): THREE.Vector3 {
  const uFrom = clampIndex(from) / MAX_WAYPOINT_INDEX;
  const uTo = clampIndex(to) / MAX_WAYPOINT_INDEX;
  const u = THREE.MathUtils.lerp(uFrom, uTo, progress);
  return RIVER_CURVE.getTangentAt(u);
}
