# Planejamento de Tarefas — Expedição Rio Doce 3D

Este documento rastreia a evolução das entregas do projeto **Expedição Rio Doce**, baseado no ciclo de vida Clean Architecture e DDD.

---

## Backlog de Implementação

- [ ] **#1 feat(engine): Domain Models, Boat Hull Integrity & Evolution System**
  - Definição dos tipos de domínio (`src/engine/types.ts`)
  - Mecânica de integridade do casco (0 a 4 rachaduras) e regras de naufrágio (`src/engine/boat.ts`)
  - Progressão de níveis do barco (Canoa -> Bote -> Barco Regional -> Cruzeiro Sustentável)
  - Cobertura de testes unitários com Vitest (`src/engine/__tests__/boat.test.ts`)

- [ ] **#2 feat(data): Rio Doce Cultural Quizzes, Character Profiles & River Waypoints**
  - Catálogo completo com as 10 perguntas culturais/históricas do Rio Doce (`src/data/rioDoceQuestions.ts`)
  - Dados e diálogos dos personagens (Agricultor, Pescador, Artesão Krenak, Guia do PERD) (`src/data/characters.ts`)
  - Topologia do percurso do Rio Doce e marcos fluviais (`src/data/riverLayout.ts`)
  - Testes de integridade dos dados (`src/engine/__tests__/data.test.ts`)

- [ ] **#3 feat(engine): Game Reducer, Waste Cleaning Mechanics & Game Flow**
  - Reducer imutável de transições de fase (`src/engine/reducer.ts`)
  - Lógica de limpeza de dejetos no rio e ganho de pontuação ecológica (`src/engine/waste.ts`)
  - Resolução de respostas: penalidade de rachadura ou reparo/evolução do barco
  - Simulação completa de partidas e validação matemática de vitória/derrota (`src/engine/__tests__/gameFlow.test.ts`)

- [ ] **#4 feat(scene): 3D River Environment, Water Shader & Evolving Boat Meshes with Damage VFX**
  - Trilha fluvial tridimensional com `CatmullRomCurve3` e shader de correnteza do rio (`src/scene/River3D.tsx`)
  - Malhas procedurais low-poly dos 4 tiers de barco (`src/scene/BoatMeshes.tsx`)
  - Representação visual 3D das rachaduras no casco e partículas de água (`src/scene/DamageVFX.tsx`)
  - Posicionamento 3D de dejetos coletáveis e personagens ribeirinhos (`src/scene/WasteTokens.tsx`, `src/scene/CharacterTokens.tsx`)
  - Câmera orbital e cinematográfica de navegação (`src/scene/CameraRig.tsx`)

- [ ] **#5 feat(ui): Responsive HUD, Dialog Modals, Hull Integrity & Styling System**
  - Arquitetura de estilos Vanilla CSS centralizada em `src/styles/` (`tokens.css`, `hud.css`, `modals.css`)
  - HUD com medidor visual das 4 rachaduras do barco, nível de embarcação e lixo retirado (`src/ui/HUD.tsx`)
  - Modais interativos de diálogo e perguntas pedagógicas (`src/ui/QuizModal.tsx`)
  - Modal de interação para coleta de lixo no rio (`src/ui/WasteModal.tsx`)
  - Notificações de evolução (upgrade) e telas de vitória / naufrágio (`src/ui/GameOverModal.tsx`, `src/ui/VictoryModal.tsx`)
