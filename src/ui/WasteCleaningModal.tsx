import { useGameStore } from '../store/gameStore';

export function WasteCleaningModal() {
  const activeWaste = useGameStore((s) => s.state.activeWaste);
  const phase = useGameStore((s) => s.state.phase);
  const dispatch = useGameStore((s) => s.dispatch);

  if (phase !== 'wasteEncounter' || !activeWaste) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '1.2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 40,
      pointerEvents: 'auto',
      maxWidth: '520px',
      width: '90%',
    }}>
      <div className="waste-interactive-banner" style={{ justifyContent: 'space-between', padding: '0.8rem 1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.8rem' }}>
            {activeWaste.tipo === 'garrafa' && '🍾'}
            {activeWaste.tipo === 'pneu' && '🛞'}
            {activeWaste.tipo === 'entulho' && '🧱'}
            {activeWaste.tipo === 'plastico' && '🛍️'}
          </span>
          <div>
            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', opacity: 0.9 }}>Rio Poluído!</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>Toque no lixo no rio para retirar!</div>
          </div>
        </div>

        <button
          className="btn-tap-clean-3d"
          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          onClick={() => dispatch({ type: 'COLLECT_WASTE' })}
        >
          🧹 Retirar (+{activeWaste.pontos + 50} pts)
        </button>
      </div>
    </div>
  );
}
