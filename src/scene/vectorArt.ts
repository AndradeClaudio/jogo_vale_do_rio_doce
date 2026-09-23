import type { Graphics } from 'pixi.js';
import type { Avatar, BoatTier, CharacterId, WasteType } from '../engine/types';
import { COLORS } from './palette';

/**
 * Casco de barco (visão de cima) como polígono simples: proa apontando para
 * +Y local (o chamador rotaciona o container para alinhar com a direção de
 * deslocamento). Silhueta única e forte por nível, sem detalhe excessivo —
 * legível em tela pequena de celular.
 */
function hullPoints(length: number, width: number): number[] {
  const hw = width / 2;
  return [
    0, length * 0.5, // proa (ponta)
    hw * 0.85, length * 0.18,
    hw, -length * 0.22,
    hw * 0.65, -length * 0.5, // popa (canto)
    -hw * 0.65, -length * 0.5,
    -hw, -length * 0.22,
    -hw * 0.85, length * 0.18,
  ];
}

/** Quem conduz o barco, visto de cima: a navegadora tem cabelo comprido com
 * trança e camiseta laranja; o navegador tem chapéu de palha e camiseta azul. */
function drawNavigator(g: Graphics, offsetY: number, avatar: Avatar): void {
  const headY = offsetY - 6;
  if (avatar === 'menina') {
    g.roundRect(-1.6, headY - 9, 3.2, 9, 1.6).fill(COLORS.hairDark); // trança caindo nas costas
    g.circle(0, headY - 9, 1.3).fill(0xec4899);
    g.circle(0, offsetY, 5).fill(COLORS.girlShirt);
    g.circle(0, headY, 3.6).fill(COLORS.hairDark);
    g.circle(0, headY + 1, 2.6).fill(COLORS.navigatorSkin);
  } else {
    g.circle(0, offsetY, 5).fill(COLORS.boyShirt);
    g.circle(0, headY, 3.2).fill(COLORS.navigatorSkin);
    g.circle(0, headY, 4.4).fill({ color: COLORS.navigatorHat, alpha: 0.9 });
    g.circle(0, headY, 2.4).fill(0xca8a04);
  }
}

function drawCracks(g: Graphics, cracks: number, length: number, width: number): void {
  if (cracks <= 0) return;
  const spots: [number, number][] = [
    [-width * 0.28, -length * 0.1],
    [width * 0.3, length * 0.05],
    [0, length * 0.28],
    [-width * 0.15, -length * 0.3],
  ];
  for (let i = 0; i < cracks && i < spots.length; i++) {
    const [x, y] = spots[i];
    const color = i < 2 ? COLORS.crackLight : COLORS.crackHeavy;
    g.moveTo(x - 3, y - 4).lineTo(x + 2, y).lineTo(x - 1, y + 4).stroke({ width: 1.6, color });
  }
}

/** Desenha o barco do nível atual (1-4), com rachaduras visuais (0-4). */
export function drawBoat(g: Graphics, tier: BoatTier, cracks: number, avatar: Avatar): void {
  g.clear();

  if (tier === 1) {
    g.poly(hullPoints(30, 14)).fill(COLORS.hullTier1);
    drawNavigator(g, -1, avatar);
  } else if (tier === 2) {
    g.poly(hullPoints(34, 17)).fill(COLORS.hullTier2);
    g.poly(hullPoints(26, 12)).fill(COLORS.hullTrim);
    g.rect(-3.5, 12, 7, 6).fill(0x1e293b);
    drawNavigator(g, -2, avatar);
  } else if (tier === 3) {
    g.poly(hullPoints(40, 20)).fill(COLORS.hullTier3);
    g.roundRect(-9, -10, 18, 16, 2).fill(0xfef08a);
    g.rect(-10, -12, 20, 3).fill(0xb45309);
    drawNavigator(g, 14, avatar);
  } else {
    g.poly(hullPoints(46, 24)).fill(COLORS.hullTier4);
    g.roundRect(-10, -14, 20, 20, 3).fill(COLORS.white);
    g.rect(-9, -13, 18, 4).fill(0x1e3a8a);
    drawNavigator(g, 16, avatar);
  }

  drawCracks(g, cracks, tier === 1 ? 30 : tier === 2 ? 34 : tier === 3 ? 40 : 46, tier === 1 ? 14 : tier === 2 ? 17 : tier === 3 ? 20 : 24);
}

/** Desenha um item de dejeto (garrafa/pneu/entulho/plástico) centrado na origem. */
export function drawWaste(g: Graphics, tipo: WasteType): void {
  g.clear();
  if (tipo === 'garrafa') {
    g.roundRect(-4, -9, 8, 18, 3).fill({ color: COLORS.wasteBottle, alpha: 0.85 });
    g.rect(-2, -12, 4, 4).fill(COLORS.wasteBottleCap);
  } else if (tipo === 'pneu') {
    g.circle(0, 0, 10).stroke({ width: 6, color: COLORS.wasteTire });
  } else if (tipo === 'entulho') {
    g.rect(-9, -3, 10, 9).fill(COLORS.wasteRubble);
    g.rect(1, -7, 8, 10).fill(0xa8a29e);
  } else {
    g.roundRect(-9, -6, 18, 12, 3).fill(COLORS.wastePlastic);
  }
}

/** Anel de alerta pulsante sobre o dejeto ativo. */
export function drawAlertRing(g: Graphics, radius: number): void {
  g.clear();
  g.circle(0, 0, radius).stroke({ width: 3, color: COLORS.alertRing, alpha: 0.85 });
}

/** Doca + marcador do personagem ribeirinho, com a cor de camisa por tipo. */
export function drawCharacterDock(g: Graphics, characterId: CharacterId): void {
  g.clear();
  g.rect(-16, -4, 32, 8).fill(COLORS.dockWood);
  g.rect(-16, -14, 4, 12).fill(0x451a03);
  g.rect(12, -14, 4, 12).fill(0x451a03);
  const shirt = COLORS.characterShirt[characterId];
  g.circle(0, -22, 7).fill(shirt);
  g.circle(0, -32, 5).fill(COLORS.characterHead);
}

export type TreeKind = 'tropical' | 'ipeAmarelo' | 'ipeRosa' | 'ipeRoxo' | 'palmeira';

// Tons de copa por espécie: [base escura, meio, luz]. Luz vem do alto à esquerda.
const CANOPY_TONES: Record<Exclude<TreeKind, 'palmeira'>, [number, number, number][]> = {
  tropical: [
    [0x14532d, 0x15803d, 0x4ade80],
    [0x166534, 0x16a34a, 0x86efac],
    [0x1a4d2e, 0x2f855a, 0x68d391],
  ],
  ipeAmarelo: [[0xca8a04, 0xfacc15, 0xfef08a]],
  ipeRosa: [[0xbe185d, 0xf472b6, 0xfbcfe8]],
  ipeRoxo: [[0x7e22ce, 0xc084fc, 0xe9d5ff]],
};

function drawRoundCanopyTree(g: Graphics, tones: [number, number, number], petals: boolean): void {
  const [dark, mid, light] = tones;
  g.ellipse(7, 4, 17, 6).fill({ color: COLORS.black, alpha: 0.2 });
  if (petals) {
    // flores caídas no chão ao redor do tronco
    for (let i = 0; i < 9; i++) {
      const a = i * 2.39;
      const r = 8 + (i % 3) * 5;
      g.circle(Math.cos(a) * r + 4, Math.sin(a) * r * 0.45 + 4, 1.3).fill({ color: mid, alpha: 0.85 });
    }
  }
  g.rect(-2.5, -9, 5, 13).fill(COLORS.treeTrunk);
  g.circle(-9, -14, 9).fill(dark);
  g.circle(9, -14, 9).fill(dark);
  g.circle(0, -20, 13).fill(dark);
  g.circle(-3, -22, 10).fill(mid);
  g.circle(5, -16, 7).fill(mid);
  g.circle(-6, -26, 5).fill({ color: light, alpha: 0.9 });
  if (petals) {
    for (let i = 0; i < 7; i++) {
      const a = i * 1.7 + 0.4;
      g.circle(Math.cos(a) * 8 - 1, -19 + Math.sin(a) * 7, 1.4).fill({ color: light, alpha: 0.95 });
    }
  }
}

function drawPalm(g: Graphics): void {
  g.ellipse(9, 4, 18, 6).fill({ color: COLORS.black, alpha: 0.18 });
  g.moveTo(0, 4).quadraticCurveTo(-1, -12, 4, -28).stroke({ width: 4, color: 0x8b5a2b, cap: 'round' });
  const cx = 4;
  const cy = -29;
  const leaves = 7;
  for (let i = 0; i < leaves; i++) {
    const a = (i / leaves) * Math.PI * 2 + 0.3;
    const len = 17;
    const tipX = cx + Math.cos(a) * len;
    const tipY = cy + Math.sin(a) * len * 0.62 + 5; // folhas pendem para baixo
    const sideA = a - 0.35;
    const sideB = a + 0.35;
    g.poly([
      cx, cy,
      cx + Math.cos(sideA) * 8, cy + Math.sin(sideA) * 5,
      tipX, tipY,
      cx + Math.cos(sideB) * 8, cy + Math.sin(sideB) * 5,
    ]).fill(i % 2 === 0 ? 0x15803d : 0x22c55e);
  }
  g.circle(cx - 2, cy + 2, 2.2).fill(0x78350f);
  g.circle(cx + 2, cy + 3, 2.2).fill(0x92400e);
}

/** Vegetação nativa brasileira em vista 3/4: copas tropicais, ipês floridos e palmeiras. */
export function drawTree(g: Graphics, kind: TreeKind, variant = 0): void {
  g.clear();
  if (kind === 'palmeira') {
    drawPalm(g);
    return;
  }
  const options = CANOPY_TONES[kind];
  drawRoundCanopyTree(g, options[variant % options.length], kind !== 'tropical');
}

/** Igreja barroca mineira (Mariana/Ouro Preto): fachada branca, cantaria de pedra e duas torres. */
export function drawChurch(g: Graphics): void {
  g.clear();
  g.ellipse(0, 10, 50, 13).fill(0xe7d3a8);
  g.ellipse(0, 10, 50, 13).stroke({ width: 1.5, color: 0xc8b38a });
  g.ellipse(10, 6, 34, 8).fill({ color: COLORS.black, alpha: 0.18 });
  // nave
  g.rect(-16, -30, 32, 36).fill(0xfafaf9);
  g.poly([-18, -30, 18, -30, 12, -38, 0, -44, -12, -38]).fill(0xb45309);
  // torres
  for (const tx of [-26, 14]) {
    g.rect(tx, -46, 12, 52).fill(0xfafaf9);
    g.rect(tx, -46, 2, 52).fill(0x9ca3af);
    g.rect(tx + 10, -46, 2, 52).fill(0x9ca3af);
    g.roundRect(tx + 3, -38, 6, 9, 3).fill(0x1e293b);
    g.poly([tx - 1, -46, tx + 13, -46, tx + 6, -57]).fill(0x475569);
    g.moveTo(tx + 6, -57).lineTo(tx + 6, -64).stroke({ width: 1.4, color: 0xf59e0b });
    g.moveTo(tx + 3.5, -61.5).lineTo(tx + 8.5, -61.5).stroke({ width: 1.4, color: 0xf59e0b });
  }
  g.rect(-26, 2, 52, 4).fill(0x9ca3af);
  g.roundRect(-5, -13, 10, 17, 5).fill(0x78350f);
  g.circle(0, -21, 3).fill(0xf59e0b);
  g.circle(0, -21, 1.4).fill(0x1d4ed8);
}

/** Oca Krenak de palha, em vista 3/4. */
export function drawOca(g: Graphics, scale = 1): void {
  g.clear();
  const s = scale;
  g.ellipse(6 * s, 4 * s, 22 * s, 6 * s).fill({ color: COLORS.black, alpha: 0.2 });
  g.ellipse(0, -6 * s, 18 * s, 15 * s).fill(0xd4a373);
  for (let i = -3; i <= 3; i++) {
    g.moveTo(0, -20 * s).quadraticCurveTo(i * 5 * s, -12 * s, i * 5.6 * s, 4 * s).stroke({ width: 1.2, color: 0xa47148, alpha: 0.75 });
  }
  g.ellipse(0, -2 * s, 18 * s, 5 * s).fill({ color: 0xa47148, alpha: 0.35 });
  g.roundRect(-3.5 * s, -6 * s, 7 * s, 10 * s, 3 * s).fill(0x3f2d1a);
  g.circle(0, -21 * s, 2.4 * s).fill(0xb08050);
}

/** Pedras da fogueira da aldeia (a chama é animada à parte). */
export function drawFirePit(g: Graphics): void {
  g.clear();
  g.circle(0, 0, 14).fill({ color: 0xf59e0b, alpha: 0.12 });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    g.circle(Math.cos(a) * 6, Math.sin(a) * 3.2, 2).fill(0x57534e);
  }
}

export function drawFlame(g: Graphics): void {
  g.clear();
  g.poly([-4, 0, 0, -12, 4, 0]).fill(0xf97316);
  g.poly([-2.4, 0, 0, -8, 2.4, 0]).fill(0xfde047);
}

export type BirdKind = 'araraVermelha' | 'araraAzul' | 'garca';

const BIRD_COLORS: Record<BirdKind, { body: number; wing: number; wingTip: number; tail: number; beak: number }> = {
  araraVermelha: { body: 0xdc2626, wing: 0x2563eb, wingTip: 0xfacc15, tail: 0xb91c1c, beak: 0xf5f5f4 },
  araraAzul: { body: 0x1d4ed8, wing: 0x2563eb, wingTip: 0x1e3a8a, tail: 0x1e40af, beak: 0x1c1917 },
  garca: { body: 0xf8fafc, wing: 0xf1f5f9, wingTip: 0xe2e8f0, tail: 0xe2e8f0, beak: 0xf59e0b },
};

/** Ave vista de cima, cabeça apontando para +Y local; `shadow` desenha a mesma silhueta em preto translúcido. */
export function drawBird(g: Graphics, kind: BirdKind, shadow = false): void {
  g.clear();
  const c = BIRD_COLORS[kind];
  const fill = (color: number) => (shadow ? { color: COLORS.black, alpha: 0.16 } : { color });
  const longTail = kind !== 'garca';
  g.poly([-2, -4, 0, longTail ? -20 : -10, 2, -4]).fill(fill(c.tail));
  g.poly([0, 1, -16, -3, -13, 3, -2, 5]).fill(fill(c.wing));
  g.poly([0, 1, 16, -3, 13, 3, 2, 5]).fill(fill(c.wing));
  g.poly([-16, -3, -12, -1, -13, 3]).fill(fill(c.wingTip));
  g.poly([16, -3, 12, -1, 13, 3]).fill(fill(c.wingTip));
  g.ellipse(0, 1, 3, 7).fill(fill(c.body));
  g.circle(0, 8, 2.6).fill(fill(c.body));
  if (!shadow) g.poly([-1, 10, 0, 13, 1, 10]).fill(c.beak);
}

/** Arbusto baixo, usado para preencher o entorno sem competir com as árvores. */
export function drawBush(g: Graphics): void {
  g.clear();
  g.ellipse(0, 2, 9, 3).fill({ color: COLORS.black, alpha: 0.12 });
  g.circle(-5, -2, 6).fill(COLORS.bushGreen);
  g.circle(4, -1, 7).fill(COLORS.grassDeep);
  g.circle(0, -5, 6).fill(COLORS.bushGreen);
}

/** Pedra arredondada de decoração do terreno. */
export function drawGroundRock(g: Graphics, scale = 1): void {
  g.clear();
  g.ellipse(0, 3 * scale, 7 * scale, 2.5 * scale).fill({ color: COLORS.black, alpha: 0.12 });
  g.circle(0, 0, 6 * scale).fill(COLORS.rockGray);
  g.circle(-2 * scale, -2 * scale, 2.4 * scale).fill({ color: COLORS.white, alpha: 0.25 });
}

/** Casinha colonial simplificada, com cor de parede configurável. */
export function drawHouse(g: Graphics, wallColor: number): void {
  g.clear();
  g.ellipse(0, 5, 20, 6).fill({ color: COLORS.black, alpha: 0.14 });
  g.rect(-14, -16, 28, 20).fill(wallColor);
  g.rect(-15, -1, 30, 4).fill(COLORS.houseTrim);
  g.poly([-17, -16, 17, -16, 0, -32]).fill(COLORS.houseRoof);
  g.rect(-4, -10, 8, 10).fill(COLORS.houseTrim);
}
