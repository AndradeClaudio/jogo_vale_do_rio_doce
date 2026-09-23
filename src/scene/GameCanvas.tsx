import { Sky } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { BoatToken } from './BoatToken';
import { CameraRig } from './CameraRig';
import { CharacterTokens } from './CharacterTokens';
import { Environment3D } from './Environment3D';
import { Illustrations3D } from './Illustrations3D';
import { River3D } from './River3D';
import { WasteTokens } from './WasteTokens';
import { SUN_POSITION } from './pathUtils';

export function GameCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      camera={{ position: [-18, 12, 24], fov: 45 }}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    >
      <fog attach="fog" args={['#cfe4e8', 30, 85]} />
      <Sky
        sunPosition={SUN_POSITION}
        turbidity={4}
        rayleigh={1.3}
        mieCoefficient={0.006}
        mieDirectionalG={0.85}
      />
      <Environment3D />
      <Illustrations3D />
      <River3D />
      <WasteTokens />
      <CharacterTokens />
      <BoatToken />
      <CameraRig />
    </Canvas>
  );
}
