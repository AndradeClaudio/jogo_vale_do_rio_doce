import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Water } from 'three-stdlib';
import { RIVER_WAYPOINTS } from '../data/riverLayout';
import { RIVER_CURVE, SUN_POSITION, getWaypointPosition, getWaypointTangent } from './pathUtils';

/** Bacias de lago ao longo do percurso, compartilhadas com o relevo do terreno. */
export const LAKES: { x: number; z: number; radius: number; depth: number }[] = [
  { x: -18, z: 14, radius: 5.8, depth: 0.9 },
  { x: -5.5, z: -3, radius: 6.8, depth: 1.0 },
  { x: 16.5, z: -12.5, radius: 6.2, depth: 0.9 },
];

/**
 * Textura de normais gerada em runtime (sem assets externos) para alimentar
 * o shader de água (three-stdlib Water), que já compõe 4 amostras dela em
 * escalas/deslocamentos diferentes para simular ondulação orgânica.
 */
function createWaterNormalTexture() {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const nx =
        Math.sin(x * 0.25) * Math.cos(y * 0.18) * 0.6 +
        Math.sin(x * 0.07 + y * 0.11) * 0.4;
      const ny =
        Math.cos(x * 0.16 + 1.7) * Math.sin(y * 0.23) * 0.6 +
        Math.cos(x * 0.045 - y * 0.09) * 0.4;
      const len = Math.sqrt(nx * nx + ny * ny + 1);
      data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      data[i + 2] = (1 / len) * 0.5 * 255 + 128;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Direção do sol usada pelo brilho especular da água, normalizada a partir
 * da mesma posição do sol do céu (Sky) e da luz direcional da cena.
 */
const WATER_SUN_DIRECTION = new THREE.Vector3(...SUN_POSITION).normalize();

/**
 * Constrói a geometria de um leito fluvial côncavo (esférico/curvado para dentro),
 * formando uma calha parabólica rebaixada no solo.
 */
function createConcaveRiverBedGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  segments = 160,
  crossSegments = 8,
  width = 5.2,
  maxDepth = 0.85,
) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const pt = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const perp = new THREE.Vector3(tan.z, 0, -tan.x).normalize();

    for (let j = 0; j <= crossSegments; j++) {
      const s = j / crossSegments;
      const factor = (s - 0.5) * 2;
      const offset = factor * (width / 2);
      // Depressão côncava parabólica: 0 nas margens, -maxDepth no fundo central
      const depth = -maxDepth * (1 - factor * factor);

      positions.push(
        pt.x + perp.x * offset,
        pt.y + depth,
        pt.z + perp.z * offset,
      );
      uvs.push(s, t * 16);
    }
  }

  const stride = crossSegments + 1;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < crossSegments; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Constrói a geometria da lâmina d'água do rio em ESPAÇO LOCAL DO PLANO
 * (x local = x mundo, y local = -z mundo, z local = 0), a convenção exigida
 * pelo shader de reflexo do three-stdlib Water (que assume a normal ao longo
 * do eixo Z local e espera que o mesh seja rotacionado -90° em X para alinhar
 * essa normal ao "para cima" do mundo). Como o rio é uma faixa sinuosa (não um
 * retângulo), construímos sua planta 2D nesse espaço local em vez de usar
 * PlaneGeometry.
 */
function createRiverWaterLocalGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  segments = 160,
  crossSegments = 6,
  width = 4.6,
) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const pt = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const perp = new THREE.Vector3(tan.z, 0, -tan.x).normalize();

    for (let j = 0; j <= crossSegments; j++) {
      const s = j / crossSegments;
      const factor = (s - 0.5) * 2;
      const offset = factor * (width / 2);
      const worldX = pt.x + perp.x * offset;
      const worldZ = pt.z + perp.z * offset;

      positions.push(worldX, -worldZ, 0);
      uvs.push(s, t * 16);
    }
  }

  const stride = crossSegments + 1;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < crossSegments; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Bacia de lago côncava (esférica para dentro / tigela invertida)
 * com água azul royal vibrante e reflexiva.
 */
function ConcaveLake({
  x,
  z,
  radius,
  depth,
  normalMap,
}: {
  x: number;
  z: number;
  radius: number;
  depth: number;
  normalMap: THREE.Texture;
}) {
  const bowlGeometry = useMemo(() => {
    const positions: number[] = [];
    const indices: number[] = [];
    const rings = 12;
    const segments = 32;

    for (let r = 0; r <= rings; r++) {
      const normR = r / rings;
      const curRadius = normR * radius;
      const curY = -depth * (1 - normR * normR);

      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        positions.push(
          Math.cos(theta) * curRadius,
          curY,
          Math.sin(theta) * curRadius,
        );
      }
    }

    const stride = segments + 1;
    for (let r = 0; r < rings; r++) {
      for (let s = 0; s < segments; s++) {
        const a = r * stride + s;
        const b = (r + 1) * stride + s;
        const c = (r + 1) * stride + (s + 1);
        const d = r * stride + (s + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [radius, depth]);

  const water = useMemo(() => {
    const w = new Water(new THREE.CircleGeometry(radius * 0.96, 40), {
      textureWidth: 256,
      textureHeight: 256,
      waterNormals: normalMap,
      sunDirection: WATER_SUN_DIRECTION,
      sunColor: '#fff4d9',
      waterColor: '#04101f',
      distortionScale: 1.6,
      alpha: 1,
      fog: true,
    });
    w.material.uniforms.size.value = 1.4;
    return w;
  }, [radius, normalMap]);

  useFrame((_, delta) => {
    water.material.uniforms.time.value += delta * 0.5;
  });

  return (
    <group position={[x, 0, z]}>
      {/* Leito arenoso côncavo */}
      <mesh geometry={bowlGeometry} receiveShadow>
        <meshStandardMaterial color="#574438" roughness={0.9} />
      </mesh>

      {/* Espelho d'água calmo, com ondulações, reflexo real e brilho de sol */}
      <primitive object={water} position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
    </group>
  );
}

/** Deck de madeira nos atracadouros com luminária e poste. */
function Dock({ index }: { index: number }) {
  const pos = getWaypointPosition(index);
  const tan = getWaypointTangent(index);
  const perp = new THREE.Vector3(tan.z, 0, -tan.x).normalize();
  const dockPos = pos.clone().add(perp.clone().multiplyScalar(2.2));
  const rotY = Math.atan2(tan.x, tan.z);

  return (
    <group position={[dockPos.x, 0.05, dockPos.z]} rotation={[0, rotY, 0]}>
      {/* Taboado do cais */}
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[1.5, 0.1, 1.1]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>
      {/* Pilares */}
      <mesh position={[-0.6, -0.25, -0.45]}>
        <cylinderGeometry args={[0.07, 0.07, 0.6, 8]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      <mesh position={[0.6, -0.25, -0.45]}>
        <cylinderGeometry args={[0.07, 0.07, 0.6, 8]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      {/* Poste do lampião */}
      <mesh position={[0.6, 0.5, 0.4]}>
        <cylinderGeometry args={[0.035, 0.035, 0.9, 8]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      {/* Luminária quente acolhedora */}
      <mesh position={[0.6, 0.98, 0.4]}>
        <sphereGeometry args={[0.1, 12, 10]} />
        <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

export function River3D() {
  const riverBedGeometry = useMemo(() => {
    return createConcaveRiverBedGeometry(RIVER_CURVE, 160, 8, 5.2, 0.85);
  }, []);

  const riverWaterGeometry = useMemo(() => {
    return createRiverWaterLocalGeometry(RIVER_CURVE, 160, 6, 4.6);
  }, []);

  const normalMap = useMemo(() => createWaterNormalTexture(), []);

  const riverWater = useMemo(() => {
    const w = new Water(riverWaterGeometry, {
      textureWidth: 256,
      textureHeight: 256,
      waterNormals: normalMap,
      sunDirection: WATER_SUN_DIRECTION,
      sunColor: '#fff4d9',
      waterColor: '#04101f',
      distortionScale: 2,
      alpha: 1,
      fog: true,
    });
    w.material.uniforms.size.value = 1.8;
    return w;
  }, [riverWaterGeometry, normalMap]);

  // Fluxo contínuo das águas do rio
  useFrame((_, delta) => {
    riverWater.material.uniforms.time.value += delta * 0.65;
  });

  return (
    <group>
      {/* 1. Leito do Rio Côncavo (curvado para dentro do terreno) */}
      <mesh geometry={riverBedGeometry} receiveShadow>
        <meshStandardMaterial color="#4a3728" roughness={0.95} />
      </mesh>

      {/* 2. Água do rio: ondulações animadas, reflexo real do ambiente e brilho de sol */}
      <primitive object={riverWater} position={[0, -0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />

      {/* 3. Bacia de Lago Côncava em Mariana */}
      <ConcaveLake x={LAKES[0].x} z={LAKES[0].z} radius={LAKES[0].radius} depth={LAKES[0].depth} normalMap={normalMap} />

      {/* 4. Grande Bacia de Lago Côncava no PERD */}
      <ConcaveLake x={LAKES[1].x} z={LAKES[1].z} radius={LAKES[1].radius} depth={LAKES[1].depth} normalMap={normalMap} />

      {/* 5. Grande Lago / Foz do Rio Doce */}
      <ConcaveLake x={LAKES[2].x} z={LAKES[2].z} radius={LAKES[2].radius} depth={LAKES[2].depth} normalMap={normalMap} />

      {/* 6. Píers de atracamento */}
      {RIVER_WAYPOINTS.map((wp) => (
        <Dock key={wp.index} index={wp.index} />
      ))}
    </group>
  );
}
