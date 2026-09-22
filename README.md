# ⛵ Expedição Rio Doce 3D — Minas Gerais

Jogo web 3D educacional e de conscientização ambiental sobre a bacia hidrográfica do **Rio Doce (Minas Gerais)**. Navegue de **Mariana** até a foz, retire dejetos do leito do rio e responda aos desafios culturais e históricos propostos por ribeirinhos (agricultores, pescadores, lideranças da etnia Krenak e guias ambientais).

---

## 🎮 Mecânica do Jogo

1. **Navegação Fluvial 3D:**
   - Percurso sobre curva tridimensional `CatmullRomCurve3` passando por pontos históricos e ecológicos de Minas Gerais (Mariana, Aimorés, Parque Estadual do Rio Doce - PERD).
2. **Coleta de Dejetos e Despoluição:**
   - Pontos de lixo (garrafas PET, pneus, entulhos de construção, plásticos) que devem ser retirados para desobstruir as águas e somar pontos de sustentabilidade.
3. **Desafios Culturais dos Ribeirinhos (10 Perguntas):**
   - Questões pedagógicas sobre Mariana, povo Krenak, Ailton Krenak, Agnaldo Timóteo, café, cacau, hidrografia e o PERD.
4. **Integridade do Casco e Evolução do Barco:**
   - Cada erro causa **+1 rachadura no casco**. Atingindo **4 rachaduras**, o barco naufraga (*Game Over*).
   - Cada acerto repara **1 rachadura** ativa.
   - Se o barco estiver 100% íntegro (0 rachaduras), o acerto aprimora o barco:
     - **Tier 1:** Canoa Ribeirinha Krenak
     - **Tier 2:** Bote Motorizado Ágil
     - **Tier 3:** Barco Regional Tradicional com Cabine
     - **Tier 4:** Cruzeiro Fluvial Sustentável

---

## 🚀 Como Rodar o Projeto

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Executar suíte de testes (Vitest)
npm run test

# Gerar build de produção
npm run build
```

---

## 🏛️ Arquitetura em Camadas (DDD / Clean Architecture)

```
src/
├── engine/         # Domínio puro e regras invariantes (sem React/Three.js, 100% testável)
│   ├── types.ts    # Tipos e modelos estritos
│   ├── boat.ts     # Integridade do casco, danos, reparos e evolução
│   ├── waste.ts    # Mecânica de coleta de dejetos e sustentabilidade
│   ├── scoring.ts  # Cálculo de pontuação e classificação honorária
│   └── reducer.ts  # Reducer puro e ciclo de eventos
├── data/           # Catálogos estáticos tipados
│   ├── rioDoceQuestions.ts  # As 10 questões pedagógicas e gabaritos
│   ├── characters.ts        # Perfis dos personagens ribeirinhos
│   └── riverLayout.ts       # Topologia dos waypoints do Rio Doce
├── store/          # Zustand store conectando a apresentação ao reducer
├── scene/          # Mundo tridimensional (Three.js + R3F + Drei)
│   ├── GameCanvas.tsx       # Canvas 3D principal
│   ├── BoatMeshes.tsx       # Modelos procedurais dos 4 tiers de barco e rachaduras
│   ├── BoatToken.tsx        # Controlador de interpolação e animação
│   ├── River3D.tsx          # Leito d'água tubular e atracadouros
│   ├── WasteTokens.tsx      # Dejetos flutuantes
│   ├── CharacterTokens.tsx  # Personagens 3D nos piers
│   ├── Environment3D.tsx    # Montanhas e relevo de Minas Gerais
│   └── CameraRig.tsx        # Câmera orbital e de perseguição
├── styles/         # Arquitetura Vanilla CSS centralizada
│   ├── tokens.css  # Variáveis globais de cores, sombras e dimensões
│   ├── main.css    # Resets e regras estruturais
│   ├── hud.css     # Painel de integridade, contador de lixo e navegação
│   └── modals.css  # Diálogos, quiz e modais de fim de jogo
└── ui/             # Componentes 2D de interface
    ├── HUD.tsx
    ├── QuizModal.tsx
    ├── WasteCleaningModal.tsx
    ├── StartScreen.tsx
    ├── GameOverModal.tsx
    └── VictoryModal.tsx
```
