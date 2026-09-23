import { useCallback } from 'react';
import type { Graphics as PixiGraphics } from 'pixi.js';
import { RIVER_WAYPOINTS } from '../data/riverLayout';
import type { CharacterId } from '../engine/types';
import { getPointAt, getTangentAt } from './riverPath';
import { drawCharacterDock } from './vectorArt';

interface MarkerSpec {
  x: number;
  y: number;
  characterId: CharacterId;
}

const MARKERS: MarkerSpec[] = RIVER_WAYPOINTS.filter((wp) => wp.tipo === 'personagem' && wp.characterId).map((wp, i) => {
  const u = wp.index / (RIVER_WAYPOINTS.length - 1);
  const pt = getPointAt(u);
  const tangent = getTangentAt(u);
  const perpX = tangent.y;
  const perpY = -tangent.x;
  const side = i % 2 === 0 ? 1 : -1;
  const offset = 55;
  return {
    x: pt.x + perpX * offset * side,
    y: pt.y + perpY * offset * side,
    characterId: wp.characterId as CharacterId,
  };
});

function MarkerGraphic({ x, y, characterId }: MarkerSpec) {
  const draw = useCallback((g: PixiGraphics) => drawCharacterDock(g, characterId), [characterId]);
  return <pixiGraphics draw={draw} x={x} y={y} />;
}

/** Docas com o marcador do personagem ribeirinho em cada parada de quiz. */
export function CharacterMarkers() {
  return (
    <pixiContainer>
      {MARKERS.map((m, i) => (
        <MarkerGraphic key={`marker_${i}`} {...m} />
      ))}
    </pixiContainer>
  );
}
