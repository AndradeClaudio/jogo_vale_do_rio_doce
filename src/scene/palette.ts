// Paleta numérica (hex) para o mundo 2D desenhado em Pixi — `Graphics.fill()`
// exige números, não variáveis CSS. Família de cores inspirada em
// `src/styles/tokens.css`, com tons mais vivos/saturados para leitura clara
// em silhuetas vetoriais simples.

export const COLORS = {
  // Água e rio — tom escuro e barrento, como os rios brasileiros (o próprio
  // Rio Doce ficou com essa cor após o rompimento de barragem em Mariana)
  riverDeep: 0x1c2e24,
  riverMid: 0x2f4a38,
  riverShine: 0x4f6b4a,
  riverBank: 0xa9793f,

  // Terreno e vegetação
  groundBase: 0x5cb85c,
  grassDeep: 0x2f9e44,
  grassLight: 0x6fd66f,
  dirtPath: 0x8a6d3b,
  bushGreen: 0x2f8f3f,
  rockGray: 0x9ca3af,
  treeTrunk: 0x6b4226,
  treeCanopyDark: 0x15803d,
  treeCanopyLight: 0x22c55e,

  // Céu / fundo (usado só como cor de fallback fora do terreno desenhado)
  sky: 0xbae6fd,

  // Casas
  houseWallOptions: [0xffffff, 0xfef9c3, 0xfce7f3, 0xdcfce7, 0xe0f2fe] as const,
  houseRoof: 0xdc2626,
  houseTrim: 0x0284c7,

  // Barco — casco por nível
  hullTier1: 0x92400e,
  hullTier2: 0x0284c7,
  hullTier3: 0x854d0e,
  hullTier4: 0x0f766e,
  hullTrim: 0xf8fafc,
  navigatorShirt: 0x0284c7,
  navigatorSkin: 0xc68a5c,
  girlShirt: 0xf97316,
  boyShirt: 0x0ea5e9,
  hairDark: 0x2b1a10,
  navigatorHat: 0xeab308,

  // Rachaduras / dano
  crackLight: 0x7c2d12,
  crackHeavy: 0xef4444,

  // Lixo
  wasteBottle: 0x38bdf8,
  wasteBottleCap: 0xdc2626,
  wasteTire: 0x1e293b,
  wasteRubble: 0x78716c,
  wastePlastic: 0xfbbf24,
  alertRing: 0xf59e0b,

  // Personagens
  characterHead: 0xfcd7b0,
  characterShirt: {
    agricultor: 0x16a34a,
    pescador: 0xd97706,
    artesao: 0xdc2626,
    guia: 0x059669,
    biologo: 0x0284c7,
  },
  dockWood: 0x78350f,

  // Diversos
  white: 0xffffff,
  black: 0x000000,
} as const;
