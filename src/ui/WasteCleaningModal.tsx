import { useGameStore } from '../store/gameStore';

export function WasteCleaningModal() {
  const activeWaste = useGameStore((s) => s.state.activeWaste);
  const phase = useGameStore((s) => s.state.phase);
  const dispatch = useGameStore((s) => s.dispatch);

  if (phase !== 'wasteEncounter' || !activeWaste) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-window">
        <div className="waste-modal-body">
          <div className="waste-icon-large">
            {activeWaste.tipo === 'garrafa' && '🍾'}
            {activeWaste.tipo === 'pneu' && '🛞'}
            {activeWaste.tipo === 'entulho' && '🧱'}
            {activeWaste.tipo === 'plastico' && '🛍️'}
          </div>

          <h3 style={{ fontSize: '1.4rem' }}>Dejetos no Rio Doce!</h3>
          <p style={{ color: 'var(--color-texto-secundario)', lineHeight: 1.5 }}>
            Você encontrou <strong>{activeWaste.nome}</strong> flutuando no leito do rio.
            Retirar resíduos protege os peixes, desassoreia as águas e restaura a saúde do Rio Doce.
          </p>

          <button
            className="btn-clean"
            onClick={() => dispatch({ type: 'COLLECT_WASTE' })}
          >
            🧹 Recolher Dejeto do Rio (+{activeWaste.pontos + 50} pts)
          </button>
        </div>
      </div>
    </div>
  );
}
