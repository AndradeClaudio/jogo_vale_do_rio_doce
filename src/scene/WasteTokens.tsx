import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { INITIAL_WASTE_ITEMS } from '../data/riverLayout';
import type { WasteItem } from '../engine/types';
import { useGameStore } from '../store/gameStore';
import { getWaypointPosition } from './pathUtils';

interface WasteMeshProps {
  item: WasteItem;
  isActive: boolean;
  onCollect: () => void;
}

function WasteMesh({ item, isActive, onCollect }: WasteMeshProps) {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const pos = getWaypointPosition(item.waypointIndex);

  useFrame(({ clock }, delta) => {
    if (meshRef.current) {
      if (isCollecting) {
        // Animação de recolhimento: sobe rodando e encolhe rumo ao barco
        meshRef.current.position.y += delta * 2.5;
        meshRef.current.rotation.y += delta * 12;
        meshRef.current.scale.multiplyScalar(0.92);
      } else {
        meshRef.current.position.y =
          0.06 + Math.sin(clock.elapsedTime * 2.8 + item.waypointIndex) * 0.05;
        meshRef.current.rotation.y = clock.elapsedTime * 0.8;
      }
    }

    if (ringRef.current && isActive) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 5) * 0.2;
      ringRef.current.scale.setScalar(pulse);
    }
  });

  const handleTap = (e?: React.MouseEvent | THREE.Event) => {
    if (e && 'stopPropagation' in e) {
      e.stopPropagation();
    }
    if (!isActive || isCollecting) return;
    setIsCollecting(true);
    setTimeout(() => {
      onCollect();
    }, 350);
  };

  return (
    <group
      ref={meshRef}
      position={[pos.x, 0.06, pos.z]}
      onClick={handleTap}
      onPointerDown={handleTap}
      scale={isActive ? [1.4, 1.4, 1.4] : [1, 1, 1]}
    >
      {/* Anel de alerta pulsante sobre as águas azuis quando o lixo está ativo */}
      {isActive && (
        <mesh ref={ringRef} position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 1.2, 32]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Modelo 3D dos Dejetos */}
      {item.tipo === 'garrafa' && (
        <group>
          <mesh castShadow rotation={[0.4, 0.2, 1.2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.42, 8]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.75} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
      )}

      {item.tipo === 'pneu' && (
        <mesh castShadow rotation={[Math.PI / 2, 0.3, 0]}>
          <torusGeometry args={[0.26, 0.11, 8, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      )}

      {item.tipo === 'entulho' && (
        <group>
          <mesh castShadow position={[-0.12, 0, 0]}>
            <boxGeometry args={[0.34, 0.24, 0.3]} />
            <meshStandardMaterial color="#78716c" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0.14, 0.06, 0.1]}>
            <boxGeometry args={[0.24, 0.28, 0.22]} />
            <meshStandardMaterial color="#a8a29e" roughness={0.9} />
          </mesh>
        </group>
      )}

      {item.tipo === 'plastico' && (
        <mesh castShadow rotation={[0.2, 0.5, 0.1]}>
          <boxGeometry args={[0.4, 0.18, 0.35]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.4} />
        </mesh>
      )}

      {/* Botão Interativo 3D Flutuante para Toque Direto */}
      {isActive && !isCollecting && (
        <Html position={[0, 1.1, 0]} center distanceFactor={14}>
          <button
            className="btn-tap-clean-3d"
            onClick={handleTap}
            title="Clique ou toque para retirar o dejeto do rio"
          >
            👆 Toque para Retirar o Lixo!
          </button>
        </Html>
      )}
    </group>
  );
}

export function WasteTokens() {
  const currentWaypoint = useGameStore((s) => s.state.currentWaypoint);
  const activeWaste = useGameStore((s) => s.state.activeWaste);
  const phase = useGameStore((s) => s.state.phase);
  const dispatch = useGameStore((s) => s.dispatch);

  // Dejetos visíveis a partir do marco atual
  const visibleWaste = INITIAL_WASTE_ITEMS.filter((w) => {
    if (w.waypointIndex < currentWaypoint) return false;
    if (w.waypointIndex === currentWaypoint && !activeWaste) return false;
    return true;
  });

  return (
    <group>
      {visibleWaste.map((item) => {
        const isActive = phase === 'wasteEncounter' && activeWaste?.id === item.id;
        return (
          <WasteMesh
            key={item.id}
            item={item}
            isActive={isActive}
            onCollect={() => dispatch({ type: 'COLLECT_WASTE' })}
          />
        );
      })}
    </group>
  );
}
