import {
  Leaf, Mountain, TreePine, Gem as GemIcon, Sparkles
} from 'lucide-react';
import '../style.css';

/* ===================================================
   WORM SKINS - Cheerful, Cartoon Apple Worm Skins
   =================================================== */
const SKINS = [
  { id: 'emerald', name: 'Apple Green', primary: '#22c55e', secondary: '#16a34a', highlight: '#86efac', belly: '#dcfce7', eye: '#15803d', glow: 'rgba(74, 222, 128, 0.65)', label: 'Classic Apple Worm', price: 0, owned: true },
  { id: 'golden', name: 'Sunny Gold', primary: '#f59e0b', secondary: '#d97706', highlight: '#fef08a', belly: '#fef3c7', eye: '#b45309', glow: 'rgba(251, 191, 36, 0.65)', label: 'Honey Glow', price: 500, owned: false },
  { id: 'ruby', name: 'Ruby Apple', primary: '#ef4444', secondary: '#dc2626', highlight: '#fca5a5', belly: '#fee2e2', eye: '#991b1b', glow: 'rgba(248, 113, 113, 0.65)', label: 'Cherry Twist', price: 750, owned: false },
  { id: 'amethyst', name: 'Grape Violet', primary: '#a855f7', secondary: '#9333ea', highlight: '#e9d5ff', belly: '#f3e8ff', eye: '#6b21a8', glow: 'rgba(192, 132, 252, 0.65)', label: 'Grape Gummy', price: 1000, owned: false },
  { id: 'cyber', name: 'Bubble Blue', primary: '#06b6d4', secondary: '#0891b2', highlight: '#a5f3fc', belly: '#cffafe', eye: '#0e7490', glow: 'rgba(34, 211, 238, 0.65)', label: 'Sky Blue Gummy', price: 1500, owned: false },
  { id: 'rose', name: 'Cotton Candy', primary: '#ec4899', secondary: '#db2777', highlight: '#fbcfe8', belly: '#fce7f3', eye: '#9d174d', glow: 'rgba(244, 114, 182, 0.65)', label: 'Candy Bloom', price: 1200, owned: false },
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
   ICONIC ADORABLE APPLE WORM (Grow Worm Style)
   Cute spherical segments, huge glossy eyes, sprout leaf,
   rosy cheeks & happy chomp animations
   =================================================== */

/* 1. Worm Head - Huge cute eyes, cheerful smile, tiny sprout on head */
function WormHeadSVG({ facing = 'right', skinId = 'emerald', expression = 'idle', skinColor = {}, time = 0, angle = null }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;
  const belly = skinColor.belly || skin.belly || '#dcfce7';

  const isEating = expression === 'eating';
  const isMoving = expression === 'moving';
  const isHappy = expression === 'happy' || expression === 'victory';
  const isIdle = !isEating && !isMoving && !isHappy;

  // Natural idle breathing & blinking
  const breath = Math.sin(time * 0.005) * 1.5;
  const blinkPhase = (Math.sin(time * 0.0035) + 1) / 2;
  const blink = isIdle && blinkPhase > 0.95 ? 0.15 : 1;
  const eyeOpen = isEating ? 0.35 : isHappy ? 1.1 : blink;

  // Sprout wiggle
  const sproutWiggle = Math.sin(time * 0.008) * 8;

  // Eye look direction - look ahead towards food/movement
  const lookX = isMoving ? 3.5 : isEating ? 2 : 1.5;
  const lookY = isMoving ? 0.5 : 0;

  // Mouth chomp when eating
  const chomp = isEating ? Math.sin(time * 0.03) * 3 : 0;

  // Angle: if angle provided use directly, else map facing direction
  const rotation = angle != null ? angle : ({ right: 0, down: 90, left: 180, up: -90 }[facing] ?? 0);

  return (
    <svg
      className={`worm-head-svg-container worm-head facing-${facing} ${isMoving ? 'moving' : ''} ${isEating ? 'eating' : ''} ${isHappy ? 'happy' : ''} ${isIdle ? 'idle' : ''}`}
      viewBox="0 0 120 120"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <defs>
        {/* Soft 3D spherical gradient for body ball */}
        <radialGradient id={`wormBallHead-${skinId}`} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="15%" stopColor={highlight} />
          <stop offset="55%" stopColor={primary} />
          <stop offset="88%" stopColor={secondary} />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.95" />
        </radialGradient>
        {/* Cute rosy blush */}
        <radialGradient id="wormBlushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4d6d" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#ff4d6d" stopOpacity="0" />
        </radialGradient>
        {/* Soft cartoon drop shadow */}
        <filter id={`wormHeadShadow-${skinId}`} x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#021a0c" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter={`url(#wormHeadShadow-${skinId})`}>
        {/* Ground shadow beneath worm head */}
        <ellipse cx="60" cy="98" rx="38" ry="10" fill="rgba(0,0,0,0.22)" />

        {/* Adorable little leaf sprout on top of head */}
        <g transform={`translate(48, 12) rotate(${sproutWiggle} 8 20)`}>
          <path d="M8 20 Q12 8 22 6 Q26 14 14 20 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.8" />
          <path d="M8 20 Q2 12 -4 14 Q-2 22 8 22 Z" fill="#4ade80" stroke="#15803d" strokeWidth="1.5" />
          <path d="M8 22 Q9 15 12 10" stroke="#166534" strokeWidth="1.2" fill="none" />
        </g>

        {/* Neck connector to blend with body segment smoothly */}
        <ellipse cx="32" cy="60" rx="22" ry="34" fill={secondary} opacity="0.85" />

        {/* Main round cartoon worm head ball */}
        <circle cx="64" cy="60" r="42" fill={`url(#wormBallHead-${skinId})`} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

        {/* Underbelly soft highlight */}
        <ellipse cx="66" cy="80" rx="30" ry="14" fill={belly} opacity="0.5" />

        {/* Big cute cartoon eyes */}
        {/* Eye 1 (Left / Upper) */}
        <g transform="translate(68, 38)">
          {/* White sclera */}
          <ellipse cx="0" cy="0" rx="14" ry={15 * eyeOpen} fill="#ffffff" stroke="#052e16" strokeWidth="2.2" />
          {/* Pupil with look-ahead direction */}
          {eyeOpen > 0.25 && (
            <>
              <ellipse cx={lookX} cy={lookY} rx="8.5" ry="9" fill="#091c0e" />
              {/* Eye sparkle highlights (kawaii anime style) */}
              <circle cx={lookX + 3.2} cy={lookY - 3.2} r="3.4" fill="#ffffff" />
              <circle cx={lookX - 2.8} cy={lookY + 3.2} r="1.6" fill="#ffffff" />
            </>
          )}
          {eyeOpen <= 0.25 && (
            <path d="M-10 0 Q0 -5 10 0" stroke="#052e16" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
        </g>

        {/* Eye 2 (Right / Lower) */}
        <g transform="translate(90, 48)">
          <ellipse cx="0" cy="0" rx="12" ry={13 * eyeOpen} fill="#ffffff" stroke="#052e16" strokeWidth="2" />
          {eyeOpen > 0.25 && (
            <>
              <ellipse cx={lookX * 0.8} cy={lookY} rx="7" ry="7.5" fill="#091c0e" />
              <circle cx={lookX * 0.8 + 2.6} cy={lookY - 2.6} r="2.8" fill="#ffffff" />
              <circle cx={lookX * 0.8 - 2.2} cy={lookY + 2.5} r="1.3" fill="#ffffff" />
            </>
          )}
          {eyeOpen <= 0.25 && (
            <path d="M-8 0 Q0 -4 8 0" stroke="#052e16" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          )}
        </g>

        {/* Rosy blush cheeks */}
        <ellipse cx="58" cy="74" rx="7" ry="4.5" fill="url(#wormBlushGrad)" />
        <ellipse cx="94" cy="74" rx="6" ry="4" fill="url(#wormBlushGrad)" />

        {/* Cheerful mouth / Chomp expression */}
        <g transform="translate(82, 70)">
          {isEating ? (
            /* Open mouth chomping on apple */
            <g>
              <ellipse cx="4" cy="2" rx="9" ry={6 + chomp} fill="#4a0404" stroke="#052e16" strokeWidth="1.8" />
              <ellipse cx="5" cy="5" rx="5" ry="3" fill="#ff4d6d" />
              <path d="M-1 -1 Q4 3 9 -1" fill="#ffffff" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          ) : isHappy ? (
            /* Big happy open smile */
            <g>
              <path d="M-4 -1 Q4 10 12 -1 Z" fill="#991b1b" stroke="#052e16" strokeWidth="2" strokeLinejoin="round" />
              <ellipse cx="4" cy="5" rx="4" ry="2" fill="#ff4d6d" />
            </g>
          ) : (
            /* Cute playful smirk smile */
            <path d="M-3 0 Q4 6 11 1" stroke="#052e16" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          )}
        </g>
      </g>
    </svg>
  );
}

/* 2. Worm Body Segment - Seamless round puffy ball with soft ring ridges */
function WormSegmentSVG({ skinId = 'emerald', scale = 1, index = 0, skinColor = {}, wavePhase = 0, angle = 0, bend = 0 }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;
  const belly = skinColor.belly || skin.belly || '#dcfce7';

  // Smooth squish & stretch crawling wave
  const wave = Math.sin(wavePhase + index * 0.85);
  const squash = 1 + wave * 0.08;
  const stretch = 1 - wave * 0.05;

  return (
    <svg
      className="worm-segment-svg-container worm-segment"
      viewBox="0 0 120 120"
      style={{ transform: `rotate(${angle}deg) scale(${squash * scale}, ${stretch * scale})` }}
    >
      <defs>
        <radialGradient id={`wormBallSeg-${skinId}-${index}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="18%" stopColor={highlight} />
          <stop offset="55%" stopColor={primary} />
          <stop offset="90%" stopColor={secondary} />
          <stop offset="100%" stopColor={secondary} />
        </radialGradient>
        <filter id={`wormSegShadow-${skinId}-${index}`} x="-20%" y="-20%" width="145%" height="145%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#021a0c" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#wormSegShadow-${skinId}-${index})`}>
        {/* Soft ground shadow */}
        <ellipse cx="60" cy="94" rx="34" ry="9" fill="rgba(0,0,0,0.18)" />

        {/* Overlapping connector bulge to prevent gaps between segments */}
        <circle cx="34" cy="60" r="32" fill={secondary} opacity="0.9" />
        <circle cx="86" cy="60" r="32" fill={secondary} opacity="0.9" />

        {/* Main puffy sphere body segment */}
        <circle cx="60" cy="60" r="38" fill={`url(#wormBallSeg-${skinId}-${index})`} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />

        {/* Soft belly glow */}
        <ellipse cx="60" cy="78" rx="26" ry="12" fill={belly} opacity="0.45" />

        {/* Subtle cute segmented ring ridge */}
        <path d="M42 42 Q60 52 78 42" stroke="rgba(255,255,255,0.35)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M40 60 Q60 70 80 60" stroke="rgba(0,0,0,0.1)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Specular gloss highlight */}
        <ellipse cx="48" cy="42" rx="9" ry="5.5" fill="#ffffff" opacity="0.4" transform="rotate(-25 48 42)" />
      </g>
    </svg>
  );
}

/* 3. Worm Tail - Adorable tapered button tip with little curl */
function WormTailSVG({ skinId = 'emerald', skinColor = {}, time = 0, angle = 0 }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;
  const belly = skinColor.belly || skin.belly || '#dcfce7';
  const wiggle = Math.sin(time * 0.007) * 6;

  return (
    <svg className="worm-tail-svg-container worm-tail" viewBox="0 0 120 120" style={{ transform: `rotate(${angle + wiggle}deg)` }}>
      <defs>
        <radialGradient id={`wormBallTail-${skinId}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="20%" stopColor={highlight} />
          <stop offset="55%" stopColor={primary} />
          <stop offset="90%" stopColor={secondary} />
          <stop offset="100%" stopColor={secondary} />
        </radialGradient>
        <filter id={`wormTailShadow-${skinId}`} x="-20%" y="-20%" width="145%" height="145%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#021a0c" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#wormTailShadow-${skinId})`}>
        {/* Soft shadow */}
        <ellipse cx="52" cy="90" rx="26" ry="8" fill="rgba(0,0,0,0.18)" />

        {/* Connector body sphere */}
        <circle cx="70" cy="60" r="30" fill={secondary} opacity="0.9" />

        {/* Tapered cute round tail sphere */}
        <ellipse cx="48" cy="60" rx="30" ry="26" fill={`url(#wormBallTail-${skinId})`} stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />

        {/* Little rounded tail tip button */}
        <circle cx="24" cy="60" r="14" fill={secondary} stroke={highlight} strokeWidth="1" />
        <circle cx="22" cy="58" r="5" fill="#ffffff" opacity="0.5" />

        {/* Cute ring ridge */}
        <path d="M38 48 Q50 56 62 48" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="44" cy="46" rx="7" ry="4" fill="#ffffff" opacity="0.35" transform="rotate(-20 44 46)" />
      </g>
    </svg>
  );
}

/* 4. Glossy 3D Candy Apple (Juicy & Delicious) */
function PremiumAppleSVG({ collected = false, bobPhase = 0 }) {
  const bobY = Math.sin(bobPhase) * 3.5;
  const bobRotate = Math.sin(bobPhase * 0.7) * 2;

  return (
    <svg
      className={`premium-apple ${collected ? 'collected' : ''}`}
      viewBox="0 0 120 120"
      style={{
        transform: `translateY(${bobY}px) rotate(${bobRotate}deg)`
      }}
    >
      <defs>
        {/* Candy Gloss Apple Gradient */}
        <radialGradient id="candyAppleGrad" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="12%" stopColor="#fecaca" />
          <stop offset="30%" stopColor="#f87171" />
          <stop offset="60%" stopColor="#ef4444" />
          <stop offset="85%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        {/* Wooden Stem */}
        <linearGradient id="appleStemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="50%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        {/* Juicy Leaf */}
        <linearGradient id="appleLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <filter id="appleGlowDrop" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter="url(#appleGlowDrop)">
        {/* Ground shadow */}
        <ellipse cx="60" cy="100" rx="34" ry="10" fill="rgba(0,0,0,0.25)" />

        {/* Curved wooden stem */}
        <path d="M60 42 Q62 24 72 16" stroke="url(#appleStemGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Fresh vibrant green leaf */}
        <g transform="translate(68, 16) rotate(18)">
          <path d="M0 14 C8 2, 26 2, 32 12 C34 20, 20 26, 0 18 Z" fill="url(#appleLeafGrad)" stroke="#166534" strokeWidth="1.8" />
          <path d="M0 15 Q14 8 28 12" stroke="#14532d" strokeWidth="1.4" fill="none" />
        </g>

        {/* Main plump 3D Apple body (double lobe heart-like shape) */}
        <path
          d="M60 44
             C46 36, 18 42, 18 68
             C18 94, 44 104, 60 102
             C76 104, 102 94, 102 68
             C102 42, 74 36, 60 44 Z"
          fill="url(#candyAppleGrad)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
        />

        {/* Shiny curved gloss streak */}
        <path
          d="M32 54 C28 64, 28 78, 38 88"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.65"
        />
        <circle cx="36" cy="50" r="3.5" fill="#ffffff" opacity="0.8" />

        {/* Apple dimple top */}
        <ellipse cx="60" cy="45" rx="7" ry="3.5" fill="#7f1d1d" opacity="0.6" />

        {/* Twinkle sparkle stars */}
        <g transform="translate(86, 48)">
          <polygon points="6,0 7.5,4.5 12,6 7.5,7.5 6,12 4.5,7.5 0,6 4.5,4.5" fill="#fef08a" />
        </g>
      </g>
    </svg>
  );
}

/* 5. Mysterious Black Hole / Stargate Portal (Grow Worm Objective) */
function PremiumPortalSVG({ unlocked = false, pulsePhase = 0 }) {
  const pulseScale = 1 + Math.sin(pulsePhase * 2) * 0.05;

  return (
    <svg className={`premium-portal ${unlocked ? 'unlocked' : 'locked'}`} viewBox="0 0 140 140" style={{ transform: unlocked ? `scale(${pulseScale})` : 'scale(1)' }}>
      <defs>
        <radialGradient id="blackHoleCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="55%" stopColor="#050014" />
          <stop offset="80%" stopColor={unlocked ? '#6d28d9' : '#1e1b4b'} />
          <stop offset="100%" stopColor={unlocked ? '#a855f7' : '#312e81'} stopOpacity="0.8" />
        </radialGradient>
        <radialGradient id="portalAccretionDisk" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="65%" stopColor={unlocked ? '#38bdf8' : '#475569'} stopOpacity="0.4" />
          <stop offset="85%" stopColor={unlocked ? '#a855f7' : '#334155'} stopOpacity="0.8" />
          <stop offset="100%" stopColor={unlocked ? '#f472b6' : '#1e293b'} stopOpacity="0" />
        </radialGradient>
        <filter id="portalBlackHoleGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer accretion swirl */}
      <circle cx="70" cy="70" r="64" fill="url(#portalAccretionDisk)" filter="url(#portalBlackHoleGlow)" />

      {/* Swirling accretion spiral arms */}
      {unlocked ? (
        <g style={{ transformOrigin: '70px 70px', animation: 'galaxySpinOrbit 3.5s linear infinite' }}>
          <path d="M70 70 Q95 30 125 50" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M70 70 Q45 110 15 90" stroke="#c084fc" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M70 70 Q110 95 90 125" stroke="#f472b6" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M70 70 Q30 45 50 15" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
        </g>
      ) : (
        /* Dormant locked portal ring */
        <g opacity="0.7">
          <circle cx="70" cy="70" r="54" fill="none" stroke="#475569" strokeWidth="3" strokeDasharray="8 6" />
        </g>
      )}

      {/* Deep Black Hole center (event horizon) */}
      <circle cx="70" cy="70" r="44" fill="url(#blackHoleCore)" filter="url(#portalBlackHoleGlow)" />
      <circle cx="70" cy="70" r="30" fill="#000000" />

      {/* Center glowing singularity dot */}
      {unlocked ? (
        <g>
          <circle cx="70" cy="70" r="6" fill="#ffffff" filter="url(#portalBlackHoleGlow)" />
          <circle cx="70" cy="70" r="10" fill="#38bdf8" opacity="0.5" />
        </g>
      ) : (
        /* Cute lock icon when locked */
        <g transform="translate(56, 52)">
          <rect x="3" y="14" width="22" height="18" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
          <path d="M8 14 V8 C8 4 20 4 20 8 V14" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="14" cy="22" r="2.5" fill="#f8fafc" />
          <rect x="13" y="23" width="2" height="5" fill="#f8fafc" />
        </g>
      )}
    </svg>
  );
}

/* 6. Lush Cartoon Maze Wall Block (Dirt with Vibrant Grass Top) */
function PremiumStoneWallSVG({ worldId = 1, variant = 0, seed = 0 }) {
  // Rich cartoon environments for each realm
  const themes = {
    1: { grass: '#22c55e', grassLight: '#86efac', grassDark: '#15803d', dirt: '#78350f', dirtDark: '#451a03', dirtLight: '#92400e', rock: '#a16207' },
    2: { grass: '#eab308', grassLight: '#fef08a', grassDark: '#a16207', dirt: '#854d0e', dirtDark: '#543007', dirtLight: '#a16207', rock: '#ca8a04' },
    3: { grass: '#06b6d4', grassLight: '#a5f3fc', grassDark: '#0e7490', dirt: '#164e63', dirtDark: '#083344', dirtLight: '#155e75', rock: '#0284c7' },
    4: { grass: '#a855f7', grassLight: '#e9d5ff', grassDark: '#7e22ce', dirt: '#581c87', dirtDark: '#3b0764', dirtLight: '#6b21a8', rock: '#9333ea' },
    5: { grass: '#ec4899', grassLight: '#fbcfe8', grassDark: '#be185d', dirt: '#831843', dirtDark: '#500724', dirtLight: '#9d174d', rock: '#db2777' },
  };
  const t = themes[worldId] || themes[1];
  const gid = `mazeWall-${worldId}-${variant}-${seed % 5}`;

  return (
    <svg className="premium-wall" viewBox="0 0 120 120">
      <defs>
        {/* Rich dirt gradient */}
        <linearGradient id={`${gid}-dirt`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={t.dirtLight} />
          <stop offset="50%" stopColor={t.dirt} />
          <stop offset="100%" stopColor={t.dirtDark} />
        </linearGradient>
        {/* Lush grass gradient */}
        <linearGradient id={`${gid}-grass`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={t.grassLight} />
          <stop offset="40%" stopColor={t.grass} />
          <stop offset="100%" stopColor={t.grassDark} />
        </linearGradient>
        <filter id={`${gid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      <g filter={`url(#${gid}-shadow)`}>
        {/* Main block foundation */}
        <rect x="4" y="4" width="112" height="112" rx="14" fill={`url(#${gid}-dirt)`} stroke="#1c1004" strokeWidth="2.5" />

        {/* Embedded cartoon pebbles / texture */}
        <circle cx="30" cy="65" r="7" fill={t.dirtDark} opacity="0.6" />
        <circle cx="28" cy="63" r="5" fill={t.rock} opacity="0.8" />
        <circle cx="85" cy="80" r="9" fill={t.dirtDark} opacity="0.6" />
        <circle cx="83" cy="78" r="6.5" fill={t.rock} opacity="0.8" />
        <ellipse cx="60" cy="92" rx="11" ry="6" fill={t.dirtDark} opacity="0.7" />

        {/* Top vibrant cartoon grass crown */}
        <path
          d="M4 18
             Q12 4 20 16
             Q28 26 36 12
             Q44 24 54 14
             Q64 26 74 12
             Q84 24 94 14
             Q104 26 116 18
             L116 4 Q116 4 104 4 L16 4 Q4 4 4 18 Z"
          fill={`url(#${gid}-grass)`}
        />

        {/* Hanging grass tufts dropping down over dirt */}
        <path d="M14 18 Q18 36 24 18" fill={t.grassDark} />
        <path d="M38 16 Q44 40 50 16" fill={t.grassDark} />
        <path d="M70 16 Q76 38 82 16" fill={t.grassDark} />
        <path d="M96 18 Q100 34 106 18" fill={t.grassDark} />

        {/* Gloss highlight on top border */}
        <path d="M10 8 Q60 5 110 8" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>
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
      <text x="60" y="65" textAnchor="middle" fill="#9ca3af" fontFamily="var(--font-ui)" fontSize="13" fontWeight="800" opacity={hits === 2 ? 0.6 : 0}>{hits}</text>
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
