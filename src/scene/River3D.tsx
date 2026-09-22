import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RIVER_WAYPOINTS } from '../data/riverLayout';
import { RIVER_CURVE, getWaypointPosition, getWaypointTangent } from './pathUtils';

/**
 * Constrói a geometria de um leito fluvial côncavo (esférico/curvado para dentro),
 * formando uma calha parabólica rebaixada no solo.
 */
function createConcaveRiverBedGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  segments = 160,
  crossSegments = 8,
  width = 5.0,
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
      const s = j / crossSegments; // 0 a 1
      const factor = (s - 0.5) * 2; // -1 a +1
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
 * Constrói a lâmina d'água azul límpida preenchendo a calha côncava do rio.
 */
function createBlueWaterGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  segments = 160,
  crossSegments = 6,
  width = 4.4,
  waterY = -0.16,
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
      // Leve afundamento no centro para dar sensação de profundidade azul
      const depthSag = -0.06 * (1 - factor * factor);

      positions.push(
        pt.x + perp.x * offset,
        waterY + depthSag,
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
 * Bacia de lago côncava (esférica para dentro / tigela invertida)
 * com água azul cintilante.
 */
function ConcaveLake({ x, z, radius, depth }: { x: number; z: number; radius: number; depth: number }) {
  // Bacia côncava do fundo do lago
  const bowlGeometry = useMemo(() => {
    const positions: number[] = [];
    const indices: number[] = [];
    const rings = 12;
    const segments = 32;

    for (let r = 0; r <= rings; r++) {
      const normR = r / rings;
      const curRadius = normR * radius;
      // Parábola côncava: -depth no centro, 0 na borda
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

  return (
    <group position={[x, 0, z]}>
      {/* Leito côncavo de areia e pedras */}
      <mesh geometry={bowlGeometry} receiveShadow>
        <meshStandardMaterial color="#92400e" roughness={0.9} />
      </mesh>

      {/* Espelho d'água azul vivo do lago */}
      <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.95, 36]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={0.3}
          roughness={0.06}
          metalness={0.15}
          transparent
          opacity={0.92}
        />
      </mesh>
    </group>
  );
}

/** Deck de madeira rústico no atracadouro de cada waypoint. */
function Dock({ index }: { index: number }) {
  const pos = getWaypointPosition(index);
  const tan = getWaypointTangent(index);
  const perp = new THREE.Vector3(tan.z, 0, -tan.x).normalize();
  const dockPos = pos.clone().add(perp.clone().multiplyScalar(2.2));
  const rotY = Math.atan2(tan.x, tan.z);

  return (
    <group position={[dockPos.x, 0.05, dockPos.z]} rotation={[0, rotY, 0]}>
      {/* Pranchas do pier */}
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[1.4, 0.08, 1.0]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {/* Pilares no solo */}
      <mesh position={[-0.55, -0.25, -0.4]}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      <mesh position={[0.55, -0.25, -0.4]}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      {/* Lampião de atracamento */}
      <mesh position={[0.55, 0.45, 0.35]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
      <mesh position={[0.55, 0.88, 0.35]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

export function River3D() {
  const riverBedGeometry = useMemo(() => {
    return createConcaveRiverBedGeometry(RIVER_CURVE, 160, 8, 5.2, 0.85);
  }, []);

  const waterGeometry = useMemo(() => {
    return createBlueWaterGeometry(RIVER_CURVE, 160, 6, 4.5, -0.15);
  }, []);

  const waterMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Leve ondulação na água azul com o tempo
  useFrame(({ clock }) => {
    if (waterMaterialRef.current) {
      const wave = Math.sin(clock.elapsedTime * 1.5) * 0.05;
      waterMaterialRef.current.emissiveIntensity = 0.25 + wave;
    }
  });

  return (
    <group>
      {/* 1. Leito do Rio Côncavo (esférico/curvado para dentro do terreno) */}
      <mesh geometry={riverBedGeometry} receiveShadow>
        <meshStandardMaterial color="#a16207" roughness={0.9} />
      </mesh>

      {/* 2. Água Azul Brilhante do Rio Doce */}
      <mesh geometry={waterGeometry}>
        <meshStandardMaterial
          ref={waterMaterialRef}
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={0.25}
          roughness={0.06}
          metalness={0.15}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* 3. Bacia de Lago Côncava em Mariana (Nascentes) */}
      <ConcaveLake x={-18} z={14} radius={5.5} depth={0.9} />

      {/* 4. Grande Bacia de Lago Côncava no Parque Estadual do Rio Doce (Lagoas do PERD) */}
      <ConcaveLake x={-5.5} z={-3} radius={6.5} depth={1.0} />

      {/* 5. Grande Lago / Foz do Rio Doce */}
      <ConcaveLake x={16.5} z={-12.5} radius={6.0} depth={0.9} />

      {/* 6. Píers de atracamento em cada marco */}
      {RIVER_WAYPOINTS.map((wp) => (
        <Dock key={wp.index} index={wp.index} />
      ))}
    </group>
  );
}
