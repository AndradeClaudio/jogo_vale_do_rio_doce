/** Foco atual da câmera em coordenadas do mundo, escrito pelo WorldLayer a cada
 * frame e lido pelas camadas animadas para desenhar só o que está perto da tela. */
export const cameraFocus = { x: 0, y: 0 };

/** Posição real (animada) do barco no mundo, escrita pelo BoatSprite: a câmera
 * persegue o barco, não o waypoint de destino, para ele nunca sair do quadro. */
export const boatWorldPosition = { x: 0, y: 0, ready: false };

/** Distância vertical (unidades do mundo) além do foco que ainda vale desenhar. */
export const VISIBLE_RANGE = 560;

/** Zoom do mundo conforme a largura da tela: em celular mostra mais paisagem ao
 * redor do rio; em telas largas mantém o zoom maior. */
export function worldScaleFor(screenWidth: number): number {
  return Math.min(2.2, Math.max(1.1, screenWidth / 300));
}
