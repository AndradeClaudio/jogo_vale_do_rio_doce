import type { Container } from 'pixi.js';
import { cameraFocus, VISIBLE_RANGE } from './camera';

/** Folga além da área visível em que o trecho já fica pré-renderizado. */
const CACHE_MARGIN = 320;

/**
 * Trechos estáticos do cenário (terreno, faixas de árvores) viram uma textura
 * única quando chegam perto da câmera — um quad em vez de centenas de formas
 * por frame — e liberam a textura quando se afastam, limitando memória em celular.
 */
export function updateChunkVisibility(
  chunks: Container[],
  bounds: { top: number; bottom: number }[],
  cached: boolean[],
  resolution: number,
): void {
  chunks.forEach((chunk, i) => {
    const { top, bottom } = bounds[i];
    const distance = Math.max(top - cameraFocus.y, cameraFocus.y - bottom, 0);
    chunk.visible = distance < VISIBLE_RANGE;
    const shouldCache = distance < VISIBLE_RANGE + CACHE_MARGIN;
    if (shouldCache !== cached[i]) {
      chunk.cacheAsTexture(shouldCache ? { resolution, antialias: true } : false);
      cached[i] = shouldCache;
    }
  });
}
