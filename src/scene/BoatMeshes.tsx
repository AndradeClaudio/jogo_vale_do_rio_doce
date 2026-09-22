import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BoatTier } from '../engine/types';

// ---------- Visualizador de Rachaduras 3D no Casco ----------

function DamageCracks({ cracks }: { cracks: number }) {
  const bubbleRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (bubbleRef.current) {
      bubbleRef.current.children.forEach((b, i) => {
        const t = (clock.elapsedTime * 2 + i * 0.4) % 1;
        b.position.y = 0.05 + t * 0.4;
        b.scale.setScalar(0.4 + t * 0.8);
        const mat = (b as THREE.Mesh).material as THREE.MeshStandardMaterial;
        mat.opacity = (1 - t) * 0.8;
      });
    }
  });

  if (cracks <= 0) return null;

  return (
    <group position={[0, 0.1, 0]}>
      {/* 1ª Rachadura: Lateral bombordo */}
      {cracks >= 1 && (
        <mesh position={[-0.32, 0.12, 0.2]} rotation={[0.2, 0.1, 0.4]}>
          <boxGeometry args={[0.04, 0.25, 0.04]} />
          <meshStandardMaterial color="#3b0764" roughness={0.9} />
        </mesh>
      )}

      {/* 2ª Rachadura: Lateral boreste */}
      {cracks >= 2 && (
        <mesh position={[0.32, 0.14, -0.3]} rotation={[-0.3, -0.2, -0.5]}>
          <boxGeometry args={[0.04, 0.28, 0.05]} />
          <meshStandardMaterial color="#450a0a" roughness={0.9} />
        </mesh>
      )}

      {/* 3ª Rachadura: Proa central profunda com infiltração */}
      {cracks >= 3 && (
        <group position={[0, 0.16, 0.55]}>
          <mesh rotation={[0.4, 0, 0.3]}>
            <boxGeometry args={[0.3, 0.06, 0.06]} />
            <meshStandardMaterial color="#dc2626" emissive="#7f1d1d" roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* 4ª Rachadura: Rachadura crítica e borbulhamento */}
      {cracks >= 4 && (
        <>
          <mesh position={[0, 0.08, -0.1]} rotation={[0.1, 0.6, 0]}>
            <boxGeometry args={[0.55, 0.08, 0.08]} />
            <meshStandardMaterial color="#ef4444" emissive="#991b1b" roughness={0.7} />
          </mesh>
          <group ref={bubbleRef}>
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} position={[(i % 2 === 0 ? 0.2 : -0.2), 0.1, (i > 1 ? 0.3 : -0.3)]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color="#93c5fd" transparent opacity={0.7} />
              </mesh>
            ))}
          </group>
        </>
      )}
    </group>
  );
}

// ---------- Boneco Navegante (Homem do Barco) ----------

function Navigator() {
  return (
    <group position={[0, 0.3, -0.1]}>
      {/* Tronco com camisa azul ribeirinha */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.22, 6, 10]} />
        <meshStandardMaterial color="#0284c7" />
      </mesh>
      {/* Cabeça */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <sphereGeometry args={[0.1, 14, 10]} />
        <meshStandardMaterial color="#fcd7b0" />
      </mesh>
      {/* Chapéu de palha tradicional mineiro */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.14, 0.06, 16]} />
        <meshStandardMaterial color="#eab308" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ---------- Tier 1: Canoa Ribeirinha Krenak ----------

function Canoe({ cracks }: { cracks: number }) {
  return (
    <group position={[0, 0.1, 0]}>
      {/* Casco da canoa em madeira escura entalhada */}
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[0.55, 0.24, 1.8]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>
      {/* Proa elevada */}
      <mesh castShadow position={[0, 0.18, 0.95]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.27, 0.4, 4]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      {/* Popa elevada */}
      <mesh castShadow position={[0, 0.18, -0.95]} rotation={[-0.4, 0, 0]}>
        <coneGeometry args={[0.27, 0.4, 4]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      {/* Remo apoiado */}
      <mesh position={[0.3, 0.25, 0.1]} rotation={[0.2, 0.1, 0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
      <Navigator />
      <DamageCracks cracks={cracks} />
    </group>
  );
}

// ---------- Tier 2: Bote Motorizado Ágil ----------

function Motorboat({ cracks }: { cracks: number }) {
  return (
    <group position={[0, 0.12, 0]}>
      {/* Casco de fibra azul resistente */}
      <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[0.7, 0.26, 1.9]} />
        <meshStandardMaterial color="#0284c7" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Borda interna branca */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.58, 0.22, 1.7]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      {/* Proa em V */}
      <mesh castShadow position={[0, 0.14, 1.05]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.36, 0.45, 3]} />
        <meshStandardMaterial color="#0369a1" />
      </mesh>
      {/* Motor de Popa */}
      <group position={[0, 0.22, -0.98]}>
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.32, 0.2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.22, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
      </group>
      <Navigator />
      <DamageCracks cracks={cracks} />
    </group>
  );
}

// ---------- Tier 3: Barco Regional Tradicional ----------

function RegionalBoat({ cracks }: { cracks: number }) {
  return (
    <group position={[0, 0.15, 0]}>
      {/* Casco amplo de madeira nobre */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[0.9, 0.32, 2.3]} />
        <meshStandardMaterial color="#854d0e" roughness={0.6} />
      </mesh>
      {/* Cabine coberta com janelas */}
      <group position={[0, 0.48, -0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.75, 0.45, 1.2]} />
          <meshStandardMaterial color="#fef08a" roughness={0.5} />
        </mesh>
        {/* Teto arredondado da cabine */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.82, 0.08, 1.3]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
        {/* Janelas */}
        <mesh position={[0.38, 0.05, 0]}>
          <boxGeometry args={[0.02, 0.18, 0.9]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} transparent opacity={0.8} />
        </mesh>
        <mesh position={[-0.38, 0.05, 0]}>
          <boxGeometry args={[0.02, 0.18, 0.9]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} transparent opacity={0.8} />
        </mesh>
      </group>
      {/* Lanterna de proa */}
      <mesh position={[0, 0.35, 1.05]}>
        <cylinderGeometry args={[0.06, 0.06, 0.14, 8]} />
        <meshStandardMaterial color="#f59e0b" emissive="#fbbf24" />
      </mesh>
      <group position={[0, 0.1, 0.6]}>
        <Navigator />
      </group>
      <DamageCracks cracks={cracks} />
    </group>
  );
}

// ---------- Tier 4: Cruzeiro Fluvial Sustentável ----------

function EcoCruise({ cracks }: { cracks: number }) {
  return (
    <group position={[0, 0.18, 0]}>
      {/* Casco principal aerodinâmico */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[1.1, 0.4, 2.7]} />
        <meshStandardMaterial color="#0f766e" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Convés superior */}
      <group position={[0, 0.55, -0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.95, 0.42, 1.8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        {/* Painéis Solares no teto */}
        <mesh position={[0, 0.23, 0]}>
          <boxGeometry args={[0.85, 0.04, 1.5]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Janelas panorâmicas contínuas */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.98, 0.16, 1.7]} />
          <meshStandardMaterial color="#67e8f9" roughness={0.1} transparent opacity={0.85} />
        </mesh>
      </group>
      {/* Mastro com bandeira */}
      <group position={[0, 0.95, -0.8]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0.1, 0.18, 0]}>
          <boxGeometry args={[0.2, 0.12, 0.02]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
      </group>
      <group position={[0, 0.15, 0.85]}>
        <Navigator />
      </group>
      <DamageCracks cracks={cracks} />
    </group>
  );
}

// ---------- Componente Polimórfico Principal do Barco ----------

export function BoatMesh({ tier, cracks }: { tier: BoatTier; cracks: number }) {
  switch (tier) {
    case 1:
      return <Canoe cracks={cracks} />;
    case 2:
      return <Motorboat cracks={cracks} />;
    case 3:
      return <RegionalBoat cracks={cracks} />;
    case 4:
      return <EcoCruise cracks={cracks} />;
  }
}
