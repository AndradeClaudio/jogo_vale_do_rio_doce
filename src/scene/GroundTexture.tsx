import { useApplication, useTick } from '@pixi/react';
import { useCallback, useRef } from 'react';
import type { Container as PixiContainer, Graphics as PixiGraphics } from 'pixi.js';
import { worldScaleFor } from './camera';
import { updateChunkVisibility } from './chunkCache';
import { COLORS } from './palette';
import { WORLD_HEIGHT } from './riverPath';
import { drawBush, drawGroundRock } from './vectorArt';

export const GROUND_LEFT = -360;
export const GROUND_RIGHT = 360;
export const GROUND_TOP = -420;
export const GROUND_BOTTOM = WORLD_HEIGHT + 420;

const CHUNK_HEIGHT = 400;
const FLOWER_COLORS = [0xffffff, 0xfde047, 0xf9a8d4, 0xc4b5fd, 0xfb923c] as const;

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function drawBase(g: PixiGraphics): void {
  g.clear();
  g.rect(GROUND_LEFT, GROUND_TOP, GROUND_RIGHT - GROUND_LEFT, GROUND_BOTTOM - GROUND_TOP).fill(COLORS.groundBase);
}

/** Detalhes de um trecho do terreno (sem fundo, para as manchas vizinhas se
 * sobreporem sem emenda visível): manchas suaves, tufos e flores do campo. */
function drawChunk(g: PixiGraphics, top: number): void {
  g.clear();
  const bottom = Math.min(top + CHUNK_HEIGHT, GROUND_BOTTOM);

  const patchStep = 48;
  for (let y = top; y < bottom; y += patchStep) {
    for (let x = GROUND_LEFT; x < GROUND_RIGHT; x += patchStep) {
      const tone = hash2(x * 0.13, y * 0.17);
      if (tone < 0.35) continue;
      const px = x + (hash2(x, y) - 0.5) * patchStep;
      const py = y + (hash2(x + 9.1, y - 3.3) - 0.5) * patchStep;
      const radius = 12 + hash2(x + 5.2, y + 8.4) * 16;
      g.ellipse(px, py, radius * 1.4, radius).fill({ color: tone > 0.7 ? COLORS.grassLight : COLORS.grassDeep, alpha: 0.26 });
    }
  }

  const tuftStep = 30;
  for (let y = top; y < bottom; y += tuftStep) {
    for (let x = GROUND_LEFT; x < GROUND_RIGHT; x += tuftStep) {
      if (hash2(x * 0.7, y * 0.3) < 0.45) continue;
      const tx = x + (hash2(x + 1.3, y) - 0.5) * tuftStep;
      const ty = y + (hash2(x, y + 2.7) - 0.5) * tuftStep;
      g.moveTo(tx - 2.5, ty - 4).lineTo(tx, ty).lineTo(tx + 2.5, ty - 4).stroke({ width: 1.1, color: 0x2f7d32, alpha: 0.55 });
    }
  }

  const flowerStep = 42;
  for (let y = top; y < bottom; y += flowerStep) {
    for (let x = GROUND_LEFT; x < GROUND_RIGHT; x += flowerStep) {
      if (hash2(x * 0.41, y * 0.29) < 0.72) continue;
      const fx = x + (hash2(x + 4.4, y) - 0.5) * flowerStep;
      const fy = y + (hash2(x, y + 6.6) - 0.5) * flowerStep;
      const color = FLOWER_COLORS[Math.floor(hash2(x + 2.2, y + 2.2) * FLOWER_COLORS.length)];
      for (let k = 0; k < 4; k++) {
        const a = k * 1.9 + hash2(fx, fy) * 6;
        g.circle(fx + Math.cos(a) * 3.4, fy + Math.sin(a) * 2.2, 1.5).fill(color);
      }
    }
  }
}

const CHUNK_TOPS: number[] = [];
for (let top = GROUND_TOP; top < GROUND_BOTTOM; top += CHUNK_HEIGHT) CHUNK_TOPS.push(top);

function GroundChunk({ top }: { top: number }) {
  const draw = useCallback((g: PixiGraphics) => drawChunk(g, top), [top]);
  return <pixiGraphics draw={draw} />;
}

interface DecorSpec {
  x: number;
  y: number;
  kind: 'bush' | 'rock';
  scale: number;
}

const DECOR: DecorSpec[] = (() => {
  const items: DecorSpec[] = [];
  const step = 44;
  for (let y = GROUND_TOP; y < GROUND_BOTTOM; y += step) {
    for (let x = GROUND_LEFT; x < GROUND_RIGHT; x += step) {
      if (hash2(x * 0.53 + 1.1, y * 0.79 - 2.2) <= 0.88) continue;
      items.push({
        x: x + (hash2(x, y + 1) - 0.5) * step,
        y: y + (hash2(x + 2, y) - 0.5) * step,
        kind: hash2(x + 0.5, y + 0.5) > 0.4 ? 'bush' : 'rock',
        scale: 0.7 + hash2(x + 3.3, y + 1.7) * 0.6,
      });
    }
  }
  return items;
})();

function DecorGraphic({ x, y, kind, scale }: DecorSpec) {
  const draw = useCallback(
    (g: PixiGraphics) => {
      if (kind === 'bush') drawBush(g);
      else drawGroundRock(g, scale);
    },
    [kind, scale],
  );
  return <pixiGraphics draw={draw} x={x} y={y} scale={kind === 'bush' ? scale : 1} />;
}

const CHUNK_BOUNDS = CHUNK_TOPS.map((top) => ({ top: top - 20, bottom: top + CHUNK_HEIGHT + 20 }));
const DECOR_BY_CHUNK: DecorSpec[][] = CHUNK_TOPS.map((top) => DECOR.filter((d) => d.y >= top && d.y < top + CHUNK_HEIGHT));

/** Terreno em trechos pré-renderizados (grama, tufos, flores, arbustos e pedras). */
export function GroundTexture() {
  const chunksRef = useRef<PixiContainer>(null);
  const cached = useRef<boolean[]>(CHUNK_TOPS.map(() => false));
  const { app } = useApplication();

  useTick(() => {
    const chunks = chunksRef.current;
    if (!chunks) return;
    updateChunkVisibility(chunks.children as PixiContainer[], CHUNK_BOUNDS, cached.current, worldScaleFor(app.screen.width));
  });

  return (
    <pixiContainer>
      <pixiGraphics draw={drawBase} />
      <pixiContainer ref={chunksRef}>
        {CHUNK_TOPS.map((top, i) => (
          <pixiContainer key={`chunk_${top}`}>
            <GroundChunk top={top} />
            {DECOR_BY_CHUNK[i].map((d, k) => (
              <DecorGraphic key={`decor_${k}`} {...d} />
            ))}
          </pixiContainer>
        ))}
      </pixiContainer>
    </pixiContainer>
  );
}
