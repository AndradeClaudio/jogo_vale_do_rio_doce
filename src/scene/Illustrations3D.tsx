import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LAKES } from './River3D';
import { RIVER_CURVE } from './pathUtils';

// ---------- Casinhas Coloniais Tradicionais de Minas Gerais ----------

interface HouseProps {
  x: number;
  z: number;
  rotation?: number;
  wallColor?: string;
  doorColor?: string;
}

function ColonialHouse({
  x,
  z,
  rotation = 0,
  wallColor = '#f8fafc',
  doorColor = '#0284c7',
}: HouseProps) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      {/* Base da casa caiada */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.4, 1.0, 1.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} />
      </mesh>

      {/* Rodapé colonial colorido */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.42, 0.16, 1.22]} />
        <meshStandardMaterial color={doorColor} roughness={0.6} />
      </mesh>

      {/* Telhado colonial cerâmico terracota */}
      <group position={[0, 1.0, 0]}>
        <mesh castShadow position={[0, 0.35, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.2, 0.7, 4]} />
          <meshStandardMaterial color="#dc2626" roughness={0.8} />
        </mesh>
      </group>

      {/* Porta colonial */}
      <mesh position={[0, 0.35, 0.61]}>
        <planeGeometry args={[0.3, 0.55]} />
        <meshStandardMaterial color={doorColor} roughness={0.5} />
      </mesh>

      {/* Janelinhas */}
      <mesh position={[-0.4, 0.55, 0.61]}>
        <planeGeometry args={[0.22, 0.25]} />
        <meshStandardMaterial color={doorColor} roughness={0.5} />
      </mesh>
      <mesh position={[0.4, 0.55, 0.61]}>
        <planeGeometry args={[0.22, 0.25]} />
        <meshStandardMaterial color={doorColor} roughness={0.5} />
      </mesh>
    </group>
  );
}

// ---------- Aguapés e Vitórias-Régias Flutuantes ----------

const WATER_LILIES_COORDS: [number, number, number][] = [
  [-16, 12, 0.35],
  [-17, 13.5, 0.4],
  [-19, 14.5, 0.3],
  [-7, 13, 0.45],
  [-4, 8, 0.38],
  [1, 9.5, 0.4],
  [7, 6.5, 0.35],
  [13, 3, 0.4],
  [11, -1.5, 0.36],
  [5, -3.5, 0.42],
  [-4, -4.5, 0.5],
  [-6.5, -2, 0.45],
  [-8, -1.5, 0.38],
  [-10, -8, 0.4],
  [-3, -11, 0.38],
  [5, -12, 0.45],
  [14, -13, 0.4],
];

function WaterLily({ x, z, scale = 0.4 }: { x: number; z: number; scale?: number }) {
  const lilyRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (lilyRef.current) {
      lilyRef.current.position.y = -0.12 + Math.sin(clock.elapsedTime * 1.8 + x) * 0.015;
      lilyRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5 + z) * 0.1;
    }
  });

  return (
    <group ref={lilyRef} position={[x, -0.12, z]} scale={[scale, scale, scale]}>
      {/* Folha redonda com fenda tradicional */}
      <mesh rotation={[-Math.PI / 2, 0, 0.4]}>
        <circleGeometry args={[1, 24, 0, Math.PI * 1.85]} />
        <meshStandardMaterial color="#16a34a" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Florzinha central */}
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#fbcfe8" emissive="#f472b6" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// ---------- Pedras Arredondadas do Leito do Rio ----------

const RIVER_ROCKS_COORDS: [number, number, number, number][] = [
  [-15, 9.5, 0.4, 0.6],
  [-11, 14, 0.5, 0.7],
  [-5, 7.5, 0.45, 0.5],
  [1, 13, 0.6, 0.8],
  [6, 10, 0.4, 0.6],
  [11, 6, 0.5, 0.7],
  [15, -2, 0.55, 0.75],
  [9, -4.5, 0.4, 0.6],
  [3, -1, 0.5, 0.7],
  [-4, -1.2, 0.45, 0.6],
  [-10, -4.5, 0.6, 0.8],
  [-6, -12, 0.5, 0.65],
  [1, -14, 0.6, 0.75],
  [10, -9.5, 0.45, 0.6],
  [15, -14.5, 0.5, 0.7],
];

function RiverRock({ x, z, scaleY, scaleXZ }: { x: number; z: number; scaleY: number; scaleXZ: number }) {
  return (
    <mesh position={[x, scaleY * 0.4 - 0.05, z]} scale={[scaleXZ, scaleY, scaleXZ]} castShadow receiveShadow>
      <sphereGeometry args={[0.5, 10, 8]} />
      <meshStandardMaterial color="#78716c" roughness={0.9} />
    </mesh>
  );
}

// ---------- Vilarejos e Casarios Coloniais ----------

const VILLAGE_HOUSES: HouseProps[] = [
  // Mariana (início da rota)
  { x: -21, z: 12, rotation: 0.3, wallColor: '#f8fafc', doorColor: '#0284c7' },
  { x: -22, z: 15, rotation: -0.2, wallColor: '#fef08a', doorColor: '#b45309' },
  { x: -19, z: 17, rotation: -0.6, wallColor: '#fce7f3', doorColor: '#be185d' },

  // Povoado das Lavras
  { x: -11, z: 15, rotation: 0.1, wallColor: '#dcfce7', doorColor: '#15803d' },
  { x: -8, z: 15.5, rotation: -0.4, wallColor: '#fef9c3', doorColor: '#a16207' },

  // Porto Histórico das Minas
  { x: 12, z: 10, rotation: -0.8, wallColor: '#e0f2fe', doorColor: '#0369a1' },
  { x: 14, z: 8, rotation: -1.1, wallColor: '#fae8ff', doorColor: '#7e22ce' },

  // Vila da Memória e PERD
  { x: 2, z: -7, rotation: 0.5, wallColor: '#ffedd5', doorColor: '#c2410c' },
  { x: -4, z: -6.5, rotation: 0.2, wallColor: '#f1f5f9', doorColor: '#047857' },

  // Foz / Litoral
  { x: 18, z: -9.5, rotation: -0.4, wallColor: '#dbeafe', doorColor: '#1d4ed8' },
  { x: 19, z: -15, rotation: 0.6, wallColor: '#fef08a', doorColor: '#b45309' },
];

const RIVER_SAMPLES_FOR_LAND = Array.from({ length: 49 }, (_, i) => RIVER_CURVE.getPointAt(i / 48));
const RIVER_HALF_WIDTH = 2.8;
const LAND_SAFETY_MARGIN = 2.2;

/**
 * Empurra um ponto (x, z) para fora d'água caso caia dentro de um lago ou do
 * canal do rio, preservando a direção original a partir do centro/curva mais
 * próxima. As casinhas são posicionadas "a olho" perto dos vilarejos e podem
 * cair dentro do círculo de um lago; isso garante que fiquem sempre em terra.
 */
function keepOnDryLand(x: number, z: number): [number, number] {
  let px = x;
  let pz = z;

  for (const lake of LAKES) {
    const dx = px - lake.x;
    const dz = pz - lake.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const safeDist = lake.radius + LAND_SAFETY_MARGIN;
    if (dist < safeDist) {
      const angle = dist > 0.001 ? Math.atan2(dz, dx) : 0;
      px = lake.x + Math.cos(angle) * safeDist;
      pz = lake.z + Math.sin(angle) * safeDist;
    }
  }

  let minDist = Infinity;
  let nearest = RIVER_SAMPLES_FOR_LAND[0];
  for (const p of RIVER_SAMPLES_FOR_LAND) {
    const dx = px - p.x;
    const dz = pz - p.z;
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d < minDist) {
      minDist = d;
      nearest = p;
    }
  }
  const safeRiverDist = RIVER_HALF_WIDTH + LAND_SAFETY_MARGIN;
  if (minDist < safeRiverDist) {
    const dx = px - nearest.x;
    const dz = pz - nearest.z;
    const angle = minDist > 0.001 ? Math.atan2(dz, dx) : 0;
    px = nearest.x + Math.cos(angle) * safeRiverDist;
    pz = nearest.z + Math.sin(angle) * safeRiverDist;
  }

  return [px, pz];
}

const SAFE_VILLAGE_HOUSES: HouseProps[] = VILLAGE_HOUSES.map((house) => {
  const [x, z] = keepOnDryLand(house.x, house.z);
  return { ...house, x, z };
});

export function Illustrations3D() {
  return (
    <group>
      {/* 1. Casinhas Coloniais Ilustradas de Minas Gerais (sempre em terra firme) */}
      {SAFE_VILLAGE_HOUSES.map((house, i) => (
        <ColonialHouse key={`house_${i}`} {...house} />
      ))}

      {/* 2. Aguapés e Vitórias-Régias Flutuando na Água Azul */}
      {WATER_LILIES_COORDS.map(([x, z, s], i) => (
        <WaterLily key={`lily_${i}`} x={x} z={z} scale={s} />
      ))}

      {/* 3. Pedras Arredondadas do Rio */}
      {RIVER_ROCKS_COORDS.map(([x, z, sy, sxz], i) => (
        <RiverRock key={`rock_${i}`} x={x} z={z} scaleY={sy} scaleXZ={sxz} />
      ))}
    </group>
  );
}
