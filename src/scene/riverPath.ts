import { MAX_WAYPOINT_INDEX } from '../data/riverLayout';

export interface Point {
  x: number;
  y: number;
}

// Traçado do Rio Doce em 2D: uma curva em S vertical (retrato), do topo
// (Mariana, nascente) até a base (Foz, encontro com o mar). O meandro em X
// dá a sensação de rio sinuoso; o espaçamento em Y é a distância percorrida.
const CONTROL_POINTS: Point[] = [
  { x: 0, y: 0 }, // 0: Mariana
  { x: -85, y: 260 }, // 1: Lixo (Garrafa)
  { x: 70, y: 560 }, // 2: Povoado Lavras (Agricultor)
  { x: -95, y: 860 }, // 3: Lixo (Pneu)
  { x: 90, y: 1160 }, // 4: Watu (Artesã)
  { x: -60, y: 1460 }, // 5: Porto Mariana (Pescador)
  { x: 95, y: 1760 }, // 6: Memória (Guia)
  { x: -90, y: 2060 }, // 7: Lixo (Entulho)
  { x: 65, y: 2360 }, // 8: Aldeia Krenak (Líder)
  { x: -100, y: 2660 }, // 9: PERD (Guia PERD)
  { x: 80, y: 2960 }, // 10: Lagoas (Biólogo)
  { x: -70, y: 3260 }, // 11: Hidrografia (Pesquisador)
  { x: 90, y: 3560 }, // 12: Agroflorestas (Agricultor)
  { x: -80, y: 3860 }, // 13: Saberes Krenak (Artesã)
  { x: 60, y: 4160 }, // 14: Lixo (Plásticos)
  { x: 0, y: 4480 }, // 15: Foz / Grande Encontro
];

const N = CONTROL_POINTS.length;

function catmullRom(p0: Point, p1: Point, p2: Point, p3: Point, t: number, out: Point): Point {
  const t2 = t * t;
  const t3 = t2 * t;
  out.x =
    0.5 *
    (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
  out.y =
    0.5 *
    (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
  return out;
}

/** Ponto no traçado do rio para u em [0,1] (0 = Mariana, 1 = Foz). */
export function getPointAt(u: number, out: Point = { x: 0, y: 0 }): Point {
  const clamped = Math.min(1, Math.max(0, u));
  const scaled = clamped * (N - 1);
  let i = Math.floor(scaled);
  if (i >= N - 1) i = N - 2;
  const t = scaled - i;
  const p0 = CONTROL_POINTS[Math.max(0, i - 1)];
  const p1 = CONTROL_POINTS[i];
  const p2 = CONTROL_POINTS[Math.min(N - 1, i + 1)];
  const p3 = CONTROL_POINTS[Math.min(N - 1, i + 2)];
  return catmullRom(p0, p1, p2, p3, t, out);
}

const TANGENT_EPS = 0.0006;
const tangentA: Point = { x: 0, y: 0 };
const tangentB: Point = { x: 0, y: 0 };

/** Direção de deslocamento (normalizada) no traçado do rio para u em [0,1]. */
export function getTangentAt(u: number, out: Point = { x: 0, y: 0 }): Point {
  getPointAt(Math.max(0, u - TANGENT_EPS), tangentA);
  getPointAt(Math.min(1, u + TANGENT_EPS), tangentB);
  out.x = tangentB.x - tangentA.x;
  out.y = tangentB.y - tangentA.y;
  const len = Math.sqrt(out.x * out.x + out.y * out.y);
  if (len > 1e-6) {
    out.x /= len;
    out.y /= len;
  } else {
    out.x = 0;
    out.y = 1;
  }
  return out;
}

/** Amostra `count + 1` pontos uniformemente distribuídos ao longo de toda a curva. */
export function sampleCurve(count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= count; i++) {
    points.push(getPointAt(i / count));
  }
  return points;
}

export const WAYPOINT_POSITIONS: Point[] = Array.from({ length: MAX_WAYPOINT_INDEX + 1 }, (_, i) =>
  getPointAt(i / MAX_WAYPOINT_INDEX),
);

function clampIndex(index: number): number {
  return Math.max(0, Math.min(MAX_WAYPOINT_INDEX, index));
}

export function getWaypointPosition(index: number): Point {
  return WAYPOINT_POSITIONS[clampIndex(index)];
}

export function getWaypointTangent(index: number, out?: Point): Point {
  return getTangentAt(clampIndex(index) / MAX_WAYPOINT_INDEX, out);
}

export function getPointBetweenWaypoints(from: number, to: number, progress: number, out?: Point): Point {
  const uFrom = clampIndex(from) / MAX_WAYPOINT_INDEX;
  const uTo = clampIndex(to) / MAX_WAYPOINT_INDEX;
  const u = uFrom + (uTo - uFrom) * progress;
  return getPointAt(u, out);
}

export function getTangentBetweenWaypoints(from: number, to: number, progress: number, out?: Point): Point {
  const uFrom = clampIndex(from) / MAX_WAYPOINT_INDEX;
  const uTo = clampIndex(to) / MAX_WAYPOINT_INDEX;
  const u = uFrom + (uTo - uFrom) * progress;
  return getTangentAt(u, out);
}

/** Meio-largura do rio no mundo 2D (px), usada pelo fundo e pelas margens. */
export const RIVER_HALF_WIDTH = 70;

/** Altura total do "mundo" do rio (px), do primeiro ao último ponto de controle. */
export const WORLD_HEIGHT = CONTROL_POINTS[N - 1].y;
