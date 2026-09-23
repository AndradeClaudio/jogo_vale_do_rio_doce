import { useTick } from '@pixi/react';
import { useCallback, useRef } from 'react';
import type { Container as PixiContainer, Graphics as PixiGraphics } from 'pixi.js';
import { cameraFocus, VISIBLE_RANGE } from './camera';
import { GROUND_BOTTOM, GROUND_LEFT, GROUND_RIGHT, GROUND_TOP } from './GroundTexture';

function hash(n: number): number {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

interface CloudSpec {
  x: number;
  y: number;
  puffs: [number, number, number][];
}

const WIDTH = GROUND_RIGHT - GROUND_LEFT + 300;
const HEIGHT = GROUND_BOTTOM - GROUND_TOP;
const DRIFT_X = 7;
const DRIFT_Y = 3.5;

const CLOUDS: CloudSpec[] = Array.from({ length: 26 }, (_, i) => ({
  x: GROUND_LEFT - 150 + hash(i * 3.7) * WIDTH,
  y: GROUND_TOP + (i / 26) * HEIGHT + hash(i * 5.1) * 120,
  puffs: Array.from({ length: 4 + Math.floor(hash(i * 7.3) * 3) }, (_, k) => [
    (hash(i * 11 + k) - 0.5) * 110,
    (hash(i * 13 + k) - 0.5) * 50,
    32 + hash(i * 17 + k) * 34,
  ]),
}));

function CloudGraphic({ puffs }: { puffs: [number, number, number][] }) {
  const draw = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      for (const [dx, dy, r] of puffs) g.ellipse(dx, dy, r * 1.3, r * 0.8).fill({ color: 0x0b1f14, alpha: 0.07 });
    },
    [puffs],
  );
  return <pixiGraphics draw={draw} />;
}

/** Sombras de nuvens passando devagar sobre a paisagem (dá profundidade e sensação de vento). */
export function CloudShadows() {
  const containerRef = useRef<PixiContainer>(null);

  useTick(() => {
    const container = containerRef.current;
    if (!container) return;
    const seconds = performance.now() / 1000;
    container.children.forEach((child, i) => {
      const c = CLOUDS[i];
      const x = GROUND_LEFT - 150 + ((((c.x - GROUND_LEFT + 150 + seconds * DRIFT_X) % WIDTH) + WIDTH) % WIDTH);
      const y = GROUND_TOP + ((((c.y - GROUND_TOP + seconds * DRIFT_Y) % HEIGHT) + HEIGHT) % HEIGHT);
      child.position.set(x, y);
      child.visible = Math.abs(y - cameraFocus.y) < VISIBLE_RANGE + 80;
    });
  });

  return (
    <pixiContainer ref={containerRef} eventMode="none">
      {CLOUDS.map((c, i) => (
        <CloudGraphic key={`cloud_${i}`} puffs={c.puffs} />
      ))}
    </pixiContainer>
  );
}
