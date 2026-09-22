import type { WasteItem } from './types';

export const WASTE_REWARD_BONUS = 50;

export interface CleanupResult {
  collectedItem: WasteItem;
  pointsEarned: number;
  message: string;
}

export function cleanWasteItem(item: WasteItem): CleanupResult {
  const points = item.pontos + WASTE_REWARD_BONUS;
  return {
    collectedItem: {
      ...item,
      recolhido: true,
    },
    pointsEarned: points,
    message: `🌊 Você retirou "${item.nome}" das águas do Rio Doce (+${points} pontos de sustentabilidade)!`,
  };
}
