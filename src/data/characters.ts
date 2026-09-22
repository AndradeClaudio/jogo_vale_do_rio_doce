import type { CharacterId, CharacterProfile } from '../engine/types';

export const CHARACTERS: Record<CharacterId, CharacterProfile> = {
  agricultor: {
    id: 'agricultor',
    nome: 'Seu Zé das Lavras',
    profissao: 'Agricultor Familiar Ribeirinho',
    localidade: 'Vale do Rio Doce - MG',
    avatarEmoji: '🌾',
    introducao: 'Olá, navegante! Cuido das lavras e lavouras tradicionais que margeiam nosso Rio Doce. Posso te fazer uma pergunta sobre a produção das nossas terras?',
  },
  pescador: {
    id: 'pescador',
    nome: 'Mestre Tião do Doce',
    profissao: 'Pescador Artesanal',
    localidade: 'Curva do Rio - Mariana / Barra Longa',
    avatarEmoji: '🎣',
    introducao: 'Salve, amigo das águas! Navego neste rio há mais de 40 anos e conheço a história de cada cidade e atividade do nosso povo. Vamos ver se você conhece a região?',
  },
  artesao: {
    id: 'artesao',
    nome: 'Aracy Krenak',
    profissao: 'Artesã e Guardiã da Memória Indígena',
    localidade: 'Terra Indígena Krenak - Resplendor - MG',
    avatarEmoji: '🪶',
    introducao: 'Seja bem-vindo ao território Krenak. O Watu (Rio Doce) é sagrado para o nosso povo, e nossa arte carrega séculos de ancestralidade. Permita-me compartilhar um saber.',
  },
  guia: {
    id: 'guia',
    nome: 'Flora Menezes',
    profissao: 'Guia Ambiental e Turística',
    localidade: 'Parque Estadual do Rio Doce (PERD)',
    avatarEmoji: '🧭',
    introducao: 'Bem-vindo ao coração ecológico de Minas Gerais! Nossas trilhas, matas e lagoas encantam visitantes do mundo todo. Vamos testar seus conhecimentos sobre o nosso patrimônio natural?',
  },
  biologo: {
    id: 'biologo',
    nome: 'Dr. Lucas Viana',
    profissao: 'Pesquisador e Hidrógrafo',
    localidade: 'Estação de Monitoramento das Águas',
    avatarEmoji: '🔬',
    introducao: 'Saudações, capitão! Estou coletando amostras e monitorando a vazão e a saúde hídrica da nossa bacia. Você compreende a ciência por trás das nossas águas?',
  },
};

export function getCharacter(id: CharacterId): CharacterProfile {
  return CHARACTERS[id];
}
