import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { INITIAL_WASTE_ITEMS } from '../data/riverLayout';
import type { WasteItem } from '../engine/types';
import { useGameStore } from '../store/gameStore';
import { getWaypointPosition } from './pathUtils';

function WasteMesh({ item }: { item: WasteItem }) {
  const meshRef = useRef<THREE.Group>(null);
  const pos = getWaypointPosition(item.waypointIndex);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = 0.05 + Math.sin(clock.elapsedTime * 2.5 + item.waypointIndex) * 0.04;
      meshRef.current.rotation.y = clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={meshRef} position={[pos.x, 0.05, pos.z]}>
      {item.tipo === 'garrafa' && (
        <group>
          <mesh castShadow rotation={[0.4, 0.2, 1.2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.35, 8]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
      )}

      {item.tipo === 'pneu' && (
        <mesh castShadow rotation={[Math.PI / 2, 0.3, 0]}>
          <torusGeometry args={[0.22, 0.09, 8, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      )}

      {item.tipo === 'entulho' && (
        <group>
          <mesh castShadow position={[-0.1, 0, 0]}>
            <boxGeometry args={[0.28, 0.2, 0.25]} />
            <meshStandardMaterial color="#78716c" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0.12, 0.05, 0.08]}>
            <boxGeometry args={[0.2, 0.25, 0.18]} />
            <meshStandardMaterial color="#a8a29e" roughness={0.9} />
          </mesh>
        </group>
      )}

      {item.tipo === 'plastico' && (
        <mesh castShadow rotation={[0.2, 0.5, 0.1]}>
          <boxGeometry args={[0.35, 0.15, 0.3]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.4} />
        </mesh>
      )}

      {/* Indicador de alerta de dejeto */}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#b91c1c" />
      </mesh>
    </group>
  );
}

export function WasteTokens() {
  const currentWaypoint = useGameStore((s) => s.state.currentWaypoint);
  const activeWaste = useGameStore((s) => s.state.activeWaste);

  // Exibe apenas dejetos que ainda não foram ultrapassados ou estão no waypoint atual
  const visibleWaste = INITIAL_WASTE_ITEMS.filter((w) => {
    if (w.waypointIndex < currentWaypoint) return false;
    if (w.waypointIndex === currentWaypoint && !activeWaste) return false;
    return true;
  });

  return (
    <group>
      {visibleWaste.map((item) => (
        <WasteMesh key={item.id} item={item} />
      ))}
    </group>
  );
}
