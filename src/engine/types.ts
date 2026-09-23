// Modelo de domínio do Expedição Rio Doce 3D — lógica pura, sem dependências de React/Three.js.

export type BoatTier = 1 | 2 | 3 | 4;

export interface BoatTierInfo {
  tier: BoatTier;
  nome: string;
  descricao: string;
  velocidadeBase: number;
}

export interface BoatState {
  /** Quantidade atual de rachaduras estruturais no casco (0 a 4). */
  cracks: number;
  /** Nível de aprimoramento da embarcação (1 = Canoa, 2 = Bote, 3 = Barco Regional, 4 = Cruzeiro). */
  tier: BoatTier;
  /** Contador cumulativo de aprimoramentos obtidos com barco sem rachaduras. */
  upgradesCount: number;
  /** Flag indicando se a embarcação atingiu o limite de 4 rachaduras e afundou. */
  isSunk: boolean;
}

export type WasteType = 'garrafa' | 'pneu' | 'entulho' | 'plastico';

export interface WasteItem {
  id: string;
  nome: string;
  tipo: WasteType;
  pontos: number;
  waypointIndex: number;
  recolhido: boolean;
}

export type CharacterId = 'agricultor' | 'pescador' | 'artesao' | 'guia' | 'biologo';

export interface CharacterProfile {
  id: CharacterId;
  nome: string;
  profissao: string;
  localidade: string;
  avatarEmoji: string;
  introducao: string;
}

export interface QuizQuestion {
  id: number;
  pergunta: string;
  alternativas: string[];
  /** Índice da alternativa correta (0 a 2). */
  correta: number;
  explicacao: string;
  personagemId: CharacterId;
  waypointIndex: number;
}

export type GamePhase =
  | 'start'
  | 'navigating'
  | 'wasteEncounter'
  | 'characterQuiz'
  | 'quizFeedback'
  | 'boatSunk'
  | 'victory';

export interface RiverWaypoint {
  index: number;
  nome: string;
  tipo: 'partida' | 'comum' | 'lixo' | 'personagem' | 'foz';
  characterId?: CharacterId;
  wasteId?: string;
  questionId?: number;
}

export interface PlayerScore {
  lixosRecolhidos: number;
  perguntasCertas: number;
  perguntasErradas: number;
  pontosSustentabilidade: number;
  rachadurasReparadas: number;
  upgradesRealizados: number;
}

/** Quem conduz o barco, escolhido pelo jogador antes da largada. */
export type Avatar = 'menina' | 'menino';

export interface GameState {
  avatar: Avatar;
  currentWaypoint: number;
  targetWaypoint: number;
  boat: BoatState;
  score: PlayerScore;
  phase: GamePhase;
  activeQuestion: QuizQuestion | null;
  activeWaste: WasteItem | null;
  answeredCorrectly: boolean | null;
  lastChoiceIndex: number | null;
  lastUpgradeMessage: string | null;
  log: string[];
  seed: number;
  rngState: number;
}

export type GameAction =
  | { type: 'START_GAME'; seed?: number; avatar?: Avatar }
  | { type: 'ADVANCE_RIVER' }
  | { type: 'COLLECT_WASTE' }
  | { type: 'ANSWER_QUIZ'; choiceIndex: number }
  | { type: 'CLOSE_FEEDBACK' }
  | { type: 'MOVE_ANIMATION_DONE' }
  | { type: 'RESTART_GAME' };
