import { useApplication, useTick } from '@pixi/react';
import { useCallback, useRef } from 'react';
import type { Container as PixiContainer, Graphics as PixiGraphics } from 'pixi.js';
import { RIVER_WAYPOINTS } from '../data/riverLayout';
import { worldScaleFor } from './camera';
import { updateChunkVisibility } from './chunkCache';
import { COLORS } from './palette';
import { getPointAt, getTangentAt, sampleCurve, type Point } from './riverPath';
import { drawChurch, drawFirePit, drawFlame, drawHouse, drawOca, drawTree, type TreeKind } from './vectorArt';

const LAST_INDEX = RIVER_WAYPOINTS.length - 1;

function hash(n: number): number {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

/** Ponto na margem: `side` = -1/1 escolhe o lado, `offset` a distância do eixo do rio. */
function besideRiver(u: number, side: number, offset: number): Point {
  const pt = getPointAt(u);
  const tan = getTangentAt(u);
  return { x: pt.x + tan.y * offset * side, y: pt.y - tan.x * offset * side };
}

// ---------- Marcos da paisagem ----------

const CHURCH_POS = besideRiver(0.02, -1, 128);
const VILLAGE_CENTER = besideRiver(8 / LAST_INDEX, 1, 132);
const CRAFT_OCA_POS = besideRiver(13 / LAST_INDEX, -1, 126);

const VILLAGE_OCAS: { x: number; y: number; scale: number }[] = [
  { x: VILLAGE_CENTER.x - 26, y: VILLAGE_CENTER.y - 18, scale: 1 },
  { x: VILLAGE_CENTER.x + 24, y: VILLAGE_CENTER.y - 22, scale: 0.9 },
  { x: VILLAGE_CENTER.x + 30, y: VILLAGE_CENTER.y + 20, scale: 1.1 },
  { x: VILLAGE_CENTER.x - 22, y: VILLAGE_CENTER.y + 24, scale: 0.85 },
];

const EXCLUSION_ZONES: { x: number; y: number; r: number }[] = [
  { ...CHURCH_POS, r: 62 },
  { ...VILLAGE_CENTER, r: 70 },
  { ...CRAFT_OCA_POS, r: 40 },
];

function isFree(p: Point): boolean {
  return EXCLUSION_ZONES.every((z) => Math.hypot(p.x - z.x, p.y - z.y) > z.r);
}

// ---------- Vegetação ----------

interface TreeSpec {
  x: number;
  y: number;
  kind: TreeKind;
  variant: number;
  scale: number;
}

function pickKind(h: number): TreeKind {
  if (h < 0.5) return 'tropical';
  if (h < 0.66) return 'ipeAmarelo';
  if (h < 0.76) return 'ipeRosa';
  if (h < 0.82) return 'ipeRoxo';
  return 'palmeira';
}

const CURVE_SAMPLES = sampleCurve(90);

// Duas fileiras de mata (perto e longe da margem) em ambos os lados, com
// espécies variadas; ordenadas por Y para as copas de trás não cobrirem as da frente.
const TREES: TreeSpec[] = CURVE_SAMPLES.flatMap((_, i) => {
  const u = i / 90;
  const trees: TreeSpec[] = [];
  for (const side of [-1, 1]) {
    const rows = i % 2 === 0 ? [96 + hash(i * 3.1 + side) * 20, 150 + hash(i * 4.7 + side) * 45] : [100 + hash(i * 2.3 + side) * 18];
    rows.forEach((offset, row) => {
      const p = besideRiver(u, side, offset);
      if (!isFree(p)) return;
      const h = hash(i * 7.3 + side * 1.9 + row * 11.1);
      trees.push({
        x: p.x,
        y: p.y,
        kind: pickKind(h),
        variant: Math.floor(hash(i * 5.1 + row) * 3),
        scale: 0.9 + hash(i * 9.7 + side + row) * 0.35,
      });
    });
  }
  return trees;
}).sort((a, b) => a.y - b.y);

interface HouseSpec {
  x: number;
  y: number;
  wallColor: number;
}

const HOUSES: HouseSpec[] = RIVER_WAYPOINTS.filter((wp) => wp.tipo === 'personagem')
  .map((wp, i) => {
    const p = besideRiver(wp.index / LAST_INDEX, i % 2 === 0 ? -1 : 1, 205);
    return { ...p, wallColor: COLORS.houseWallOptions[i % COLORS.houseWallOptions.length] };
  })
  .filter(isFree);

// ---------- Componentes ----------

function TreeGraphic({ x, y, kind, variant, scale }: TreeSpec) {
  const draw = useCallback((g: PixiGraphics) => drawTree(g, kind, variant), [kind, variant]);
  return <pixiGraphics draw={draw} x={x} y={y} scale={scale} />;
}

function HouseGraphic({ x, y, wallColor }: HouseSpec) {
  const draw = useCallback((g: PixiGraphics) => drawHouse(g, wallColor), [wallColor]);
  return <pixiGraphics draw={draw} x={x} y={y} />;
}

function OcaGraphic({ x, y, scale }: { x: number; y: number; scale: number }) {
  const draw = useCallback((g: PixiGraphics) => drawOca(g, scale), [scale]);
  return <pixiGraphics draw={draw} x={x} y={y} />;
}

function Campfire({ x, y }: Point) {
  const flameRef = useRef<PixiGraphics>(null);
  useTick(() => {
    const f = flameRef.current;
    if (!f) return;
    const t = performance.now() * 0.012;
    f.scale.set(0.85 + Math.sin(t) * 0.12, 0.9 + Math.sin(t * 1.7) * 0.22);
  });
  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics draw={drawFirePit} />
      <pixiGraphics ref={flameRef} draw={drawFlame} y={1} />
    </pixiContainer>
  );
}

// Faixas horizontais de árvores, cada uma pré-renderizada como textura perto da câmera.
const BAND_HEIGHT = 400;
const TREE_BANDS: TreeSpec[][] = [];
for (const tree of TREES) {
  const band = Math.floor((tree.y + 1000) / BAND_HEIGHT);
  (TREE_BANDS[band] ??= []).push(tree);
}
const NON_EMPTY_BANDS = TREE_BANDS.filter((band) => band && band.length > 0);
const BAND_BOUNDS = NON_EMPTY_BANDS.map((band) => ({
  top: Math.min(...band.map((t) => t.y)) - 45,
  bottom: Math.max(...band.map((t) => t.y)) + 12,
}));

/** Mata nativa, casario, a igreja barroca de Mariana e a aldeia Krenak ao longo das margens. */
export function RiverScenery() {
  const treesRef = useRef<PixiContainer>(null);
  const cached = useRef<boolean[]>(NON_EMPTY_BANDS.map(() => false));
  const { app } = useApplication();

  useTick(() => {
    const trees = treesRef.current;
    if (!trees) return;
    updateChunkVisibility(trees.children as PixiContainer[], BAND_BOUNDS, cached.current, worldScaleFor(app.screen.width));
  });

  return (
    <pixiContainer>
      <pixiGraphics draw={drawChurch} x={CHURCH_POS.x} y={CHURCH_POS.y} />
      <Campfire x={VILLAGE_CENTER.x} y={VILLAGE_CENTER.y} />
      {VILLAGE_OCAS.map((o, i) => (
        <OcaGraphic key={`oca_${i}`} {...o} />
      ))}
      <OcaGraphic x={CRAFT_OCA_POS.x} y={CRAFT_OCA_POS.y} scale={1.25} />
      {HOUSES.map((h, i) => (
        <HouseGraphic key={`house_${i}`} {...h} />
      ))}
      <pixiContainer ref={treesRef}>
        {NON_EMPTY_BANDS.map((band, b) => (
          <pixiContainer key={`band_${b}`}>
            {band.map((t, i) => (
              <TreeGraphic key={`tree_${i}`} {...t} />
            ))}
          </pixiContainer>
        ))}
      </pixiContainer>
    </pixiContainer>
  );
}
