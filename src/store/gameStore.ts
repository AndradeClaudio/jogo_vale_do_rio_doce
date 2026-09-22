import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { createInitialState, gameReducer } from '../engine/reducer';
import type { GameAction, GameState } from '../engine/types';

interface GameStore {
  state: GameState;
  dispatch: (action: GameAction) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    state: createInitialState(),
    dispatch: (action) => {
      const prev = get().state;
      const next = gameReducer(prev, action);
      if (next !== prev) {
        set({ state: next });
      }
    },
    reset: () => set({ state: createInitialState() }),
  })),
);
