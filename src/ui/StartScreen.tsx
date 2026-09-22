import { useGameStore } from '../store/gameStore';

export function StartScreen() {
  const phase = useGameStore((s) => s.state.phase);
  const dispatch = useGameStore((s) => s.dispatch);

  if (phase !== 'start') return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-window endgame-window" style={{ maxWidth: '620px' }}>
        <div style={{ fontSize: '3.5rem' }}>🛶🌿</div>
        <h1 style={{ color: 'var(--color-rio-profundo)', fontSize: '2rem' }}>
          Expedição Rio Doce 3D
        </h1>
        <p style={{ color: 'var(--color-texto-secundario)', lineHeight: 1.6, textAlign: 'justify' }}>
          Embarque em uma jornada pelas águas históricas e sagradas do <strong>Rio Doce (Watu)</strong>,
          em Minas Gerais. Navegando a bordo de uma canoa tradicional, sua missão é retirar os dejetos
          poluentes do leito do rio e responder às perguntas dos ribeirinhos: agricultores, pescadores,
          artesãos Krenak e guias ambientais.
        </p>

        <div style={{
          background: 'rgba(2, 132, 199, 0.08)',
          borderLeft: '4px solid var(--color-rio-azul)',
          padding: '0.9rem',
          borderRadius: 'var(--raio-borda-pequeno)',
          textAlign: 'left',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          color: 'var(--color-texto-principal)',
        }}>
          <div>⚡ <strong>Atenção ao Casco:</strong> Cada erro causa uma rachadura. Com 4 rachaduras, o barco afunda!</div>
          <div>🛠️ <strong>Reparo & Evolução:</strong> Acertos vedam rachaduras. Se o barco estiver sem danos, ele aprimora para um Bote, Barco Regional ou até um Cruzeiro Fluvial!</div>
        </div>

        <button
          className="btn-advance"
          style={{ fontSize: '1.25rem', padding: '1rem 2.8rem' }}
          onClick={() => dispatch({ type: 'START_GAME' })}
        >
          ⚓ Iniciar Navegação no Rio Doce
        </button>
      </div>
    </div>
  );
}
