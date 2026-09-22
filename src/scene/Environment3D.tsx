// Coordenadas das árvores nativas nas margens do vale (afastadas do leito do rio)
const TREES_COORDS: [number, number][] = [
  [-22, 19], [-16, 19], [-11, 18], [-5, 16], [2, 17], [8, 15],
  [18, 11], [18, 0], [17, -18], [11, -19], [4, -19], [-4, -18],
  [-14, -18], [-22, -18], [-24, -3], [-24, 6], [-18, 5], [-12, 4],
  [-6, 2], [0, -10], [6, -8], [12, -7],
];

// Montanhas mineiras distantes no horizonte para compor a paisagem sem bloquear o rio
const DISTANT_MOUNTAINS: [number, number, number, number][] = [
  [-45, 25, 14, 9],
  [-25, 42, 16, 11],
  [10, 45, 18, 12],
  [40, 30, 15, 10],
  [45, -15, 16, 11],
  [25, -42, 18, 12],
  [-15, -45, 17, 11],
  [-42, -25, 15, 9],
];

function NativeTree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Tronco */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 0.9, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Copa */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <coneGeometry args={[0.7, 1.5, 7]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <coneGeometry args={[0.5, 1.1, 7]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} />
      </mesh>
    </group>
  );
}

function DistantRidge({ x, z, radius, height }: { x: number; z: number; radius: number; height: number }) {
  return (
    <mesh position={[x, height / 2 - 1, z]} receiveShadow>
      <coneGeometry args={[radius, height, 8]} />
      <meshStandardMaterial color="#3f6212" roughness={0.9} />
    </mesh>
  );
}

export function Environment3D() {
  return (
    <group>
      {/* Terreno verde suave do Vale do Rio Doce */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#4ade80" roughness={0.85} />
      </mesh>

      {/* Montanhas distantes no horizonte */}
      {DISTANT_MOUNTAINS.map(([x, z, r, h], i) => (
        <DistantRidge key={i} x={x} z={z} radius={r} height={h} />
      ))}

      {/* Árvores ao longo das margens */}
      {TREES_COORDS.map(([x, z], i) => (
        <NativeTree key={i} x={x} z={z} />
      ))}

      {/* Iluminação suave e vibrante */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[25, 35, 25]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <hemisphereLight args={['#bae6fd', '#dcfce7', 0.5]} />
    </group>
  );
}
