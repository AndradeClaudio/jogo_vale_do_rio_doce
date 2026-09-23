import { useTick } from '@pixi/react';
import { useCallback, useRef } from 'react';
import { FillGradient, type Graphics as PixiGraphics } from 'pixi.js';
import { cameraFocus, VISIBLE_RANGE } from './camera';
import { GROUND_BOTTOM, GROUND_LEFT, GROUND_RIGHT } from './GroundTexture';
import { getPointAt, getTangentAt, RIVER_HALF_WIDTH, WORLD_HEIGHT } from './riverPath';

// Linha da costa logo abaixo da Foz: o rio atravessa a faixa de areia e
// deságua no mar, onde a pluma barrenta se espalha (marca real do Rio Doce).
const COAST_Y = WORLD_HEIGHT + 100;
const SAND_DEPTH = 34;
const end = getPointAt(1);
const endTan = getTangentAt(1);
const MOUTH_X = end.x + endTan.x * ((COAST_Y - end.y) / endTan.y);
const MOUTH_HALF = RIVER_HALF_WIDTH + 13;
const SEA_BOTTOM = GROUND_BOTTOM + 200;

function coastWave(x: number): number {
  return Math.sin(x * 0.045) * 5 + Math.sin(x * 0.11 + 1.3) * 2.5;
}

function drawSea(g: PixiGraphics): void {
  g.clear();
  const seaGradient = new FillGradient({
    type: 'linear',
    start: { x: 0, y: COAST_Y },
    end: { x: 0, y: COAST_Y + 420 },
    colorStops: [
      { offset: 0, color: 0x2a9d8f },
      { offset: 0.35, color: 0x137a8c },
      { offset: 1, color: 0x0b3d5c },
    ],
    textureSpace: 'global',
  });

  // mar: a borda superior acompanha a ondulação da praia
  const seaPoints: number[] = [];
  for (let x = GROUND_LEFT; x <= GROUND_RIGHT; x += 12) seaPoints.push(x, COAST_Y + coastWave(x));
  seaPoints.push(GROUND_RIGHT, SEA_BOTTOM, GROUND_LEFT, SEA_BOTTOM);
  g.poly(seaPoints).fill(seaGradient);

  // faixa de areia dos dois lados da desembocadura
  for (const [from, to] of [[GROUND_LEFT, MOUTH_X - MOUTH_HALF], [MOUTH_X + MOUTH_HALF, GROUND_RIGHT]]) {
    const sand: number[] = [];
    for (let x = from; x <= to; x += 12) sand.push(x, COAST_Y - SAND_DEPTH + coastWave(x + 40) * 0.6);
    for (let x = to; x >= from; x -= 12) sand.push(x, COAST_Y + coastWave(x) + 2);
    g.poly(sand).fill(0xe9d8a6);
  }

  // pluma de lama se abrindo no mar
  g.ellipse(MOUTH_X + 20, COAST_Y + 95, 230, 110).fill({ color: 0xa47b45, alpha: 0.16 });
  g.ellipse(MOUTH_X + 10, COAST_Y + 60, 160, 70).fill({ color: 0x9a7040, alpha: 0.24 });
  g.ellipse(MOUTH_X, COAST_Y + 30, 100, 38).fill({ color: 0x8a6337, alpha: 0.32 });
}

function drawSurf(g: PixiGraphics, seconds: number): void {
  g.clear();
  if (Math.abs(COAST_Y - cameraFocus.y) > VISIBLE_RANGE + 200) return;
  for (let line = 0; line < 3; line++) {
    const t = (seconds * 0.35 + line / 3) % 1;
    const offset = 6 + t * 40;
    const alpha = (1 - t) * 0.7;
    g.moveTo(GROUND_LEFT, COAST_Y + offset + coastWave(GROUND_LEFT + seconds * 8));
    for (let x = GROUND_LEFT; x <= GROUND_RIGHT; x += 10) {
      if (Math.abs(x - MOUTH_X) < MOUTH_HALF) {
        g.moveTo(x, COAST_Y + offset + coastWave(x + seconds * 8));
        continue;
      }
      g.lineTo(x, COAST_Y + offset + coastWave(x + seconds * 8));
    }
    g.stroke({ width: 2, color: 0xf8fafc, alpha });
  }
}

/** Praia e oceano no fim do percurso, com espuma das ondas animada. */
export function RiverMouthSea() {
  const surfRef = useRef<PixiGraphics>(null);
  const noop = useCallback(() => {}, []);
  useTick(() => {
    const surf = surfRef.current;
    if (surf) drawSurf(surf, performance.now() / 1000);
  });
  return (
    <pixiContainer>
      <pixiGraphics draw={drawSea} />
      <pixiGraphics ref={surfRef} draw={noop} />
    </pixiContainer>
  );
}
