import { calculateScoreSummary } from '../engine/scoring';
import { useGameStore } from '../store/gameStore';

export function GameOverModal() {
  const phase = useGameStore((s) => s.state.phase);
  const boat = useGameStore((s) => s.state.boat);
  const score = useGameStore((s) => s.state.score);
  const dispatch = useGameStore((s) => s.dispatch);

  if (phase !== 'boatSunk') return null;

  const summary = calculateScoreSummary(score, boat);

  return (
    <div className="modal-backdrop">
      <div className="modal-window endgame-window">
        <div className="endgame-icon">💥⛵</div>
        <h2 style={{ color: 'var(--color-dano-critico)', fontSize: '1.8rem' }}>
          O Barco Afundou!
        </h2>
        <p style={{ color: 'var(--color-texto-secundario)', lineHeight: 1.5 }}>
          Após acumular 4 rachaduras não reparadas, o casco cedeu à força das águas do Rio Doce.
        </p>

        <div style={{
          background: 'rgba(254, 226, 226, 0.6)',
          border: '1px solid var(--color-dano-critico)',
          borderRadius: 'var(--raio-borda-medio)',
          padding: '1rem',
          width: '100%',
          textAlign: 'left',
          fontSize: '0.95rem',
          lineHeight: 1.6,
        }}>
          <div><strong>Classificação:</strong> {summary.classificacao}</div>
          <div><strong>Lixos Retirados:</strong> {score.lixosRecolhidos}</div>
          <div><strong>Perguntas Respondidas:</strong> {score.perguntasCertas} certas / {score.perguntasErradas} erradas</div>
          <div><strong>Pontos de Sustentabilidade:</strong> {score.pontosSustentabilidade}</div>
        </div>

        <button
          className="btn-restart"
          onClick={() => dispatch({ type: 'RESTART_GAME' })}
        >
          🔄 Tentar Novamente
        </button>
      </div>
    </div>
  );
}
