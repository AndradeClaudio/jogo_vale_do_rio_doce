import { useMemo } from 'react';
import * as THREE from 'three';
import { RIVER_WAYPOINTS } from '../data/riverLayout';
import { RIVER_CURVE, getWaypointPosition, getWaypointTangent } from './pathUtils';

/** Deck de madeira no atracadouro de cada waypoint. */
function Dock({ index }: { index: number }) {
  const pos = getWaypointPosition(index);
  const tan = getWaypointTangent(index);
  const perp = new THREE.Vector3(tan.z, 0, -tan.x).normalize();
  const dockPos = pos.clone().add(perp.clone().multiplyScalar(1.2));
  const rotY = Math.atan2(tan.x, tan.z);

  return (
    <group position={[dockPos.x, 0.05, dockPos.z]} rotation={[0, rotY, 0]}>
      {/* Pranchas de madeira do cais */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {/* Pilares fincados no leito */}
      <mesh position={[-0.45, -0.2, -0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      <mesh position={[0.45, -0.2, -0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      {/* Poste com luminária */}
      <mesh position={[0.45, 0.4, 0.25]}>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      <mesh position={[0.45, 0.75, 0.25]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fef08a" emissive="#f59e0b" />
      </mesh>
    </group>
  );
}

export function River3D() {
  // Gera geometria tubular suave acompanhando a curva do Rio Doce
  const waterGeometry = useMemo(() => {
    return new THREE.TubeGeometry(RIVER_CURVE, 120, 1.8, 14, false);
  }, []);

  // Leito arenoso por baixo da água
  const riverBedGeometry = useMemo(() => {
    return new THREE.TubeGeometry(RIVER_CURVE, 120, 2.3, 14, false);
  }, []);

  return (
    <group>
      {/* Leito do rio em terra e pedras */}
      <mesh geometry={riverBedGeometry} position={[0, -0.25, 0]} receiveShadow>
        <meshStandardMaterial color="#854d0e" roughness={0.9} />
      </mesh>

      {/* Água corrente do Rio Doce */}
      <mesh geometry={waterGeometry} position={[0, -0.1, 0]}>
        <meshStandardMaterial
          color="#0d9488"
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Atracadouros e píers em cada marco */}
      {RIVER_WAYPOINTS.map((wp) => (
        <Dock key={wp.index} index={wp.index} />
      ))}
    </group>
  );
}
