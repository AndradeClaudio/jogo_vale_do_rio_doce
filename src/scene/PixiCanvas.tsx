import { Application, extend, useApplication, useTick } from '@pixi/react';
import { useRef } from 'react';
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { useGameStore } from '../store/gameStore';
import { BoatSprite } from './BoatSprite';
import { boatWorldPosition, cameraFocus, worldScaleFor } from './camera';
import { CharacterMarkers } from './CharacterMarkers';
import { CloudShadows } from './CloudShadows';
import { GroundTexture } from './GroundTexture';
import { COLORS } from './palette';
import { RiverBackground } from './RiverBackground';
import { RiverMouthSea } from './RiverMouthSea';
import { RiverScenery } from './RiverScenery';
import { getWaypointPosition } from './riverPath';
import { ScreenEffects } from './ScreenEffects';
import { WasteSprites } from './WasteSprites';

extend({ Container, Graphics, Sprite, Text });

/** Container "mundo" cuja posição segue o waypoint atual (câmera de perseguição
 * suave) e cujo zoom se adapta à largura da tela. */
function WorldLayer() {
  const worldRef = useRef<Container>(null);
  const initialized = useRef(false);
  const { app } = useApplication();

  useTick(({ deltaMS }) => {
    const world = worldRef.current;
    if (!world) return;
    const target = boatWorldPosition.ready
      ? boatWorldPosition
      : getWaypointPosition(useGameStore.getState().state.currentWaypoint);

    if (!initialized.current) {
      initialized.current = true;
      cameraFocus.x = target.x;
      cameraFocus.y = target.y;
    } else {
      // suavização por tempo (não por frame): mesma sensação em 30 ou 120 fps
      const follow = 1 - Math.exp(-(deltaMS / 1000) * 7);
      cameraFocus.x += (target.x - cameraFocus.x) * follow;
      cameraFocus.y += (target.y - cameraFocus.y) * follow;
    }

    const screenW = app.screen.width;
    const screenH = app.screen.height;
    const scale = worldScaleFor(screenW);
    world.scale.set(scale);
    world.position.set(screenW / 2 - cameraFocus.x * scale, screenH * 0.5 - cameraFocus.y * scale);
  });

  return (
    <pixiContainer ref={worldRef}>
      <GroundTexture />
      <RiverBackground />
      <RiverMouthSea />
      <RiverScenery />
      <CharacterMarkers />
      <WasteSprites />
      <BoatSprite />
      <CloudShadows />
    </pixiContainer>
  );
}

export function PixiCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, touchAction: 'none' }}>
      <Application resizeTo={containerRef} backgroundColor={COLORS.groundBase} antialias resolution={Math.min(window.devicePixelRatio || 1, 2)} autoDensity>
        <WorldLayer />
        <ScreenEffects />
      </Application>
    </div>
  );
}
