import { describe, expect, it } from 'vitest';
import { MAX_CRACKS } from '../boat';
import { createInitialState, gameReducer } from '../reducer';


describe('Game Reducer & Event Flow', () => {
  it('inicializa e transiciona para navegando ao iniciar o jogo', () => {
    let state = createInitialState(123);
    expect(state.phase).toBe('start');
    expect(state.currentWaypoint).toBe(0);

    state = gameReducer(state, { type: 'START_GAME' });
    expect(state.phase).toBe('navigating');
    expect(state.boat.tier).toBe(1);
    expect(state.boat.cracks).toBe(0);
  });

  it('avalia o encontro com dejeto no waypoint 1 e coleta com sucesso', () => {
    let state = createInitialState(123);
    state = gameReducer(state, { type: 'START_GAME' });

    // Avança para o waypoint 1 (lixo)
    state = gameReducer(state, { type: 'ADVANCE_RIVER' });
    expect(state.currentWaypoint).toBe(1);
    expect(state.phase).toBe('wasteEncounter');
    expect(state.activeWaste?.nome).toContain('Garrafas');

    // Coleta o dejeto
    state = gameReducer(state, { type: 'COLLECT_WASTE' });
    expect(state.phase).toBe('navigating');
    expect(state.score.lixosRecolhidos).toBe(1);
    expect(state.score.pontosSustentabilidade).toBeGreaterThan(0);
    expect(state.activeWaste).toBeNull();
  });

  it('avalia o encontro com personagem no waypoint 2 e responde corretamente, aprimorando o barco', () => {
    let state = createInitialState(123);
    state = gameReducer(state, { type: 'START_GAME' });
    state = gameReducer(state, { type: 'ADVANCE_RIVER' }); // WP 1: Lixo
    state = gameReducer(state, { type: 'COLLECT_WASTE' });
    state = gameReducer(state, { type: 'ADVANCE_RIVER' }); // WP 2: Pergunta 1

    expect(state.currentWaypoint).toBe(2);
    expect(state.phase).toBe('characterQuiz');
    expect(state.activeQuestion?.id).toBe(1);

    // Pergunta 1: correta é índice 1 (Café e cacau)
    state = gameReducer(state, { type: 'ANSWER_QUIZ', choiceIndex: 1 });
    expect(state.phase).toBe('quizFeedback');
    expect(state.answeredCorrectly).toBe(true);
    expect(state.score.perguntasCertas).toBe(1);
    expect(state.boat.tier).toBe(2); // Evoluiu de canoa para bote!

    state = gameReducer(state, { type: 'CLOSE_FEEDBACK' });
    expect(state.phase).toBe('navigating');
    expect(state.activeQuestion).toBeNull();
  });

  it('provoca naufrágio quando o jogador acumula 4 erros em perguntas', () => {
    let state = createInitialState(123);
    state = gameReducer(state, { type: 'START_GAME' });

    // Simula 4 perguntas com respostas erradas
    for (let i = 1; i <= 4; i++) {
      state.phase = 'characterQuiz';
      state.activeQuestion = {
        id: i,
        pergunta: `Teste ${i}`,
        alternativas: ['A', 'B', 'C'],
        correta: 0,
        explicacao: 'Explicacao',
        personagemId: 'agricultor',
        waypointIndex: i,
      };

      state = gameReducer(state, { type: 'ANSWER_QUIZ', choiceIndex: 1 }); // Erra
      if (i < 4) {
        expect(state.boat.cracks).toBe(i);
        expect(state.boat.isSunk).toBe(false);
        state = gameReducer(state, { type: 'CLOSE_FEEDBACK' });
      }
    }

    expect(state.boat.cracks).toBe(MAX_CRACKS);
    expect(state.boat.isSunk).toBe(true);
    expect(state.phase).toBe('boatSunk');

    // Qualquer tentativa de avançar pós-naufrágio é ignorada
    const afterSunk = gameReducer(state, { type: 'ADVANCE_RIVER' });
    expect(afterSunk.phase).toBe('boatSunk');
  });

  it('permite vedar rachaduras com respostas corretas subsequentes', () => {
    let state = createInitialState(123);
    state = gameReducer(state, { type: 'START_GAME' });

    // Erra uma pergunta propositalmente
    state.phase = 'characterQuiz';
    state.activeQuestion = {
      id: 99,
      pergunta: 'Pergunta',
      alternativas: ['Certa', 'Errada', 'Outra'],
      correta: 0,
      explicacao: 'Exp',
      personagemId: 'agricultor',
      waypointIndex: 1,
    };
    state = gameReducer(state, { type: 'ANSWER_QUIZ', choiceIndex: 1 }); // Erra
    expect(state.boat.cracks).toBe(1);

    state = gameReducer(state, { type: 'CLOSE_FEEDBACK' });

    // Agora acerta uma pergunta
    state.phase = 'characterQuiz';
    state.activeQuestion = {
      id: 100,
      pergunta: 'Pergunta 2',
      alternativas: ['Certa', 'Errada', 'Outra'],
      correta: 0,
      explicacao: 'Exp',
      personagemId: 'artesao',
      waypointIndex: 2,
    };
    state = gameReducer(state, { type: 'ANSWER_QUIZ', choiceIndex: 0 }); // Acerta
    expect(state.answeredCorrectly).toBe(true);
    expect(state.boat.cracks).toBe(0); // Vedou a rachadura!
    expect(state.boat.tier).toBe(1); // Não evoluiu porque gastou o acerto no reparo
    expect(state.score.rachadurasReparadas).toBe(1);
  });
});
