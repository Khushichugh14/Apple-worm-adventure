import {
  Leaf, Mountain, TreePine, Gem as GemIcon, Sparkles
} from 'lucide-react';
import '../style.css';

/* ===================================================
   WORLD THEME PALETTES - Premium 3D environment colors
   =================================================== */
const WORLD_PALETTES = {
  1: { name: 'Enchanted Forest', bg: '#0b1a12', grass: '#22c55e', dirt: '#78350f', stone: '#475569', glow: '#34d399', accent: '#15803d', deep: '#062614' },
  2: { name: 'Magical Garden', bg: '#1a1408', grass: '#f59e0b', dirt: '#854d0e', stone: '#78350f', glow: '#fbbf24', accent: '#d97706', deep: '#120c02' },
  3: { name: 'Crystal Underground', bg: '#051018', grass: '#38bdf8', dirt: '#164e63', stone: '#334155', glow: '#67e8f9', accent: '#0e7490', deep: '#020c17' },
  4: { name: 'Frozen Ice Kingdom', bg: '#0a0c14', grass: '#60a5fa', dirt: '#1e293b', stone: '#475569', glow: '#7dd3fc', accent: '#38bdf8', deep: '#050714' },
  5: { name: 'Cosmic Galaxy', bg: '#0a0410', grass: '#a855f7', dirt: '#581c87', stone: '#4c1d95', glow: '#c084fc', accent: '#9333ea', deep: '#05020e' },
};

function worldPalette(worldId = 1) {
  return WORLD_PALETTES[worldId] || WORLD_PALETTES[1];
}

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

/* 4. World-Aware Glossy 3D Apple - Each world has distinct apple styling */
function PremiumAppleSVG({ collected = false, bobPhase = 0, worldId = 1 }) {
  const bobY = Math.sin(bobPhase) * 3.5;
  const bobRotate = Math.sin(bobPhase * 0.7) * 2;
  const t = worldPalette(worldId);

  const appleColor = worldId === 5 ? '#f472b6' : worldId === 3 ? '#38bdf8' : worldId === 4 ? '#7dd3fc' : '#ef4444';
  const appleDark = worldId === 5 ? '#db2777' : worldId === 3 ? '#0e7490' : worldId === 4 ? '#38bdf8' : '#b91c1c';
  const stemColor = worldId === 4 ? '#0f172a' : '#78350f';
  const leafColor = worldId === 3 ? '#22c55e' : worldId === 5 ? '#a855f7' : '#22c55e';

  return (
    <svg
      className={`premium-apple apple-world-${worldId} ${collected ? 'collected' : ''}`}
      viewBox="0 0 120 120"
      style={{
        transform: `translateY(${bobY}px) rotate(${bobRotate}deg)`
      }}
    >
      <defs>
        <radialGradient id={`candyAppleGrad-${worldId}`} cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="12%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="30%" stopColor={appleColor} />
          <stop offset="60%" stopColor={appleColor} />
          <stop offset="85%" stopColor={appleDark} />
          <stop offset="100%" stopColor={appleDark} />
        </radialGradient>
        <linearGradient id={`appleStemGrad-${worldId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={stemColor} />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id={`appleLeafGrad-${worldId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="50%" stopColor={leafColor} />
          <stop offset="100%" stopColor={leafColor} />
        </linearGradient>
        <filter id={`appleGlowDrop-${worldId}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor={t.glow} floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter={`url(#appleGlowDrop-${worldId})`}>
        <ellipse cx="60" cy="100" rx="34" ry="10" fill="rgba(0,0,0,0.25)" />

        <path d="M60 42 Q62 24 72 16" stroke={`url(#appleStemGrad-${worldId})`} strokeWidth="6" strokeLinecap="round" fill="none" />
        <g transform="translate(68, 16) rotate(18)">
          <path d="M0 14 C8 2, 26 2, 32 12 C34 20, 20 26, 0 18 Z" fill={`url(#appleLeafGrad-${worldId})`} stroke="#166534" strokeWidth="1.8" />
          <path d="M0 15 Q14 8 28 12" stroke="#14532d" strokeWidth="1.4" fill="none" />
        </g>

        <path
          d="M60 44 C46 36, 18 42, 18 68 C18 94, 44 104, 60 102 C76 104, 102 94, 102 68 C102 42, 74 36, 60 44 Z"
          fill={`url(#candyAppleGrad-${worldId})`}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
        />
        <path d="M32 54 C28 64, 28 78, 38 88" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.65" />
        <circle cx="36" cy="50" r="3.5" fill="#ffffff" opacity="0.8" />
        <ellipse cx="60" cy="45" rx="7" ry="3.5" fill={appleDark} opacity="0.6" />
        <g transform="translate(86, 48)">
          <polygon points="6,0 7.5,4.5 12,6 7.5,7.5 6,12 4.5,7.5 0,6 4.5,4.5" fill="#fef08a" />
        </g>
      </g>
    </svg>
  );
}

/* 5. World-Aware Mystical Portal - Rotating rings, glow, world-specific colors */
function PremiumPortalSVG({ unlocked = false, pulsePhase = 0, worldId = 1 }) {
  const pulseScale = 1 + Math.sin(pulsePhase * 2) * 0.05;
  const t = worldPalette(worldId);
  const portalColor = unlocked ? t.glow : '#475569';
  const portalColor2 = unlocked ? t.accent : '#334155';

  return (
    <svg className={`premium-portal portal-world-${worldId} ${unlocked ? 'unlocked' : 'locked'}`} viewBox="0 0 140 140" style={{ transform: unlocked ? `scale(${pulseScale})` : 'scale(1)' }}>
      <defs>
        <radialGradient id={`blackHoleCore-${worldId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="55%" stopColor="#050014" />
          <stop offset="80%" stopColor={unlocked ? portalColor : '#1e1b4b'} />
          <stop offset="100%" stopColor={unlocked ? portalColor2 : '#312e81'} stopOpacity="0.8" />
        </radialGradient>
        <radialGradient id={`portalAccretionDisk-${worldId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="65%" stopColor={unlocked ? t.glow : '#475569'} stopOpacity="0.4" />
          <stop offset="85%" stopColor={unlocked ? portalColor : '#334155'} stopOpacity="0.8" />
          <stop offset="100%" stopColor={unlocked ? portalColor2 : '#1e293b'} stopOpacity="0" />
        </radialGradient>
        <filter id={`portalBlackHoleGlow-${worldId}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`portalInnerGlow-${worldId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer accretion swirl - rotates slowly */}
      <circle cx="70" cy="70" r="64" fill="url(#portalAccretionDisk-${worldId})" filter={`url(#portalBlackHoleGlow-${worldId})`} />

      {unlocked ? (
        <g style={{ transformOrigin: '70px 70px', animation: 'galaxySpinOrbit 4s linear infinite' }}>
          <path d="M70 70 Q95 30 125 50" stroke={t.glow} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" filter={`url(#portalInnerGlow-${worldId})`} />
          <path d="M70 70 Q45 110 15 90" stroke={portalColor2} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" filter={`url(#portalInnerGlow-${worldId})`} />
          <path d="M70 70 Q110 95 90 125" stroke={t.accent} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M70 70 Q30 45 50 15" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
        </g>
      ) : (
        <g opacity="0.7">
          <circle cx="70" cy="70" r="54" fill="none" stroke="#475569" strokeWidth="3" strokeDasharray="8 6" />
        </g>
      )}

      {/* Deep Black Hole center */}
      <circle cx="70" cy="70" r="44" fill={`url(#blackHoleCore-${worldId})`} filter={`url(#portalBlackHoleGlow-${worldId})`} />
      <circle cx="70" cy="70" r="30" fill="#000000" />

      {/* Center glowing singularity */}
      {unlocked ? (
        <g filter={`url(#portalInnerGlow-${worldId})`}>
          <circle cx="70" cy="70" r="6" fill="#ffffff" />
          <circle cx="70" cy="70" r="10" fill={t.glow} opacity="0.5" />
          <circle cx="70" cy="70" r="14" fill={t.glow} opacity="0.25" />
        </g>
      ) : (
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

/* 6. World-Aware 3D Raised Maze Wall - Beveled edges, depth, shadows, world materials */
function PremiumStoneWallSVG({ worldId = 1, variant = 0, seed = 0 }) {
  const t = worldPalette(worldId);
  const gid = `mazeWall-${worldId}-${variant}-${seed % 5}`;

  // World-specific wall materials
  const materials = {
    1: { side: '#3f624a', top: '#22c55e', topLight: '#86efac', topDark: '#15803d', rim: '#4ade80', crack: '#15803d' },
    2: { side: '#6b4a1e', top: '#f59e0b', topLight: '#fef08a', topDark: '#a16207', rim: '#fcd34d', crack: '#78350f' },
    3: { side: '#2d4a5f', top: '#38bdf8', topLight: '#a5f3fc', topDark: '#0e7490', rim: '#67e8f9', crack: '#0369a1' },
    4: { side: '#2e1065', top: '#60a5fa', topLight: '#7dd3fc', topDark: '#38bdf8', rim: '#bae6fd', crack: '#1e3a8a' },
    5: { side: '#5b21b6', top: '#a855f7', topLight: '#e9d5ff', topDark: '#7e22ce', rim: '#d8b4fe', crack: '#7e22ce' },
  };
  const m = materials[worldId] || materials[1];

  return (
    <svg className="premium-wall" viewBox="0 0 120 120">
      <defs>
        <filter id={`${gid}-wallShadow`} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter={`url(#${gid}-wallShadow)`}>
        {/* Left side face - 3D depth */}
        <path d="M4 4 L14 14 L14 110 L4 100 Z" fill={t.dirt} opacity="0.7" />
        {/* Right side face - 3D depth */}
        <path d="M116 4 L106 14 L106 110 L116 100 Z" fill={t.dirt} opacity="0.4" />
        {/* Top side face - 3D depth */}
        <path d="M4 4 L14 14 L106 14 L116 4 Z" fill="#000000" opacity="0.3" />

        {/* Main front face - raised block */}
        <rect x="14" y="14" width="92" height="92" rx="12" fill={`url(#${gid}-dirt)`} stroke="#1c1004" strokeWidth="2" />

        {/* Top bevel edge - highlights the raised top */}
        <path d="M14 14 Q60 8 106 14" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M16 14 Q60 10 104 14" stroke="rgba(0,0,0,0.3)" strokeWidth="1" strokeLinecap="round" fill="none" />

        {/* World-specific top material */}
        <path d="M16 16 Q60 12 104 16 Q108 18 108 100 Q60 104 12 100 Q10 18 16 16 Z" fill={`url(#${gid}-top)`} />

        {/* Embedded stones/texture on front face */}
        <circle cx="30" cy="40" r="6" fill={t.dirt} opacity="0.5" />
        <circle cx="28" cy="38" r="4" fill={m.side} opacity="0.8" />
        <circle cx="85" cy="55" r="7" fill={t.dirt} opacity="0.5" />
        <circle cx="83" cy="53" r="5" fill={m.side} opacity="0.8" />
        <circle cx="55" cy="85" r="5" fill={t.dirt} opacity="0.5" />

        {/* Vertical highlight rim on right edge */}
        <path d="M104 16 Q106 60 104 104" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Crack detail lines */}
        <g stroke={m.crack} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3">
          <path d="M25 25 Q60 35 95 25" />
          <path d="M25 95 Q60 85 95 95" />
        </g>

        {/* Top surface highlight glow */}
        <path d="M20 18 Q60 14 100 18" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
      </g>

      <defs>
        <linearGradient id={`${gid}-top`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={m.topLight} />
          <stop offset="40%" stopColor={m.top} />
          <stop offset="100%" stopColor={m.topDark} />
        </linearGradient>
      </defs>
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

/* 12. World Background - Rich layered background per world theme */
function WorldBackgroundSVG({ worldId = 1 }) {
  const t = worldPalette(worldId);

  const worldDetails = {
    1: {
      gradient: `linear-gradient(180deg, ${t.deep} 0%, ${t.bg} 40%, ${t.bg} 100%)`,
      decorations: `
        <g opacity="0.6">
          <ellipse cx="20" cy="30" rx="40" ry="20" fill="${t.grass}" opacity="0.15" filter="blur(8px)" />
          <ellipse cx="100" cy="90" rx="50" ry="30" fill="${t.grass}" opacity="0.15" filter="blur(8px)" />
          <ellipse cx="60" cy="10" rx="60" ry="25" fill="#ffffff" opacity="0.08" filter="blur(10px)" />
        </g>
      `
    },
    2: {
      gradient: `linear-gradient(180deg, ${t.deep} 0%, ${t.bg} 40%, ${t.bg} 100%)`,
      decorations: `
        <g opacity="0.5">
          <ellipse cx="30" cy="40" rx="35" ry="20" fill="${t.glow}" opacity="0.15" filter="blur(10px)" />
          <ellipse cx="110" cy="80" rx="45" ry="25" fill="${t.glow}" opacity="0.15" filter="blur(10px)" />
        </g>
      `
    },
    3: {
      gradient: `linear-gradient(180deg, ${t.deep} 0%, ${t.bg} 40%, ${t.bg} 100%)`,
      decorations: `
        <g opacity="0.6">
          <ellipse cx="25" cy="35" rx="40" ry="25" fill="${t.glow}" opacity="0.2" filter="blur(12px)" />
          <ellipse cx="95" cy="85" rx="50" ry="30" fill="${t.accent}" opacity="0.15" filter="blur(12px)" />
          <circle cx="60" cy="60" r="80" fill="${t.glow}" opacity="0.05" filter="blur(20px)" />
        </g>
      `
    },
    4: {
      gradient: `linear-gradient(180deg, ${t.deep} 0%, ${t.bg} 40%, ${t.bg} 100%)`,
      decorations: `
        <g opacity="0.5">
          <ellipse cx="30" cy="30" rx="35" ry="20" fill="${t.glow}" opacity="0.15" filter="blur(10px)" />
          <ellipse cx="110" cy="90" rx="45" ry="25" fill="#e0f2fe" opacity="0.15" filter="blur(10px)" />
        </g>
      `
    },
    5: {
      gradient: `linear-gradient(180deg, ${t.deep} 0%, ${t.bg} 40%, ${t.bg} 100%)`,
      decorations: `
        <g opacity="0.6">
          <ellipse cx="20" cy="40" rx="45" ry="30" fill="${t.glow}" opacity="0.2" filter="blur(15px)" />
          <ellipse cx="100" cy="70" rx="55" ry="35" fill="#fbbf24" opacity="0.15" filter="blur(15px)" />
          <circle cx="60" cy="60" r="90" fill="${t.glow}" opacity="0.04" filter="blur(25px)" />
        </g>
      `
    }
  };

  const w = worldDetails[worldId] || worldDetails[1];

  return (
    <svg className="world-background-svg" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id={`worldBg-${worldId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={t.deep} />
          <stop offset="40%" stopColor={t.bg} />
          <stop offset="100%" stopColor={t.bg} />
        </linearGradient>
        <filter id={`worldNoise-${worldId}`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.15 0" />
        </filter>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill="url(#worldBg-${worldId})" />
      <rect x="0" y="0" width="100" height="100" fill="none" filter="url(#worldNoise-${worldId})" opacity="0.3" />
      <g dangerouslySetInnerHTML={{ __html: w.decorations }} />
    </svg>
  );
}

/* 13. World Tree - Forest decoration for board perimeter */
function WorldTreeSVG({ worldId = 1, variant = 0 }) {
  const t = worldPalette(worldId);
  const treeColor = worldId === 1 ? '#15803d' : worldId === 3 ? '#0e7490' : worldId === 4 ? '#38bdf8' : worldId === 5 ? '#9333ea' : '#a16207';
  const leafColor = worldId === 1 ? '#22c55e' : worldId === 3 ? '#38bdf8' : worldId === 4 ? '#60a5fa' : worldId === 5 ? '#a855f7' : '#d97706';

  return (
    <svg className="world-tree-svg" viewBox="0 0 60 100" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <filter id={`treeShadow-${worldId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>
      <g filter={`url(#treeShadow-${worldId})`}>
        <path d="M28 100 L32 100 L30 60 L28 100 Z" fill="#4a3728" />
        <ellipse cx="30" cy="30" rx="18" ry="25" fill={treeColor} />
        <ellipse cx="22" cy="22" rx="14" ry="18" fill={leafColor} opacity="0.9" />
        <ellipse cx="38" cy="22" rx="14" ry="18" fill={leafColor} opacity="0.9" />
        <ellipse cx="30" cy="14" rx="16" ry="16" fill={leafColor} opacity="0.85" />
      </g>
    </svg>
  );
}

/* 14. World Mushroom - Forest/garden decoration */
function WorldMushroomSVG({ worldId = 1, variant = 0 }) {
  const t = worldPalette(worldId);
  const capColor = worldId === 1 ? '#ef4444' : worldId === 2 ? '#f59e0b' : worldId === 3 ? '#a855f7' : worldId === 4 ? '#fbbf24' : '#c084fc';
  const stemColor = '#d1d5db';

  return (
    <svg className="world-mushroom-svg" viewBox="0 0 40 50" style={{ width: '100%', height: '100%', display: 'block' }}>
      <path d="M10 30 Q20 10 30 30 Q20 34 10 30 Z" fill={capColor} />
      <path d="M16 30 Q20 26 24 30 Q20 34 16 30 Z" fill="#ffffff" opacity="0.3" />
      <rect x="18" y="30" width="4" height="16" rx="2" fill={stemColor} />
      <circle cx="14" cy="26" r="2" fill="#ffffff" opacity="0.6" />
      <circle cx="24" cy="22" r="2" fill="#ffffff" opacity="0.6" />
      <circle cx="18" cy="32" r="2" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

/* 15. World Crystal - Cave decoration */
function WorldCrystalSVG({ worldId = 1, variant = 0 }) {
  const t = worldPalette(worldId);
  const crystalColor = worldId === 1 ? '#22c55e' : worldId === 2 ? '#f59e0b' : worldId === 3 ? '#38bdf8' : worldId === 4 ? '#60a5fa' : '#a855f7';

  return (
    <svg className="world-crystal-svg" viewBox="0 0 40 60" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id={`crystalGrad-${worldId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="40%" stopColor={crystalColor} />
          <stop offset="100%" stopColor={crystalColor} />
        </linearGradient>
      </defs>
      <path d="M20 5 L28 25 L20 45 L12 25 Z" fill="url(#crystalGrad-${worldId})" />
      <path d="M20 15 L24 25 L20 35 L16 25 Z" fill="#ffffff" opacity="0.4" />
      <circle cx="20" cy="25" r="3" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

/* 16. World Ice Crystal - Frozen decoration */
function WorldIceCrystalSVG({ worldId = 1, variant = 0 }) {
  return (
    <svg className="world-ice-crystal-svg" viewBox="0 0 40 50" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="iceCrystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <path d="M20 2 L30 22 L20 42 L10 22 Z" fill="url(#iceCrystalGrad)" opacity="0.8" />
      <path d="M20 12 L26 22 L20 32 L14 22 Z" fill="#ffffff" opacity="0.5" />
      <path d="M20 8 Q22 15 20 22 Q18 15 20 8" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

/* 17. World Planet - Cosmic decoration */
function WorldPlanetSVG({ worldId = 1, variant = 0 }) {
  const t = worldPalette(worldId);
  const planetColor = worldId === 5 ? '#a855f7' : worldId === 3 ? '#38bdf8' : worldId === 4 ? '#60a5fa' : '#f59e0b';

  return (
    <svg className="world-planet-svg" viewBox="0 0 50 50" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <radialGradient id={`planetGrad-${worldId}`} cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="30%" stopColor={planetColor} />
          <stop offset="100%" stopColor={worldPalette(worldId === 5 ? 1 : 5).deep} />
        </radialGradient>
      </defs>
      <circle cx="25" cy="25" r="18" fill="url(#planetGrad-${worldId})" />
      <ellipse cx="18" cy="20" rx="6" ry="10" fill="#ffffff" opacity="0.2" transform="rotate(-20 18 20)" />
      <circle cx="30" cy="32" r="2" fill="#ffffff" opacity="0.6" />
      <circle cx="15" cy="35" r="1.5" fill="#ffffff" opacity="0.5" />
    </svg>
  );
}

/* 18. Floating Particle - Ambient decoration */
function FloatingParticleSVG({ worldId = 1, type = 'sparkle' }) {
  const t = worldPalette(worldId);
  const color = type === 'sparkle' ? t.glow : type === 'glow' ? t.accent : '#ffffff';

  if (type === 'sparkle') {
    return (
      <svg viewBox="0 0 12 12" style={{ width: '100%', height: '100%', display: 'block' }}>
        <polygon points="6,0 7.5,3 10,3 8.5,6 9,9 6,7.5 3,9 3.5,6 2,3 4.5,3" fill={color} />
      </svg>
    );
  }
  if (type === 'glow') {
    return (
      <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%', display: 'block' }}>
        <circle cx="10" cy="10" r="8" fill={color} opacity="0.3" />
        <circle cx="10" cy="10" r="3" fill={color} opacity="0.8" />
      </svg>
    );
  }
  return null;
}

export { SKINS, calculateStars, WorldIcons, WorldIcon,
  ContinuousWormSVG,
  PremiumAppleSVG, PremiumPortalSVG, PremiumStoneWallSVG,
  PremiumGrassTileSVG, PremiumStoneBlockSVG, PremiumCrateTileSVG,
  PremiumIceTileSVG, PremiumTreasureTileSVG,
  WORLD_PALETTES, worldPalette,
  WorldBackgroundSVG, WorldTreeSVG, WorldMushroomSVG, WorldCrystalSVG, WorldIceCrystalSVG, WorldPlanetSVG, FloatingParticleSVG };
