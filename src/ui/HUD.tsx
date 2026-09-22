import { MAX_WAYPOINT_INDEX, getWaypoint } from '../data/riverLayout';
import { BOAT_TIERS_INFO } from '../engine/boat';
import { useGameStore } from '../store/gameStore';

export function HUD() {
  const currentWaypoint = useGameStore((s) => s.state.currentWaypoint);
  const boat = useGameStore((s) => s.state.boat);
  const score = useGameStore((s) => s.state.score);
  const phase = useGameStore((s) => s.state.phase);
  const log = useGameStore((s) => s.state.log);
  const dispatch = useGameStore((s) => s.dispatch);

  const tierInfo = BOAT_TIERS_INFO[boat.tier];
  const wp = getWaypoint(currentWaypoint);
  const progressPercent = Math.round((currentWaypoint / MAX_WAYPOINT_INDEX) * 100);
  const lastLogMessage = log[log.length - 1] ?? '';

  const canAdvance = phase === 'navigating';

  return (
    <div className="hud-container">
      {/* Topo do HUD */}
      <div className="hud-top">
        {/* Card do Barco e Rachaduras */}
        <div className="hud-card boat-status-card">
          <div className="boat-header">
            <span className="boat-tier-title">
              ⛵ {tierInfo.nome}
            </span>
            <span className="boat-tier-pill">Nível {boat.tier}</span>
          </div>

          <div className="cracks-meter">
            <div className="cracks-label-row">
              <span>Integridade do Casco:</span>
              <span style={{ color: boat.cracks >= 3 ? 'var(--color-dano-critico)' : 'inherit' }}>
                {boat.cracks === 0 ? 'Casco Íntegro (0/4)' : `${boat.cracks}/4 Rachaduras`}
              </span>
            </div>
            <div className="cracks-slots-row">
              {[1, 2, 3, 4].map((slotNumber) => {
                const isCracked = boat.cracks >= slotNumber;
                return (
                  <div
                    key={slotNumber}
                    className={`crack-slot ${isCracked ? 'cracked' : 'intact'}`}
                    title={isCracked ? `Rachadura ${slotNumber} ativa` : 'Casco vedado'}
                  >
                    {isCracked ? '⚡' : '🛡️'}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="river-progress-bar">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="progress-text">{wp.nome} ({progressPercent}%)</span>
          </div>
        </div>

        {/* Card de Pontuação e Sustentabilidade */}
        <div className="hud-card stats-card">
          <div className="stat-item">
            <span className="stat-label">Lixo Recolhido</span>
            <span className="stat-value">🗑️ {score.lixosRecolhidos}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Acertos</span>
            <span className="stat-value">🎯 {score.perguntasCertas}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Sustentabilidade</span>
            <span className="stat-value">🌿 {score.pontosSustentabilidade}</span>
          </div>
        </div>
      </div>

      {/* Rodapé com Ação de Navegação e Toast */}
      <div className="hud-bottom">
        {lastLogMessage && (
          <div className="log-toast">
            {lastLogMessage}
          </div>
        )}

        {canAdvance && (
          <button
            className="btn-advance"
            onClick={() => dispatch({ type: 'ADVANCE_RIVER' })}
          >
            🧭 Navegar pelo Rio Doce ➡️
          </button>
        )}
      </div>
    </div>
  );
}
