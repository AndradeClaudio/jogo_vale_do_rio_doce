import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { BoatMesh } from './BoatMeshes';
import {
  getPointBetweenWaypoints,
  getTangentBetweenWaypoints,
  getWaypointPosition,
  getWaypointTangent,
} from './pathUtils';

const NAVIGATION_STEP_DURATION = 0.8; // segundos de navegação entre marcos

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

export function BoatToken() {
  const group = useRef<THREE.Group>(null);
  const boat = useGameStore((s) => s.state.boat);
  const currentWaypoint = useGameStore((s) => s.state.currentWaypoint);
  const isSunk = boat.isSunk;

  const anim = useRef<AnimState>({
    displayed: 0,
    target: 0,
    t: 0,
    animating: false,
    sinkProgress: 0,
  });

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const a = anim.current;

    // Se o barco afundou, anima descida para o fundo do leito
    if (isSunk) {
      a.sinkProgress = Math.min(1, a.sinkProgress + delta * 0.8);
      g.position.y = -a.sinkProgress * 1.2;
      g.rotation.z = Math.sin(a.sinkProgress * Math.PI) * 0.4;
      g.rotation.x = -a.sinkProgress * 0.3;
      return;
    }

    // Detecta mudança de waypoint
    if (!a.animating && currentWaypoint !== a.displayed) {
      a.target = currentWaypoint;
      a.t = 0;
      a.animating = true;
    }

    if (a.animating) {
      const stepTarget = a.displayed < a.target ? a.displayed + 1 : a.displayed - 1;
      a.t = Math.min(1, a.t + delta / NAVIGATION_STEP_DURATION);
      const e = easeInOut(a.t);

      const pos = getPointBetweenWaypoints(a.displayed, stepTarget, e);
      const tan = getTangentBetweenWaypoints(a.displayed, stepTarget, e);

      // Balanço natural das águas do Rio Doce
      const bob = Math.sin(a.t * Math.PI * 4) * 0.04;
      g.position.set(pos.x, pos.y + bob, pos.z);
      g.rotation.y = Math.atan2(tan.x, tan.z);
      g.rotation.z = Math.sin(a.t * Math.PI * 2) * 0.03;

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
      const tan = getWaypointTangent(a.displayed);
      // Leve flutuação quando parado
      const idleBob = Math.sin(Date.now() * 0.002) * 0.03;
      g.position.set(pos.x, pos.y + idleBob, pos.z);
      g.rotation.y = Math.atan2(tan.x, tan.z);
    }
  });

  return (
    <group ref={group} position={getWaypointPosition(0)}>
      <BoatMesh tier={boat.tier} cracks={boat.cracks} />
    </group>
  );
}
