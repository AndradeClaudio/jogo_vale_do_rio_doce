import { PixiCanvas } from './scene/PixiCanvas';
import { GameOverModal } from './ui/GameOverModal';
import { HUD } from './ui/HUD';
import { QuizModal } from './ui/QuizModal';
import { StartScreen } from './ui/StartScreen';
import { VictoryModal } from './ui/VictoryModal';
import { WasteCleaningModal } from './ui/WasteCleaningModal';

export default function App() {
  return (
    <div className="game-root">
      {/* Cena 2D vetorial (Pixi.js) */}
      <PixiCanvas />

      {/* Interface HUD 2D */}
      <HUD />

      {/* Modais e Diálogos */}
      <StartScreen />
      <QuizModal />
      <WasteCleaningModal />
      <GameOverModal />
      <VictoryModal />
    </div>
  );
}
