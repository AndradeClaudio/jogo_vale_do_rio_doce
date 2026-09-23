import { useApplication, useTick } from '@pixi/react';
import { useCallback, useRef } from 'react';
import { Texture, type Container as PixiContainer, type Graphics as PixiGraphics, type Sprite as PixiSprite } from 'pixi.js';
import { drawBird, type BirdKind } from './vectorArt';

const POOL_SIZE = 6;
const SHADOW_OFFSET = { x: 34, y: 52 };

interface BirdState {
  offsetX: number;
  offsetY: number;
  flapPhase: number;
}

interface Flock {
  kind: BirdKind;
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  speed: number;
  size: number;
  members: BirdState[];
}

const KINDS: BirdKind[] = ['araraVermelha', 'araraAzul', 'garca'];

function spawnFlock(width: number, height: number): Flock {
  const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
  const fromLeft = Math.random() < 0.5;
  const startY = height * (0.2 + Math.random() * 0.45);
  const endY = height * (0.2 + Math.random() * 0.45);
  const startX = fromLeft ? -80 : width + 80;
  const endX = fromLeft ? width + 80 : -80;
  const dx = endX - startX;
  const dy = endY - startY;
  const len = Math.hypot(dx, dy);
  const count = kind === 'garca' ? 4 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 2);
  const members: BirdState[] = Array.from({ length: count }, (_, i) => {
    const rank = Math.ceil(i / 2);
    const side = i % 2 === 0 ? 1 : -1;
    return { offsetX: -rank * 30, offsetY: i === 0 ? 0 : side * rank * 24, flapPhase: Math.random() * Math.PI * 2 };
  });
  return {
    kind,
    x: startX,
    y: startY,
    dirX: dx / len,
    dirY: dy / len,
    speed: kind === 'garca' ? 95 : 150,
    size: Math.max(1.3, Math.min(2.1, width / 520)),
    members,
  };
}

/** Bandos de araras e garças cruzando a tela de tempos em tempos, com sombra no chão. */
function Birds() {
  const { app } = useApplication();
  const birdsRef = useRef<PixiContainer>(null);
  const shadowsRef = useRef<PixiContainer>(null);
  const flock = useRef<Flock | null>(null);
  const nextSpawnAt = useRef(performance.now() + 2500);
  const noop = useCallback(() => {}, []);

  useTick(({ deltaMS }) => {
    const birds = birdsRef.current;
    const shadows = shadowsRef.current;
    if (!birds || !shadows) return;
    const now = performance.now();
    const w = app.screen.width;
    const h = app.screen.height;

    if (!flock.current && now >= nextSpawnAt.current) {
      flock.current = spawnFlock(w, h);
      flock.current.members.forEach((_, i) => {
        drawBird(birds.children[i] as PixiGraphics, flock.current!.kind);
        drawBird(shadows.children[i] as PixiGraphics, flock.current!.kind, true);
      });
    }

    const f = flock.current;
    if (!f) {
      for (let i = 0; i < POOL_SIZE; i++) {
        birds.children[i].visible = false;
        shadows.children[i].visible = false;
      }
      return;
    }

    f.x += f.dirX * f.speed * (deltaMS / 1000);
    f.y += f.dirY * f.speed * (deltaMS / 1000);
    const rotation = Math.atan2(-f.dirX, f.dirY);
    const perpX = -f.dirY;
    const perpY = f.dirX;
    let anyOnScreen = false;

    for (let i = 0; i < POOL_SIZE; i++) {
      const bird = birds.children[i];
      const shadow = shadows.children[i];
      const m = f.members[i];
      if (!m) {
        bird.visible = false;
        shadow.visible = false;
        continue;
      }
      const bx = f.x + f.dirX * m.offsetX + perpX * m.offsetY;
      const by = f.y + f.dirY * m.offsetX + perpY * m.offsetY;
      const flapSpeed = f.kind === 'garca' ? 0.006 : 0.012;
      const flap = 0.45 + Math.abs(Math.sin(now * flapSpeed + m.flapPhase)) * 0.55;
      for (const [obj, ox, oy] of [[bird, 0, 0], [shadow, SHADOW_OFFSET.x, SHADOW_OFFSET.y]] as const) {
        obj.visible = true;
        obj.position.set(bx + ox, by + oy);
        obj.rotation = rotation;
        obj.scale.set(f.size * flap, f.size);
      }
      if (bx > -120 && bx < w + 120 && by > -120 && by < h + 120) anyOnScreen = true;
    }

    const traveled = f.dirX > 0 ? f.x > w + 200 : f.x < -200;
    if (!anyOnScreen && traveled) {
      flock.current = null;
      nextSpawnAt.current = now + 6000 + Math.random() * 7000;
    }
  });

  return (
    <pixiContainer eventMode="none">
      <pixiContainer ref={shadowsRef}>
        {Array.from({ length: POOL_SIZE }, (_, i) => (
          <pixiGraphics key={`shadow_${i}`} draw={noop} visible={false} />
        ))}
      </pixiContainer>
      <pixiContainer ref={birdsRef}>
        {Array.from({ length: POOL_SIZE }, (_, i) => (
          <pixiGraphics key={`bird_${i}`} draw={noop} visible={false} />
        ))}
      </pixiContainer>
    </pixiContainer>
  );
}

// Textura da vinheta gerada uma vez via Canvas 2D (gradiente radial nativo do
// navegador) e esticada para o tamanho da tela — fica elíptica em telas não quadradas.
let vignetteTexture: Texture | null = null;
function getVignetteTexture(): Texture {
  if (vignetteTexture) return vignetteTexture;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.28, size / 2, size / 2, size * 0.72);
  gradient.addColorStop(0, 'rgba(8, 24, 16, 0)');
  gradient.addColorStop(1, 'rgba(8, 24, 16, 0.38)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  vignetteTexture = Texture.from(canvas);
  return vignetteTexture;
}

/** Vinheta suave nas bordas, dando acabamento cinematográfico e foco no centro. */
function Vignette() {
  const { app } = useApplication();
  const ref = useRef<PixiSprite>(null);

  useTick(() => {
    const sprite = ref.current;
    if (!sprite) return;
    sprite.width = app.screen.width;
    sprite.height = app.screen.height;
  });

  return <pixiSprite ref={ref} texture={getVignetteTexture()} eventMode="none" />;
}

/** Camadas em espaço de tela, desenhadas por cima do mundo. */
export function ScreenEffects() {
  return (
    <pixiContainer eventMode="none">
      <Birds />
      <Vignette />
    </pixiContainer>
  );
}
