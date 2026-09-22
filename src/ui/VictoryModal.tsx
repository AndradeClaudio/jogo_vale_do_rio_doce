import { BOAT_TIERS_INFO } from '../engine/boat';
import { calculateScoreSummary } from '../engine/scoring';
import { useGameStore } from '../store/gameStore';

export function VictoryModal() {
  const phase = useGameStore((s) => s.state.phase);
  const boat = useGameStore((s) => s.state.boat);
  const score = useGameStore((s) => s.state.score);
  const dispatch = useGameStore((s) => s.dispatch);

  if (phase !== 'victory') return null;

  const summary = calculateScoreSummary(score, boat);
  const tierInfo = BOAT_TIERS_INFO[boat.tier];

  return (
    <div className="modal-backdrop">
      <div className="modal-window endgame-window">
        <div className="endgame-icon">🏆🌊</div>
        <h2 style={{ color: 'var(--color-mata-escura)', fontSize: '1.9rem' }}>
          Expedição Concluída com Sucesso!
        </h2>
        <p style={{ color: 'var(--color-texto-secundario)', lineHeight: 1.5 }}>
          Você navegou por toda a extensão do Rio Doce, de Mariana até o litoral,
          resgatando saberes ancestrais e despoluindo as águas!
        </p>

        <div style={{
          background: 'rgba(220, 252, 231, 0.6)',
          border: '1.5px solid var(--color-sucesso-verde)',
          borderRadius: 'var(--raio-borda-medio)',
          padding: '1.2rem',
          width: '100%',
          textAlign: 'left',
          fontSize: '1rem',
          lineHeight: 1.8,
        }}>
          <div><strong>Embarcação Final:</strong> {tierInfo.nome} (Nível {boat.tier})</div>
          <div><strong>Classificação:</strong> {summary.classificacao}</div>
          <div><strong>Pontuação Total:</strong> {summary.pontosTotais} pontos</div>
          <div><strong>Taxa de Acertos no Quiz:</strong> {summary.taxaAcertoQuiz}% ({score.perguntasCertas}/10)</div>
          <div><strong>Lixos Retirados do Rio:</strong> {score.lixosRecolhidos} itens</div>
          <div><strong>Rachaduras Reparadas:</strong> {score.rachadurasReparadas}</div>
        </div>

        <button
          className="btn-advance"
          onClick={() => dispatch({ type: 'RESTART_GAME' })}
        >
          🌟 Nova Expedição no Rio Doce
        </button>
      </div>
    </div>
  );
}
