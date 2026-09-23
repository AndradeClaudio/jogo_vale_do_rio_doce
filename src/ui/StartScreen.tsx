import { useState } from 'react';
import type { Avatar } from '../engine/types';
import { useGameStore } from '../store/gameStore';
import { AvatarPortrait } from './AvatarPortrait';

interface StorySlide {
  icon: string;
  date?: string;
  title: string;
  text: string;
  fact?: string;
  tone: string;
}

// História do rompimento da barragem de Fundão (Mariana, 2015), contada antes
// da largada para dar sentido à missão de limpar e conhecer o rio.
const STORY: StorySlide[] = [
  {
    icon: '🏞️',
    title: 'O Rio Doce',
    text: 'Por séculos, o Rio Doce — o Watu, rio sagrado para o povo Krenak — levou água, peixe e sustento a milhões de pessoas em Minas Gerais e no Espírito Santo.',
    tone: 'linear-gradient(135deg, #bae6fd, #bbf7d0)',
  },
  {
    icon: '⚠️',
    date: '5 de novembro de 2015',
    title: 'A barragem se rompeu',
    text: 'Em Mariana (MG), a barragem de Fundão, da mineradora Samarco — controlada pela Vale e pela BHP Billiton —, se rompeu. Uma onda de lama com rejeitos de minério de ferro desceu o vale.',
    fact: 'Cerca de 40 milhões de m³ de lama',
    tone: 'linear-gradient(135deg, #fed7aa, #fca5a5)',
  },
  {
    icon: '🏚️',
    title: 'Bento Rodrigues coberto pela lama',
    text: 'Em poucos minutos, a lama soterrou o distrito de Bento Rodrigues e atingiu outras comunidades, como Paracatu de Baixo. Famílias perderam suas casas, seus vizinhos e sua história.',
    fact: '19 vidas perdidas',
    tone: 'linear-gradient(135deg, #d6d3d1, #a8a29e)',
  },
  {
    icon: '🌊',
    title: 'A lama chegou ao mar',
    text: 'Os rejeitos desceram o Rio Doce por mais de 600 km até o Oceano Atlântico, em Regência (ES). Peixes morreram, cidades como Governador Valadares ficaram sem água e o povo Krenak perdeu o acesso ao seu rio sagrado.',
    fact: 'Um dos maiores desastres socioambientais do Brasil',
    tone: 'linear-gradient(135deg, #d6b98c, #8a6337)',
  },
  {
    icon: '🛶',
    title: 'Sua missão',
    text: 'O rio ainda se recupera. Navegue de Mariana até a foz, retire o lixo das águas e aprenda com quem vive às suas margens. Cada acerto fortalece o barco — e a memória do Rio Doce.',
    tone: 'linear-gradient(135deg, #99f6e4, #bae6fd)',
  },
];

const AVATAR_OPTIONS: { value: Avatar; label: string }[] = [
  { value: 'menina', label: 'Navegadora' },
  { value: 'menino', label: 'Navegador' },
];

export function StartScreen() {
  const phase = useGameStore((s) => s.state.phase);
  const savedAvatar = useGameStore((s) => s.state.avatar);
  const dispatch = useGameStore((s) => s.dispatch);
  const [step, setStep] = useState<'historia' | 'personagem'>('historia');
  const [slide, setSlide] = useState(0);
  const [avatar, setAvatar] = useState<Avatar>(savedAvatar);

  if (phase !== 'start') return null;

  if (step === 'historia') {
    const current = STORY[slide];
    const isLast = slide === STORY.length - 1;
    return (
      <div className="modal-backdrop">
        <div className="modal-window endgame-window intro-window">
          <div className="intro-header">
            <span className="intro-brand">Expedição Rio Doce</span>
            {!isLast && (
              <button className="btn-link" onClick={() => setStep('personagem')}>
                Pular história
              </button>
            )}
          </div>

          <div className="story-illustration" style={{ background: current.tone }} aria-hidden="true">
            {current.icon}
          </div>

          {current.date && <div className="story-date">{current.date}</div>}
          <h2 className="story-title">{current.title}</h2>
          <p className="story-text">{current.text}</p>
          {current.fact && <div className="story-fact">{current.fact}</div>}

          <div className="story-dots" aria-label={`Parte ${slide + 1} de ${STORY.length}`}>
            {STORY.map((s, i) => (
              <span key={s.title} className={`story-dot ${i === slide ? 'active' : ''}`} />
            ))}
          </div>

          <div className="intro-nav">
            <button className="btn-link" onClick={() => setSlide(slide - 1)} style={{ visibility: slide === 0 ? 'hidden' : 'visible' }}>
              ← Voltar
            </button>
            <button className="btn-advance" onClick={() => (isLast ? setStep('personagem') : setSlide(slide + 1))}>
              {isLast ? 'Escolher personagem →' : 'Continuar →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-window endgame-window intro-window">
        <div className="intro-header">
          <span className="intro-brand">Expedição Rio Doce</span>
          <button className="btn-link" onClick={() => { setSlide(0); setStep('historia'); }}>
            Rever a história
          </button>
        </div>

        <h2 className="story-title">Quem vai navegar o Rio Doce?</h2>

        <div className="avatar-options" role="radiogroup" aria-label="Escolha seu personagem">
          {AVATAR_OPTIONS.map((option) => (
            <button
              key={option.value}
              role="radio"
              aria-checked={avatar === option.value}
              className={`avatar-card ${avatar === option.value ? 'selected' : ''}`}
              onClick={() => setAvatar(option.value)}
            >
              <AvatarPortrait avatar={option.value} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="intro-rules">
          <div>⚡ <strong>Atenção ao casco:</strong> cada erro causa uma rachadura. Com 4 rachaduras, o barco afunda!</div>
          <div>🛠️ <strong>Reparo e evolução:</strong> acertos vedam rachaduras. Com o casco inteiro, o barco evolui até virar um Cruzeiro Fluvial!</div>
        </div>

        <button className="btn-advance" onClick={() => dispatch({ type: 'START_GAME', avatar })}>
          ⚓ Iniciar Navegação
        </button>
      </div>
    </div>
  );
}
