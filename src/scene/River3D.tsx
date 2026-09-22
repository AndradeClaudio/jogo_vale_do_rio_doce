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
 * Constrói a lâmina d'água azul forte preenchendo a calha côncava do rio.
 */
function createBlueWaterGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  segments = 160,
  crossSegments = 6,
  width = 4.6,
  waterY = -0.14,
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
      const depthSag = -0.05 * (1 - factor * factor);

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
 * com água azul royal vibrante e reflexiva.
 */
function ConcaveLake({ x, z, radius, depth }: { x: number; z: number; radius: number; depth: number }) {
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

  return (
    <group position={[x, 0, z]}>
      {/* Leito arenoso côncavo */}
      <mesh geometry={bowlGeometry} receiveShadow>
        <meshStandardMaterial color="#574438" roughness={0.9} />
      </mesh>

      {/* Espelho d'água azul royal forte e vibrante */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.96, 36]} />
        <meshStandardMaterial
          color="#0a192f"
          emissive="#040d1a"
          emissiveIntensity={0.25}
          roughness={0.04}
          metalness={0.2}
          transparent
          opacity={0.97}
        />
      </mesh>
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

  const waterGeometry = useMemo(() => {
    return createBlueWaterGeometry(RIVER_CURVE, 160, 6, 4.6, -0.13);
  }, []);

  const waterMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Animação sutil do brilho azul das águas
  useFrame(({ clock }) => {
    if (waterMaterialRef.current) {
      const shimmer = Math.sin(clock.elapsedTime * 2) * 0.06;
      waterMaterialRef.current.emissiveIntensity = 0.38 + shimmer;
    }
  });

  return (
    <group>
      {/* 1. Leito do Rio Côncavo (curvado para dentro do terreno) */}
      <mesh geometry={riverBedGeometry} receiveShadow>
        <meshStandardMaterial color="#574438" roughness={0.9} />
      </mesh>

      {/* 2. Água com Azul Royal Mais Forte e Marcante */}
      <mesh geometry={waterGeometry}>
        <meshStandardMaterial
          ref={waterMaterialRef}
          color="#0a192f" // Azul muito escuro (Dark Navy / Midnight Blue)
          emissive="#040d1a" // Emissividade sutil azul muito escura
          emissiveIntensity={0.25}
          roughness={0.04}
          metalness={0.2}
          transparent
          opacity={0.97}
        />
      </mesh>

      {/* 3. Bacia de Lago Côncava em Mariana */}
      <ConcaveLake x={-18} z={14} radius={5.8} depth={0.9} />

      {/* 4. Grande Bacia de Lago Côncava no PERD */}
      <ConcaveLake x={-5.5} z={-3} radius={6.8} depth={1.0} />

      {/* 5. Grande Lago / Foz do Rio Doce */}
      <ConcaveLake x={16.5} z={-12.5} radius={6.2} depth={0.9} />

      {/* 6. Píers de atracamento */}
      {RIVER_WAYPOINTS.map((wp) => (
        <Dock key={wp.index} index={wp.index} />
      ))}
    </group>
  );
}
