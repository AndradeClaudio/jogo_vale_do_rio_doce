import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useGameStore } from '../store/gameStore';
import { getWaypointPosition } from './pathUtils';

const tmpTarget = new THREE.Vector3();

export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);

  useFrame(() => {
    const c = controls.current;
    if (!c) return;
    const currentWaypoint = useGameStore.getState().state.currentWaypoint;
    const pos = getWaypointPosition(currentWaypoint);
    tmpTarget.set(pos.x, pos.y + 0.6, pos.z);
    c.target.lerp(tmpTarget, 0.05);
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minDistance={6}
      maxDistance={35}
      maxPolarAngle={Math.PI / 2.1}
      enableDamping
      dampingFactor={0.06}
    />
  );
}
