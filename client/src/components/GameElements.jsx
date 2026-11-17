import {
  Leaf, Mountain, TreePine, Gem as GemIcon, Sparkles, Flame
} from 'lucide-react';
import '../style.css';

/* ===================================================
   WORLD PALETTES - 5 distinct premium environments
   1 Mossy Meadow, 2 Frozen Crystal Cave, 3 Desert Canyon,
   4 Enchanted Mushroom Forest, 5 Volcanic Realm
   =================================================== */
export const WORLD_PALETTES = {
  1: {
    name: 'Mossy Meadow',
    bg: '#08160d',
    deep: '#040b07',
    floorA: '#173322',
    floorB: '#132a1c',
    accent: '#22c55e',
    glow: '#86efac',
    wall: '#5f7a4a',
    wallDark: '#3f5234',
    apple: '#ef4444',
    portal: '#34d399',
    mist: 'rgba(134,239,172,0.18)',
  },
  2: {
    name: 'Frozen Crystal Cave',
    bg: '#071723',
    deep: '#030b12',
    floorA: '#123046',
    floorB: '#0d2436',
    accent: '#38bdf8',
    glow: '#bae6fd',
    wall: '#7dd3fc',
    wallDark: '#2b6b8f',
    apple: '#60a5fa',
    portal: '#67e8f9',
    mist: 'rgba(186,230,253,0.22)',
  },
  3: {
    name: 'Desert Canyon',
    bg: '#24170a',
    deep: '#120b05',
    floorA: '#5a3a1b',
    floorB: '#472e16',
    accent: '#f59e0b',
    glow: '#fde68a',
    wall: '#c2410c',
    wallDark: '#7c2d12',
    apple: '#ef4444',
    portal: '#fbbf24',
    mist: 'rgba(253,230,138,0.16)',
  },
  4: {
    name: 'Enchanted Mushroom Forest',
    bg: '#170d22',
    deep: '#0b0612',
    floorA: '#2d1a45',
    floorB: '#241537',
    accent: '#a855f7',
    glow: '#e9d5ff',
    wall: '#7c3aed',
    wallDark: '#4c1d95',
    apple: '#f472b6',
    portal: '#c084fc',
    mist: 'rgba(233,213,255,0.18)',
  },
  5: {
    name: 'Volcanic Realm',
    bg: '#1d0b08',
    deep: '#0d0403',
    floorA: '#3a1710',
    floorB: '#2b110c',
    accent: '#f97316',
    glow: '#fdba74',
    wall: '#57534e',
    wallDark: '#292524',
    apple: '#fb7185',
    portal: '#fb923c',
    mist: 'rgba(251,146,60,0.2)',
  },
};

export function worldPalette(worldId = 1) {
  return WORLD_PALETTES[worldId] || WORLD_PALETTES[1];
}

export const SKINS = [
  { id: 'emerald', name: 'Emerald', primary: '#4ade80', secondary: '#16a34a', highlight: '#bbf7d0', belly: '#dcfce7', eye: '#14532d', glow: 'rgba(74,222,128,0.55)', label: 'Classic earthworm', price: 0, owned: true },
  { id: 'golden', name: 'Golden Sun', primary: '#fbbf24', secondary: '#d97706', highlight: '#fef3c7', belly: '#fffbeb', eye: '#92400e', glow: 'rgba(251,191,36,0.55)', label: 'Sunny glow', price: 500, owned: false },
  { id: 'ruby', name: 'Ruby Flame', primary: '#fb7185', secondary: '#e11d48', highlight: '#fecdd3', belly: '#fff1f2', eye: '#881337', glow: 'rgba(251,113,133,0.55)', label: 'Fiery red', price: 750, owned: false },
  { id: 'amethyst', name: 'Cosmic Violet', primary: '#c084fc', secondary: '#7c3aed', highlight: '#ede9fe', belly: '#f5f3ff', eye: '#4c1d95', glow: 'rgba(192,132,252,0.55)', label: 'Mystic purple', price: 1000, owned: false },
  { id: 'cyber', name: 'Neon Cyber', primary: '#22d3ee', secondary: '#0891b2', highlight: '#cffafe', belly: '#ecfeff', eye: '#155e75', glow: 'rgba(34,211,238,0.55)', label: 'Electric cyan', price: 1500, owned: false },
  { id: 'rose', name: 'Rose Quartz', primary: '#f472b6', secondary: '#db2777', highlight: '#fce7f3', belly: '#fdf2f8', eye: '#831843', glow: 'rgba(244,114,182,0.55)', label: 'Soft pink', price: 1200, owned: false },
];

export function calculateStars(moves, limit, parMoves) {
  const par = parMoves || Math.ceil(limit * 0.55);
  if (moves <= par) return 3;
  if (moves <= Math.ceil(limit * 0.8)) return 2;
  return 1;
}

const WorldIcons = { leaf: Leaf, mountain: Mountain, gem: GemIcon, 'tree-pine': TreePine, sparkles: Sparkles, flame: Flame };
export const WorldIcon = ({ name, size = 20, className = '' }) => {
  const Icon = WorldIcons[name] || Sparkles;
  return <Icon size={size} className={className} />;
};

/* ===================================================
   3D Cartoon Earthworm - complete segmented body, head, eyes, mouth, tail
   =================================================== */
export function ContinuousWormSVG({
  segments,
  wormSkin = 'emerald',
  expression = 'idle',
  skinColor = {},
  animTime = 0,
  facing = 'right',
  levelSize = 8,
  growing = false,
}) {
  const skin = SKINS.find(s => s.id === wormSkin) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;
  const belly = skinColor.belly || skin.belly || '#fefce8';
  const eyeColor = skinColor.eye || skin.eye;

  if (!segments || segments.length === 0) return null;

  // Coordinate space matches an equal grid (overlay aligned to grid padding).
  const size = 100;
  const cell = size / levelSize;
  const half = cell / 2;
  const t = animTime * 0.0045;
  const isEating = expression === 'eating';
  const isMoving = expression === 'moving';
  const isHappy = expression === 'happy' || expression === 'victory';
  const blink = (Math.sin(animTime * 0.003) + 1) / 2 > 0.975 && !isEating ? 0.06 : 1;
  const n = Math.max(1, segments.length - 1);

  const pts = segments.map((seg, i) => {
    const p = i / n;
    // Smooth body-following wave (damped toward head, stronger mid-body)
    const waveAmp = (isMoving ? 0.11 : 0.05) * cell * Math.sin(Math.PI * Math.min(1, p * 1.1));
    const phase = t * 2.4 + i * 0.95;
    const wx = i === 0 ? 0 : Math.sin(phase) * waveAmp;
    const wy = i === 0 ? 0 : Math.cos(phase) * waveAmp;
    // Tapered earthworm proportions: rounded head, thicker mid, slim tail
    let rx;
    let ry;
    if (i === 0) {
      rx = cell * 0.42; ry = cell * 0.40;
    } else if (p < 0.18) {
      rx = cell * 0.38; ry = cell * 0.35;
    } else {
      const taper = 1 - Math.pow(p, 0.85) * 0.55;
      rx = cell * 0.36 * taper;
      ry = cell * 0.33 * taper;
    }
    return {
      i,
      p,
      cx: seg[0] * cell + half + wx,
      cy: seg[1] * cell + half + wy,
      rx, ry,
    };
  });

  // Smooth spine through segment centers
  let spine = `M ${pts[0].cx} ${pts[0].cy}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const mx = (prev.cx + cur.cx) / 2;
    const my = (prev.cy + cur.cy) / 2;
    spine += ` Q ${prev.cx} ${prev.cy} ${mx} ${my}`;
  }
  spine += ` T ${pts[pts.length - 1].cx} ${pts[pts.length - 1].cy}`;

  const head = pts[0];
  const neck = pts[1] || head;
  let headAngle = Math.atan2(head.cy - neck.cy, head.cx - neck.cx) * 180 / Math.PI;
  if (segments.length === 1) headAngle = { right: 0, down: 90, left: 180, up: -90 }[facing] || 0;

  const tail = pts[pts.length - 1];
  const beforeTail = pts[Math.max(0, pts.length - 2)] || tail;
  const tailAngle = Math.atan2(tail.cy - beforeTail.cy, tail.cx - beforeTail.cx) * 180 / Math.PI;

  const uid = `worm-${wormSkin}-${levelSize}`;
  const bodyStroke = Math.max(2.2, cell * 0.52);
  const innerStroke = Math.max(1.6, cell * 0.40);

  return (
    <svg
      className={`continuous-worm-svg ${growing ? 'growing' : ''} ${isMoving ? 'moving' : ''} ${isEating ? 'eating' : ''} ${isHappy ? 'happy' : ''}`}
      viewBox={`0 0 ${size} ${size}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`body-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="45%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </linearGradient>
        <radialGradient id={`head-${uid}`} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="22%" stopColor={highlight} />
          <stop offset="55%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </radialGradient>
        <linearGradient id={`belly-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={belly} stopOpacity="0.9" />
          <stop offset="100%" stopColor={belly} stopOpacity="0.45" />
        </linearGradient>
        <filter id={`shadow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy={Math.max(0.8, cell * 0.06)} stdDeviation={Math.max(0.6, cell * 0.05)} floodColor="#000" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Soft ground shadow along body */}
      <path d={spine} fill="none" stroke="#000" strokeWidth={bodyStroke * 1.05} strokeLinecap="round" strokeLinejoin="round" opacity="0.12" transform="translate(0,1.2)" />

      {/* Continuous body connector */}
      <path d={spine} fill="none" stroke={secondary} strokeWidth={bodyStroke} strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      <path d={spine} fill="none" stroke={`url(#body-${uid})`} strokeWidth={innerStroke} strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />

      {/* Segments (tail -> neck) for clear segmented earthworm look */}
      {[...pts].slice(1).reverse().map((pt) => {
        const i = pt.i;
        const prev = pts[i - 1] || pt;
        const next = pts[i + 1] || pt;
        const angle = Math.atan2(next.cy - prev.cy, next.cx - prev.cx) * 180 / Math.PI;
        const pulse = 1 + Math.sin(t * 2.1 + i * 0.85) * 0.04;
        const segRx = pt.rx * pulse;
        const segRy = pt.ry * (1 / pulse);
        const isTail = i === pts.length - 1;
        const tailTaper = isTail ? 0.78 : 1;
        return (
          <g key={i} transform={`translate(${pt.cx},${pt.cy}) rotate(${angle})`} filter={`url(#shadow-${uid})`}>
            <ellipse cx={0} cy={segRy * 0.18} rx={segRx * 0.95} ry={segRy * 0.28} fill="#000" opacity="0.14" />
            <ellipse cx={isTail ? segRx * 0.08 : 0} cy={0} rx={segRx * 0.98 * tailTaper} ry={segRy * 0.98 * (isTail ? 0.9 : 1)} fill={`url(#body-${uid})`} />
            <ellipse cx={0} cy={segRy * 0.22} rx={segRx * 0.62} ry={segRy * 0.34} fill={`url(#belly-${uid})`} opacity="0.85" />
            {/* segment rings */}
            <path d={`M ${-segRx * 0.55} ${-segRy * 0.05} Q 0 ${-segRy * 0.42} ${segRx * 0.55} ${-segRy * 0.05}`} stroke="rgba(255,255,255,0.22)" strokeWidth={Math.max(0.7, cell * 0.035)} fill="none" />
            <path d={`M ${-segRx * 0.5} ${segRy * 0.22} Q 0 ${segRy * 0.02} ${segRx * 0.5} ${segRy * 0.22}`} stroke="rgba(0,0,0,0.12)" strokeWidth={Math.max(0.6, cell * 0.03)} fill="none" />
            <ellipse cx={-segRx * 0.2} cy={-segRy * 0.28} rx={segRx * 0.18} ry={segRy * 0.14} fill="#fff" opacity="0.3" />
            {isTail && (
              <ellipse cx={segRx * 0.38} cy={0} rx={segRx * 0.22} ry={segRy * 0.22} fill={highlight} opacity="0.55" />
            )}
          </g>
        );
      })}

      {/* Head (rounded, expressive, clearly visible) */}
      <g transform={`translate(${head.cx},${head.cy}) rotate(${headAngle})`} filter={`url(#shadow-${uid})`}>
        <ellipse cx={0} cy={head.ry * 0.16} rx={head.rx * 1.02} ry={head.ry * 0.3} fill="#000" opacity="0.14" />
        {/* head base */}
        <ellipse cx={0} cy={0} rx={head.rx} ry={head.ry} fill={`url(#head-${uid})`} />
        <ellipse cx={0} cy={head.ry * 0.24} rx={head.rx * 0.68} ry={head.ry * 0.38} fill={`url(#belly-${uid})`} opacity="0.9" />
        {/* brow/shine */}
        <ellipse cx={-head.rx * 0.18} cy={-head.ry * 0.34} rx={head.rx * 0.28} ry={head.ry * 0.18} fill="#fff" opacity="0.45" />
        <path d={`M ${-head.rx * 0.45} ${-head.ry * 0.08} Q 0 ${-head.ry * 0.52} ${head.rx * 0.45} ${-head.ry * 0.08}`} stroke="rgba(255,255,255,0.22)" strokeWidth={Math.max(0.8, cell * 0.04)} fill="none" />

        {/* cute antenna nubs */}
        <g>
          <line x1={-head.rx * 0.05} y1={-head.ry * 0.78} x2={-head.rx * 0.18} y2={-head.ry * 1.15} stroke={secondary} strokeWidth={Math.max(1, cell * 0.05)} strokeLinecap="round" />
          <circle cx={-head.rx * 0.2} cy={-head.ry * 1.18} r={Math.max(1.2, cell * 0.055)} fill={highlight} stroke={secondary} strokeWidth="0.5" />
          <line x1={-head.rx * 0.05} y1={head.ry * 0.78} x2={-head.rx * 0.18} y2={head.ry * 1.15} stroke={secondary} strokeWidth={Math.max(1, cell * 0.05)} strokeLinecap="round" />
          <circle cx={-head.rx * 0.2} cy={head.ry * 1.18} r={Math.max(1.2, cell * 0.055)} fill={highlight} stroke={secondary} strokeWidth="0.5" />
        </g>

        {/* Eyes */}
        {[-1, 1].map((side) => (
          <g key={side} transform={`translate(${head.rx * 0.08}, ${side * head.ry * 0.34})`}>
            <ellipse cx="0" cy="0" rx={head.rx * 0.23} ry={head.ry * 0.27 * blink} fill="#fff" stroke="rgba(0,0,0,0.12)" strokeWidth="0.6" />
            <circle cx={isMoving ? head.rx * 0.045 : head.rx * 0.01} cy={side * head.ry * 0.01} r={head.rx * 0.105 * blink} fill={eyeColor} />
            <circle cx={head.rx * 0.07} cy={-head.ry * 0.05} r={head.rx * 0.045 * blink} fill="#fff" />
            {isHappy && blink > 0.5 && <path d={`M ${-head.rx * 0.1} ${head.ry * 0.1} Q 0 ${-head.ry * 0.02} ${head.rx * 0.1} ${head.ry * 0.1}`} stroke={eyeColor} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />}
          </g>
        ))}

        {/* Cheeks */}
        <ellipse cx={head.rx * 0.18} cy={-head.ry * 0.58} rx={head.rx * 0.16} ry={head.ry * 0.09} fill="#fb7185" opacity={isHappy ? 0.38 : 0.2} />
        <ellipse cx={head.rx * 0.18} cy={head.ry * 0.58} rx={head.rx * 0.16} ry={head.ry * 0.09} fill="#fb7185" opacity={isHappy ? 0.38 : 0.2} />

        {/* Mouth (small, expressive) */}
        <g transform={`translate(${head.rx * 0.56}, 0)`}>
          {isEating ? (
            <g>
              <ellipse cx="0" cy="0" rx={head.rx * 0.2} ry={head.ry * 0.22} fill="#4a1d1d" />
              <ellipse cx={head.rx * 0.02} cy={head.ry * 0.07} rx={head.rx * 0.1} ry={head.ry * 0.08} fill="#fb7185" opacity="0.9" />
            </g>
          ) : isHappy ? (
            <path d={`M ${-head.rx * 0.12} ${-head.ry * 0.08} Q 0 ${head.ry * 0.22} ${head.rx * 0.12} ${-head.ry * 0.08}`} stroke="#4a1d1d" strokeWidth={Math.max(1.2, cell * 0.06)} fill="none" strokeLinecap="round" />
          ) : (
            <path d={`M ${-head.rx * 0.1} 0 Q 0 ${head.ry * 0.1} ${head.rx * 0.1} 0`} stroke="#4a1d1d" strokeWidth={Math.max(1.1, cell * 0.05)} fill="none" strokeLinecap="round" />
          )}
        </g>
      </g>

      {/* Tail tip accent for clear tail visibility */}
      {segments.length > 1 && (
        <g transform={`translate(${tail.cx},${tail.cy}) rotate(${tailAngle})`} opacity="0.9">
          <ellipse cx={tail.rx * 0.55} cy={0} rx={tail.rx * 0.28} ry={tail.ry * 0.24} fill={highlight} opacity="0.55" />
        </g>
      )}

      {/* Eating feedback */}
      {isEating && (
        <g transform={`translate(${head.cx + Math.cos(headAngle * Math.PI / 180) * head.rx * 0.95}, ${head.cy + Math.sin(headAngle * Math.PI / 180) * head.rx * 0.95})`}>
          <circle cx="0" cy="0" r={Math.max(1.4, cell * 0.08)} fill={highlight} opacity="0.95" />
          <circle cx={cell * 0.12} cy={-cell * 0.08} r={Math.max(0.9, cell * 0.045)} fill="#fff" opacity="0.9" />
        </g>
      )}
    </svg>
  );
}

/* ===================================================
   3D Apple - realistic shading, highlights, collection effects
   =================================================== */
export function PremiumAppleSVG({ collected = false, bobPhase = 0, worldId = 1 }) {
  const p = worldPalette(worldId);
  const bob = Math.sin(bobPhase * 1.05) * 2.4;
  const rot = Math.sin(bobPhase * 0.7) * 2.2;
  const shimmer = 0.35 + (Math.sin(bobPhase * 1.8) + 1) * 0.12;
  const body = worldId === 2 ? '#a5d8ff' : worldId === 4 ? '#f9a8d4' : worldId === 5 ? '#fda4af' : '#ef4444';
  const mid = worldId === 2 ? '#60a5fa' : worldId === 4 ? '#ec4899' : worldId === 5 ? '#fb7185' : '#dc2626';
  const dark = worldId === 2 ? '#1d4ed8' : worldId === 4 ? '#9d174d' : worldId === 5 ? '#9f1239' : '#7f1d1d';
  const leaf = worldId === 3 ? '#84cc16' : worldId === 5 ? '#65a30d' : '#22c55e';
  const leafDark = worldId === 3 ? '#3f6212' : '#14532d';
  const glow = worldId === 2 ? 'rgba(186,230,253,.7)' : worldId === 4 ? 'rgba(244,114,182,.6)' : worldId === 5 ? 'rgba(251,146,60,.55)' : 'rgba(248,113,113,.55)';
  const uid = `a${worldId}`;
  return (
    <svg className={`premium-apple ${collected ? 'collected' : ''}`} viewBox="0 0 120 120" style={{ width: '92%', height: '92%', overflow: 'visible', transform: collected ? 'scale(0.15)' : `translateY(${bob}px) rotate(${rot}deg)`, opacity: collected ? 0 : 1, transition: 'transform .28s ease, opacity .28s ease', filter: `drop-shadow(0 8px 10px rgba(0,0,0,.28)) drop-shadow(0 0 10px ${glow})` }}>
      <defs>
        <radialGradient id={`apple-body-${uid}`} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="16%" stopColor={body} />
          <stop offset="55%" stopColor={mid} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <radialGradient id={`apple-shade-${uid}`} cx="72%" cy="75%" r="55%">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.32" />
        </radialGradient>
        <linearGradient id={`stem-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a16207" /><stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id={`leaf-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#86efac" /><stop offset="45%" stopColor={leaf} /><stop offset="100%" stopColor={leafDark} />
        </linearGradient>
        <filter id={`apple-spec-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <ellipse cx="60" cy="104" rx="28" ry="8" fill="#000" opacity={0.18 + (Math.sin(bobPhase) + 1) * 0.03} />
      <path d="M60 44 C58 28 66 20 74 14" stroke={`url(#stem-${uid})`} strokeWidth="6.5" strokeLinecap="round" fill="none" />
      <path d="M60 44 C58 28 66 20 74 14" stroke="#fef3c7" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.25" />
      <g transform="translate(70,12) rotate(20)">
        <path d="M0 14 C10 -2 32 0 36 14 C32 26 12 30 0 20 Z" fill={`url(#leaf-${uid})`} stroke={leafDark} strokeWidth="1.2" />
        <path d="M2 15 Q16 8 32 14" stroke={leafDark} strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M6 16 Q16 12 24 14" stroke="#dcfce7" strokeWidth="1.2" fill="none" opacity="0.35" />
      </g>
      <path d="M60 42 C40 34 16 44 16 72 C16 98 40 108 60 103 C80 108 104 98 104 72 C104 44 80 34 60 42 Z" fill={`url(#apple-body-${uid})`} />
      <path d="M60 42 C40 34 16 44 16 72 C16 98 40 108 60 103 C80 108 104 98 104 72 C104 44 80 34 60 42 Z" fill={`url(#apple-shade-${uid})`} />
      <path d="M60 46 C44 40 24 48 24 72 C24 92 42 100 60 96" stroke="#fff" strokeWidth="3" fill="none" opacity="0.18" strokeLinecap="round" />
      <ellipse cx="40" cy="58" rx="9" ry="15" fill="#fff" opacity={shimmer} transform="rotate(-18 40 58)" filter={`url(#apple-spec-${uid})`} />
      <circle cx="36" cy="50" r="3.4" fill="#fff" opacity="0.85" />
      <circle cx="43" cy="66" r="1.8" fill="#fff" opacity="0.55" />
      <ellipse cx="78" cy="76" rx="10" ry="6" fill={dark} opacity="0.18" />
      <g opacity="0.95">
        <g transform="translate(84,46)">
          <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="3.2s" repeatCount="indefinite" />
          <polygon points="0,-6 1.8,-1.6 6.5,0 1.8,1.6 0,6 -1.8,1.6 -6.5,0 -1.8,-1.6" fill="#fff" opacity="0.95" />
        </g>
        <circle cx="24" cy="40" r="2.2" fill="#fff" opacity="0.7"><animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.2s" repeatCount="indefinite" /></circle>
      </g>
      <g className="apple-collect-fx" opacity={collected ? 1 : 0}>
        <circle cx="60" cy="70" r="12" fill="#fff" opacity="0.8" />
        <circle cx="60" cy="70" r="24" fill="none" stroke={p.glow || '#fff'} strokeWidth="4" opacity="0.6" />
      </g>
    </svg>
  );
}

/* ===================================================
   Portal - attractive, clearly identifiable destination
   =================================================== */
export function PremiumPortalSVG({ unlocked = false, pulsePhase = 0, worldId = 1 }) {
  const p = worldPalette(worldId);
  const pulse = 1 + Math.sin(pulsePhase * 2.4) * 0.035;
  const c1 = unlocked ? p.portal : '#64748b';
  const c2 = unlocked ? p.glow : '#475569';
  const c3 = unlocked ? '#ffffff' : '#94a3b8';
  const uid = `p${worldId}`;
  return (
    <svg className={`premium-portal ${unlocked ? 'unlocked' : 'locked'}`} viewBox="0 0 140 140" style={{ width: '96%', height: '96%', overflow: 'visible', transform: `scale(${unlocked ? pulse : 1})`, filter: unlocked ? `drop-shadow(0 0 10px ${c1}) drop-shadow(0 8px 10px rgba(0,0,0,.25))` : 'drop-shadow(0 6px 8px rgba(0,0,0,.35))' }}>
      <defs>
        <radialGradient id={`portal-core-${uid}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={unlocked ? '#e0f2fe' : '#334155'} stopOpacity={unlocked ? 0.9 : 0.5} />
          <stop offset="35%" stopColor={unlocked ? c2 : '#1e293b'} stopOpacity="0.9" />
          <stop offset="70%" stopColor={unlocked ? c1 : '#334155'} stopOpacity="0.8" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <linearGradient id={`portal-rim-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c3} stopOpacity="0.95" />
          <stop offset="45%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <filter id={`portal-glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={unlocked ? 4 : 2} result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx="70" cy="112" rx="34" ry="8" fill="#000" opacity="0.22" />
      <g filter={`url(#portal-glow-${uid})`}>
        <circle cx="70" cy="70" r="58" fill="none" stroke={c2} strokeWidth={unlocked ? 11 : 9} opacity={unlocked ? 0.35 : 0.18} />
        <circle cx="70" cy="70" r="53" fill="none" stroke={`url(#portal-rim-${uid})`} strokeWidth="6" opacity={unlocked ? 0.95 : 0.45} />
        <g style={{ transformOrigin: '70px 70px', animation: unlocked ? 'spin 7s linear infinite' : 'none' }}>
          <circle cx="70" cy="70" r="46" fill="none" stroke={c1} strokeWidth="3.5" strokeDasharray="16 10 6 12" opacity={unlocked ? 0.95 : 0.3} />
          {[0,60,120,180,240,300].map(a => <circle key={a} cx={70 + Math.cos(a*Math.PI/180)*46} cy={70 + Math.sin(a*Math.PI/180)*46} r="2.4" fill={c3} opacity={unlocked ? 0.9 : 0.25} />)}
        </g>
        <g style={{ transformOrigin: '70px 70px', animation: unlocked ? 'spinReverse 4.5s linear infinite' : 'none' }}>
          <circle cx="70" cy="70" r="37" fill="none" stroke={c2} strokeWidth="2.5" strokeDasharray="8 10" opacity={unlocked ? 0.9 : 0.25} />
        </g>
        <circle cx="70" cy="70" r="30" fill={`url(#portal-core-${uid})`} stroke={c1} strokeWidth="2" />
        <ellipse cx="60" cy="58" rx="10" ry="6" fill="#fff" opacity={unlocked ? 0.18 : 0.08} />
        {unlocked ? (
          <g>
            <g transform="translate(70,70)">
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="5s" repeatCount="indefinite" />
              <path d="M0 -18 L5 -5 L18 0 L5 5 L0 18 L-5 5 L-18 0 L-5 -5 Z" fill={c3} opacity="0.95" />
            </g>
            <circle cx="70" cy="70" r="7" fill="#fff" />
            <circle cx="70" cy="70" r="14" fill={c2} opacity="0.22"><animate attributeName="r" values="12;16;12" dur="1.8s" repeatCount="indefinite" /></circle>
            {[0,1,2,3,4,5,6,7].map(i => (
              <circle key={i} cx={70 + Math.cos((pulsePhase * 1.2 + i) * 0.785) * (20 + (i%2)*4)} cy={70 + Math.sin((pulsePhase * 1.2 + i) * 0.785) * (20 + (i%2)*4)} r={i%2?1.8:2.4} fill={i%3===0?c3:c2} opacity="0.85" />
            ))}
          </g>
        ) : (
          <g transform="translate(56,52)" opacity="0.95">
            <rect x="0" y="12" width="28" height="20" rx="5" fill="#334155" stroke="#94a3b8" strokeWidth="2.5" />
            <path d="M6 12 V8 a8 8 0 0 1 16 0 v4" fill="none" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="14" cy="22" r="2.6" fill="#cbd5e1" />
            <rect x="12.8" y="22" width="2.4" height="5" rx="1.2" fill="#cbd5e1" />
          </g>
        )}
      </g>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes spinReverse{to{transform:rotate(-360deg)}}`}</style>
    </svg>
  );
}

/* ===================================================
   World-aware obstacle/object tiles - detailed 3D per environment
   =================================================== */
export function PremiumStoneWallSVG({ worldId = 1, variant = 0 }) {
  const p = worldPalette(worldId);
  const uid = `w${worldId}${variant}`;
  const themes = {
    1: { topA:'#8fb86a', topB:'#5f7a4a', sideA:'#4d6338', sideB:'#2f3f22', edge:'#d9f99d', detail:'moss' },
    2: { topA:'#f0f9ff', topB:'#93c5fd', sideA:'#60a5fa', sideB:'#1e3a8a', edge:'#ffffff', detail:'ice' },
    3: { topA:'#f59e0b', topB:'#b45309', sideA:'#92400e', sideB:'#451a03', edge:'#fde68a', detail:'sand' },
    4: { topA:'#c084fc', topB:'#7c3aed', sideA:'#5b21b6', sideB:'#2e1065', edge:'#f5d0fe', detail:'magic' },
    5: { topA:'#57534e', topB:'#292524', sideA:'#44403c', sideB:'#0c0a09', edge:'#fdba74', detail:'lava' },
  };
  const t = themes[worldId] || themes[1];
  const off = (variant % 3) * 6;
  return (
    <svg className="premium-wall" viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`wall-top-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.topA} />
          <stop offset="100%" stopColor={t.topB} />
        </linearGradient>
        <linearGradient id={`wall-side-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={t.sideA} />
          <stop offset="100%" stopColor={t.sideB} />
        </linearGradient>
        <linearGradient id={`wall-rim-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="93" rx="38" ry="6" fill="#000" opacity="0.22" />
      <rect x="6" y="20" width="88" height="72" rx="12" fill={`url(#wall-side-${uid})`} />
      <rect x="8" y="22" width="8" height="66" rx="4" fill="#000" opacity="0.12" />
      <rect x="6" y="6" width="88" height="70" rx="12" fill={`url(#wall-top-${uid})`} stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <rect x="10" y="10" width="80" height="8" rx="4" fill="url(#wall-rim-${uid})" opacity="0.55" />
      <g opacity="0.22" stroke="#000" strokeWidth="2">
        <path d={`M14 ${34+off%4} H86`} />
        <path d={`M14 ${52-off%3} H86`} />
        <path d={`M${36+off%5} 14 V70`} />
        <path d={`M${64-off%5} 14 V70`} />
      </g>
      {t.detail === 'moss' && <g>
        <path d="M10 10 q10 -6 18 0 q8 -5 16 0 q10 -6 18 0 q10 -5 18 0 v10 H10 Z" fill="#4ade80" opacity="0.55" />
        <path d="M18 22 q6 10 0 18 M28 20 q5 8 0 14" stroke="#166534" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
        <circle cx="74" cy="30" r="3" fill="#86efac" opacity="0.8" />
        <circle cx="24" cy="60" r="4" fill="#22c55e" opacity="0.35" />
      </g>}
      {t.detail === 'ice' && <g>
        <rect x="10" y="10" width="80" height="14" rx="6" fill="#fff" opacity="0.35" />
        <path d={`M22 ${60-off%6} l8 -16 8 16 Z`} fill="#e0f2fe" opacity="0.85" />
        <path d={`M58 ${64+off%4} l10 -20 10 20 Z`} fill="#bae6fd" opacity="0.8" />
        <path d="M18 28 L30 22 L26 36 Z M68 26 L80 30 L72 40 Z" fill="#fff" opacity="0.55" />
      </g>}
      {t.detail === 'sand' && <g>
        <path d="M10 14 h80" stroke="#fde68a" strokeWidth="4" opacity="0.25" />
        <path d={`M16 ${44+off%5} h24 M56 ${58-off%4} h24`} stroke="#7c2d12" strokeWidth="3" opacity="0.35" />
        <path d={`M20 ${66-off%6} h60`} stroke="#fef3c7" strokeWidth="2" opacity="0.25" />
        <rect x="68" y="24" width="10" height="8" rx="2" fill="#fcd34d" opacity="0.28" />
      </g>}
      {t.detail === 'magic' && <g>
        <ellipse cx="28" cy="28" rx="8" ry="5" fill="#e879f9" opacity="0.25" />
        <ellipse cx="72" cy="54" rx="10" ry="6" fill="#67e8f9" opacity="0.18" />
        <circle cx="30" cy="30" r="2.5" fill="#fdf4ff" opacity="0.8"><animate attributeName="opacity" values="0.3;1;0.3" dur={`${2.2+variant%3}s`} repeatCount="indefinite" /></circle>
        <circle cx="70" cy="56" r="2" fill="#f0abfc" opacity="0.8"><animate attributeName="opacity" values="0.3;1;0.3" dur={`${2.8+variant%2}s`} repeatCount="indefinite" /></circle>
        <path d="M18 64 q10 -14 20 0 q10 -14 20 0 q10 -14 20 0" stroke="#e9d5ff" strokeWidth="2.5" fill="none" opacity="0.35" />
      </g>}
      {t.detail === 'lava' && <g>
        <path d={`M14 ${62-off%5} L34 ${48+off%4} L50 ${66-off%3} L70 ${46+off%4} L86 ${60-off%5}`} stroke="#fb923c" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8">
          <animate attributeName="opacity" values="0.45;0.95;0.45" dur={`${1.6+variant%3*0.3}s`} repeatCount="indefinite" />
        </path>
        <path d={`M20 ${40+off%5} h14 M58 ${36-off%4} h16`} stroke="#f97316" strokeWidth="3" strokeLinecap="round" opacity="0.55">
          <animate attributeName="opacity" values="0.25;0.7;0.25" dur={`${1.9+variant%2*0.4}s`} repeatCount="indefinite" />
        </path>
        <path d="M10 10 h80" stroke="#78716c" strokeWidth="3" opacity="0.25" />
      </g>}
      <path d="M12 12 H88" stroke="#fff" strokeWidth="2" opacity="0.18" strokeLinecap="round" />
    </svg>
  );
}

export function PremiumGrassTileSVG({ pulsePhase = 0, worldId = 1 }) {
  const sway = Math.sin(pulsePhase) * 1.8;
  const uid = `g${worldId}`;
  if (worldId === 2) {
    return (
      <svg viewBox="0 0 100 100" style={{ width: '90%', height: '90%', overflow: 'visible' }}>
        <defs>
          <radialGradient id={`snow-${uid}`} cx="40%" cy="35%" r="60%"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#bae6fd" /></radialGradient>
        </defs>
        <ellipse cx="50" cy="78" rx="28" ry="8" fill="#000" opacity="0.15" />
        <ellipse cx="50" cy="62" rx="34" ry="18" fill="#e0f2fe" opacity="0.85" />
        <ellipse cx="50" cy="56" rx="28" ry="15" fill={`url(#snow-${uid})`} />
        <path d="M30 56 q20 -12 40 0" stroke="#fff" strokeWidth="4" fill="none" opacity="0.7" />
        <circle cx="38" cy="50" r="3" fill="#fff" opacity="0.8" />
      </svg>
    );
  }
  if (worldId === 3) {
    return (
      <svg viewBox="0 0 100 100" style={{ width: '88%', height: '88%', overflow: 'visible', transform: `translateY(${sway * 0.3}px)` }}>
        <ellipse cx="50" cy="80" rx="24" ry="7" fill="#000" opacity="0.18" />
        <path d="M30 78 q20 -16 40 0" fill="#b45309" opacity="0.5" />
        <path d="M50 78 V40" stroke="#166534" strokeWidth="6" strokeLinecap="round" />
        <path d="M50 58 L34 46 M50 50 L66 38" stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="50" cy="36" r="4" fill="#fde68a" />
        <circle cx="50" cy="36" r="7" fill="#f59e0b" opacity="0.25"><animate attributeName="opacity" values="0.15;0.35;0.15" dur="2s" repeatCount="indefinite" /></circle>
      </svg>
    );
  }
  if (worldId === 4) {
    return (
      <svg viewBox="0 0 100 100" style={{ width: '92%', height: '92%', overflow: 'visible' }}>
        <ellipse cx="50" cy="80" rx="26" ry="8" fill="#000" opacity="0.18" />
        <rect x="46" y="44" width="8" height="36" rx="4" fill="#ede9fe" />
        <ellipse cx="50" cy="40" rx="24" ry="15" fill="#c084fc" />
        <ellipse cx="50" cy="42" rx="18" ry="5" fill="#fff" opacity="0.15" />
        <circle cx="40" cy="38" r="3.2" fill="#fdf4ff" opacity="0.9" />
        <circle cx="58" cy="34" r="2.8" fill="#67e8f9" opacity="0.85"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" /></circle>
        <circle cx="50" cy="46" r="2.4" fill="#f0abfc" opacity="0.85" />
      </svg>
    );
  }
  if (worldId === 5) {
    return (
      <svg viewBox="0 0 100 100" style={{ width: '90%', height: '90%', overflow: 'visible' }}>
        <ellipse cx="50" cy="80" rx="28" ry="8" fill="#000" opacity="0.2" />
        <ellipse cx="50" cy="72" rx="26" ry="10" fill="#292524" />
        <path d="M30 72 q20 -20 40 0" stroke="#44403c" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M38 70 q12 -14 24 0" stroke="#f97316" strokeWidth="4" fill="none" opacity="0.7"><animate attributeName="opacity" values="0.35;0.85;0.35" dur="1.5s" repeatCount="indefinite" /></path>
        <circle cx="50" cy="60" r="4.5" fill="#fdba74" opacity="0.85"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.2s" repeatCount="indefinite" /></circle>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" style={{ width: '92%', height: '92%', overflow: 'visible', transform: `translateY(${sway * 0.4}px)` }}>
      <ellipse cx="50" cy="80" rx="28" ry="8" fill="#000" opacity="0.18" />
      <ellipse cx="50" cy="76" rx="26" ry="9" fill="#14532d" opacity="0.55" />
      <path d="M30 78 Q40 38 50 78 Q60 38 70 78" stroke="#16a34a" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M38 78 Q46 46 54 78 Q62 46 70 76" stroke="#4ade80" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M26 78 Q34 52 42 78" stroke="#22c55e" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function PremiumStoneBlockSVG({ hits = 2, worldId = 1 }) {
  const cracked = hits <= 1;
  const uid = `s${worldId}${hits}`;
  const t = worldId === 2 ? ['#e0f2fe','#93c5fd','#1e3a8a'] : worldId === 3 ? ['#fdba74','#b45309','#451a03'] : worldId === 4 ? ['#e9d5ff','#7c3aed','#2e1065'] : worldId === 5 ? ['#78716c','#44403c','#0c0a09'] : ['#d1d5db','#6b7280','#1f2937'];
  return (
    <svg viewBox="0 0 100 100" style={{ width: '96%', height: '96%', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`stone-top-${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={t[0]} /><stop offset="100%" stopColor={t[1]} /></linearGradient>
        <linearGradient id={`stone-side-${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={t[1]} /><stop offset="100%" stopColor={t[2]} /></linearGradient>
      </defs>
      <ellipse cx="50" cy="92" rx="34" ry="6" fill="#000" opacity="0.2" />
      <rect x="10" y="16" width="80" height="74" rx="12" fill={`url(#stone-side-${uid})`} />
      <rect x="10" y="8" width="80" height="74" rx="12" fill={`url(#stone-top-${uid})`} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <rect x="14" y="12" width="72" height="8" rx="4" fill="#fff" opacity="0.22" />
      <path d="M16 34 H84 M16 54 H84 M40 12 V78 M64 12 V78" stroke="#000" strokeOpacity="0.12" strokeWidth="2.5" />
      {cracked && <g stroke={worldId===5?'#fb923c':'#111827'} strokeWidth="3" fill="none" opacity="0.75"><path d="M26 22 L44 38 L34 56 L54 74" /><path d="M62 26 L52 44 L70 58" /><path d="M38 42 L56 36" /></g>}
      {worldId===5 && !cracked && <path d="M24 60 L40 50 L56 62 L72 48" stroke="#fb923c" strokeWidth="2.5" fill="none" opacity="0.35" />}
    </svg>
  );
}

export function PremiumCrateTileSVG({ worldId = 1 }) {
  const uid = `c${worldId}`;
  const woodA = worldId === 2 ? '#93c5fd' : worldId === 4 ? '#c084fc' : worldId === 5 ? '#78716c' : '#d97706';
  const woodB = worldId === 2 ? '#1e3a8a' : worldId === 4 ? '#4c1d95' : worldId === 5 ? '#292524' : '#78350f';
  return (
    <svg viewBox="0 0 100 100" style={{ width: '96%', height: '96%', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`crate-top-${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={woodA} /><stop offset="100%" stopColor={woodB} /></linearGradient>
        <linearGradient id={`crate-side-${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={woodB} /><stop offset="100%" stopColor="#1c1917" /></linearGradient>
      </defs>
      <ellipse cx="50" cy="92" rx="34" ry="6" fill="#000" opacity="0.2" />
      <rect x="10" y="16" width="80" height="74" rx="8" fill={`url(#crate-side-${uid})`} />
      <rect x="10" y="8" width="80" height="74" rx="8" fill={`url(#crate-top-${uid})`} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <rect x="14" y="12" width="72" height="7" rx="3.5" fill="#fff" opacity="0.18" />
      <g stroke="#000" strokeOpacity="0.28" strokeWidth="4">
        <path d="M14 30 H86 M14 50 H86 M14 70 H86 M32 12 V78 M50 12 V78 M68 12 V78" />
      </g>
      <path d="M14 12 L86 78 M86 12 L14 78" stroke="#000" strokeOpacity="0.22" strokeWidth="5" />
      <circle cx="50" cy="45" r="5" fill="#fef3c7" opacity="0.35" stroke="#000" strokeOpacity="0.2" />
      {worldId===5 && <path d="M20 40 L40 32 L60 44 L80 34" stroke="#fb923c" strokeWidth="2.5" fill="none" opacity="0.5" />}
    </svg>
  );
}

export function PremiumIceTileSVG({ pulsePhase = 0, worldId = 2 }) {
  const glow = 0.4 + (Math.sin(pulsePhase * 1.5) + 1) * 0.18;
  return (
    <svg viewBox="0 0 100 100" style={{ width: '96%', height: '96%', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`ice-top-${worldId}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.98" /><stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.88" /></linearGradient>
        <linearGradient id={`ice-side-${worldId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0c4a6e" /></linearGradient>
      </defs>
      <ellipse cx="50" cy="92" rx="34" ry="6" fill="#000" opacity="0.16" />
      <rect x="8" y="14" width="84" height="76" rx="14" fill={`url(#ice-side-${worldId})`} />
      <rect x="8" y="8" width="84" height="76" rx="14" fill={`url(#ice-top-${worldId})`} stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" />
      <rect x="14" y="12" width="60" height="8" rx="4" fill="#fff" opacity="0.45" />
      <path d="M18 24 L38 18 L30 40 Z M62 20 L82 28 L70 44 Z M24 62 L44 56 L36 80 Z M58 58 L80 66 L66 84 Z" fill="#fff" opacity={glow} />
      <path d="M16 50 H84 M50 16 V84 M20 20 L80 80 M80 20 L20 80" stroke="#bae6fd" strokeWidth="1.5" opacity="0.35" />
    </svg>
  );
}

export function PremiumTreasureTileSVG({ pulsePhase = 0, worldId = 1 }) {
  const bob = Math.sin(pulsePhase * 1.8) * 1.8;
  const glow = 0.4 + (Math.sin(pulsePhase * 2) + 1) * 0.2;
  return (
    <svg viewBox="0 0 100 100" style={{ width: '94%', height: '94%', overflow: 'visible', transform: `translateY(${bob}px)` }}>
      <defs>
        <linearGradient id={`chest-lid-${worldId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#b45309" /></linearGradient>
        <linearGradient id={`chest-body-${worldId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#92400e" /><stop offset="100%" stopColor="#451a03" /></linearGradient>
        <radialGradient id={`chest-gem-${worldId}`} cx="35%" cy="30%" r="60%"><stop offset="0%" stopColor="#fff" /><stop offset="40%" stopColor="#67e8f9" /><stop offset="100%" stopColor="#0891b2" /></radialGradient>
      </defs>
      <ellipse cx="50" cy="86" rx="28" ry="7" fill="#000" opacity="0.22" />
      <rect x="20" y="48" width="60" height="34" rx="7" fill={`url(#chest-body-${worldId})`} stroke="#78350f" strokeWidth="1.5" />
      <rect x="20" y="36" width="60" height="18" rx="8" fill={`url(#chest-lid-${worldId})`} stroke="#fef3c7" strokeOpacity="0.4" />
      <path d="M20 48 Q50 34 80 48" stroke="#fde68a" strokeWidth="3" fill="none" opacity="0.55" />
      <rect x="24" y="52" width="52" height="4" rx="2" fill="#000" opacity="0.15" />
      <rect x="45" y="52" width="10" height="14" rx="3" fill="#fcd34d" stroke="#92400e" />
      <circle cx="50" cy="59" r="2.5" fill="#78350f" />
      <circle cx="50" cy="42" r="5" fill={`url(#chest-gem-${worldId})`} opacity={glow} />
      <circle cx="34" cy="32" r="3" fill="#fde68a" opacity={glow}><animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" repeatCount="indefinite" /></circle>
      <circle cx="66" cy="30" r="2.4" fill="#fff" opacity={glow}><animate attributeName="opacity" values="0.25;0.9;0.25" dur="1.9s" repeatCount="indefinite" /></circle>
    </svg>
  );
}

/* ===================================================
   World background + perimeter decorations (5 distinct worlds)
   =================================================== */
export function WorldBackgroundSVG({ worldId = 1 }) {
  if (worldId === 1) {
    return (
      <svg className="world-background-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="w1-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#163a24" />
            <stop offset="55%" stopColor="#0e2517" />
            <stop offset="100%" stopColor="#06140b" />
          </linearGradient>
          <radialGradient id="w1-sun" cx="50%" cy="8%" r="55%">
            <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#bbf7d0" stopOpacity="0" />
          </radialGradient>
          <pattern id="w1-grass" width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M2 18 Q4 10 6 18 M8 18 Q10 8 12 18 M14 18 Q15 12 17 18" stroke="#166534" strokeWidth="1.2" fill="none" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#w1-bg)" />
        <rect width="400" height="400" fill="url(#w1-sun)" />
        <ellipse cx="80" cy="345" rx="150" ry="60" fill="#14532d" opacity="0.55" />
        <ellipse cx="320" cy="360" rx="170" ry="70" fill="#166534" opacity="0.45" />
        <path d="M0 300 Q60 270 120 300 T240 300 T360 290 T400 305 V400 H0 Z" fill="#134e2a" opacity="0.75" />
        <rect x="0" y="300" width="400" height="100" fill="url(#w1-grass)" opacity="0.6" />
        {[...Array(18)].map((_, i) => (
          <g key={`root-${i}`} opacity={0.18 + (i % 3) * 0.06}>
            <path d={`M${20 + (i * 23) % 360} 315 C ${30 + (i * 23) % 360} 330, ${10 + (i * 23) % 360} 345, ${25 + (i * 23) % 360} 365`} stroke="#78350f" strokeWidth={2 + (i % 2)} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {[...Array(14)].map((_, i) => (
          <g key={`flower-${i}`} transform={`translate(${(i * 29 + 12) % 390}, ${292 + (i % 4) * 10})`}>
            <circle cx="0" cy="0" r={2.2 + (i % 3)} fill={i % 3 === 0 ? '#fde68a' : i % 3 === 1 ? '#fda4af' : '#c4b5fd'} opacity="0.9" />
            <circle cx="0" cy="0" r={0.8 + (i % 2) * 0.4} fill="#fff7ed" />
            <path d="M0 2 V8" stroke="#166534" strokeWidth="1.2" />
          </g>
        ))}
        {[...Array(10)].map((_, i) => (
          <g key={`mush-${i}`} transform={`translate(${(i * 41 + 25) % 380}, ${320 + (i % 3) * 8}) scale(${0.7 + (i % 3) * 0.15})`}>
            <rect x="-2" y="0" width="4" height="8" rx="2" fill="#fef3c7" />
            <ellipse cx="0" cy="0" rx="7" ry="4.5" fill={i % 2 ? '#ef4444' : '#f97316'} />
            <circle cx="-2" cy="-1" r="1.1" fill="#fff" opacity="0.9" /><circle cx="2.5" cy="0.5" r="0.9" fill="#fff" opacity="0.85" />
          </g>
        ))}
        {[...Array(12)].map((_, i) => (
          <ellipse key={`bush-${i}`} cx={(i * 37 + 18) % 395} cy={305 + (i % 5) * 7} rx={10 + (i % 4) * 4} ry={5 + (i % 3) * 2} fill={i % 2 ? '#166534' : '#15803d'} opacity={0.35 + (i % 3) * 0.08} />
        ))}
        {[...Array(16)].map((_, i) => (
          <g key={`ff-${i}`}>
            <circle cx={(i * 27 + 10) % 400} cy={(i * 53 + 30) % 320} r={1.6 + (i % 3) * 0.6} fill="#bef264" opacity="0.25">
              <animate attributeName="opacity" values="0.05;0.85;0.05" dur={`${2.2 + (i % 5) * 0.6}s`} begin={`${(i % 7) * 0.3}s`} repeatCount="indefinite" />
              <animate attributeName="cx" values={`${(i * 27 + 10) % 400};${((i * 27 + 20) % 400)};${(i * 27 + 10) % 400}`} dur={`${4 + (i % 4)}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={(i * 27 + 10) % 400} cy={(i * 53 + 30) % 320} r={4 + (i % 2)} fill="#d9f99d" opacity="0.08">
              <animate attributeName="opacity" values="0.02;0.18;0.02" dur={`${2.2 + (i % 5) * 0.6}s`} begin={`${(i % 7) * 0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>
    );
  }
  if (worldId === 2) {
    return (
      <svg className="world-background-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="w2-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c2d45" />
            <stop offset="50%" stopColor="#082033" />
            <stop offset="100%" stopColor="#030b14" />
          </linearGradient>
          <radialGradient id="w2-cold" cx="50%" cy="15%" r="65%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="w2-ice" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#w2-bg)" />
        <rect width="400" height="400" fill="url(#w2-cold)" />
        <path d="M0 320 Q80 285 160 320 T320 315 T400 330 V400 H0 Z" fill="#0b2236" />
        <path d="M0 335 Q90 305 180 335 T360 330 T400 340 V400 H0 Z" fill="#dbeafe" opacity="0.12" />
        {[...Array(10)].map((_, i) => (
          <path key={`rock-${i}`} d={`M${10 + i * 40} 360 l${12 + (i % 3) * 6} -${18 + (i % 4) * 8} l${18 + (i % 3) * 5} ${6 + (i % 2) * 4} l${10 + (i % 2) * 6} ${14 + (i % 3) * 4} Z`} fill={i % 2 ? '#334155' : '#475569'} opacity={0.35 + (i % 3) * 0.08} />
        ))}
        {[...Array(12)].map((_, i) => (
          <g key={`crystal-${i}`} transform={`translate(${18 + (i * 33) % 370}, ${250 + (i % 5) * 18})`} opacity={0.55 + (i % 3) * 0.12}>
            <path d={`M0 40 L${6 + (i % 3) * 2} 0 L${12 + (i % 3) * 4} 40 Z`} fill="#67e8f9" />
            <path d={`M${6 + (i % 3) * 2} 0 L${12 + (i % 3) * 4} 40 L${4 + (i % 2) * 2} 40 Z`} fill="#bae6fd" opacity="0.7" />
            <path d={`M${6 + (i % 3) * 2} 6 L${9 + (i % 3) * 2} 18`} stroke="#fff" strokeWidth="1.2" opacity="0.8" />
            <ellipse cx={6 + (i % 3) * 2} cy="18" rx={10 + (i % 2) * 4} ry="4" fill="#67e8f9" opacity="0.15">
              <animate attributeName="opacity" values="0.05;0.25;0.05" dur={`${2.5 + (i % 4)}s`} repeatCount="indefinite" />
            </ellipse>
          </g>
        ))}
        {[...Array(22)].map((_, i) => (
          <g key={`snow-${i}`}>
            <circle cx={(i * 19 + 8) % 400} cy={(i * 31 + 12) % 400} r={1 + (i % 3) * 0.7} fill="#fff" opacity={0.25 + (i % 4) * 0.12}>
              <animate attributeName="cy" values={`${(i * 31 + 12) % 400};${((i * 31 + 42) % 400)};${(i * 31 + 12) % 400}`} dur={`${4 + (i % 5)}s`} repeatCount="indefinite" />
              <animate attributeName="cx" values={`${(i * 19 + 8) % 400};${((i * 19 + 18) % 400)};${(i * 19 + 8) % 400}`} dur={`${5 + (i % 4)}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        <path d="M0 0 H400 V70 Q320 95 240 70 T80 80 T0 60 Z" fill="url(#w2-ice)" opacity="0.22" />
      </svg>
    );
  }
  if (worldId === 3) {
    return (
      <svg className="world-background-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="w3-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8a3a12" />
            <stop offset="45%" stopColor="#5b2a12" />
            <stop offset="100%" stopColor="#1f1008" />
          </linearGradient>
          <radialGradient id="w3-sun" cx="72%" cy="12%" r="35%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.55" />
            <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill="url(#w3-bg)" />
        <rect width="400" height="400" fill="url(#w3-sun)" />
        <path d="M0 250 L60 170 L110 220 L180 130 L250 210 L320 150 L400 230 V400 H0 Z" fill="#7c2d12" opacity="0.55" />
        <path d="M0 290 L70 230 L130 270 L210 200 L290 260 L360 220 L400 270 V400 H0 Z" fill="#92400e" opacity="0.5" />
        <path d="M0 330 Q100 300 200 335 T400 320 V400 H0 Z" fill="#d97706" opacity="0.35" />
        <path d="M0 350 Q120 325 240 355 T400 345 V400 H0 Z" fill="#f59e0b" opacity="0.18" />
        {[...Array(7)].map((_, i) => (
          <g key={`cactus-${i}`} transform={`translate(${25 + i * 55}, ${285 - (i % 3) * 12})`} opacity="0.8">
            <rect x="-4" y="0" width="8" height={30 + (i % 3) * 10} rx="4" fill="#166534" />
            <rect x="-16" y="10" width="12" height="5" rx="2.5" fill="#15803d" />
            <rect x="-16" y={-2 + (i % 2) * 2} width="5" height="14" rx="2.5" fill="#166534" />
            <rect x="4" y="16" width="12" height="5" rx="2.5" fill="#15803d" />
            <rect x="11" y="6" width="5" height="12" rx="2.5" fill="#166534" />
          </g>
        ))}
        {[...Array(10)].map((_, i) => (
          <path key={`dry-${i}`} d={`M${15 + i * 40} 360 q6 -14 0 -28 M${15 + i * 40} 345 q-8 -8 -14 -6 M${15 + i * 40} 345 q8 -8 14 -6`} stroke="#92400e" strokeWidth="2" fill="none" opacity="0.45" />
        ))}
        {[...Array(4)].map((_, i) => (
          <g key={`ruin-${i}`} transform={`translate(${50 + i * 95}, ${250 + (i % 2) * 18})`} opacity="0.22">
            <rect x="0" y="20" width="36" height="34" fill="#78350f" />
            <rect x="6" y="0" width="6" height="22" fill="#92400e" />
            <rect x="24" y="6" width="6" height="16" fill="#92400e" />
            <rect x="14" y="30" width="8" height="14" fill="#451a03" />
          </g>
        ))}
        {[...Array(12)].map((_, i) => (
          <circle key={`dust-${i}`} cx={(i * 37 + 20) % 400} cy={120 + (i * 29) % 180} r={1 + (i % 2)} fill="#fde68a" opacity="0.18">
            <animate attributeName="cx" values={`${(i * 37 + 20) % 400};${((i * 37 + 60) % 400)};${(i * 37 + 20) % 400}`} dur={`${6 + (i % 4)}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    );
  }
  if (worldId === 4) {
    return (
      <svg className="world-background-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="w4-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b0764" />
            <stop offset="45%" stopColor="#240b3b" />
            <stop offset="100%" stopColor="#0a0414" />
          </linearGradient>
          <radialGradient id="w4-glow" cx="30%" cy="25%" r="55%">
            <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="w4-glow2" cx="75%" cy="60%" r="45%">
            <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#d946ef" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill="url(#w4-bg)" />
        <rect width="400" height="400" fill="url(#w4-glow)" />
        <rect width="400" height="400" fill="url(#w4-glow2)" />
        <path d="M0 330 Q80 300 160 330 T320 320 T400 335 V400 H0 Z" fill="#1e1033" opacity="0.8" />
        {[...Array(9)].map((_, i) => {
          const x = 25 + (i * 44) % 360;
          const h = 26 + (i % 4) * 10;
          const cap = 18 + (i % 3) * 8;
          const c1 = i % 3 === 0 ? '#d946ef' : i % 3 === 1 ? '#a855f7' : '#f472b6';
          return (
            <g key={`gm-${i}`} transform={`translate(${x}, ${310 - (i % 3) * 12})`} opacity={0.75 + (i % 2) * 0.15}>
              <rect x="-4" y={-h} width="8" height={h} rx="3" fill="#ede9fe" opacity="0.9" />
              <ellipse cx="0" cy={-h} rx={cap} ry={cap * 0.55} fill={c1} />
              <ellipse cx="-5" cy={-h - 2} rx={cap * 0.28} ry={cap * 0.18} fill="#fff" opacity="0.35" />
              <circle cx={-cap * 0.3} cy={-h + 2} r={2.2} fill="#fdf4ff" opacity="0.85" />
              <circle cx={cap * 0.15} cy={-h - 4} r={1.8} fill="#fdf4ff" opacity="0.8" />
              <circle cx={cap * 0.35} cy={-h + 3} r={1.4} fill="#fdf4ff" opacity="0.75" />
              <ellipse cx="0" cy={-h + 2} rx={cap * 0.9} ry={cap * 0.2} fill="#fff" opacity="0.08">
                <animate attributeName="opacity" values="0.04;0.16;0.04" dur={`${2.4 + (i % 3)}s`} repeatCount="indefinite" />
              </ellipse>
            </g>
          );
        })}
        {[...Array(12)].map((_, i) => (
          <g key={`plant-${i}`} transform={`translate(${(i * 35 + 10) % 395}, ${330 + (i % 4) * 8})`} opacity="0.7">
            <path d={`M0 0 Q${-6 - (i % 3) * 3} -${14 + (i % 4) * 6} 0 -${22 + (i % 5) * 5}`} stroke={i % 2 ? '#22d3ee' : '#a78bfa'} strokeWidth="2.5" fill="none" strokeLinecap="round">
              <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur={`${2 + (i % 4) * 0.5}s`} repeatCount="indefinite" />
            </path>
            <circle cx="0" cy={-22 - (i % 5) * 5} r={2 + (i % 2)} fill={i % 2 ? '#67e8f9' : '#e879f9'}>
              <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1.8 + (i % 3) * 0.6}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        {[...Array(20)].map((_, i) => (
          <circle key={`mp-${i}`} cx={(i * 23 + 7) % 400} cy={(i * 41 + 15) % 380} r={1.2 + (i % 4) * 0.8} fill={i % 3 === 0 ? '#e879f9' : i % 3 === 1 ? '#c084fc' : '#67e8f9'} opacity={0.2 + (i % 3) * 0.1}>
            <animate attributeName="cy" values={`${(i * 41 + 15) % 380};${((i * 41 + 5) % 380)};${(i * 41 + 15) % 380}`} dur={`${3 + (i % 5)}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values={`${0.1 + (i % 3) * 0.1};${0.45 + (i % 3) * 0.1};${0.1 + (i % 3) * 0.1}`} dur={`${2.2 + (i % 4)}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    );
  }
  return (
    <svg className="world-background-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="w5-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f0a0a" />
          <stop offset="45%" stopColor="#1c1917" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <radialGradient id="w5-heat" cx="50%" cy="85%" r="55%">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#ef4444" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="w5-lava" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#w5-bg)" />
      <rect width="400" height="400" fill="url(#w5-heat)" />
      <path d="M20 400 L90 260 L150 340 L210 230 L270 330 L340 250 L390 400 Z" fill="#292524" opacity="0.9" />
      <path d="M0 400 L60 300 L120 360 L170 280 L240 360 L300 290 L400 400 Z" fill="#1c1917" opacity="0.85" />
      {[...Array(10)].map((_, i) => (
        <path key={`crack-${i}`} d={`M${30 + i * 36} ${360 - (i % 4) * 18} l${8 + (i % 3) * 5} -${12 + (i % 5) * 6} l${-4 + (i % 2) * 8} -${10 + (i % 4) * 5} l${10 + (i % 3) * 4} -${8 + (i % 3) * 4}`} stroke="url(#w5-lava)" strokeWidth={1.5 + (i % 2)} fill="none" opacity={0.45 + (i % 3) * 0.12}>
          <animate attributeName="opacity" values={`${0.25 + (i % 3) * 0.1};${0.7 + (i % 2) * 0.15};${0.25 + (i % 3) * 0.1}`} dur={`${1.6 + (i % 4) * 0.5}s`} repeatCount="indefinite" />
        </path>
      ))}
      <path d="M0 360 Q60 345 120 360 T240 355 T360 365 T400 358 L400 400 L0 400 Z" fill="#7c2d12" opacity="0.55" />
      <path d="M40 370 Q100 350 160 368 T280 360 T360 372" stroke="url(#w5-lava)" strokeWidth="6" fill="none" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.2s" repeatCount="indefinite" />
      </path>
      <path d="M90 385 Q150 372 210 386 T330 380" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.45">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.8s" repeatCount="indefinite" />
      </path>
      {[...Array(18)].map((_, i) => (
        <circle key={`ember-${i}`} cx={(i * 23 + 12) % 400} cy={220 + (i * 19) % 150} r={1 + (i % 3) * 0.8} fill={i % 2 ? '#fdba74' : '#fb923c'} opacity={0.25 + (i % 3) * 0.1}>
          <animate attributeName="cy" values={`${220 + (i * 19) % 150};${190 + (i * 19) % 150};${220 + (i * 19) % 150}`} dur={`${2.5 + (i % 4)}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values={`${0.15 + (i % 3) * 0.1};${0.55 + (i % 3) * 0.1};${0.15 + (i % 3) * 0.1}`} dur={`${1.8 + (i % 5) * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {[...Array(6)].map((_, i) => (
        <ellipse key={`smoke-${i}`} cx={80 + i * 55} cy={140 + (i % 3) * 25} rx={18 + (i % 3) * 8} ry={8 + (i % 2) * 4} fill="#57534e" opacity="0.12">
          <animate attributeName="cy" values={`${140 + (i % 3) * 25};${120 + (i % 3) * 25};${140 + (i % 3) * 25}`} dur={`${5 + i}s`} repeatCount="indefinite" />
          <animate attributeName="rx" values={`${18 + (i % 3) * 8};${24 + (i % 3) * 8};${18 + (i % 3) * 8}`} dur={`${5 + i}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
    </svg>
  );
}

export function WorldTreeSVG({ worldId = 1 }) {
  if (worldId === 2) {
    return (
      <svg viewBox="0 0 80 120" style={{ width: '100%', height: '100%' }}>
        <path d="M40 112 L40 58" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
        <path d="M10 78 L40 18 L70 78 Z" fill="#e0f2fe" />
        <path d="M16 96 L40 42 L64 96 Z" fill="#bae6fd" opacity="0.95" />
        <path d="M24 60 L40 36 L56 60" stroke="#fff" strokeWidth="3" fill="none" opacity="0.5" />
        <ellipse cx="40" cy="112" rx="16" ry="5" fill="#334155" opacity="0.35" />
      </svg>
    );
  }
  if (worldId === 3) {
    return (
      <svg viewBox="0 0 90 120" style={{ width: '100%', height: '100%' }}>
        <rect x="20" y="56" width="10" height="54" rx="3" fill="#a16207" />
        <rect x="58" y="64" width="8" height="46" rx="3" fill="#92400e" />
        <path d="M25 46 L25 10 M10 34 L25 24 M40 34 L25 22" stroke="#78350f" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M62 54 L62 30 M50 44 L62 36 M74 46 L62 34" stroke="#78350f" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M8 98 Q30 88 50 98 T82 96" stroke="#92400e" strokeWidth="6" fill="none" opacity="0.5" />
      </svg>
    );
  }
  if (worldId === 4) {
    return (
      <svg viewBox="0 0 90 130" style={{ width: '100%', height: '100%' }}>
        <rect x="41" y="58" width="8" height="60" rx="4" fill="#ddd6fe" />
        <ellipse cx="45" cy="42" rx="34" ry="24" fill="#a855f7" />
        <ellipse cx="28" cy="54" rx="18" ry="14" fill="#c084fc" opacity="0.95" />
        <ellipse cx="64" cy="54" rx="18" ry="14" fill="#d946ef" opacity="0.9" />
        <circle cx="30" cy="40" r="4" fill="#fdf4ff" opacity="0.9" />
        <circle cx="50" cy="30" r="5" fill="#fdf4ff" opacity="0.85" />
        <circle cx="62" cy="46" r="3.5" fill="#fdf4ff" opacity="0.85" />
        <ellipse cx="45" cy="46" rx="20" ry="6" fill="#fff" opacity="0.12">
          <animate attributeName="opacity" values="0.06;0.22;0.06" dur="2.6s" repeatCount="indefinite" />
        </ellipse>
      </svg>
    );
  }
  if (worldId === 5) {
    return (
      <svg viewBox="0 0 90 120" style={{ width: '100%', height: '100%' }}>
        <path d="M45 112 L20 70 L35 70 L28 40 L45 18 L62 40 L55 70 L70 70 Z" fill="#292524" />
        <path d="M45 98 L34 72 L45 46 L56 72 Z" fill="#44403c" />
        <path d="M45 96 L38 74 L45 58 L52 74 Z" fill="#fb923c" opacity="0.75">
          <animate attributeName="opacity" values="0.35;0.95;0.35" dur="1.6s" repeatCount="indefinite" />
        </path>
        <path d="M45 86 L42 76 L45 66 L48 76 Z" fill="#fde68a" opacity="0.7">
          <animate attributeName="opacity" values="0.25;0.85;0.25" dur="1.2s" repeatCount="indefinite" />
        </path>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 90 130" style={{ width: '100%', height: '100%' }}>
      <rect x="40" y="70" width="10" height="50" rx="4" fill="#92400e" />
      <path d="M45 84 C30 90, 20 102, 14 118" stroke="#78350f" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M45 86 C60 92, 70 104, 78 118" stroke="#78350f" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="45" cy="46" r="30" fill="#22c55e" />
      <circle cx="24" cy="58" r="20" fill="#16a34a" />
      <circle cx="66" cy="58" r="20" fill="#4ade80" opacity="0.95" />
      <circle cx="45" cy="26" r="16" fill="#86efac" opacity="0.5" />
      <circle cx="30" cy="38" r="4" fill="#fda4af" />
      <circle cx="58" cy="34" r="3.5" fill="#fde68a" />
      <circle cx="46" cy="52" r="3" fill="#fca5a5" />
    </svg>
  );
}
export function WorldBushSVG({ worldId = 1 }) {
  if (worldId === 2) {
    return (
      <svg viewBox="0 0 80 60" style={{ width: '100%', height: '100%' }}>
        <ellipse cx="40" cy="44" rx="30" ry="12" fill="#e0f2fe" opacity="0.95" />
        <circle cx="20" cy="36" r="13" fill="#fff" opacity="0.95" />
        <circle cx="40" cy="30" r="15" fill="#f8fafc" opacity="0.98" />
        <circle cx="60" cy="36" r="13" fill="#dbeafe" opacity="0.95" />
        <path d="M18 34 l6 -8 l6 8 M34 28 l6 -10 l6 10 M52 34 l6 -8 l6 8" stroke="#bae6fd" strokeWidth="2" fill="none" opacity="0.7" />
      </svg>
    );
  }
  if (worldId === 3) {
    return (
      <svg viewBox="0 0 80 70" style={{ width: '100%', height: '100%' }}>
        <ellipse cx="40" cy="56" rx="24" ry="8" fill="#92400e" opacity="0.35" />
        <rect x="37" y="18" width="6" height="38" rx="3" fill="#15803d" />
        <rect x="18" y="30" width="18" height="5" rx="2.5" fill="#166534" />
        <rect x="44" y="34" width="18" height="5" rx="2.5" fill="#166534" />
        <rect x="18" y="18" width="5" height="14" rx="2.5" fill="#15803d" />
        <rect x="57" y="22" width="5" height="14" rx="2.5" fill="#15803d" />
        <path d="M12 56 q10 -10 18 0 M50 56 q10 -12 18 0" stroke="#a16207" strokeWidth="2" fill="none" opacity="0.5" />
      </svg>
    );
  }
  if (worldId === 4) {
    return (
      <svg viewBox="0 0 80 60" style={{ width: '100%', height: '100%' }}>
        <ellipse cx="40" cy="42" rx="30" ry="14" fill="#4c1d95" />
        <circle cx="24" cy="34" r="11" fill="#a855f7" />
        <circle cx="40" cy="28" r="13" fill="#d946ef" opacity="0.9" />
        <circle cx="56" cy="34" r="11" fill="#c084fc" />
        <circle cx="32" cy="30" r="2.5" fill="#67e8f9"><animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" /></circle>
        <circle cx="48" cy="26" r="2" fill="#f0abfc"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.7s" repeatCount="indefinite" /></circle>
      </svg>
    );
  }
  if (worldId === 5) {
    return (
      <svg viewBox="0 0 80 60" style={{ width: '100%', height: '100%' }}>
        <path d="M10 50 L22 18 L34 50 L46 22 L58 50 L70 26 L76 50 Z" fill="#44403c" />
        <path d="M24 46 L30 30 L36 46 M50 46 L56 30 L62 46" stroke="#fb923c" strokeWidth="3" fill="none" opacity="0.7">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.5s" repeatCount="indefinite" />
        </path>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 60" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="40" cy="44" rx="30" ry="13" fill="#14532d" />
      <circle cx="20" cy="36" r="14" fill="#22c55e" />
      <circle cx="40" cy="28" r="17" fill="#4ade80" />
      <circle cx="60" cy="36" r="14" fill="#16a34a" />
      <circle cx="28" cy="30" r="3.2" fill="#fb7185" />
      <circle cx="48" cy="24" r="3" fill="#fde68a" />
      <circle cx="56" cy="34" r="2.6" fill="#c084fc" />
    </svg>
  );
}
export function WorldRockSVG({ worldId = 1 }) {
  if (worldId === 2) {
    return (
      <svg viewBox="0 0 80 60" style={{ width: '100%', height: '100%' }}>
        <path d="M8 52 L22 18 L40 8 L60 20 L72 52 Z" fill="#94a3b8" />
        <path d="M22 18 L40 8 L36 34 Z" fill="#e0f2fe" opacity="0.35" />
        <path d="M12 50 Q40 40 68 50" stroke="#e0f2fe" strokeWidth="4" fill="none" opacity="0.5" />
      </svg>
    );
  }
  if (worldId === 3) {
    return (
      <svg viewBox="0 0 80 60" style={{ width: '100%', height: '100%' }}>
        <path d="M8 52 L18 22 L38 10 L58 24 L72 52 Z" fill="#c2410c" />
        <path d="M18 22 L38 10 L34 30 Z" fill="#fdba74" opacity="0.25" />
        <path d="M20 34 H58 M24 42 H54" stroke="#7c2d12" strokeWidth="2" opacity="0.35" />
      </svg>
    );
  }
  if (worldId === 4) {
    return (
      <svg viewBox="0 0 80 60" style={{ width: '100%', height: '100%' }}>
        <path d="M10 52 L24 16 L42 10 L60 22 L70 52 Z" fill="#5b21b6" />
        <path d="M24 16 L42 10 L36 32 Z" fill="#e9d5ff" opacity="0.22" />
        <circle cx="34" cy="36" r="3" fill="#67e8f9" opacity="0.7"><animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite" /></circle>
      </svg>
    );
  }
  if (worldId === 5) {
    return (
      <svg viewBox="0 0 80 60" style={{ width: '100%', height: '100%' }}>
        <path d="M8 52 L20 20 L40 8 L60 18 L72 52 Z" fill="#292524" />
        <path d="M20 20 L40 8 L36 28 Z" fill="#57534e" opacity="0.35" />
        <path d="M26 40 L34 30 L42 42 L50 28 L58 40" stroke="#f97316" strokeWidth="2.5" fill="none" opacity="0.8">
          <animate attributeName="opacity" values="0.35;0.95;0.35" dur="1.7s" repeatCount="indefinite" />
        </path>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 60" style={{ width: '100%', height: '100%' }}>
      <path d="M10 52 L22 20 L40 10 L58 22 L70 52 Z" fill="#6b7280" />
      <path d="M22 20 L40 10 L35 34 Z" fill="#fff" opacity="0.2" />
      <ellipse cx="26" cy="46" rx="6" ry="3" fill="#22c55e" opacity="0.35" />
      <ellipse cx="54" cy="44" rx="5" ry="2.5" fill="#16a34a" opacity="0.3" />
    </svg>
  );
}
export function WorldMushroomSVG({ worldId = 4 }) {
  if (worldId === 1) {
    return (
      <svg viewBox="0 0 60 70" style={{ width: '100%', height: '100%' }}>
        <rect x="25" y="38" width="10" height="24" rx="4" fill="#fef3c7" />
        <ellipse cx="30" cy="34" rx="22" ry="13" fill="#dc2626" />
        <circle cx="22" cy="32" r="3" fill="#fff" opacity="0.9" /><circle cx="36" cy="28" r="3.5" fill="#fff" opacity="0.85" /><circle cx="30" cy="38" r="2.5" fill="#fff" opacity="0.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 70 80" style={{ width: '100%', height: '100%' }}>
      <rect x="30" y="42" width="10" height="28" rx="4" fill="#ede9fe" />
      <ellipse cx="35" cy="36" rx="28" ry="16" fill={worldId === 4 ? '#d946ef' : '#a855f7'} />
      <ellipse cx="35" cy="40" rx="18" ry="5" fill="#fff" opacity="0.12" />
      <circle cx="22" cy="34" r="3.2" fill="#fdf4ff" opacity="0.9" />
      <circle cx="36" cy="28" r="4" fill="#fdf4ff" opacity="0.85" />
      <circle cx="48" cy="35" r="3" fill="#fdf4ff" opacity="0.85" />
      {worldId === 4 && <circle cx="35" cy="22" r="10" fill="#e879f9" opacity="0.18"><animate attributeName="opacity" values="0.08;0.28;0.08" dur="2.4s" repeatCount="indefinite" /></circle>}
    </svg>
  );
}
export function WorldCrystalSVG({ worldId = 2 }) {
  const cool = worldId === 2 || worldId === 4;
  const c1 = worldId === 4 ? '#c084fc' : '#67e8f9';
  const c2 = worldId === 4 ? '#e879f9' : '#bae6fd';
  return (
    <svg viewBox="0 0 60 80" style={{ width: '100%', height: '100%' }}>
      <path d="M30 4 L46 28 L40 74 L20 74 L14 28 Z" fill={c1} opacity="0.88" />
      <path d="M30 4 L40 74 L20 74 Z" fill={c2} opacity="0.55" />
      <path d="M30 4 L30 74 M14 28 L46 28" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" />
      <path d="M22 28 L30 12 L38 28 Z" fill="#fff" opacity="0.45" />
      {cool && <ellipse cx="30" cy="40" rx="14" ry="18" fill="#fff" opacity="0.08"><animate attributeName="opacity" values="0.03;0.14;0.03" dur="2.5s" repeatCount="indefinite" /></ellipse>}
    </svg>
  );
}
export function WorldIceCrystalSVG({ worldId = 2 }) {
  return (
    <svg viewBox="0 0 60 90" style={{ width: '100%', height: '100%' }}>
      <path d="M30 2 L42 24 L30 86 L18 24 Z" fill="#e0f2fe" opacity="0.92" />
      <path d="M30 2 L30 86 M18 24 L42 24 M22 44 L38 44 M24 62 L36 62" stroke="#7dd3fc" strokeWidth="2" />
      <path d="M30 10 L36 24 L30 34 L24 24 Z" fill="#fff" opacity="0.5" />
      <ellipse cx="30" cy="30" rx="10" ry="16" fill="#67e8f9" opacity="0.12"><animate attributeName="opacity" values="0.05;0.22;0.05" dur="2.2s" repeatCount="indefinite" /></ellipse>
    </svg>
  );
}
export function WorldPlanetSVG({ worldId = 5 }) {
  if (worldId === 3) {
    return (
      <svg viewBox="0 0 70 50" style={{ width: '100%', height: '100%' }}>
        <path d="M6 42 L20 14 L34 30 L48 10 L64 42 Z" fill="#92400e" opacity="0.85" />
        <path d="M16 42 L28 24 L40 42 Z" fill="#b45309" opacity="0.6" />
        <rect x="24" y="30" width="4" height="8" fill="#78350f" opacity="0.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id={`ember-${worldId}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="45%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="22" fill={`url(#ember-${worldId})`} />
      <path d="M14 30 q16 -10 32 0" stroke="#7f1d1d" strokeWidth="3" fill="none" opacity="0.45" />
      <circle cx="30" cy="30" r="26" fill="#fb923c" opacity="0.12"><animate attributeName="opacity" values="0.06;0.2;0.06" dur="1.8s" repeatCount="indefinite" /></circle>
    </svg>
  );
}
export function FloatingParticleSVG({ worldId = 1 }) {
  if (worldId === 1) {
    return <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%' }}><circle cx="10" cy="10" r="3.2" fill="#bef264" /><circle cx="10" cy="10" r="7" fill="#d9f99d" opacity="0.3" /></svg>;
  }
  if (worldId === 2) {
    return <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%' }}><path d="M10 2 L12 8 L18 10 L12 12 L10 18 L8 12 L2 10 L8 8 Z" fill="#e0f2fe" opacity="0.9" /></svg>;
  }
  if (worldId === 3) {
    return <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%' }}><circle cx="10" cy="10" r="3" fill="#fde68a" opacity="0.8" /></svg>;
  }
  if (worldId === 4) {
    return <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%' }}><circle cx="10" cy="10" r="2.8" fill="#e879f9" /><circle cx="10" cy="10" r="6.5" fill="#c084fc" opacity="0.35" /></svg>;
  }
  return <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%' }}><circle cx="10" cy="10" r="3" fill="#fb923c" /><circle cx="10" cy="10" r="6" fill="#ef4444" opacity="0.25" /></svg>;
}
export function WorldFireflySVG({ worldId = 1, delay = 0 }) {
  if (worldId === 2) {
    return (
      <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%', animation: `pulse 2.4s ease-in-out ${delay}s infinite` }}>
        <path d="M10 2 L12 8 L18 10 L12 12 L10 18 L8 12 L2 10 L8 8 Z" fill="#e0f2fe" />
        <circle cx="10" cy="10" r="6" fill="#7dd3fc" opacity="0.25" />
      </svg>
    );
  }
  if (worldId === 3) {
    return (
      <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%', animation: `pulse 2.8s ease-in-out ${delay}s infinite` }}>
        <circle cx="10" cy="10" r="2.5" fill="#fde68a" />
        <circle cx="10" cy="10" r="5.5" fill="#f59e0b" opacity="0.2" />
      </svg>
    );
  }
  if (worldId === 4) {
    return (
      <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%', animation: `pulse 1.8s ease-in-out ${delay}s infinite` }}>
        <circle cx="10" cy="10" r="3.2" fill="#f0abfc" />
        <circle cx="10" cy="10" r="7" fill="#a855f7" opacity="0.3" />
      </svg>
    );
  }
  if (worldId === 5) {
    return (
      <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%', animation: `pulse 1.4s ease-in-out ${delay}s infinite` }}>
        <circle cx="10" cy="10" r="3" fill="#fdba74" />
        <circle cx="10" cy="10" r="7" fill="#ef4444" opacity="0.3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%', animation: `pulse 2s ease-in-out ${delay}s infinite` }}>
      <circle cx="10" cy="10" r="3.5" fill="#bef264" />
      <circle cx="10" cy="10" r="7" fill="#84cc16" opacity="0.3" />
    </svg>
  );
}
