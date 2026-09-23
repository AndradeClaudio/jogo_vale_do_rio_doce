import { getCharacter } from '../data/characters';
import { useGameStore } from '../store/gameStore';

const LETTERS = ['A', 'B', 'C'];

export function QuizModal() {
  const activeQuestion = useGameStore((s) => s.state.activeQuestion);
  const answeredCorrectly = useGameStore((s) => s.state.answeredCorrectly);
  const lastChoiceIndex = useGameStore((s) => s.state.lastChoiceIndex);
  const lastUpgradeMessage = useGameStore((s) => s.state.lastUpgradeMessage);
  const dispatch = useGameStore((s) => s.dispatch);

  if (!activeQuestion) return null;

  const character = getCharacter(activeQuestion.personagemId);
  const hasAnswered = answeredCorrectly !== null;

  return (
    <div className="modal-backdrop">
      <div className="modal-window">
        {/* Cabeçalho do Personagem Ribeirinho */}
        <div className="character-header">
          <div className="character-avatar">{character.avatarEmoji}</div>
          <div className="character-info">
            <h3>{character.nome}</h3>
            <p>{character.profissao} — {character.localidade}</p>
          </div>
        </div>

        {!hasAnswered && (
          <div className="character-intro">
            "{character.introducao}"
          </div>
        )}

        {/* Pergunta Pedagógica */}
        <div className="quiz-question-box">
          <h4 className="quiz-question-title">{activeQuestion.pergunta}</h4>

          <div className="quiz-choices">
            {activeQuestion.alternativas.map((alt, index) => {
              let choiceClass = 'choice-btn';
              if (hasAnswered) {
                if (index === activeQuestion.correta) {
                  choiceClass += ' correct';
                } else if (index === lastChoiceIndex) {
                  choiceClass += ' wrong';
                }
              }

              return (
                <button
                  key={index}
                  className={choiceClass}
                  disabled={hasAnswered}
                  onClick={() => dispatch({ type: 'ANSWER_QUIZ', choiceIndex: index })}
                >
                  <span className="choice-letter">{LETTERS[index]}</span>
                  <span>{alt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Pedagógico e Impacto no Barco */}
        {hasAnswered && (
          <div className={`feedback-box ${answeredCorrectly ? 'correct' : 'wrong'}`}>
            <div className="feedback-upgrade-highlight">
              {answeredCorrectly ? '🎉 Resposta Correta!' : '⚠️ Resposta Incorreta!'}
            </div>
            {lastUpgradeMessage && (
              <p><strong>{lastUpgradeMessage}</strong></p>
            )}
            <p>{activeQuestion.explicacao}</p>

            <button
              className="btn-advance"
              style={{ marginTop: '0.8rem', alignSelf: 'center' }}
              onClick={() => dispatch({ type: 'CLOSE_FEEDBACK' })}
            >
              Continuar Navegação ⛵
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
