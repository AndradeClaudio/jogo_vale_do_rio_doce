import * as THREE from 'three';

const TREES_COORDS: [number, number][] = [
  [-22, 16], [-20, 8], [-16, 17], [-12, 16], [-10, 8], [-6, 15],
  [-2, 6], [2, 15], [6, 4], [10, 12], [14, 11], [18, 2],
  [16, -5], [10, -6], [4, 1], [-2, -8], [-8, 0], [-14, -2],
  [-16, -10], [-12, -15], [-5, -16], [3, -15], [10, -15], [20, -10],
];

const HILLS_COORDS: [number, number, number, number][] = [
  [-25, 10, 6, 4],
  [-20, 22, 8, 5],
  [0, 20, 9, 6],
  [22, 12, 8, 5],
  [22, -4, 7, 4.5],
  [15, -20, 9, 5.5],
  [-12, -22, 10, 6],
  [-24, -12, 8, 4],
];

function Tree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 6]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <coneGeometry args={[0.65, 1.4, 7]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <coneGeometry args={[0.45, 1.0, 7]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Hill({ x, z, radius, height }: { x: number; z: number; radius: number; height: number }) {
  return (
    <mesh position={[x, height / 2 - 0.5, z]} receiveShadow>
      <sphereGeometry args={[radius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#4d7c0f" roughness={0.9} />
    </mesh>
  );
}

export function Environment3D() {
  return (
    <group>
      {/* Plano de base verde do Vale do Rio Doce */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#65a30d" roughness={0.8} />
      </mesh>

      {/* Relevo das montanhas mineiras */}
      {HILLS_COORDS.map(([x, z, r, h], i) => (
        <Hill key={i} x={x} z={z} radius={r} height={h} />
      ))}

      {/* Vegetação nativa */}
      {TREES_COORDS.map(([x, z], i) => (
        <Tree key={i} x={x} z={z} />
      ))}

      {/* Iluminação tropical brasileira */}
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[20, 30, 20]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
      />
    </group>
  );
}
