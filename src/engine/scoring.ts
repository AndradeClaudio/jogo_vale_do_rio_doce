import type { BoatState, PlayerScore } from './types';

export interface ScoreSummary {
  pontosTotais: number;
  taxaAcertoQuiz: number;
  classificacao: string;
  resumoTexto: string;
}

export function calculateScoreSummary(score: PlayerScore, boat: BoatState): ScoreSummary {
  const totalPerguntas = score.perguntasCertas + score.perguntasErradas;
  const taxaAcerto = totalPerguntas > 0 ? (score.perguntasCertas / totalPerguntas) * 100 : 0;

  // Bônus final por tier de barco e integridade
  const bonusTier = boat.tier * 100;
  const bonusIntegridade = (4 - boat.cracks) * 75;
  const pontosTotais = score.pontosSustentabilidade + bonusTier + bonusIntegridade;

  let classificacao = 'Guardião Iniciante do Rio Doce';
  if (boat.isSunk) {
    classificacao = 'Expedição Interrompida (Naufrágio)';
  } else if (boat.tier === 4 && taxaAcerto >= 90) {
    classificacao = 'Comandante Honorário das Águas do Rio Doce 🌟';
  } else if (boat.tier >= 3 && taxaAcerto >= 70) {
    classificacao = 'Mestre Navegador do Rio Doce 🌿';
  } else if (taxaAcerto >= 50) {
    classificacao = 'Defensor Ambiental das Águas 💧';
  }

  const resumoTexto = boat.isSunk
    ? `Infelizmente seu barco afundou após 4 rachaduras. Respondeu ${score.perguntasCertas} certas e retirou ${score.lixosRecolhidos} dejetos.`
    : `Parabéns pela navegação! Você alcançou a Foz com o ${boat.tier === 4 ? 'Cruzeiro Fluvial' : 'Barco nível ' + boat.tier}, recolheu ${score.lixosRecolhidos} dejetos e acertou ${score.perguntasCertas} desafios culturais.`;

  return {
    pontosTotais,
    taxaAcertoQuiz: Math.round(taxaAcerto),
    classificacao,
    resumoTexto,
  };
}
