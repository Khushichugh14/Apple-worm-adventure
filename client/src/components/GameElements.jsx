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
   PREMIUM CONTINUOUS WORM - Realistic Segmented Earthworm
   Single connected body path, tapered segments, expressive head,
   peristaltic movement, 3D glossy shading, curved corners
   =================================================== */

/* 1. Continuous Worm Body - Single SVG drawing the entire worm as one creature */
function ContinuousWormSVG({
  segments,
  wormSkin = 'emerald',
  expression = 'idle',
  skinColor = {},
  animTime = 0,
  facing = 'right',
  width = 120,
  height = 120,
  levelSize = 8,
}) {
  const skin = SKINS.find(s => s.id === wormSkin) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;
  const belly = skinColor.belly || skin.belly || '#dcfce7';
  const eye = skinColor.eye || skin.eye;

  const segCount = segments.length;
  if (segCount === 0) return null;

  // Normalize grid coordinates to fit within viewBox with padding
  const pad = 10;
  const cellSize = (width - pad * 2) / levelSize;

  const isEating = expression === 'eating';
  const isMoving = expression === 'moving';
  const isHappy = expression === 'happy' || expression === 'victory';
  const isIdle = !isEating && !isMoving && !isHappy;

  // Peristaltic wave phase
  const waveTime = animTime * 0.006;

  // Blink animation
  const blinkPhase = (Math.sin(animTime * 0.0035) + 1) / 2;
  const blink = isIdle && blinkPhase > 0.96 ? 0.1 : 1;
  const eyeOpen = isEating ? 0.3 : isHappy ? 1.2 : blink;

  // Breathing pulse
  const breath = Math.sin(animTime * 0.004) * 0.02;

  // Build normalized segment points
  const points = segments.map((seg, i) => {
    const t = i / Math.max(1, segCount - 1);
    const headW = cellSize * 0.82;   // head width: fits inside one grid cell
    const tailW = cellSize * 0.28;   // tail width: tapers down
    const segWidth = headW - (headW - tailW) * t;
    return {
      x: pad + seg[0] * cellSize,
      y: pad + seg[1] * cellSize,
      width: segWidth,
      index: i,
    };
  });

  // Build continuous body path
  let pathD = '';
  const head = points[0];

  if (points.length === 1) {
    const p = points[0];
    const hw = p.width / 2;
    pathD = `M${p.x - hw},${p.y - hw} L${p.x + hw},${p.y - hw} L${p.x + hw},${p.y + hw} L${p.x - hw},${p.y + hw} Z`;
  } else {
    const neck = points[1];
    const headAngle = Math.atan2(neck.y - head.y, neck.x - head.x);
    const hw = head.width / 2;
    const headNx = Math.cos(headAngle + Math.PI / 2) * hw;
    const headNy = Math.sin(headAngle + Math.PI / 2) * hw;

    pathD = `M${head.x - headNx},${head.y - headNy}`;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const next = points[i + 1];
      const w = p.width / 2;

      if (next) {
        const dx = next.x - p.x;
        const dy = next.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dist > 0 ? -dy / dist : 0;
        const ny = dist > 0 ? dx / dist : 0;

        const p1x = p.x + nx * w;
        const p1y = p.y + ny * w;
        const p2x = p.x - nx * w;
        const p2y = p.y - ny * w;

        const nw = next.width / 2;
        const n1x = next.x + nx * nw;
        const n1y = next.y + ny * nw;
        const n2x = next.x - nx * nw;
        const n2y = next.y - ny * nw;

        if (i === 0) {
          pathD += ` L${p1x},${p1y}`;
        } else {
          pathD += ` Q${p.x},${p.y} ${p1x},${p1y}`;
        }
        pathD += ` L${n1x},${n1y}`;
        pathD += ` Q${next.x},${next.y} ${n2x},${n2y}`;
        pathD += ` L${p2x},${p2y}`;
        pathD += ` Q${p.x},${p.y} ${p.x - nx * w},${p.y - ny * w}`;
      } else {
        pathD += ` Q${p.x},${p.y} ${p.x},${p.y - w} Z`;
      }
    }
    pathD += ' Z';
  }

  // Head rotation angle
  let headRotation = 0;
  if (segCount > 1) {
    const neck = points[1];
    headRotation = Math.atan2(neck.y - head.y, neck.x - head.x) * 180 / Math.PI;
  } else {
    headRotation = { right: 0, down: 90, left: 180, up: -90 }[facing] ?? 0;
  }

  return (
    <svg
      className="continuous-worm-svg"
      viewBox="0 0 120 120"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <radialGradient id={`wormBodyGrad-${wormSkin}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="20%" stopColor={highlight} />
          <stop offset="50%" stopColor={primary} />
          <stop offset="85%" stopColor={secondary} />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.95" />
        </radialGradient>

        <linearGradient id={`wormRingGrad-${wormSkin}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
        </linearGradient>

        <linearGradient id={`wormBellyGrad-${wormSkin}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={belly} stopOpacity="0.7" />
          <stop offset="100%" stopColor={belly} stopOpacity="0.3" />
        </linearGradient>

        <filter id={`wormBodyShadow-${wormSkin}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Ground shadow under worm center */}
      {segCount > 1 && (
        <ellipse
          cx={(head.x + points[segCount - 1].x) / 2}
          cy={(head.y + points[segCount - 1].y) / 2 + 4}
          rx={head.width * 0.6}
          ry={head.width * 0.15}
          fill="rgba(0,0,0,0.2)"
          opacity={isMoving ? 0.6 : 0.4}
        />
      )}

      <path
        d={pathD}
        fill={`url(#wormBodyGrad-${wormSkin})`}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter={`url(#wormBodyShadow-${wormSkin})`}
      />

      {segments.map((seg, i) => {
        const wave = Math.sin(waveTime + i * 1.2);
        const ringOpacity = Math.abs(wave) > 0.7 ? 0.3 : 0;
        if (ringOpacity === 0 || i === 0 || i === segCount - 1) return null;
        const p = points[i];
        const next = points[i + 1];
        if (!next) return null;
        const dx = next.x - p.x;
        const dy = next.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dist > 0 ? -dy / dist : 0;
        const ny = dist > 0 ? dx / dist : 0;
        const w = p.width / 2;
        const nw = next.width / 2;
        const r1x = p.x + nx * w * 0.85;
        const r1y = p.y + ny * w * 0.85;
        const r2x = p.x - nx * w * 0.85;
        const r2y = p.y - ny * w * 0.85;
        const nr1x = next.x + nx * nw * 0.85;
        const nr1y = next.y + ny * nw * 0.85;
        const nr2x = next.x - nx * nw * 0.85;
        const nr2y = next.y - ny * nw * 0.85;
        return (
          <path
            key={`ring-${i}`}
            d={`M${r1x},${r1y} L${nr1x},${nr1y} L${nr2x},${nr2y} L${r2x},${r2y} Z`}
            fill="rgba(0,0,0,0.25)"
            opacity={ringOpacity}
          />
        );
      })}

      {segments.map((seg, i) => {
        if (i === 0 || i === segCount - 1) return null;
        const p = points[i];
        const next = points[i + 1];
        if (!next) return null;
        const dx = next.x - p.x;
        const dy = next.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dist > 0 ? -dy / dist : 0;
        const ny = dist > 0 ? dx / dist : 0;
        const w = p.width / 2;
        const nw = next.width / 2;
        return (
          <path
            key={`seg-ring-${i}`}
            d={`M${p.x + nx * w},${p.y + ny * w} Q${p.x},${p.y} ${p.x - nx * w},${p.y - ny * w} L${next.x - nx * nw},${next.y - ny * nw} Q${next.x},${next.y} ${next.x + nx * nw},${next.y + ny * nw} Z`}
            fill="none"
            stroke={`url(#wormRingGrad-${wormSkin})`}
            strokeWidth="1"
            opacity={0.5}
          />
        );
      })}

      <path
        d={pathD}
        fill="none"
        stroke={`url(#wormBellyGrad-${wormSkin})`}
        strokeWidth="8"
        strokeLinejoin="round"
        opacity={0.35}
      />

      <path
        d={pathD}
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity={0.25}
      />

      <g transform={`translate(${head.x},${head.y}) rotate(${headRotation})`}>
        {/* Head shadow */}
        <ellipse cx="0" cy="3" rx={head.width * 0.8} ry={head.width * 0.3} fill="rgba(0,0,0,0.25)" />

        {/* Main head body - fits within one grid cell */}
        <ellipse cx="3" cy="0" rx={head.width * 0.8} ry={head.width * 0.6} fill={`url(#wormBodyGrad-${wormSkin})`} stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
        <ellipse cx="5" cy="1" rx={head.width * 0.5} ry={head.width * 0.4} fill={highlight} opacity="0.35" />

        {/* Mouth line */}
        <path d={`M-${head.width * 0.3} ${-head.width * 0.5} Q0 ${-head.width * 0.8} ${head.width * 0.3} ${-head.width * 0.5}`} stroke="rgba(0,0,0,0.2)" strokeWidth="1" fill="none" strokeLinecap="round" />

        {/* Eyes */}
        <g transform={`translate(${head.width * 0.4}, ${-head.width * 0.25})`}>
          <ellipse cx="0" cy="0" rx={head.width * 0.16} ry={head.width * 0.2} fill="#ffffff" stroke={eye} strokeWidth="1.5" />
          {eyeOpen > 0.2 && (
            <>
              <ellipse cx={isMoving ? head.width * 0.04 : 0} cy="0" rx={head.width * 0.08} ry={head.width * 0.1} fill="#0a0a0a" />
              <circle cx={head.width * 0.1} cy={-head.width * 0.05} r={head.width * 0.04} fill="#ffffff" />
            </>
          )}
          {eyeOpen <= 0.2 && (
            <path d={`M-${head.width * 0.12} 0 Q0 ${-head.width * 0.08} ${head.width * 0.12} 0`} stroke={eye} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}
        </g>
        <g transform={`translate(${head.width * 0.4}, ${head.width * 0.25})`}>
          <ellipse cx="0" cy="0" rx={head.width * 0.16} ry={head.width * 0.2} fill="#ffffff" stroke={eye} strokeWidth="1.5" />
          {eyeOpen > 0.2 && (
            <>
              <ellipse cx={isMoving ? head.width * 0.04 : 0} cy="0" rx={head.width * 0.08} ry={head.width * 0.1} fill="#0a0a0a" />
              <circle cx={head.width * 0.1} cy={-head.width * 0.05} r={head.width * 0.04} fill="#ffffff" />
            </>
          )}
          {eyeOpen <= 0.2 && (
            <path d={`M-${head.width * 0.12} 0 Q0 ${-head.width * 0.08} ${head.width * 0.12} 0`} stroke={eye} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}
        </g>

        {/* Mouth */}
        <g transform={`translate(${head.width * 0.58}, 0)`}>
          {isEating ? (
            <g>
              <ellipse cx="0" cy={head.width * 0.04} rx={head.width * 0.18} ry={head.width * 0.1} fill="#2a0a0a" stroke={eye} strokeWidth="1" />
              <ellipse cx="0" cy={head.width * 0.12} rx={head.width * 0.09} ry={head.width * 0.04} fill="#ff4d6d" />
            </g>
          ) : isHappy ? (
            <path d={`M-${head.width * 0.1} ${head.width * 0.04} Q0 ${head.width * 0.22} ${head.width * 0.1} ${head.width * 0.04}`} stroke={eye} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d={`M-${head.width * 0.08} ${head.width * 0.08} Q0 ${head.width * 0.18} ${head.width * 0.08} ${head.width * 0.08}`} stroke={eye} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}
        </g>

        {/* Cheek highlight */}
        <ellipse cx={head.width * 0.12} cy={-head.width * 0.08} rx={head.width * 0.22} ry={head.width * 0.12} fill="#ffffff" opacity={0.2} transform={`rotate(-15 ${head.width * 0.12} ${-head.width * 0.08})`} />
      </g>

      {segCount > 1 && (
        <g transform={`translate(${points[segCount - 1].x},${points[segCount - 1].y})`}>
          <circle cx="0" cy="0" r={points[segCount - 1].width / 2.5} fill={secondary} opacity="0.85" />
          <circle cx="0" cy="0" r={points[segCount - 1].width / 4} fill="#ffffff" opacity="0.3" />
        </g>
      )}
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
  ContinuousWormSVG,
  PremiumAppleSVG, PremiumPortalSVG, PremiumStoneWallSVG,
  PremiumGrassTileSVG, PremiumStoneBlockSVG, PremiumCrateTileSVG,
  PremiumIceTileSVG, PremiumTreasureTileSVG };
