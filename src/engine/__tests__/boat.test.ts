import { describe, expect, it } from 'vitest';
import {
  MAX_CRACKS,
  applyHullDamage,
  applyHullRepairOrUpgrade,
  createInitialBoat,
  getBoatTierInfo,
} from '../boat';

describe('Boat Hull Integrity & Evolution Service', () => {
  it('inicializa o barco como canoa sem danos e sem naufrágio', () => {
    const boat = createInitialBoat();
    expect(boat.cracks).toBe(0);
    expect(boat.tier).toBe(1);
    expect(boat.isSunk).toBe(false);
    expect(boat.upgradesCount).toBe(0);
  });

  it('adiciona rachaduras progressivamente até o naufrágio no 4º erro', () => {
    let boat = createInitialBoat();

    // 1º erro
    let res = applyHullDamage(boat);
    boat = res.boat;
    expect(boat.cracks).toBe(1);
    expect(boat.isSunk).toBe(false);
    expect(res.sunkJustNow).toBe(false);

    // 2º erro
    res = applyHullDamage(boat);
    boat = res.boat;
    expect(boat.cracks).toBe(2);
    expect(boat.isSunk).toBe(false);

    // 3º erro
    res = applyHullDamage(boat);
    boat = res.boat;
    expect(boat.cracks).toBe(3);
    expect(boat.isSunk).toBe(false);

    // 4º erro -> Naufrágio
    res = applyHullDamage(boat);
    boat = res.boat;
    expect(boat.cracks).toBe(MAX_CRACKS);
    expect(boat.isSunk).toBe(true);
    expect(res.sunkJustNow).toBe(true);
  });

  it('repara rachaduras quando o barco possui danos', () => {
    let boat = createInitialBoat();
    // Causar 2 danos
    boat = applyHullDamage(boat).boat;
    boat = applyHullDamage(boat).boat;
    expect(boat.cracks).toBe(2);

    // 1 reparo
    let res = applyHullRepairOrUpgrade(boat);
    boat = res.boat;
    expect(res.actionDone).toBe('repair');
    expect(boat.cracks).toBe(1);
    expect(boat.tier).toBe(1); // Não evolui se estava reparando

    // 2º reparo
    res = applyHullRepairOrUpgrade(boat);
    boat = res.boat;
    expect(res.actionDone).toBe('repair');
    expect(boat.cracks).toBe(0);
  });

  it('aprimora o barco quando o casco não possui rachaduras (Canoa -> Bote -> Barco Regional -> Cruzeiro)', () => {
    let boat = createInitialBoat();
    expect(boat.tier).toBe(1);

    // 1º upgrade -> Tier 2 (Bote)
    let res = applyHullRepairOrUpgrade(boat);
    boat = res.boat;
    expect(res.actionDone).toBe('upgrade');
    expect(boat.tier).toBe(2);
    expect(boat.upgradesCount).toBe(1);

    // 2º upgrade -> Tier 3 (Barco Regional)
    res = applyHullRepairOrUpgrade(boat);
    boat = res.boat;
    expect(res.actionDone).toBe('upgrade');
    expect(boat.tier).toBe(3);
    expect(boat.upgradesCount).toBe(2);

    // 3º upgrade -> Tier 4 (Cruzeiro Fluvial)
    res = applyHullRepairOrUpgrade(boat);
    boat = res.boat;
    expect(res.actionDone).toBe('upgrade');
    expect(boat.tier).toBe(4);
    expect(boat.upgradesCount).toBe(3);

    // Próximo acerto no nível máximo mantém tier 4 e adiciona upgradesCount
    res = applyHullRepairOrUpgrade(boat);
    boat = res.boat;
    expect(res.actionDone).toBe('maxTier');
    expect(boat.tier).toBe(4);
    expect(boat.upgradesCount).toBe(4);
  });

  it('retorna informações detalhadas de cada tier', () => {
    const tier1 = getBoatTierInfo(1);
    const tier4 = getBoatTierInfo(4);

    expect(tier1.nome).toContain('Canoa');
    expect(tier4.nome).toContain('Cruzeiro');
    expect(tier4.velocidadeBase).toBeGreaterThan(tier1.velocidadeBase);
  });
});
