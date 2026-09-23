import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useGameStore } from '../store/gameStore';
import { getWaypointPosition } from './pathUtils';

const tmpTarget = new THREE.Vector3();
const tmpDelta = new THREE.Vector3();

export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const isInitialized = useRef(false);

  useFrame(({ camera }) => {
    const c = controls.current;
    if (!c) return;

    const currentWaypoint = useGameStore.getState().state.currentWaypoint;
    const pos = getWaypointPosition(currentWaypoint);
    tmpTarget.set(pos.x, -0.05, pos.z);

    // No primeiro frame, posiciona a câmera diretamente sobre o barco e o lago azul
    if (!isInitialized.current) {
      isInitialized.current = true;
      c.target.copy(tmpTarget);
      camera.position.set(pos.x + 5.5, pos.y + 6.5, pos.z + 8.5);
      c.update();
      return;
    }

    // Move o alvo E a câmera juntos, preservando o zoom/ângulo escolhido pelo
    // jogador, para a embarcação nunca "fugir" do enquadramento conforme navega.
    tmpDelta.subVectors(tmpTarget, c.target).multiplyScalar(0.06);
    c.target.add(tmpDelta);
    camera.position.add(tmpDelta);
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minDistance={3.5}
      maxDistance={45}
      maxPolarAngle={Math.PI / 2.15}
      enableDamping
      dampingFactor={0.07}
    />
  );
}
