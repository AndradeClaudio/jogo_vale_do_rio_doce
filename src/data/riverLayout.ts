import type { RiverWaypoint, WasteItem } from '../engine/types';

export const RIVER_WAYPOINTS: RiverWaypoint[] = [
  { index: 0, nome: 'Mariana — Nascentes do Rio Doce', tipo: 'partida' },
  { index: 1, nome: 'Remanso das Garrafas', tipo: 'lixo', wasteId: 'waste_1' },
  { index: 2, nome: 'Povoado Agrícola das Lavras', tipo: 'personagem', characterId: 'agricultor', questionId: 1 },
  { index: 3, nome: 'Curva Rasa do Assoreamento', tipo: 'lixo', wasteId: 'waste_3' },
  { index: 4, nome: 'Margem Sagrada do Watu', tipo: 'personagem', characterId: 'artesao', questionId: 2 },
  { index: 5, nome: 'Porto Histórico das Minas', tipo: 'personagem', characterId: 'pescador', questionId: 3 },
  { index: 6, nome: 'Vila da Memória e da Música', tipo: 'personagem', characterId: 'guia', questionId: 4 },
  { index: 7, nome: 'Corredeira dos Entulhos', tipo: 'lixo', wasteId: 'waste_7' },
  { index: 8, nome: 'Aldeia Krenak — Filosofia da Terra', tipo: 'personagem', characterId: 'artesao', questionId: 5 },
  { index: 9, nome: 'Entrada do Parque Estadual (PERD)', tipo: 'personagem', characterId: 'guia', questionId: 6 },
  { index: 10, nome: 'Mirante das Lagoas Naturais', tipo: 'personagem', characterId: 'biologo', questionId: 7 },
  { index: 11, nome: 'Estação de Monitoramento Hidrográfico', tipo: 'personagem', characterId: 'biologo', questionId: 8 },
  { index: 12, nome: 'Vale das Agroflorestas', tipo: 'personagem', characterId: 'agricultor', questionId: 9 },
  { index: 13, nome: 'Casa de Saberes e Artesanato Krenak', tipo: 'personagem', characterId: 'artesao', questionId: 10 },
  { index: 14, nome: 'Trecho Crítico de Resíduos Plásticos', tipo: 'lixo', wasteId: 'waste_14' },
  { index: 15, nome: 'Foz do Rio Doce — Encontro com o Mar', tipo: 'foz' },
];

export const INITIAL_WASTE_ITEMS: WasteItem[] = [
  {
    id: 'waste_1',
    nome: 'Garrafas Plásticas PET',
    tipo: 'garrafa',
    pontos: 25,
    waypointIndex: 1,
    recolhido: false,
  },
  {
    id: 'waste_3',
    nome: 'Pneu Abandonado no Leito',
    tipo: 'pneu',
    pontos: 35,
    waypointIndex: 3,
    recolhido: false,
  },
  {
    id: 'waste_7',
    nome: 'Entulho e Sucata Flutuante',
    tipo: 'entulho',
    pontos: 40,
    waypointIndex: 7,
    recolhido: false,
  },
  {
    id: 'waste_14',
    nome: 'Embalagens Plásticas Industriais',
    tipo: 'plastico',
    pontos: 30,
    waypointIndex: 14,
    recolhido: false,
  },
];

export function getWaypoint(index: number): RiverWaypoint {
  const wp = RIVER_WAYPOINTS[index];
  if (!wp) {
    throw new Error(`Waypoint fora dos limites do Rio Doce: ${index}`);
  }
  return wp;
}

export function getWasteByWaypoint(waypointIndex: number): WasteItem | undefined {
  return INITIAL_WASTE_ITEMS.find((w) => w.waypointIndex === waypointIndex);
}

export const MAX_WAYPOINT_INDEX = RIVER_WAYPOINTS.length - 1;
