import { useTick } from '@pixi/react';
import { useCallback, useRef } from 'react';
import type { Graphics as PixiGraphics } from 'pixi.js';
import { cameraFocus, VISIBLE_RANGE } from './camera';
import { COLORS } from './palette';
import { getPointAt, getTangentAt, RIVER_HALF_WIDTH, sampleCurve, type Point } from './riverPath';

// Estende a faixa visual do rio reto além de Mariana e da Foz, para que ela
// sempre saia da tela em vez de terminar num "fundo de piscina" arredondado
// dentro da área visível.
const EXTEND_LENGTH = 320;
const startPoint = getPointAt(0);
const startTangent = getTangentAt(0);
const endPoint = getPointAt(1);
const endTangent = getTangentAt(1);

const CURVE_POINTS = [
  { x: startPoint.x - startTangent.x * EXTEND_LENGTH, y: startPoint.y - startTangent.y * EXTEND_LENGTH },
  ...sampleCurve(200),
  { x: endPoint.x + endTangent.x * EXTEND_LENGTH, y: endPoint.y + endTangent.y * EXTEND_LENGTH },
];

function strokePath(g: PixiGraphics, width: number, color: number, alpha = 1) {
  g.clear();
  g.moveTo(CURVE_POINTS[0].x, CURVE_POINTS[0].y);
  for (let i = 1; i < CURVE_POINTS.length; i++) {
    g.lineTo(CURVE_POINTS[i].x, CURVE_POINTS[i].y);
  }
  g.stroke({ width, color, alpha, cap: 'round', join: 'round' });
}

function hash(n: number): number {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

// ---------- Vida na água (dados determinísticos, animados no tempo) ----------

interface Streak { u0: number; lateral: number; length: number; speed: number; alpha: number }
interface Glint { u: number; lateral: number; phase: number; freq: number }
interface FishSpot { u: number; lateral: number; period: number; offset: number }

const STREAKS: Streak[] = Array.from({ length: 340 }, (_, i) => ({
  u0: hash(i * 1.37),
  lateral: (hash(i * 2.91) - 0.5) * 2 * RIVER_HALF_WIDTH * 0.82,
  length: 8 + hash(i * 3.3) * 16,
  speed: (14 + hash(i * 4.1) * 12) / 4800,
  alpha: 0.18 + hash(i * 5.7) * 0.22,
}));

const GLINTS: Glint[] = Array.from({ length: 180 }, (_, i) => ({
  u: hash(i * 6.13),
  lateral: (hash(i * 7.77) - 0.5) * 2 * RIVER_HALF_WIDTH * 0.85,
  phase: hash(i * 8.2) * Math.PI * 2,
  freq: 1.2 + hash(i * 9.4) * 1.8,
}));

const FISH_SPOTS: FishSpot[] = Array.from({ length: 70 }, (_, i) => ({
  u: hash(i * 10.9),
  lateral: (hash(i * 11.3) - 0.5) * 2 * RIVER_HALF_WIDTH * 0.6,
  period: 5 + hash(i * 12.7) * 7,
  offset: hash(i * 13.1) * 12,
}));

const pBuf: Point = { x: 0, y: 0 };
const tBuf: Point = { x: 0, y: 0 };

function pointOnRiver(u: number, lateral: number): boolean {
  getPointAt(u, pBuf);
  if (Math.abs(pBuf.y - cameraFocus.y) > VISIBLE_RANGE) return false;
  getTangentAt(u, tBuf);
  pBuf.x += tBuf.y * lateral;
  pBuf.y -= tBuf.x * lateral;
  return true;
}

function drawWaterLife(g: PixiGraphics, seconds: number): void {
  g.clear();

  // correnteza: traços claros deslizando rio abaixo
  for (const s of STREAKS) {
    const u = (s.u0 + seconds * s.speed) % 1;
    if (!pointOnRiver(u, s.lateral)) continue;
    const half = s.length / 2;
    g.moveTo(pBuf.x - tBuf.x * half, pBuf.y - tBuf.y * half)
      .lineTo(pBuf.x + tBuf.x * half, pBuf.y + tBuf.y * half)
      .stroke({ width: 1.6, color: 0xb5ccb0, alpha: s.alpha, cap: 'round' });
  }

  // reflexos do sol cintilando na superfície
  for (const gl of GLINTS) {
    const a = Math.pow(Math.max(0, Math.sin(seconds * gl.freq + gl.phase)), 14);
    if (a < 0.05) continue;
    if (!pointOnRiver(gl.u, gl.lateral)) continue;
    g.circle(pBuf.x, pBuf.y, 1.3 + a * 1.2).fill({ color: 0xf8fafc, alpha: a * 0.9 });
  }

  // peixes pulando: anel que se abre + o peixe saltando no início do ciclo
  for (const f of FISH_SPOTS) {
    const phase = ((seconds + f.offset) / f.period) % 1;
    if (phase > 0.3) continue;
    if (!pointOnRiver(f.u, f.lateral)) continue;
    const k = phase / 0.3;
    g.circle(pBuf.x, pBuf.y, 2 + k * 15).stroke({ width: 1.3, color: 0xd9ead3, alpha: (1 - k) * 0.6 });
    if (k < 0.45) {
      const jump = Math.sin((k / 0.45) * Math.PI) * 9;
      g.ellipse(pBuf.x, pBuf.y - jump, 4.5, 2).fill(0xcbd5e1);
      g.poly([pBuf.x + 4, pBuf.y - jump, pBuf.x + 7, pBuf.y - jump - 2, pBuf.x + 7, pBuf.y - jump + 2]).fill(0x94a3b8);
    }
  }
}

/** Faixa do rio (margem + água + brilho) e a vida na água animada por cima. */
export function RiverBackground() {
  const drawBank = useCallback((g: PixiGraphics) => strokePath(g, RIVER_HALF_WIDTH * 2 + 26, COLORS.riverBank), []);
  const drawWater = useCallback((g: PixiGraphics) => strokePath(g, RIVER_HALF_WIDTH * 2, COLORS.riverDeep), []);
  const drawShine = useCallback((g: PixiGraphics) => strokePath(g, RIVER_HALF_WIDTH * 1.1, COLORS.riverMid, 0.7), []);
  const noop = useCallback(() => {}, []);

  const shineRef = useRef<PixiGraphics>(null);
  const lifeRef = useRef<PixiGraphics>(null);

  useTick(() => {
    const seconds = performance.now() / 1000;
    const shine = shineRef.current;
    if (shine) shine.alpha = 0.55 + Math.sin(seconds * 1.5) * 0.15;
    const life = lifeRef.current;
    if (life) drawWaterLife(life, seconds);
  });

  return (
    <pixiContainer>
      <pixiGraphics draw={drawBank} />
      <pixiGraphics draw={drawWater} />
      <pixiGraphics ref={shineRef} draw={drawShine} />
      <pixiGraphics ref={lifeRef} draw={noop} />
    </pixiContainer>
  );
}
