import type { BoatState, BoatTier, BoatTierInfo } from './types';

export const MAX_CRACKS = 4;

export const BOAT_TIERS_INFO: Record<BoatTier, BoatTierInfo> = {
  1: {
    tier: 1,
    nome: 'Canoa Ribeirinha Krenak',
    descricao: 'Canoa tradicional de madeira, leve e silenciosa para navegação nas margens do Rio Doce.',
    velocidadeBase: 1.0,
  },
  2: {
    tier: 2,
    nome: 'Bote Motorizado Ágil',
    descricao: 'Bote equipado com motor de popa, capaz de desviar com facilidade de obstáculos.',
    velocidadeBase: 1.4,
  },
  3: {
    tier: 3,
    nome: 'Barco Regional Tradicional',
    descricao: 'Embarcação fluvial robusta com cabine coberta, resistente às correntezas do Rio Doce.',
    velocidadeBase: 1.8,
  },
  4: {
    tier: 4,
    nome: 'Cruzeiro Fluvial Sustentável',
    descricao: 'Grande cruzeiro de expedição ecológica com painéis solares e propulsão limpa.',
    velocidadeBase: 2.2,
  },
};

export function createInitialBoat(): BoatState {
  return {
    cracks: 0,
    tier: 1,
    upgradesCount: 0,
    isSunk: false,
  };
}

export interface DamageResult {
  boat: BoatState;
  sunkJustNow: boolean;
  message: string;
}

export function applyHullDamage(current: BoatState): DamageResult {
  if (current.isSunk) {
    return {
      boat: current,
      sunkJustNow: false,
      message: 'O barco já está afundado.',
    };
  }

  const nextCracks = Math.min(MAX_CRACKS, current.cracks + 1);
  const isSunk = nextCracks >= MAX_CRACKS;

  const nextBoat: BoatState = {
    ...current,
    cracks: nextCracks,
    isSunk,
  };

  const message = isSunk
    ? `💥 4ª rachadura no casco! O barco não resistiu e afundou nas águas do Rio Doce.`
    : `⚠️ Uma nova rachadura surgiu no casco! (${nextCracks}/${MAX_CRACKS} rachaduras).`;

  return {
    boat: nextBoat,
    sunkJustNow: isSunk,
    message,
  };
}

export interface RepairOrUpgradeResult {
  boat: BoatState;
  actionDone: 'repair' | 'upgrade' | 'maxTier';
  message: string;
}

export function applyHullRepairOrUpgrade(current: BoatState): RepairOrUpgradeResult {
  if (current.isSunk) {
    return {
      boat: current,
      actionDone: 'repair',
      message: 'Impossível reparar um barco afundado.',
    };
  }

  // Regra central: se houver rachaduras, o acerto veda/repara 1 rachadura.
  if (current.cracks > 0) {
    const nextCracks = Math.max(0, current.cracks - 1);
    const nextBoat: BoatState = {
      ...current,
      cracks: nextCracks,
    };
    return {
      boat: nextBoat,
      actionDone: 'repair',
      message: `🛠️ Rachadura vedada com sucesso! Casco agora com ${nextCracks}/${MAX_CRACKS} rachaduras.`,
    };
  }

  // Se não houver rachaduras, o barco ganha aprimoramento (upgrade de tier).
  if (current.tier < 4) {
    const nextTier = (current.tier + 1) as BoatTier;
    const tierInfo = BOAT_TIERS_INFO[nextTier];
    const nextBoat: BoatState = {
      ...current,
      tier: nextTier,
      upgradesCount: current.upgradesCount + 1,
    };
    return {
      boat: nextBoat,
      actionDone: 'upgrade',
      message: `✨ Casco perfeito! Sua embarcação evoluiu para: ${tierInfo.nome}!`,
    };
  }

  // Tier 4 já alcançado
  const nextBoat: BoatState = {
    ...current,
    upgradesCount: current.upgradesCount + 1,
  };
  return {
    boat: nextBoat,
    actionDone: 'maxTier',
    message: `🌟 Casco impecável! O ${BOAT_TIERS_INFO[4].nome} segue em excelência de navegação!`,
  };
}

export function getBoatTierInfo(tier: BoatTier): BoatTierInfo {
  return BOAT_TIERS_INFO[tier];
}
