import { useTick } from '@pixi/react';
import { useCallback, useRef } from 'react';
import type { Container as PixiContainer, Graphics as PixiGraphics } from 'pixi.js';
import { useGameStore } from '../store/gameStore';
import { boatWorldPosition } from './camera';
import {
  getPointBetweenWaypoints,
  getTangentBetweenWaypoints,
  getWaypointPosition,
  getWaypointTangent,
  type Point,
} from './riverPath';
import { drawBoat } from './vectorArt';

const NAVIGATION_STEP_DURATION = 0.85;
const BOAT_SCALE = 1.35;

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

interface AnimState {
  displayed: number;
  target: number;
  t: number;
  animating: boolean;
  sinkProgress: number;
}

function publishBoatPosition(p: Point): void {
  boatWorldPosition.x = p.x;
  boatWorldPosition.y = p.y;
  boatWorldPosition.ready = true;
}

/** Rotaciona o barco para alinhar sua proa (desenhada apontando +Y local) com a direção de deslocamento. */
function rotationForTangent(tan: Point): number {
  return Math.atan2(-tan.x, tan.y);
}

export function BoatSprite() {
  const containerRef = useRef<PixiContainer>(null);
  const anim = useRef<AnimState>({ displayed: 0, target: 0, t: 0, animating: false, sinkProgress: 0 });
  const posBuf = useRef<Point>({ x: 0, y: 0 });
  const tanBuf = useRef<Point>({ x: 0, y: 1 });

  const tier = useGameStore((s) => s.state.boat.tier);
  const cracks = useGameStore((s) => s.state.boat.cracks);
  const avatar = useGameStore((s) => s.state.avatar);
  const draw = useCallback((g: PixiGraphics) => drawBoat(g, tier, cracks, avatar), [tier, cracks, avatar]);

  useTick(({ deltaMS }) => {
    const c = containerRef.current;
    if (!c) return;
    const delta = deltaMS / 1000;
    const a = anim.current;
    const state = useGameStore.getState().state;

    if (state.boat.isSunk) {
      a.sinkProgress = Math.min(1, a.sinkProgress + delta * 0.7);
      c.alpha = 1 - a.sinkProgress * 0.7;
      c.scale.set(BOAT_SCALE * (1 - a.sinkProgress * 0.3));
      c.rotation += a.sinkProgress * 0.01;
      return;
    }

    if (!a.animating && state.currentWaypoint !== a.displayed) {
      a.target = state.currentWaypoint;
      a.t = 0;
      a.animating = true;
    }

    if (a.animating) {
      const stepTarget = a.displayed < a.target ? a.displayed + 1 : a.displayed - 1;
      a.t = Math.min(1, a.t + delta / NAVIGATION_STEP_DURATION);
      const e = easeInOut(a.t);
      getPointBetweenWaypoints(a.displayed, stepTarget, e, posBuf.current);
      getTangentBetweenWaypoints(a.displayed, stepTarget, e, tanBuf.current);
      const bob = Math.sin(a.t * Math.PI * 4) * 2;
      c.position.set(posBuf.current.x, posBuf.current.y + bob);
      publishBoatPosition(posBuf.current);
      c.rotation = rotationForTangent(tanBuf.current);
      c.scale.set(BOAT_SCALE * (1 + Math.sin(a.t * Math.PI * 2) * 0.02));

      if (a.t >= 1) {
        a.displayed = stepTarget;
        a.t = 0;
        if (a.displayed === a.target) {
          a.animating = false;
          useGameStore.getState().dispatch({ type: 'MOVE_ANIMATION_DONE' });
        }
      }
    } else {
      const pos = getWaypointPosition(a.displayed);
      const tan = getWaypointTangent(a.displayed, tanBuf.current);
      const idleBob = Math.sin(performance.now() * 0.0022) * 1.5;
      c.position.set(pos.x, pos.y + idleBob);
      publishBoatPosition(pos);
      c.rotation = rotationForTangent(tan);
      c.scale.set(BOAT_SCALE);
    }
  });

  return (
    <pixiContainer ref={containerRef}>
      <pixiGraphics draw={draw} />
    </pixiContainer>
  );
}
