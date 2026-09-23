import { useTick } from '@pixi/react';
import { useCallback, useRef } from 'react';
import type { Container as PixiContainer, Graphics as PixiGraphics, FederatedPointerEvent } from 'pixi.js';
import { INITIAL_WASTE_ITEMS } from '../data/riverLayout';
import type { WasteItem } from '../engine/types';
import { useGameStore } from '../store/gameStore';
import { getWaypointPosition } from './riverPath';
import { drawAlertRing, drawWaste } from './vectorArt';

interface WasteSpriteProps {
  item: WasteItem;
  isActive: boolean;
  onCollect: () => void;
}

function WasteSprite({ item, isActive, onCollect }: WasteSpriteProps) {
  const containerRef = useRef<PixiContainer>(null);
  const ringRef = useRef<PixiGraphics>(null);
  const pos = getWaypointPosition(item.waypointIndex);

  const drawItem = useCallback((g: PixiGraphics) => drawWaste(g, item.tipo), [item.tipo]);
  const drawRing = useCallback((g: PixiGraphics) => drawAlertRing(g, 18), []);

  useTick(() => {
    const c = containerRef.current;
    if (c) {
      const t = performance.now() * 0.0028 + item.waypointIndex;
      c.y = pos.y + Math.sin(t) * 4;
      c.rotation = Math.sin(performance.now() * 0.0008) * 0.15;
    }
    const ring = ringRef.current;
    if (ring && isActive) {
      const pulse = 1 + Math.sin(performance.now() * 0.005) * 0.15;
      ring.scale.set(pulse);
    }
  });

  const handleTap = useCallback(
    (e: FederatedPointerEvent) => {
      e.stopPropagation();
      if (isActive) onCollect();
    },
    [isActive, onCollect],
  );

  return (
    <pixiContainer ref={containerRef} x={pos.x} y={pos.y} scale={isActive ? 1.3 : 1}>
      {isActive && <pixiGraphics ref={ringRef} draw={drawRing} />}
      <pixiGraphics draw={drawItem} eventMode="static" cursor="pointer" onPointerDown={handleTap} />
    </pixiContainer>
  );
}

/** Itens de dejeto flutuantes visíveis a partir do waypoint atual. */
export function WasteSprites() {
  const currentWaypoint = useGameStore((s) => s.state.currentWaypoint);
  const activeWaste = useGameStore((s) => s.state.activeWaste);
  const phase = useGameStore((s) => s.state.phase);
  const dispatch = useGameStore((s) => s.dispatch);

  const visibleWaste = INITIAL_WASTE_ITEMS.filter((w) => {
    if (w.waypointIndex < currentWaypoint) return false;
    if (w.waypointIndex === currentWaypoint && !activeWaste) return false;
    return true;
  });

  return (
    <pixiContainer>
      {visibleWaste.map((item) => {
        const isActive = phase === 'wasteEncounter' && activeWaste?.id === item.id;
        return (
          <WasteSprite
            key={item.id}
            item={item}
            isActive={isActive}
            onCollect={() => dispatch({ type: 'COLLECT_WASTE' })}
          />
        );
      })}
    </pixiContainer>
  );
}
