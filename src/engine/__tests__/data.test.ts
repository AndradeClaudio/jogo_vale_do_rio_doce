import { describe, expect, it } from 'vitest';
import { CHARACTERS, getCharacter } from '../../data/characters';
import {
  INITIAL_WASTE_ITEMS,
  MAX_WAYPOINT_INDEX,
  RIVER_WAYPOINTS,
  getWasteByWaypoint,
  getWaypoint,
} from '../../data/riverLayout';
import {
  RIO_DOCE_QUESTIONS,
  getQuestionById,
  getQuestionByWaypoint,
} from '../../data/rioDoceQuestions';

describe('Rio Doce Data & Pedagogical Catalog Integrity', () => {
  it('contém exatamente as 10 perguntas solicitadas pelo usuário', () => {
    expect(RIO_DOCE_QUESTIONS).toHaveLength(10);
    const ids = RIO_DOCE_QUESTIONS.map((q) => q.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('valida que todas as 10 perguntas possuem 3 alternativas e gabarito válido', () => {
    for (const q of RIO_DOCE_QUESTIONS) {
      expect(q.alternativas).toHaveLength(3);
      expect(q.correta).toBeGreaterThanOrEqual(0);
      expect(q.correta).toBeLessThanOrEqual(2);
      expect(q.pergunta.trim().length).toBeGreaterThan(5);
      expect(q.explicacao.trim().length).toBeGreaterThan(10);
      expect(CHARACTERS[q.personagemId]).toBeDefined();
    }
  });

  it('verifica os gabaritos específicos das 10 questões solicitadas', () => {
    // 1. Produtos agrícolas -> Café e cacau (opção B / índice 1)
    expect(getQuestionById(1)?.alternativas[getQuestionById(1)!.correta]).toBe('Café e cacau');

    // 2. Povo indígena -> Krenak (opção A / índice 0)
    expect(getQuestionById(2)?.alternativas[getQuestionById(2)!.correta]).toBe('Krenak');

    // 3. Economia de Mariana -> Mineração (opção B / índice 1)
    expect(getQuestionById(3)?.alternativas[getQuestionById(3)!.correta]).toBe('Mineração');

    // 4. Agnaldo Timóteo -> Cantor (opção B / índice 1)
    expect(getQuestionById(4)?.alternativas[getQuestionById(4)!.correta]).toBe('Cantor');

    // 5. Ailton Krenak -> Escritor e representante do povo Krenak (opção A / índice 0)
    expect(getQuestionById(5)?.alternativas[getQuestionById(5)!.correta]).toBe(
      'Escritor e representante do povo Krenak',
    );

    // 6. Parque no turismo -> Parque Estadual do Rio Doce (opção A / índice 0)
    expect(getQuestionById(6)?.alternativas[getQuestionById(6)!.correta]).toBe(
      'Parque Estadual do Rio Doce',
    );

    // 7. Turismo destaca -> As belezas naturais (opção A / índice 0)
    expect(getQuestionById(7)?.alternativas[getQuestionById(7)!.correta]).toBe('As belezas naturais');

    // 8. Hidrografia -> Os rios e águas (opção A / índice 0)
    expect(getQuestionById(8)?.alternativas[getQuestionById(8)!.correta]).toBe('Os rios e águas');

    // 9. Produto com o café -> Cacau (opção A / índice 0)
    expect(getQuestionById(9)?.alternativas[getQuestionById(9)!.correta]).toBe('Cacau');

    // 10. Artesanato -> Krenak (opção A / índice 0)
    expect(getQuestionById(10)?.alternativas[getQuestionById(10)!.correta]).toBe('Krenak');
  });

  it('valida o catálogo de personagens ribeirinhos', () => {
    const charactersList = ['agricultor', 'pescador', 'artesao', 'guia', 'biologo'] as const;
    for (const charId of charactersList) {
      const char = getCharacter(charId);
      expect(char.nome).toBeTruthy();
      expect(char.profissao).toBeTruthy();
      expect(char.avatarEmoji).toBeTruthy();
    }
  });

  it('valida os waypoints do Rio Doce de 0 a 15', () => {
    expect(RIVER_WAYPOINTS).toHaveLength(16);
    expect(MAX_WAYPOINT_INDEX).toBe(15);

    RIVER_WAYPOINTS.forEach((wp, index) => {
      expect(wp.index).toBe(index);
      const fetched = getWaypoint(index);
      expect(fetched.nome).toBe(wp.nome);
    });

    expect(getWaypoint(0).tipo).toBe('partida');
    expect(getWaypoint(15).tipo).toBe('foz');
  });

  it('valida os itens de lixo e dejetos no leito do rio', () => {
    expect(INITIAL_WASTE_ITEMS.length).toBeGreaterThanOrEqual(4);
    for (const waste of INITIAL_WASTE_ITEMS) {
      expect(waste.pontos).toBeGreaterThan(0);
      expect(waste.waypointIndex).toBeLessThan(MAX_WAYPOINT_INDEX);
      const wp = getWaypoint(waste.waypointIndex);
      expect(wp.tipo).toBe('lixo');
      expect(getWasteByWaypoint(waste.waypointIndex)?.id).toBe(waste.id);
    }
  });

  it('relaciona cada pergunta a um waypoint existente', () => {
    for (const q of RIO_DOCE_QUESTIONS) {
      const wp = getWaypoint(q.waypointIndex);
      expect(wp.tipo).toBe('personagem');
      expect(wp.questionId).toBe(q.id);
      expect(getQuestionByWaypoint(q.waypointIndex)?.id).toBe(q.id);
    }
  });
});
