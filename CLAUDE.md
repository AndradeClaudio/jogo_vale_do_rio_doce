# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Web game (3D, educational) about the Rio Doce river basin in Minas Gerais. Player navigates a boat from Mariana to the river mouth, collects waste from the river, and answers 10 pedagogical questions posed by riverside characters (farmers, fishers, Krenak leaders, environmental guides). Wrong answers crack the hull (4 cracks = shipwreck/game over); correct answers repair a crack or, if the hull is already intact, upgrade the boat through 4 tiers. Content and UI copy are in Portuguese.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b (project references) then vite build
npm run preview   # preview production build
npm run test      # vitest run (all tests)
```

Run a single test file: `npx vitest run src/engine/__tests__/reducer.test.ts`
Run in watch mode: `npx vitest`

## Architecture

Layered/DDD-style split with a strict one-way dependency: `engine` → `store`/`scene`/`ui`. The engine layer has zero React/Three.js imports and is 100% unit-testable in isolation.

- **`src/engine/`** — pure domain logic and invariants, no framework deps.
  - `types.ts` — `GameState`, `GameAction`, and all domain types/models.
  - `boat.ts` — hull integrity: damage, repair, and the 4-tier boat upgrade progression.
  - `waste.ts` — waste-collection mechanics and sustainability scoring.
  - `scoring.ts` — score calculation and honorary classification.
  - `reducer.ts` — the single pure reducer (`gameReducer`) driving the entire game state machine via `GameAction`s (`START_GAME`, `ADVANCE_RIVER`, `COLLECT_WASTE`, `ANSWER_QUIZ`, `CLOSE_FEEDBACK`, `MOVE_ANIMATION_DONE`, `RESTART_GAME`). `phase` on `GameState` (`start` → `navigating` → `wasteEncounter`/`characterQuiz` → `quizFeedback` → ... → `boatSunk`/`victory`) is the source of truth for what's on screen; each action asserts the current phase before acting and is a no-op (returns the same state reference) otherwise. State transitions use `structuredClone` + a mutable draft, not Immer.
- **`src/data/`** — static typed catalogs: the 10 quiz questions + answer keys (`rioDoceQuestions.ts`), riverside character profiles (`characters.ts`), and river waypoint topology (`riverLayout.ts`). Waypoint `tipo` (`lixo` / `personagem` / `foz` / common) drives which phase `ADVANCE_RIVER` transitions into.
- **`src/store/`** — `gameStore.ts`: a thin Zustand store (`subscribeWithSelector`) wrapping the engine reducer. `dispatch` calls `gameReducer` and only calls `set` when state actually changed (reference inequality).
- **`src/scene/`** — the 3D world (Three.js via `@react-three/fiber` + `@react-three/drei`): `GameCanvas.tsx` (root canvas), boat models/animation (`BoatMeshes.tsx`, `BoatToken.tsx`), river geometry (`River3D.tsx`, `pathUtils.ts` — navigation follows a `CatmullRomCurve3`), floating waste (`WasteTokens.tsx`), character tokens (`CharacterTokens.tsx`), terrain (`Environment3D.tsx`), stylized illustrations (`Illustrations3D.tsx`), and camera (`CameraRig.tsx`).
- **`src/ui/`** — 2D React overlay components (HUD, quiz modal, waste-cleaning modal, start/game-over/victory screens) that read from the store and dispatch actions.
- **`src/styles/`** — vanilla CSS, no CSS-in-JS: `tokens.css` (design tokens), `main.css` (resets/structure), `hud.css`, `modals.css`.

When changing game rules or scoring, edit `src/engine/` only — it's covered by tests in `src/engine/__tests__/` and consumed identically by store/scene/ui. When changing what's rendered/visualized, `scene/` and `ui/` consume `useGameStore` but should never encode game rules themselves.
