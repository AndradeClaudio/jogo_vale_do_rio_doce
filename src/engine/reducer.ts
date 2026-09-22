import {
  MAX_WAYPOINT_INDEX,
  getWasteByWaypoint,
  getWaypoint,
} from '../data/riverLayout';
import { getQuestionByWaypoint } from '../data/rioDoceQuestions';
import { applyHullDamage, applyHullRepairOrUpgrade, createInitialBoat } from './boat';
import { cleanWasteItem } from './waste';
import type { GameAction, GameState } from './types';

export function createInitialState(seed = 20260922): GameState {
  return {
    currentWaypoint: 0,
    targetWaypoint: 0,
    boat: createInitialBoat(),
    score: {
      lixosRecolhidos: 0,
      perguntasCertas: 0,
      perguntasErradas: 0,
      pontosSustentabilidade: 0,
      rachadurasReparadas: 0,
      upgradesRealizados: 0,
    },
    phase: 'start',
    activeQuestion: null,
    activeWaste: null,
    answeredCorrectly: null,
    lastChoiceIndex: null,
    lastUpgradeMessage: null,
    log: [
      '🚢 Bem-vindo à Expedição Rio Doce!',
      'Navegue de Mariana até a foz, retire os lixos e responda aos saberes dos ribeirinhos.',
    ],
    seed,
    rngState: seed,
  };
}

function addLog(draft: GameState, message: string): void {
  draft.log.push(message);
  if (draft.log.length > 50) {
    draft.log.splice(0, draft.log.length - 50);
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'START_GAME') {
    const fresh = createInitialState(action.seed ?? state.seed);
    fresh.phase = 'navigating';
    addLog(fresh, '⚓ A embarcação soltou as amarras nas nascentes de Mariana. Boa viagem!');
    return fresh;
  }

  if (action.type === 'RESTART_GAME') {
    const fresh = createInitialState(state.seed + 1);
    fresh.phase = 'navigating';
    addLog(fresh, '🔄 Nova expedição iniciada no Rio Doce!');
    return fresh;
  }

  // Se o barco afundou ou o jogo terminou em vitória, rejeita outras ações
  if (state.phase === 'boatSunk' || state.phase === 'victory') {
    return state;
  }

  const draft: GameState = structuredClone(state);

  switch (action.type) {
    case 'ADVANCE_RIVER': {
      if (draft.phase !== 'navigating') return state;
      if (draft.currentWaypoint >= MAX_WAYPOINT_INDEX) {
        draft.phase = 'victory';
        addLog(draft, '🏆 Você chegou à Foz do Rio Doce!');
        return draft;
      }

      const nextIndex = draft.currentWaypoint + 1;
      draft.targetWaypoint = nextIndex;
      draft.currentWaypoint = nextIndex;
      const wp = getWaypoint(nextIndex);

      if (wp.tipo === 'lixo') {
        const waste = getWasteByWaypoint(nextIndex);
        if (waste && !waste.recolhido) {
          draft.activeWaste = waste;
          draft.phase = 'wasteEncounter';
          addLog(draft, `⚠️ Dejetos avistados no rio: "${waste.nome}". É hora de limpar!`);
          return draft;
        }
      }

      if (wp.tipo === 'personagem') {
        const question = getQuestionByWaypoint(nextIndex);
        if (question) {
          draft.activeQuestion = question;
          draft.answeredCorrectly = null;
          draft.lastChoiceIndex = null;
          draft.lastUpgradeMessage = null;
          draft.phase = 'characterQuiz';
          addLog(draft, `🤝 Parada em ${wp.nome}. Um ribeirinho tem uma pergunta para você!`);
          return draft;
        }
      }

      if (wp.tipo === 'foz') {
        draft.phase = 'victory';
        addLog(draft, '🎉 Foz alcançada! Expedição Rio Doce concluída com honra e sustentabilidade!');
        return draft;
      }

      // Waypoint comum
      draft.phase = 'navigating';
      addLog(draft, `⛵ Navegando pelas águas de ${wp.nome}...`);
      return draft;
    }

    case 'COLLECT_WASTE': {
      if (draft.phase !== 'wasteEncounter' || !draft.activeWaste) return state;
      const cleanup = cleanWasteItem(draft.activeWaste);
      draft.score.lixosRecolhidos += 1;
      draft.score.pontosSustentabilidade += cleanup.pointsEarned;
      addLog(draft, cleanup.message);
      draft.activeWaste = null;
      draft.phase = 'navigating';
      return draft;
    }

    case 'ANSWER_QUIZ': {
      if (draft.phase !== 'characterQuiz' || !draft.activeQuestion) return state;
      if (draft.answeredCorrectly !== null) return state; // Já respondeu

      const question = draft.activeQuestion;
      const isCorrect = action.choiceIndex === question.correta;
      draft.lastChoiceIndex = action.choiceIndex;
      draft.answeredCorrectly = isCorrect;

      if (isCorrect) {
        draft.score.perguntasCertas += 1;
        draft.score.pontosSustentabilidade += 60;

        const outcome = applyHullRepairOrUpgrade(draft.boat);
        draft.boat = outcome.boat;
        draft.lastUpgradeMessage = outcome.message;

        if (outcome.actionDone === 'repair') {
          draft.score.rachadurasReparadas += 1;
        } else {
          draft.score.upgradesRealizados += 1;
        }

        addLog(draft, `✅ Resposta correta! ${outcome.message}`);
        draft.phase = 'quizFeedback';
        return draft;
      } else {
        draft.score.perguntasErradas += 1;

        const outcome = applyHullDamage(draft.boat);
        draft.boat = outcome.boat;
        draft.lastUpgradeMessage = outcome.message;

        addLog(draft, `❌ Resposta incorreta! ${outcome.message}`);

        if (outcome.sunkJustNow) {
          draft.phase = 'boatSunk';
          addLog(draft, '☠️ Naufrágio: 4 rachaduras acumuladas no casco. O barco afundou no Rio Doce.');
          return draft;
        }

        draft.phase = 'quizFeedback';
        return draft;
      }
    }

    case 'CLOSE_FEEDBACK': {
      if (draft.phase !== 'quizFeedback') return state;
      if (draft.boat.isSunk) {
        draft.phase = 'boatSunk';
        return draft;
      }
      draft.activeQuestion = null;
      draft.answeredCorrectly = null;
      draft.lastChoiceIndex = null;
      draft.phase = 'navigating';
      return draft;
    }

    case 'MOVE_ANIMATION_DONE': {
      // Evento de sincronização da cena 3D
      return draft;
    }

    default:
      return state;
  }
}
