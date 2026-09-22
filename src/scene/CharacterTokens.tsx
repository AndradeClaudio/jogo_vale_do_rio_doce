import * as THREE from 'three';
import { RIVER_WAYPOINTS } from '../data/riverLayout';
import type { CharacterId } from '../engine/types';
import { getWaypointPosition, getWaypointTangent } from './pathUtils';

function CharacterFigure({ type }: { type: CharacterId }) {
  let shirtColor = '#16a34a'; // Agricultor
  let headwearColor = '#eab308'; // Palha

  if (type === 'pescador') {
    shirtColor = '#d97706';
    headwearColor = '#78716c';
  } else if (type === 'artesao') {
    shirtColor = '#dc2626';
    headwearColor = '#b91c1c';
  } else if (type === 'guia') {
    shirtColor = '#059669';
    headwearColor = '#ca8a04';
  } else if (type === 'biologo') {
    shirtColor = '#0284c7';
    headwearColor = '#f8fafc';
  }

  return (
    <group position={[0, 0.45, 0]}>
      {/* Corpo */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <capsuleGeometry args={[0.16, 0.35, 6, 10]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      {/* Cabeça */}
      <mesh castShadow position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.13, 14, 10]} />
        <meshStandardMaterial color="#fcd7b0" />
      </mesh>
      {/* Chapéu ou adereço */}
      <mesh position={[0, 0.82, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.16, 0.08, 12]} />
        <meshStandardMaterial color={headwearColor} />
      </mesh>
    </group>
  );
}

export function CharacterTokens() {
  const characterWaypoints = RIVER_WAYPOINTS.filter((wp) => wp.tipo === 'personagem' && wp.characterId);

  return (
    <group>
      {characterWaypoints.map((wp) => {
        const pos = getWaypointPosition(wp.index);
        const tan = getWaypointTangent(wp.index);
        const perp = new THREE.Vector3(tan.z, 0, -tan.x).normalize();
        const charPos = pos.clone().add(perp.clone().multiplyScalar(1.2));
        const rotY = Math.atan2(-perp.x, -perp.z);

        return (
          <group key={wp.index} position={[charPos.x, 0.1, charPos.z]} rotation={[0, rotY, 0]}>
            <CharacterFigure type={wp.characterId!} />
          </group>
        );
      })}
    </group>
  );
}
