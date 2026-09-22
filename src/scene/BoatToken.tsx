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

const NAVIGATION_STEP_DURATION = 0.85;

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
  const wakeRef = useRef<THREE.Mesh>(null);
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

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const a = anim.current;

    // Pulso suave na esteira d'água sob o casco
    if (wakeRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.08;
      wakeRef.current.scale.setScalar(pulse);
    }

    // Se o barco afundou, desce lentamente até o fundo da bacia côncava
    if (isSunk) {
      a.sinkProgress = Math.min(1, a.sinkProgress + delta * 0.7);
      g.position.y = -0.15 - a.sinkProgress * 0.75;
      g.rotation.z = Math.sin(a.sinkProgress * Math.PI) * 0.45;
      g.rotation.x = -a.sinkProgress * 0.35;
      return;
    }

    // Detecta mudança de marco
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

      // Balanço natural e ondulação nas águas azuis
      const bob = Math.sin(a.t * Math.PI * 4) * 0.05;
      g.position.set(pos.x, -0.06 + bob, pos.z);
      g.rotation.y = Math.atan2(tan.x, tan.z);
      g.rotation.z = Math.sin(a.t * Math.PI * 2) * 0.04;

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
      const idleBob = Math.sin(clock.elapsedTime * 2.2) * 0.03;
      g.position.set(pos.x, -0.06 + idleBob, pos.z);
      g.rotation.y = Math.atan2(tan.x, tan.z);
    }
  });

  return (
    <group ref={group} position={getWaypointPosition(0)}>
      {/* Esteira d'água / ondulação suave ao redor do casco */}
      <mesh
        ref={wakeRef}
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.5, 1.4, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Modelo do barco em escala destacada (1.65x) para visibilidade máxima */}
      <group scale={[1.65, 1.65, 1.65]}>
        <BoatMesh tier={boat.tier} cracks={boat.cracks} />
      </group>
    </group>
  );
}
