import {
  Leaf, Mountain, TreePine, Gem as GemIcon, Sparkles
} from 'lucide-react';
import '../style.css';

/* ===================================================
   WORM SKINS - Premium earthworm color palettes
   =================================================== */
const SKINS = [
  { id: 'emerald', name: 'Emerald', primary: '#10b981', secondary: '#059669', highlight: '#34d399', glow: 'rgba(52, 211, 153, 0.5)', label: 'Garden Earth', price: 0, owned: true },
  { id: 'golden', name: 'Golden Sun', primary: '#f59e0b', secondary: '#d97706', highlight: '#fef08a', glow: 'rgba(251, 191, 36, 0.5)', label: 'Golden Glow', price: 500, owned: false },
  { id: 'ruby', name: 'Ruby Flame', primary: '#e11d48', secondary: '#be123c', highlight: '#fb7185', glow: 'rgba(244, 63, 94, 0.5)', label: 'Blazing Spark', price: 750, owned: false },
  { id: 'amethyst', name: 'Cosmic Violet', primary: '#8b5cf6', secondary: '#6d28d9', highlight: '#c4b5fd', glow: 'rgba(168, 85, 247, 0.5)', label: 'Mystic Aura', price: 1000, owned: false },
  { id: 'cyber', name: 'Neon Cyber', primary: '#06b6d4', secondary: '#0e7490', highlight: '#67e8f9', glow: 'rgba(6, 182, 212, 0.5)', label: 'Digital Edge', price: 1500, owned: false },
  { id: 'rose', name: 'Rose Quartz', primary: '#ec4899', secondary: '#be185d', highlight: '#fbcfe8', glow: 'rgba(236, 72, 153, 0.5)', label: 'Gentle Bloom', price: 1200, owned: false },
];

function calculateStars(moves, limit, parMoves) {
  const par = parMoves || Math.ceil(limit * 0.55);
  if (moves <= par) return 3;
  if (moves <= Math.ceil(limit * 0.8)) return 2;
  return 1;
}

const WorldIcons = {
  leaf: Leaf,
  mountain: Mountain,
  gem: GemIcon,
  'tree-pine': TreePine,
  sparkles: Sparkles,
};

const WorldIcon = ({ name, size = 20, className = '' }) => {
  const Icon = WorldIcons[name] || Sparkles;
  return <Icon size={size} className={className} />;
};

/* ===================================================
   REALISTIC EARTHWORM CHARACTER SYSTEM
   =================================================== */

/* 1. Worm Head - Realistic segmented earthworm with eyes, mouth, clitellum */
function WormHeadSVG({ facing = 'right', skinId = 'emerald', expression = 'idle', skinColor = {}, time = 0 }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;

  const isEating = expression === 'eating';
  const isMoving = expression === 'moving';
  const isHappy = expression === 'happy';
  const isIdle = !isEating && !isMoving && !isHappy;

  const pupilR = isEating ? 2.5 : isHappy ? 4 : 5;
  const blinkProgress = isIdle ? (Math.sin(time * 0.003) * 0.5 + 0.5) : 0;
  const shouldBlink = isIdle && blinkProgress > 0.98;
  const eyeScale = shouldBlink ? 0.12 : 1;
  const pupilOffsetX = isEating ? 2 : isMoving ? 2 : 1.5;
  const mouthOpen = isEating ? 1 : 0;
  const headTilt = isMoving ? 3 : isEating ? 5 : 0;

  return (
    <svg className={`worm-head facing-${facing} ${isMoving ? 'moving' : ''} ${isEating ? 'eating' : ''} ${isHappy ? 'happy' : ''} ${isIdle ? 'idle' : ''}`} viewBox="0 0 120 120">
      <defs>
        <linearGradient id={`headGrad-${skinId}-${expression}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="30%" stopColor={primary} />
          <stop offset="70%" stopColor={secondary} />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`headBelly-${skinId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={highlight} stopOpacity="0.5" />
          <stop offset="40%" stopColor={primary} stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
        <filter id="headShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000000" floodOpacity="0.5" />
        </filter>
        <filter id="slimySheen" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ground shadow under head */}
      <ellipse cx="60" cy="92" rx="38" ry="14" fill="rgba(0,0,0,0.25)" filter="url(#headShadow)" />

      {/* Clitellum band (thick segment near head - mature worm feature) */}
      <ellipse cx="60" cy="52" rx="44" ry="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      <ellipse cx="60" cy="48" rx="40" ry="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

      {/* Main head body - tapered worm shape */}
      <path
        d="M20 40 Q60 20 100 40 Q100 80 60 92 Q20 80 20 40 Z"
        fill={`url(#headGrad-${skinId}-${expression})`}
        filter="url(#headShadow)"
      />
      <path
        d="M25 45 Q60 28 95 45 Q95 75 60 85 Q25 75 25 45 Z"
        fill={`url(#headBelly-${skinId})`}
        opacity="0.85"
      />

      {/* Segmentation rings */}
      <g stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M28 50 Q60 62 92 50" />
        <path d="M34 56 Q60 66 86 56" strokeWidth="1.5" opacity="0.6" />
        <path d="M40 60 Q60 68 80 60" strokeWidth="1" opacity="0.4" />
      </g>

      {/* Slimy highlight sheen */}
      <path
        d="M35 40 Q55 30 75 40 Q85 60 75 80 Q55 90 35 60 Q25 50 35 40 Z"
        fill="#ffffff"
        opacity="0.12"
        filter="url(#slimySheen)"
      />

      {/* Eyes on top of head */}
      <g transform="translate(44, 48)">
        <ellipse cx="0" cy="0" rx="10" ry={isEating ? 4 : 10} fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
        {!shouldBlink && (
          <g className="worm-eye-pupil">
            <circle cx={pupilOffsetX} cy={-2} r={pupilR * eyeScale} fill="#0f172a" />
            <circle cx={pupilOffsetX - 1} cy={-3} r="2.5" fill="#ffffff" />
            <circle cx={pupilOffsetX + 2} cy={1} r="1" fill="#ffffff" opacity="0.9" />
          </g>
        )}
        {shouldBlink && <path d="M-10 0 Q0 -3 10 0" stroke="#0f172a" strokeWidth="3" fill="none" />}
      </g>
      <g transform="translate(76, 48)">
        <ellipse cx="0" cy="0" rx="10" ry={isEating ? 4 : 10} fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
        {!shouldBlink && (
          <g className="worm-eye-pupil">
            <circle cx={pupilOffsetX} cy={-2} r={pupilR * eyeScale} fill="#0f172a" />
            <circle cx={pupilOffsetX - 1} cy={-3} r="2.5" fill="#ffffff" />
            <circle cx={pupilOffsetX + 2} cy={1} r="1" fill="#ffffff" opacity="0.9" />
          </g>
        )}
        {shouldBlink && <path d="M-10 0 Q0 -3 10 0" stroke="#0f172a" strokeWidth="3" fill="none" />}
      </g>

      {/* Mouth at front of head */}
      <g transform={`translate(60, ${82 + mouthOpen * 8}) rotate(${headTilt})`}>
        {isEating ? (
          <>
            <ellipse cx="0" cy="0" rx="12" ry="10" fill="#1a0a0a" stroke="#0f172a" strokeWidth="2" />
            <ellipse cx="0" cy="4" rx="7" ry="6" fill="#fb7185" opacity="0.95" />
            <path d="M-4 0 Q0 3 4 0" stroke="#ffffff" strokeWidth="1" opacity="0.4" fill="none" />
          </>
        ) : isHappy ? (
          <path d="M-6 2 Q0 6 6 2" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M-4 1 Q0 3 4 1" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}
      </g>

      {/* Antennae/sensors */}
      <g stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M42 30 Q52 18 62 28" opacity="0.6" />
        <path d="M78 30 Q68 18 58 28" opacity="0.6" />
        <circle cx="52" cy="16" r="1.5" fill="#0f172a" opacity="0.7" />
        <circle cx="68" cy="16" r="1.5" fill="#0f172a" opacity="0.7" />
      </g>

      {/* Breathing pulse */}
      <ellipse cx="60" cy="60" rx={38 + Math.sin(time * 0.002) * 2} ry={30 + Math.sin(time * 0.002) * 2} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    </svg>
  );
}

/* 2. Worm Body Segment - Peristaltic rings & segmentation */
function WormSegmentSVG({ skinId = 'emerald', scale = 1, index = 0, skinColor = {}, wavePhase = 0 }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;

  const wave = Math.sin(wavePhase + index * 0.8);
  const segmentHeight = 28 + wave * 4;
  const segmentWidth = 42 + wave * 2;
  const compress = wave > 0 ? 1 + wave * 0.15 : 1;

  const stripe = index % 2 === 0;

  return (
    <svg className="worm-segment" style={{ '--seg-scale': scale, '--seg-i': index, '--wave': wave }} viewBox="0 0 120 120">
      <defs>
        <linearGradient id={`segGrad-${skinId}-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="30%" stopColor={primary} />
          <stop offset="70%" stopColor={secondary} />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`segBelly-${skinId}-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={highlight} stopOpacity="0.4" />
          <stop offset="50%" stopColor={primary} stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
        </linearGradient>
        <filter id="segShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
        </filter>
        <filter id="slimySheenSeg" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="60" cy="82" rx={30 * scale} ry={10 * scale} fill="rgba(0,0,0,0.2)" filter="url(#segShadow)" />

      {/* Main segment body - cylindrical */}
      <path
        d="M18 42 Q60 28 102 42 Q102 78 60 86 Q18 78 18 42 Z"
        fill={`url(#segGrad-${skinId}-${index})`}
        filter="url(#segShadow)"
        transform={`scale(${compress}, 1) translate(${(1-compress)*60}, 0)`}
      />
      <path
        d="M24 46 Q60 34 96 46 Q96 74 60 82 Q24 74 24 46 Z"
        fill={`url(#segBelly-${skinId}-${index})`}
        opacity="0.85"
      />

      {/* Segmentation rings - defining worm feature */}
      <g stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7">
        <path d={`M25 ${stripe ? 54 : 48} Q60 ${stripe ? 66 : 60} 95 ${stripe ? 54 : 48}`} />
        <path d={`M32 ${stripe ? 58 : 52} Q60 ${stripe ? 68 : 56} 88 ${stripe ? 58 : 52}`} strokeWidth="1.5" opacity="0.5" />
      </g>

      {/* Slimy sheen */}
      <path
        d="M30 44 Q55 36 80 44 Q85 60 80 76 Q55 84 30 60 Q15 52 30 44 Z"
        fill="#ffffff"
        opacity="0.1"
        filter="url(#slimySheenSeg)"
      />

      {/* Subtle highlight spots */}
      <ellipse cx="40" cy="44" rx={8 * scale} ry={5 * scale} fill="#ffffff" opacity="0.2" transform={`rotate(-15 40 44)`} />
      <circle cx="78" cy="68" r={2.5 * scale} fill={highlight} opacity="0.4" />
    </svg>
  );
}

/* 3. Worm Tail - Tapered point with wiggle */
function WormTailSVG({ skinId = 'emerald', skinColor = {}, time = 0 }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;

  const wiggle = Math.sin(time * 0.004) * 3;

  return (
    <svg className="worm-tail" viewBox="0 0 120 120" style={{ transform: `rotate(${wiggle}deg)` }}>
      <defs>
        <linearGradient id={`tailGrad-${skinId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="30%" stopColor={primary} />
          <stop offset="70%" stopColor={secondary} />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`tailBelly-${skinId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={highlight} stopOpacity="0.4" />
          <stop offset="50%" stopColor={primary} stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
        </linearGradient>
        <filter id="tailShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="55" cy="85" rx="18" ry="8" fill="rgba(0,0,0,0.18)" filter="url(#tailShadow)" />

      {/* Tapered tail body */}
      <path
        d="M20 50 Q50 35 95 55 Q105 65 80 78 Q45 90 20 60 Z"
        fill={`url(#tailGrad-${skinId})`}
        filter="url(#tailShadow)"
      />
      <path
        d="M28 54 Q55 44 88 58 Q95 66 72 74 Q40 82 28 64 Z"
        fill={`url(#tailBelly-${skinId})`}
        opacity="0.85"
      />

      {/* Tail segmentation rings */}
      <g stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6">
        <path d="M30 52 Q55 48 80 54" />
        <path d="M36 58 Q55 56 74 60" strokeWidth="1" opacity="0.4" />
        <path d="M42 64 Q55 64 68 66" strokeWidth="0.8" opacity="0.3" />
      </g>

      {/* Tail tip - darker */}
      <path d="M78 60 Q95 55 105 62 Q98 72 82 70 Q68 64 78 60 Z" fill={secondary} opacity="0.6" />
      <ellipse cx="95" cy="62" rx="3" ry="4" fill={secondary} />

      {/* Slimy sheen */}
      <path d="M32 50 Q55 44 78 52 Q85 64 78 74 Q55 78 32 62 Q25 56 32 50 Z" fill="#ffffff" opacity="0.08" filter="url(#slimySheenSeg)" />
    </svg>
  );
}

/* 4. Premium Apple with 3D look */
function PremiumAppleSVG({ collected = false, bobPhase = 0 }) {
  const bobY = Math.sin(bobPhase) * 3;
  const bobRotate = Math.sin(bobPhase * 0.7) * 1.5;

  return (
    <svg className={`premium-apple ${collected ? 'collected' : ''}`} viewBox="0 0 120 120" style={{
      animation: collected ? 'none' : 'appleBob 3s ease-in-out infinite alternate',
      transform: `translateY(${bobY}px) rotate(${bobRotate}deg)`
    }}>
      <defs>
        <radialGradient id="appleBody" cx="30%" cy="25%" r="78%">
          <stop offset="0%" stopColor="#fff5f5" />
          <stop offset="10%" stopColor="#ffcccc" />
          <stop offset="30%" stopColor="#ff6b6b" />
          <stop offset="55%" stopColor="#ef4444" />
          <stop offset="75%" stopColor="#dc2626" />
          <stop offset="90%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#6b1010" />
        </radialGradient>
        <radialGradient id="appleSpecular" cx="28%" cy="22%" r="35%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="appleGlowAura" cx="50%" cy="65%" r="55%">
          <stop offset="0%" stopColor="rgba(239,68,68,0.25)" />
          <stop offset="100%" stopColor="rgba(239,68,68,0)" />
        </radialGradient>
        <linearGradient id="appleLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <linearGradient id="appleStem" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <filter id="appleGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Ground glow */}
      <ellipse cx="60" cy="95" rx="30" ry="10" fill="url(#appleGlowAura)" />

      {/* Main apple body */}
      <path
        d="M60 40 C35 40, 16 58, 16 78 C16 98, 38 106, 60 100 C82 106, 104 98, 104 78 C104 58, 85 40, 60 40 Z"
        fill="url(#appleBody)"
        filter="url(#appleGlow)"
      />

      {/* Subsurface scatter */}
      <path
        d="M60 40 C35 40, 16 58, 16 78 C16 98, 38 106, 60 100 C82 106, 104 98, 104 78 C104 58, 85 40, 60 40 Z"
        fill="#ffaaaa"
        opacity="0.15"
      />

      {/* Primary specular */}
      <ellipse cx="38" cy="52" rx="18" ry="22" fill="url(#appleSpecular)" transform="rotate(-20 38 52)" />
      <ellipse cx="34" cy="48" rx="7" ry="9" fill="#ffffff" opacity="0.5" transform="rotate(-25 34 48)" />
      <circle cx="28" cy="58" r="2.5" fill="#ffffff" opacity="0.35" />

      {/* Rim light */}
      <path
        d="M60 40 C85 40, 104 58, 104 78 C104 98, 82 106, 60 100"
        fill="none"
        stroke="url(#appleRimLight)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Stem */}
      <path d="M60 38 Q64 22 70 14" stroke="url(#appleStem)" strokeWidth="5.5" strokeLinecap="round" fill="none" filter="url(#appleGlow)" />

      {/* Leaf */}
      <g transform="translate(72, 14) rotate(12)">
        <path d="M0 14 C6 2, 22 2, 28 12 C32 20, 18 26, 0 18 Z" fill="url(#appleLeaf)" stroke="#14532d" strokeWidth="1.8" />
        <path d="M0 14 Q12 8 24 10" stroke="#14532d" strokeWidth="1.4" fill="none" opacity="0.7" />
      </g>

      {/* Sparkles */}
      <g className="apple-sparkle" transform="translate(20, 30)" style={{ animation: 'sparkleOrbit 3.2s ease-in-out infinite' }}>
        <polygon points="7,0 9,5 15,7 9,9 7,14 5,9 0,7 5,5" fill="#fef08a" />
      </g>
      <g className="apple-sparkle" transform="translate(88, 80)" style={{ animation: 'sparkleOrbit 3.8s ease-in-out infinite reverse' }}>
        <polygon points="6,0 8,3 12,5 8,7 6,10 4,7 0,5 4,3" fill="#fde68a" />
      </g>
    </svg>
  );
}

/* 5. Premium Cosmic Portal */
function PremiumPortalSVG({ unlocked = false, pulsePhase = 0 }) {
  const pulseScale = 1 + Math.sin(pulsePhase) * 0.08;

  return (
    <svg className={`premium-portal ${unlocked ? 'unlocked' : 'locked'}`} viewBox="0 0 140 140" style={{ transform: unlocked ? `scale(${pulseScale})` : 'scale(1)' }}>
      <defs>
        <radialGradient id="portalVoid" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={unlocked ? '#ffffff' : '#3d1a6b'} />
          <stop offset="15%" stopColor={unlocked ? '#67e8f9' : '#2e1065'} />
          <stop offset="35%" stopColor={unlocked ? '#a78bfa' : '#1e0a3d'} />
          <stop offset="60%" stopColor={unlocked ? '#8b5cf6' : '#0f051a'} />
          <stop offset="100%" stopColor="rgba(2,6,23,0.1)" />
        </radialGradient>
        <radialGradient id="portalCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={unlocked ? '#ffffff' : '#4c1d95'} stopOpacity="0.9" />
          <stop offset="40%" stopColor={unlocked ? '#22d3ee' : '#312e81'} stopOpacity="0.6" />
          <stop offset="70%" stopColor={unlocked ? '#c084fc' : '#1e1e3f'} stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="portalRune" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="25%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="75%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <filter id="portalGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="particleGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer ambient rings */}
      {unlocked && (
        <g filter="url(#portalGlow)" opacity="0.6">
          <circle cx="70" cy="70" r="62" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="16 8" opacity="0.4" style={{ animation: 'portalRingSpin 20s linear infinite' }} />
          <circle cx="70" cy="70" r="56" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="10 10" opacity="0.35" style={{ animation: 'portalRingSpin 15s linear infinite reverse' }} />
          <circle cx="70" cy="70" r="50" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="6 6" opacity="0.3" style={{ animation: 'portalRingSpin 12s linear infinite' }} />
        </g>
      )}

      {/* Main portal ring */}
      <circle cx="70" cy="70" r="60" fill="none" stroke={unlocked ? 'url(#portalRune)' : '#334155'} strokeWidth={unlocked ? 5 : 4} strokeDasharray={unlocked ? '14 6 4 6' : '8 8'} opacity={unlocked ? 1 : 0.7} filter={unlocked ? 'url(#portalGlow)' : 'none'} style={{ animation: unlocked ? 'portalRingSpin 8s linear infinite' : 'none' }} />

      {/* Inner ring */}
      <circle cx="70" cy="70" r="54" fill="none" stroke={unlocked ? '#e0f2fe' : '#475569'} strokeWidth="2" opacity={unlocked ? 0.6 : 0.4} />

      {/* Pulsing core */}
      <circle className="portal-pulse-ring" cx="70" cy="70" r="48" fill="url(#portalCore)" filter={unlocked ? 'url(#portalGlow)' : 'none'} opacity={unlocked ? 0.8 : 0.3} />

      {/* Mystical runes */}
      <g stroke="#a78bfa" strokeWidth="1.5" fill="none" opacity={unlocked ? 0.7 : 0.3}>
        <circle cx="70" cy="70" r="66" strokeDasharray="4 12" style={{ animation: 'portalRingSpin 30s linear infinite reverse' }} />
      </g>

      {unlocked ? (
        <g className="portal-galaxy-spin" filter="url(#portalGlow)">
          <path d="M70 70 Q95 35 120 55" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M70 70 Q45 105 20 85" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M70 70 Q105 95 85 120" stroke="#fbbf24" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M70 70 Q35 45 55 20" stroke="#fb7185" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.8" />

          {/* Central core */}
          <circle cx="70" cy="70" r="14" fill="#ffffff" opacity="0.95" filter="url(#portalGlow)" />
          <circle cx="70" cy="70" r="9" fill="#22d3ee" filter="url(#portalGlow)" />
          <circle cx="70" cy="70" r="5" fill="#ffffff" opacity="0.9" />

          {/* Orbiting particles */}
          <g style={{ animation: 'galaxySpinOrbit 6s linear infinite' }}>
            <circle cx="100" cy="45" r="2.5" fill="#fff" filter="url(#particleGlow)" />
            <circle cx="40" cy="95" r="2" fill="#fff" opacity="0.9" filter="url(#particleGlow)" />
            <circle cx="105" cy="90" r="1.5" fill="#fff" opacity="0.8" filter="url(#particleGlow)" />
            <circle cx="35" cy="45" r="1.8" fill="#fff" opacity="0.85" filter="url(#particleGlow)" />
            <circle cx="112" cy="70" r="1.2" fill="#fbbf24" filter="url(#particleGlow)" />
            <circle cx="28" cy="70" r="1.2" fill="#fb7185" filter="url(#particleGlow)" />
          </g>

          <g style={{ animation: 'galaxySpinOrbit 4s linear infinite reverse' }}>
            <circle cx="85" cy="50" r="1.5" fill="#22d3ee" filter="url(#particleGlow)" />
            <circle cx="55" cy="90" r="1.2" fill="#a78bfa" filter="url(#particleGlow)" />
            <circle cx="90" cy="90" r="1" fill="#fbbf24" filter="url(#particleGlow)" />
            <circle cx="50" cy="50" r="1" fill="#fb7185" filter="url(#particleGlow)" />
          </g>
        </g>
      ) : (
        <g transform="translate(48, 45)" opacity="0.85" filter="url(#portalGlow)">
          <rect x="4" y="16" width="28" height="22" rx="5" fill="#1e1e3f" stroke="#475569" strokeWidth="2" />
          <rect x="8" y="20" width="20" height="14" rx="3" fill="none" stroke="#64748b" strokeWidth="1" opacity="0.5" />
          <path d="M12 16 V8 C12 3, 26 3, 26 8 V16" stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M12 16 V8 C12 3, 26 3, 26 8 V16" stroke="#cbd5e1" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
          <circle cx="18" cy="27" r="3" fill="#020617" />
          <rect x="17" y="29" width="2" height="6" rx="1" fill="#020617" />
          <circle cx="18" cy="12" r="1.5" fill="#64748b" opacity="0.6" style={{ animation: 'lockParticleFloat 2s ease-in-out infinite' }} />
          <circle cx="28" cy="18" r="1" fill="#475569" opacity="0.5" style={{ animation: 'lockParticleFloat 2.5s ease-in-out infinite reverse' }} />
        </g>
      )}
    </svg>
  );
}

/* 6. Environment Tiles - Stone Wall */
function PremiumStoneWallSVG({ worldId = 1, variant = 0, seed = 0 }) {
  const themes = {
    1: { base: ['#2d4a35', '#1e3a26', '#142d1b'], moss: ['#4ade80', '#22c55e', '#166534'], accent: '#86efac', edge: '#bbf7d0', rune: '#4ade80', glyph: 'leaf', decor: 'moss' },
    2: { base: ['#785c3a', '#5c4528', '#3d2e15'], moss: ['#fcd34d', '#d97706', '#92400e'], accent: '#fde68a', edge: '#fef08a', rune: '#f59e0b', glyph: 'sun', decor: 'cracks' },
    3: { base: ['#1e3a5f', '#0f2440', '#081830'], moss: ['#67e8f9', '#0ea5e9', '#0369a1'], accent: '#bae6fd', edge: '#e0f2fe', rune: '#38bdf8', glyph: 'crystal', decor: 'crystals' },
    4: { base: ['#3d1a5c', '#2a1045', '#1a0830'], moss: ['#c084fc', '#a855f7', '#7e22ce'], accent: '#e9d5ff', edge: '#f5f0ff', rune: '#a855f7', glyph: 'arcane', decor: 'runes' },
    5: { base: ['#4a1a3d', '#351028', '#22081a'], moss: ['#f9a8d4', '#f43f5e', '#be185d'], accent: '#fce7f3', edge: '#fff0f5', rune: '#f472b6', glyph: 'star', decor: 'stars' },
  };
  const t = themes[worldId] || themes[1];
  const rx = [10, 12, 8, 14, 10, 12][variant % 6];
  const gid = `wall-${worldId}-${variant}-${seed % 4}`;
  const decorSeed = (seed * 9301 + 49297) % 233280;
  const decorRand = decorSeed / 233280;

  return (
    <svg className="premium-wall" viewBox="0 0 120 120">
      <defs>
        <linearGradient id={`${gid}-top`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={t.base[0]} stopOpacity="0.95" />
          <stop offset="35%" stopColor={t.base[1]} stopOpacity="0.98" />
          <stop offset="70%" stopColor={t.base[2]} />
          <stop offset="100%" stopColor={t.base[2]} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`${gid}-edge`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={t.edge} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${gid}-moss`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={t.moss[0]} stopOpacity="0" />
          <stop offset="30%" stopColor={t.moss[1]} stopOpacity="0.3" />
          <stop offset="60%" stopColor={t.moss[2]} stopOpacity="0.6" />
          <stop offset="100%" stopColor={t.moss[2]} stopOpacity="0.8" />
        </linearGradient>
        <filter id={`${gid}-shadow`} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.7" />
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      <rect x="6" y="6" width="108" height="108" rx={rx} fill={`url(#${gid}-top)`} stroke="#050810" strokeWidth="3.5" filter={`url(#${gid}-shadow)`} />
      <rect x="12" y="12" width="96" height="96" rx={Math.max(6, rx - 4)} fill="none" stroke={t.edge} strokeWidth="1.5" opacity="0.25" />
      <rect x="10" y="10" width="100" height="100" rx={Math.max(5, rx - 3)} fill="none" stroke="#020617" strokeWidth="1.5" opacity="0.2" />

      <g stroke="#020617" strokeWidth="1.2" opacity="0.18">
        <path d={`M14 ${26 + (variant % 3) * 2} H106`} />
        <path d={`M14 ${48 + (variant % 4) * 3} H106`} />
        <path d={`M14 ${72 + (variant % 3) * 2} H106`} />
        <path d={`M14 ${90 + (variant % 2) * 3} H106`} />
      </g>

      <g stroke="#020617" strokeWidth="1" opacity="0.12">
        <path d={`M${32 + (variant % 4) * 3} 14 V${92 + (variant % 3) * 2}`} />
        <path d={`M${58 + (variant % 5) * 2} 14 V${92 + (variant % 4) * 2}`} />
        <path d={`M${84 + (variant % 3) * 2} 14 V${92 + (variant % 2) * 3}`} />
      </g>

      <rect x="14" y="14" width="92" height="92" rx={Math.max(4, rx - 5)} fill={`url(#${gid}-edge)`} opacity="0.25" />

      {/* Glyph */}
      <g opacity="0.9">
        {t.glyph === 'leaf' && <path d="M60 28 C78 38, 80 65, 60 92 C40 65, 42 38, 60 28 Z" stroke={t.rune} strokeWidth="2.5" fill="rgba(255,255,255,0.06)" />}
        {t.glyph === 'sun' && (
          <g stroke={t.rune} strokeWidth="2" fill="rgba(255,255,255,0.06)">
            <circle cx="60" cy="60" r="14" />
            <path d="M60 32 V40 M60 80 V88 M32 60 H40 M80 60 H88 M40 40 L47 47 M73 73 L80 80 M73 47 L80 40 M47 73 L40 80" />
          </g>
        )}
        {t.glyph === 'crystal' && (
          <g>
            <path d="M60 24 L92 60 L60 96 L28 60 Z" stroke={t.rune} strokeWidth="2.5" fill="rgba(255,255,255,0.06)" />
            <line x1="60" y1="24" x2="60" y2="96" stroke={t.rune} strokeWidth="1.6" opacity="0.5" />
            <line x1="28" y1="60" x2="92" y2="60" stroke={t.rune} strokeWidth="1.6" opacity="0.5" />
          </g>
        )}
        {t.glyph === 'arcane' && (
          <g stroke={t.rune} strokeWidth="2" fill="rgba(255,255,255,0.05)">
            <circle cx="60" cy="60" r="18" />
            <path d="M60 34 L85 78 H35 Z" />
            <circle cx="60" cy="60" r="5" fill={t.rune} />
          </g>
        )}
        {t.glyph === 'star' && (
          <g>
            <path d="M60 24 L68 48 L94 52 L75 70 L79 96 L60 82 L41 96 L45 70 L26 52 L52 48 Z" stroke={t.rune} strokeWidth="2.2" fill="rgba(255,255,255,0.08)" />
            <circle cx="60" cy="60" r="5" fill={t.edge} opacity="0.9" />
          </g>
        )}
      </g>

      <circle cx="60" cy="60" r="6.5" fill={t.rune} opacity="0.6" />

      {/* Decor */}
      {t.decor === 'moss' && (
        <g fill={t.moss[1]} opacity="0.7">
          {decorRand > 0.3 && <circle cx="20" cy="20" r="4" />}
          {decorRand > 0.5 && <ellipse cx="100" cy="22" rx="5" ry="3" />}
          {decorRand > 0.65 && <circle cx="18" cy="98" r="3.5" />}
          <ellipse cx="60" cy="16" rx="12" ry="4" fill="url(#${gid}-moss)" opacity="0.5" />
        </g>
      )}
      {t.decor === 'cracks' && (
        <g stroke="#1a1508" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.5">
          {decorRand > 0.4 && <path d="M20 20 Q40 30 50 20 Q60 15 80 25" />}
          {decorRand > 0.6 && <path d="M25 95 Q45 80 65 90" />}
          {decorRand > 0.3 && <path d="M20 30 V60 Q50 65 80 60" />}
          {decorRand > 0.7 && <path d="M10 50 Q30 55 50 50 Q70 45 110 55" />}
        </g>
      )}
      {t.decor === 'crystals' && (
        <g fill={t.moss[1]} opacity="0.6">
          {decorRand > 0.35 && <path d="M60 20 L68 35 L52 35 Z" />}
          {decorRand > 0.55 && <path d="M25 60 L38 52 L38 68 Z" />}
          {decorRand > 0.7 && <path d="M95 60 L82 52 L82 68 Z" />}
        </g>
      )}
      {t.decor === 'runes' && (
        <g stroke={t.rune} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7">
          {decorRand > 0.3 && <path d="M30 30 L40 30 L35 40 Z M30 40 L40 40" />}
          {decorRand > 0.5 && <path d="M80 25 L90 35 M80 35 L90 25 M85 20 V40" />}
        </g>
      )}
      {t.decor === 'stars' && (
        <g fill={t.accent} opacity="0.8">
          {decorRand > 0.25 && <circle cx="20" cy="20" r="2" />}
          {decorRand > 0.45 && <circle cx="100" cy="22" r="1.5" />}
          {decorRand > 0.65 && <circle cx="18" cy="98" r="1.8" />}
        </g>
      )}

      <rect x="8" y="80" width="104" height="32" rx={Math.max(4, rx - 2)} fill="url(#${gid}-shadow)" opacity="0.3" />
    </svg>
  );
}

/* 7. Grass Tile */
function PremiumGrassTileSVG({ pulsePhase = 0 }) {
  const sway = Math.sin(pulsePhase * 0.5) * 3;
  return (
    <svg className="premium-grass" viewBox="0 0 120 120" style={{ transform: `translateY(${sway}px)` }}>
      <defs>
        <linearGradient id="grassGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#166534" />
          <stop offset="40%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
        <filter id="grassGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#22c55e" floodOpacity="0.4" />
        </filter>
      </defs>
      <ellipse cx="60" cy="85" rx="30" ry="14" fill="#0f172a" opacity="0.3" />
      <path d="M30 90 Q45 55 60 85 Q75 55 90 90" fill="none" stroke="url(#grassGrad)" strokeWidth="14" strokeLinecap="round" filter="url(#grassGlow)" />
      <path d="M40 88 Q50 52 60 86 Q70 52 80 88" fill="none" stroke="#16a34a" strokeWidth="9" strokeLinecap="round" opacity="0.7" />
      <path d="M50 92 Q60 60 70 92" fill="none" stroke="#4ade80" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
      <g stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M45 85 Q55 65 65 85" />
        <path d="M55 88 Q62 62 69 88" strokeWidth="1" opacity="0.5" />
      </g>
    </svg>
  );
}

/* 8. Stone Block (multi-hit) */
function PremiumStoneBlockSVG({ hits = 2, pulsePhase = 0 }) {
  const crack = hits <= 1;
  const glow = hits <= 1 ? 'rgba(251,191,36,0.4)' : 'transparent';
  return (
    <svg className="premium-stone-block" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="stoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="50%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
        <filter id="stoneShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.7" />
        </filter>
      </defs>
      <rect x="10" y="10" width="100" height="100" rx="14" fill="url(#stoneGrad)" stroke="#4b5563" strokeWidth="3" filter="url(#stoneShadow)" />
      <rect x="14" y="14" width="92" height="92" rx="10" fill="none" stroke={glow} strokeWidth="2" opacity={hits <= 1 ? 0.8 : 0} />
      <rect x="16" y="16" width="88" height="88" rx="8" fill="none" stroke="#6b7280" strokeWidth="1" opacity="0.3" />
      {crack && (
        <g stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M20 20 Q60 30 100 20 Q80 60 60 40" />
          <path d="M25 100 Q55 90 85 100 Q70 60 50 80" />
          <path d="M20 60 Q50 55 100 60" />
        </g>
      )}
      {hits === 2 && (
        <g stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5">
          <path d="M25 25 Q60 35 95 25" />
          <path d="M25 95 Q60 85 95 95" />
        </g>
      )}
      <text x="60" y="65" text-anchor="middle" fill="#9ca3af" font-family="var(--font-ui)" font-size="13" font-weight="800" opacity={hits === 2 ? 0.6 : 0}>{hits}</text>
    </svg>
  );
}

/* 9. Wooden Crate */
function PremiumCrateTileSVG({ pulsePhase = 0 }) {
  const shake = Math.sin(pulsePhase * 2) * 1;
  return (
    <svg className="premium-crate" viewBox="0 0 120 120" style={{ transform: `rotate(${shake}deg)` }}>
      <defs>
        <linearGradient id="crateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a16207" />
          <stop offset="40%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <filter id="crateShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>
      <rect x="8" y="8" width="104" height="104" rx="6" fill="url(#crateGrad)" stroke="#78350f" strokeWidth="3" filter="url(#crateShadow)" />
      <rect x="12" y="12" width="96" height="96" rx="4" fill="none" stroke="#d97706" strokeWidth="1.5" opacity="0.5" />
      <g stroke="#451a03" strokeWidth="3" strokeLinecap="round" opacity="0.7">
        <line x1="20" y1="30" x2="100" y2="30" />
        <line x1="20" y1="60" x2="100" y2="60" />
        <line x1="20" y1="90" x2="100" y2="90" />
        <line x1="30" y1="20" x2="30" y2="100" />
        <line x1="60" y1="20" x2="60" y2="100" />
        <line x1="90" y1="20" x2="90" y2="100" />
      </g>
      <path d="M35 35 Q60 60 85 35 M35 85 Q60 60 85 85" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
      <g fill="#78350f">
        <circle cx="22" cy="32" r="1.5" />
        <circle cx="98" cy="32" r="1.5" />
        <circle cx="22" cy="88" r="1.5" />
        <circle cx="98" cy="88" r="1.5" />
      </g>
    </svg>
  );
}

/* 10. Ice Tile */
function PremiumIceTileSVG({ pulsePhase = 0 }) {
  const shimmer = Math.sin(pulsePhase) * 0.3 + 0.7;
  return (
    <svg className="premium-ice" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="iceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="iceGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="iceGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.5" />
        </filter>
      </defs>
      <rect x="6" y="6" width="108" height="108" rx="16" fill="url(#iceGrad)" stroke="#bfdbfe" strokeWidth="2" />
      <circle cx="60" cy="60" r="34" fill="url(#iceGlow)" filter="url(#iceGlowFilter)" opacity={shimmer} />
      <path d="M30 30 Q60 20 90 30 Q100 60 90 90 Q60 100 30 90 Q20 60 30 30 Z" fill="none" stroke="#bfdbfe" strokeWidth="2" strokeDasharray="8 8" opacity="0.6" />
      <g stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.4">
        <line x1="35" y1="35" x2="45" y2="45" />
        <line x1="85" y1="35" x2="75" y2="45" />
        <line x1="35" y1="85" x2="45" y2="75" />
        <line x1="85" y1="85" x2="75" y2="75" />
      </g>
    </svg>
  );
}

/* 11. Treasure Tile */
function PremiumTreasureTileSVG({ pulsePhase = 0 }) {
  const sparkle = Math.sin(pulsePhase * 2) > 0;
  return (
    <svg className="premium-treasure" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="chestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="60%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <filter id="treasureGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#fbbf24" floodOpacity="0.6" />
        </filter>
      </defs>
      <ellipse cx="60" cy="92" rx="34" ry="10" fill="#111827" opacity="0.5" />
      <rect x="28" y="56" width="64" height="28" rx="6" fill="url(#chestGrad)" stroke="#92400e" strokeWidth="2" filter="url(#treasureGlow)" />
      <rect x="32" y="60" width="56" height="20" rx="4" fill="none" stroke="#fcd34d" strokeWidth="1.5" opacity="0.6" />
      <rect x="48" y="44" width="24" height="16" rx="2" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
      <path d="M60 36 L72 44 L60 52 L48 44 Z" fill="url(#gemGrad)" stroke="#fcd34d" strokeWidth="2" filter="url(#treasureGlow)" />
      <path d="M60 36 L60 44 M72 44 L60 44 M48 44 L60 44 M60 44 L60 52" stroke="#fcd34d" strokeWidth="1" opacity="0.6" />
      {sparkle && (
        <g filter="url(#treasureGlow)" opacity="0.9">
          <polygon points="60,28 63,32 68,32 64,35 66,39 63,36 60,38 57,36 54,39 56,35 52,32 57,32" fill="#ffffff" />
          <circle cx="60" cy="24" r="1.5" fill="#ffffff" opacity="0.8" />
        </g>
      )}
    </svg>
  );
}

export { SKINS, calculateStars, WorldIcons, WorldIcon,
  WormHeadSVG, WormSegmentSVG, WormTailSVG,
  PremiumAppleSVG, PremiumPortalSVG, PremiumStoneWallSVG,
  PremiumGrassTileSVG, PremiumStoneBlockSVG, PremiumCrateTileSVG,
  PremiumIceTileSVG, PremiumTreasureTileSVG };
