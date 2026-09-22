import type { QuizQuestion } from '../engine/types';

export const RIO_DOCE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    pergunta: 'Quais produtos agrícolas são citados?',
    alternativas: [
      'Arroz e feijão',
      'Café e cacau',
      'Milho e trigo',
    ],
    correta: 1,
    explicacao: 'O café e o cacau são culturas agrícolas de grande relevância e tradição econômica nas terras férteis da bacia do Rio Doce.',
    personagemId: 'agricultor',
    waypointIndex: 2,
  },
  {
    id: 2,
    pergunta: 'Qual povo indígena é citado?',
    alternativas: [
      'Krenak',
      'Guarani',
      'Yanomami',
    ],
    correta: 0,
    explicacao: 'O povo Krenak habita tradicionalmente as margens do Rio Doce (chamado "Watu" em sua língua nativa), no leste do estado de Minas Gerais.',
    personagemId: 'artesao',
    waypointIndex: 4,
  },
  {
    id: 3,
    pergunta: 'Qual atividade se destaca na economia de Mariana?',
    alternativas: [
      'Pesca',
      'Mineração',
      'Pecuária',
    ],
    correta: 1,
    explicacao: 'Mariana, primeira capital de Minas Gerais, tem sua história e atividade econômica fortemente marcadas pela mineração desde o ciclo do ouro até os dias atuais.',
    personagemId: 'pescador',
    waypointIndex: 5,
  },
  {
    id: 4,
    pergunta: 'Quem foi Agnaldo Timóteo?',
    alternativas: [
      'Escritor',
      'Cantor',
      'Agricultor',
    ],
    correta: 1,
    explicacao: 'Agnaldo Timóteo foi um consagrado cantor e compositor da música popular brasileira, nascido em Caratinga, no Vale do Rio Doce.',
    personagemId: 'guia',
    waypointIndex: 6,
  },
  {
    id: 5,
    pergunta: 'Quem é Ailton Krenak?',
    alternativas: [
      'Escritor e representante do povo Krenak',
      'Cantor',
      'Agricultor',
    ],
    correta: 0,
    explicacao: 'Ailton Krenak é um aclamado filósofo, escritor, ambientalista, líder indígena e imortal da Academia Brasileira de Letras (ABL).',
    personagemId: 'artesao',
    waypointIndex: 8,
  },
  {
    id: 6,
    pergunta: 'Qual parque é citado no turismo?',
    alternativas: [
      'Parque Estadual do Rio Doce',
      'Parque Nacional da Serra da Canastra',
      'Parque do Ibirapuera',
    ],
    correta: 0,
    explicacao: 'O Parque Estadual do Rio Doce (PERD) é a maior reserva contínua de Mata Atlântica de Minas Gerais, guardando mais de 40 lagoas naturais.',
    personagemId: 'guia',
    waypointIndex: 9,
  },
  {
    id: 7,
    pergunta: 'O turismo destaca o quê?',
    alternativas: [
      'As belezas naturais',
      'As fábricas',
      'As escolas',
    ],
    correta: 0,
    explicacao: 'O turismo na bacia do Rio Doce celebra as exuberantes belezas naturais, lagoas límpidas, serras e a biodiversidade da Mata Atlântica.',
    personagemId: 'biologo',
    waypointIndex: 10,
  },
  {
    id: 8,
    pergunta: 'O que é estudado na hidrografia?',
    alternativas: [
      'Os rios e águas',
      'As plantações',
      'As músicas',
    ],
    correta: 0,
    explicacao: 'A hidrografia é o ramo da geografia física dedicado ao estudo e mapeamento das águas do planeta, especialmente bacias fluviais, nascentes e lagos.',
    personagemId: 'biologo',
    waypointIndex: 11,
  },
  {
    id: 9,
    pergunta: 'Qual produto aparece junto com o café?',
    alternativas: [
      'Cacau',
      'Algodão',
      'Cana-de-açúcar',
    ],
    correta: 0,
    explicacao: 'O cacau surge consorciado com o café ao longo do Vale do Rio Doce, fortalecendo a economia e a agricultura familiar regional.',
    personagemId: 'agricultor',
    waypointIndex: 12,
  },
  {
    id: 10,
    pergunta: 'O artesanato está relacionado a qual cultura?',
    alternativas: [
      'Krenak',
      'Japonesa',
      'Italiana',
    ],
    correta: 0,
    explicacao: 'O artesanato tradicional do Vale do Rio Doce é profundamente ligado à cultura e aos saberes ancestrais do povo indígena Krenak.',
    personagemId: 'artesao',
    waypointIndex: 13,
  },
];

export function getQuestionById(id: number): QuizQuestion | undefined {
  return RIO_DOCE_QUESTIONS.find((q) => q.id === id);
}

export function getQuestionByWaypoint(waypointIndex: number): QuizQuestion | undefined {
  return RIO_DOCE_QUESTIONS.find((q) => q.waypointIndex === waypointIndex);
}
