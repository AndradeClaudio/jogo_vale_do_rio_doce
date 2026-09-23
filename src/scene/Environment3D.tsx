import { useMemo } from 'react';
import * as THREE from 'three';
import { LAKES } from './River3D';
import { RIVER_CURVE, SUN_POSITION } from './pathUtils';

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

// Pseudo-aleatório determinístico (0..1) a partir de coordenadas, sem dependências externas
function hash2(x: number, z: number): number {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

// Ruído fractal leve (soma de senoides em frequências crescentes) usado para relevo e mosqueado da grama
function fakeNoise(x: number, z: number): number {
  return (
    Math.sin(x * 0.15) * Math.cos(z * 0.13) * 0.5 +
    Math.sin(x * 0.37 + 1.3) * Math.cos(z * 0.29 + 0.7) * 0.25 +
    Math.sin(x * 0.8 + 3.1) * Math.cos(z * 0.6 + 2.2) * 0.125
  );
}

/**
 * Terreno com relevo suave (colinas do vale) e grama mosqueada via cor de vértice.
 * A altura é anulada (smoothstep) perto do rio e dos lagos para nunca invadir a água
 * nem descolar cais, casas e árvores plantados a y=0 junto à margem.
 */
function createTerrainGeometry(size: number, segments: number) {
  const half = size / 2;
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const riverSamples = Array.from({ length: 49 }, (_, i) => RIVER_CURVE.getPointAt(i / 48));

  const grassDeep = new THREE.Color('#3f8f43');
  const grassLight = new THREE.Color('#7bc95f');
  const bankMud = new THREE.Color('#8a7148');
  const flattenRadius = 5.5;
  const blendRadius = 12;
  const bankRadius = 2.2; // faixa estreita de barranco: mergulha perto da água, sobe logo em seguida

  for (let iz = 0; iz <= segments; iz++) {
    const z = -half + (iz / segments) * size;
    for (let ix = 0; ix <= segments; ix++) {
      const x = -half + (ix / segments) * size;

      let minDist = Infinity;
      for (const p of riverSamples) {
        const dx = x - p.x;
        const dz = z - p.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        if (d < minDist) minDist = d;
      }
      for (const lake of LAKES) {
        const dx = x - lake.x;
        const dz = z - lake.z;
        const d = Math.sqrt(dx * dx + dz * dz) - lake.radius;
        if (d < minDist) minDist = d;
      }

      const t = THREE.MathUtils.clamp((minDist - flattenRadius) / (blendRadius - flattenRadius), 0, 1);
      const smooth = t * t * (3 - 2 * t);
      const n = fakeNoise(x, z);
      const noiseHeight = n * 0.35 * smooth;

      // Perto do rio/lagos o terreno mergulha bem abaixo do leito/bacia (que são
      // meshes separados) para nunca "vazar" por cima da água; a poucos metros
      // da margem ele já volta ao relevo normal (barranco estreito, não uma
      // encosta longa) para não obrigar casas/árvores a ficarem longe da água.
      const bankT = THREE.MathUtils.clamp(minDist / bankRadius, 0, 1);
      const bankSmooth = bankT * bankT * (3 - 2 * bankT);
      const bankDepth = -1.4;
      const height = THREE.MathUtils.lerp(bankDepth, noiseHeight, bankSmooth);

      const bankFactor = 1 - bankSmooth;

      positions.push(x, height, z);

      const grassMix = THREE.MathUtils.clamp((n + 0.9) / 1.8, 0, 1);
      const col = grassDeep.clone().lerp(grassLight, grassMix);
      col.lerp(bankMud, bankFactor * 0.45);
      colors.push(col.r, col.g, col.b);
    }
  }

  const stride = segments + 1;
  for (let iz = 0; iz < segments; iz++) {
    for (let ix = 0; ix < segments; ix++) {
      const a = iz * stride + ix;
      const b = (iz + 1) * stride + ix;
      const c = (iz + 1) * stride + (ix + 1);
      const d = iz * stride + (ix + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

function NativeTree({ x, z }: { x: number; z: number }) {
  const jitter = hash2(x, z);
  const jitter2 = hash2(x + 91.7, z - 47.3);
  const scale = 0.85 + jitter * 0.35;
  const rotation = jitter2 * Math.PI * 2;
  const canopyColor = useMemo(
    () => new THREE.Color('#15803d').lerp(new THREE.Color('#166534'), jitter),
    [jitter],
  );

  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]} scale={[scale, scale, scale]}>
      {/* Tronco */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 0.9, 7]} />
        <meshStandardMaterial color="#5a3a1e" roughness={0.95} />
      </mesh>
      {/* Copa */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <coneGeometry args={[0.7, 1.5, 8]} />
        <meshStandardMaterial color={canopyColor} roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <coneGeometry args={[0.5, 1.1, 8]} />
        <meshStandardMaterial color="#16a34a" roughness={0.85} />
      </mesh>
    </group>
  );
}

function DistantRidge({ x, z, radius, height }: { x: number; z: number; radius: number; height: number }) {
  const dist = Math.sqrt(x * x + z * z);
  const hazeAmount = THREE.MathUtils.clamp((dist - 35) / 40, 0, 1);
  const color = useMemo(
    () => new THREE.Color('#3f6212').lerp(new THREE.Color('#c9d8dc'), hazeAmount),
    [hazeAmount],
  );

  return (
    <mesh position={[x, height / 2 - 1, z]} receiveShadow>
      <coneGeometry args={[radius, height, 10]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

export function Environment3D() {
  const terrainGeometry = useMemo(() => createTerrainGeometry(130, 84), []);

  return (
    <group>
      {/* Terreno com relevo suave e grama mosqueada do Vale do Rio Doce */}
      <mesh geometry={terrainGeometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.92} />
      </mesh>

      {/* Montanhas distantes no horizonte, com perspectiva atmosférica */}
      {DISTANT_MOUNTAINS.map(([x, z, r, h], i) => (
        <DistantRidge key={i} x={x} z={z} radius={r} height={h} />
      ))}

      {/* Árvores ao longo das margens, com variação natural de porte e tom */}
      {TREES_COORDS.map(([x, z], i) => (
        <NativeTree key={i} x={x} z={z} />
      ))}

      {/* Iluminação solar direcional (alinhada ao céu) com sombras suaves */}
      <ambientLight intensity={0.32} />
      <directionalLight
        position={SUN_POSITION}
        intensity={1.85}
        color="#fff4d9"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0015}
      />
      <hemisphereLight args={['#bcd7e0', '#4b7a3f', 0.42]} />
    </group>
  );
}
