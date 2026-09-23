import type { Avatar } from '../engine/types';

const SKIN = '#c68a5c';
const HAIR = '#2b1a10';

/** Retrato ilustrado de quem vai navegar — mesmas cores usadas no barco dentro do jogo. */
export function AvatarPortrait({ avatar }: { avatar: Avatar }) {
  const isGirl = avatar === 'menina';
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label={isGirl ? 'Navegadora' : 'Navegador'}>
      <circle cx="60" cy="60" r="58" fill={isGirl ? '#fde68a' : '#bae6fd'} />
      {isGirl && (
        <>
          <ellipse cx="60" cy="58" rx="31" ry="33" fill={HAIR} />
          <rect x="79" y="66" width="9" height="36" rx="4.5" fill={HAIR} />
          <circle cx="83.5" cy="100" r="4" fill="#ec4899" />
        </>
      )}
      <ellipse cx="60" cy="122" rx="38" ry="28" fill={isGirl ? '#f97316' : '#0ea5e9'} />
      <rect x="54" y="78" width="12" height="16" rx="4" fill={SKIN} />
      <ellipse cx="60" cy="60" rx="22" ry="24" fill={SKIN} />
      {isGirl ? (
        <>
          <path d="M37 58 Q39 31 60 31 Q81 31 83 58 Q73 43 60 46 Q47 43 37 58 Z" fill={HAIR} />
          <circle cx="80" cy="38" r="4" fill="#f472b6" />
          <circle cx="80" cy="38" r="1.6" fill="#fde047" />
        </>
      ) : (
        <>
          <path d="M38 58 Q38 34 60 34 Q82 34 82 58 Q76 46 60 45 Q44 46 38 58 Z" fill={HAIR} />
          <ellipse cx="60" cy="38" rx="38" ry="8" fill="#eab308" />
          <rect x="41" y="17" width="38" height="22" rx="11" fill="#facc15" />
          <rect x="41" y="31" width="38" height="4" fill="#b45309" />
        </>
      )}
      <circle cx="52" cy="62" r="2.6" fill="#1c1917" />
      <circle cx="68" cy="62" r="2.6" fill="#1c1917" />
      <circle cx="53" cy="61" r="0.9" fill="#fff" />
      <circle cx="69" cy="61" r="0.9" fill="#fff" />
      <circle cx="46" cy="70" r="3.5" fill="#f472b6" opacity="0.35" />
      <circle cx="74" cy="70" r="3.5" fill="#f472b6" opacity="0.35" />
      <path d="M53 71 Q60 77 67 71" stroke="#7c2d12" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
