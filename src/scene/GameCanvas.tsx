import { Canvas } from '@react-three/fiber';
import { BoatToken } from './BoatToken';
import { CameraRig } from './CameraRig';
import { CharacterTokens } from './CharacterTokens';
import { Environment3D } from './Environment3D';
import { River3D } from './River3D';
import { WasteTokens } from './WasteTokens';

export function GameCanvas() {
  return (
    <Canvas
      shadows
      camera={{ position: [-18, 12, 24], fov: 45 }}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#bae6fd']} />
      <fog attach="fog" args={['#dbeafe', 25, 80]} />
      <Environment3D />
      <River3D />
      <WasteTokens />
      <CharacterTokens />
      <BoatToken />
      <CameraRig />
    </Canvas>
  );
}
