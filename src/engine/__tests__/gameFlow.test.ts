import { describe, expect, it } from 'vitest';
import { MAX_WAYPOINT_INDEX } from '../../data/riverLayout';
import { createInitialState, gameReducer } from '../reducer';
import { calculateScoreSummary } from '../scoring';
import type { GameState } from '../types';

describe('End-to-End Game Flow Simulation', () => {
  it('completa uma partida com 100% de acertos, alcançando Foz e Cruzeiro Fluvial', () => {
    let state = createInitialState(42);
    state = gameReducer(state, { type: 'START_GAME' });

    let safetySteps = 0;
    while (state.phase !== 'victory' && state.phase !== 'boatSunk' && safetySteps < 100) {
      safetySteps++;

      if (state.phase === 'navigating') {
        state = gameReducer(state, { type: 'ADVANCE_RIVER' });
      } else if (state.phase === 'wasteEncounter') {
        state = gameReducer(state, { type: 'COLLECT_WASTE' });
      } else if (state.phase === 'characterQuiz') {
        const correctIndex = state.activeQuestion!.correta;
        state = gameReducer(state, { type: 'ANSWER_QUIZ', choiceIndex: correctIndex });
      } else if (state.phase === 'quizFeedback') {
        state = gameReducer(state, { type: 'CLOSE_FEEDBACK' });
      }
    }

    expect(state.phase).toBe('victory');
    expect(state.currentWaypoint).toBe(MAX_WAYPOINT_INDEX);
    expect(state.boat.tier).toBe(4); // Atingiu Cruzeiro Fluvial!
    expect(state.boat.cracks).toBe(0);
    expect(state.score.perguntasCertas).toBe(10);
    expect(state.score.lixosRecolhidos).toBe(4);

    const summary = calculateScoreSummary(state.score, state.boat);
    expect(summary.classificacao).toContain('Comandante Honorário');
    expect(summary.pontosTotais).toBeGreaterThan(1000);
  });

  it('simula 50 partidas com comportamentos estocásticos sem travamentos (deadlocks)', () => {
    for (let run = 1; run <= 50; run++) {
      let state = createInitialState(run * 7919);
      state = gameReducer(state, { type: 'START_GAME' });

      let actionsCount = 0;
      while (state.phase !== 'victory' && state.phase !== 'boatSunk' && actionsCount < 150) {
        actionsCount++;

        switch (state.phase) {
          case 'navigating':
            state = gameReducer(state, { type: 'ADVANCE_RIVER' });
            break;
          case 'wasteEncounter':
            state = gameReducer(state, { type: 'COLLECT_WASTE' });
            break;
          case 'characterQuiz': {
            // Probabilidade de 75% de acertar
            const isLucky = (state.rngState % 100) < 75;
            state.rngState = (Math.imul(state.rngState, 1664525) + 1013904223) | 0;
            const choice = isLucky
              ? state.activeQuestion!.correta
              : (state.activeQuestion!.correta + 1) % 3;
            state = gameReducer(state, { type: 'ANSWER_QUIZ', choiceIndex: choice });
            break;
          }
          case 'quizFeedback':
            state = gameReducer(state, { type: 'CLOSE_FEEDBACK' });
            break;
          default:
            break;
        }
      }

      // Toda partida deve terminar em vitória ou naufrágio
      expect(['victory', 'boatSunk']).toContain(state.phase);
      expect(actionsCount).toBeLessThan(150);
    }
  });
});
