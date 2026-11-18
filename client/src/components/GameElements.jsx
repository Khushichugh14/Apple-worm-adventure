import React from 'react';
import {
  Leaf, Mountain, TreePine, Gem as GemIcon, Sparkles, Flame
} from 'lucide-react';
import '../style.css';

/* ===================================================
   WORLD PALETTES - 5 distinct, vibrant, scenic environments
   Matching the reference app "Grow Worm: Maze Adventure"
   1 Sunset Meadow, 2 Sunny Glade & River, 3 Desert Canyon,
   4 Enchanted Twilight Forest, 5 Volcanic Caldera
   =================================================== */
export const WORLD_PALETTES = {
  1: {
    id: 1,
    name: 'Sunset Meadow',
    skyTop: '#c4b5fd',
    skyMid: '#fbcfe8',
    skyBottom: '#fed7aa',
    boardBg: '#ffffff',
    floorA: '#fbfdf9',
    floorB: '#edf5e8',
    floorBorder: 'rgba(34, 197, 94, 0.22)',
    wallTop: '#84cc16',
    wallSide: '#a16207',
    wallDark: '#78350f',
    accent: '#10b981',
    glow: '#34d399',
    apple: '#ef4444',
    portal: '#a855f7',
    portalGlow: '#d8b4fe',
  },
  2: {
    id: 2,
    name: 'Sunny Glade',
    skyTop: '#38bdf8',
    skyMid: '#7dd3fc',
    skyBottom: '#e0f2fe',
    boardBg: '#ffffff',
    floorA: '#f8fafc',
    floorB: '#e2f0fc',
    floorBorder: 'rgba(56, 189, 248, 0.25)',
    wallTop: '#e0f2fe',
    wallSide: '#0284c7',
    wallDark: '#0369a1',
    accent: '#0ea5e9',
    glow: '#38bdf8',
    apple: '#ef4444',
    portal: '#6366f1',
    portalGlow: '#a5b4fc',
  },
  3: {
    id: 3,
    name: 'Desert Canyon',
    skyTop: '#fdba74',
    skyMid: '#fed7aa',
    skyBottom: '#fef3c7',
    boardBg: '#ffffff',
    floorA: '#fffbeb',
    floorB: '#fef3c7',
    floorBorder: 'rgba(245, 158, 11, 0.25)',
    wallTop: '#fbbf24',
    wallSide: '#c2410c',
    wallDark: '#9a3412',
    accent: '#f59e0b',
    glow: '#fde68a',
    apple: '#ef4444',
    portal: '#ec4899',
    portalGlow: '#f472b6',
  },
  4: {
    id: 4,
    name: 'Enchanted Twilight',
    skyTop: '#1e1b4b',
    skyMid: '#581c87',
    skyBottom: '#701a75',
    boardBg: '#ffffff',
    floorA: '#faf5ff',
    floorB: '#f3e8ff',
    floorBorder: 'rgba(168, 85, 247, 0.28)',
    wallTop: '#c084fc',
    wallSide: '#7c3aed',
    wallDark: '#5b21b6',
    accent: '#a855f7',
    glow: '#e9d5ff',
    apple: '#f43f5e',
    portal: '#06b6d4',
    portalGlow: '#67e8f9',
  },
  5: {
    id: 5,
    name: 'Volcanic Caldera',
    skyTop: '#451a03',
    skyMid: '#7f1d1d',
    skyBottom: '#991b1b',
    boardBg: '#ffffff',
    floorA: '#fff1f2',
    floorB: '#ffe4e6',
    floorBorder: 'rgba(249, 115, 22, 0.28)',
    wallTop: '#57534e',
    wallSide: '#292524',
    wallDark: '#1c1917',
    accent: '#f97316',
    glow: '#fdba74',
    apple: '#ef4444',
    portal: '#8b5cf6',
    portalGlow: '#c4b5fd',
  },
};

export function worldPalette(worldId = 1) {
  return WORLD_PALETTES[worldId] || WORLD_PALETTES[1];
}

/* ===================================================
   COLLECTIBLE WORM SKINS
   Faithfully inspired by the reference app "Grow Worm: Maze Adventure"
   =================================================== */
export const SKINS = [
  {
    id: 'emerald',
    name: 'Classic Worm',
    primary: '#10c822',
    secondary: '#0b941a',
    highlight: '#74f238',
    belly: '#cff542',
    eye: '#111827',
    blush: '#ff6b8b',
    spots: '#0a8716',
    antennae: '#74f238',
    glow: 'rgba(16, 200, 34, 0.45)',
    label: 'Classic vibrant earthworm',
    price: 0,
    owned: true,
  },
  {
    id: 'golden',
    name: 'Golden Sun',
    primary: '#f59e0b',
    secondary: '#b45309',
    highlight: '#fde047',
    belly: '#fef08a',
    eye: '#78350f',
    blush: '#f87171',
    spots: '#d97706',
    antennae: '#fde047',
    glow: 'rgba(245, 158, 11, 0.45)',
    label: 'Warm radiant sunbeam',
    price: 300,
    owned: false,
  },
  {
    id: 'ruby',
    name: 'Ruby Berry',
    primary: '#f43f5e',
    secondary: '#be123c',
    highlight: '#fda4af',
    belly: '#ffe4e6',
    eye: '#881337',
    blush: '#fb7185',
    spots: '#e11d48',
    antennae: '#fecdd3',
    glow: 'rgba(244, 63, 94, 0.45)',
    label: 'Juicy sweet strawberry',
    price: 500,
    owned: false,
  },
  {
    id: 'amethyst',
    name: 'Cosmic Violet',
    primary: '#a855f7',
    secondary: '#7e22ce',
    highlight: '#d8b4fe',
    belly: '#f3e8ff',
    eye: '#3b0764',
    blush: '#f472b6',
    spots: '#9333ea',
    antennae: '#e9d5ff',
    glow: 'rgba(168, 85, 247, 0.45)',
    label: 'Mystical stardust worm',
    price: 750,
    owned: false,
  },
  {
    id: 'cyber',
    name: 'Neon Cyber',
    primary: '#06b6d4',
    secondary: '#0e7490',
    highlight: '#67e8f9',
    belly: '#cffafe',
    eye: '#164e63',
    blush: '#f472b6',
    spots: '#0891b2',
    antennae: '#a5f3fc',
    glow: 'rgba(6, 182, 212, 0.45)',
    label: 'Electric teal glow',
    price: 1000,
    owned: false,
  },
  {
    id: 'axolotl',
    name: 'Axolotl Pink',
    primary: '#f472b6',
    secondary: '#db2777',
    highlight: '#fbcfe8',
    belly: '#fdf2f8',
    eye: '#831843',
    blush: '#fb7185',
    spots: '#e11d48',
    antennae: '#f472b6',
    glow: 'rgba(244, 114, 182, 0.45)',
    label: 'Cute feathery axolotl',
    price: 1200,
    owned: false,
  },
  {
    id: 'frankenstein',
    name: 'Franken-Worm',
    primary: '#84cc16',
    secondary: '#4d7c0f',
    highlight: '#bef264',
    belly: '#d9f99d',
    eye: '#14532d',
    blush: '#86efac',
    spots: '#3f6212',
    antennae: '#94a3b8',
    glow: 'rgba(132, 204, 22, 0.45)',
    label: 'Spooky stitched friend',
    price: 1500,
    owned: false,
  },
  {
    id: 'sheep',
    name: 'Woolly Sheep',
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    highlight: '#ffffff',
    belly: '#f1f5f9',
    eye: '#334155',
    blush: '#fda4af',
    spots: '#e2e8f0',
    antennae: '#fbcfe8',
    glow: 'rgba(255, 255, 255, 0.55)',
    label: 'Fluffy cloud woolly sheep',
    price: 1800,
    owned: false,
  },
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
   AUTHENTIC 3D CARTOON WORM CHARACTER
   High-definition, expressive cartoon earthworm matching "Grow Worm: Maze Adventure":
   - Volumetric chunky organic segmented body
   - 3D specular cylinder highlights & soft ground contact shadow
   - Ventral chartreuse belly contour & dorsal spots
   - Adorable 3D googly eyes with dual catchlight sparkles
   - Dynamic animated mouth (chomp eating, eager "O" near food, smile, victory)
   - Springy bouncy antennae with glowing chartreuse tips
   - Rosy blushing cheeks
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
  targetApple = null,
}) {
  const skin = SKINS.find(s => s.id === wormSkin) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;
  const belly = skinColor.belly || skin.belly || '#cff542';
  const eyeColor = skinColor.eye || skin.eye || '#111827';
  const blushColor = skinColor.blush || skin.blush || '#ff6b8b';
  const spotsColor = skinColor.spots || skin.spots || secondary;
  const antennaeColor = skinColor.antennae || skin.antennae || highlight;

  if (!segments || segments.length === 0) return null;

  const size = 100;
  const cell = size / levelSize;
  const half = cell / 2;
  const t = animTime * 0.0035;

  const isEating = expression === 'eating';
  const isMoving = expression === 'moving';
  const isHappy = expression === 'happy' || expression === 'victory';
  const isAnticipating = expression === 'anticipating';
  const isFailed = expression === 'failed';

  // Subtle organic squish/breathe phase
  const breathe = Math.sin(t * 3) * 0.03;
  const blink = (Math.sin(animTime * 0.0028) + 1) / 2 > 0.96 && !isEating && !isFailed ? 0.08 : 1;

  // Segment coordinate mapping (supports fractional positions during interpolation)
  const pts = segments.map((seg, i) => {
    return {
      x: seg[0] * cell + half,
      y: seg[1] * cell + half,
      gridX: seg[0],
      gridY: seg[1],
      i,
    };
  });

  const bodyR = Math.max(3.2, cell * 0.34);

  const head = pts[0];
  const neck = pts[1] || head;

  // Determine facing direction angle
  let headAngle = 0;
  if (pts.length > 1) {
    const dx = head.x - neck.x;
    const dy = head.y - neck.y;
    headAngle = Math.atan2(dy, dx) * 180 / Math.PI;
  } else {
    headAngle = { right: 0, down: 90, left: 180, up: -90 }[facing] || 0;
  }

  // Look-at direction for pupils: track nearest apple or glance forward
  let pupilOffsetX = 1.6;
  let pupilOffsetY = 0;
  if (targetApple) {
    const adx = targetApple[0] - head.gridX;
    const ady = targetApple[1] - head.gridY;
    const dist = Math.hypot(adx, ady);
    if (dist <= 2.8) {
      pupilOffsetX = Math.max(-2.4, Math.min(2.4, adx * 1.4));
      pupilOffsetY = Math.max(-2.4, Math.min(2.4, ady * 1.4));
    }
  }

  // Construct seamless continuous body spine path
  let spinePath = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    spinePath += ` L ${pts[i].x} ${pts[i].y}`;
  }

  const tail = pts[pts.length - 1];
  const beforeTail = pts[Math.max(0, pts.length - 2)] || tail;
  const tailAngle = Math.atan2(tail.y - beforeTail.y, tail.x - beforeTail.x) * 180 / Math.PI;

  const uid = `worm-${wormSkin}-${levelSize}`;

  return (
    <svg
      className={`continuous-worm-svg ${growing ? 'growing' : ''} ${isMoving ? 'moving' : ''} ${isEating ? 'eating' : ''} ${isHappy ? 'happy' : ''}`}
      viewBox={`0 0 ${size} ${size}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        {/* Soft 3D volumetric linear gradient along body */}
        <linearGradient id={`worm-body-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="38%" stopColor={primary} />
          <stop offset="85%" stopColor={secondary} />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.9" />
        </linearGradient>

        {/* Glossy radial gradient for head */}
        <radialGradient id={`worm-head-${uid}`} cx="32%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="25%" stopColor={highlight} />
          <stop offset="65%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </radialGradient>

        {/* Lighter chartreuse / cream underbelly stripe */}
        <linearGradient id={`worm-belly-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={belly} stopOpacity="0.95" />
          <stop offset="100%" stopColor={belly} stopOpacity="0.3" />
        </linearGradient>

        {/* 3D Contact drop-shadow */}
        <filter id={`worm-shadow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy={Math.max(1.2, cell * 0.08)} stdDeviation={Math.max(1, cell * 0.06)} floodColor="#000000" floodOpacity="0.32" />
        </filter>

        {/* Soft blur for ground shadow */}
        <filter id={`worm-ground-shadow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={Math.max(1.2, cell * 0.07)} />
        </filter>
      </defs>

       {/* 1. Ground Contact Shadow (offset downward for 3D elevation) */}
      <path
        d={spinePath}
        fill="none"
        stroke="#000000"
        strokeWidth={bodyR * 2.02}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.2"
        filter={`url(#worm-ground-shadow-${uid})`}
        transform={`translate(0, ${Math.max(1, cell * 0.07)})`}
      />

      {/* 2. Seamless continuous body base */}
      <path
        d={spinePath}
        fill="none"
        stroke={secondary}
        strokeWidth={bodyR * 2.08}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.92"
      />
      <path
        d={spinePath}
        fill="none"
        stroke={`url(#worm-body-${uid})`}
        strokeWidth={bodyR * 1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3. Underbelly continuous highlight stripe */}
      <path
        d={spinePath}
        fill="none"
        stroke={belly}
        strokeWidth={bodyR * 0.68}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
        transform={`translate(0, ${bodyR * 0.24})`}
      />

      {/* 4. Individual segments: dorsal spots, ring creases, and 3D volume */}
      {[...pts].slice(1).reverse().map((pt) => {
        const i = pt.i;
        const prev = pts[i - 1] || pt;
        const next = pts[i + 1] || pt;
        const segAngle = Math.atan2(next.y - prev.y, next.x - prev.x) * 180 / Math.PI;
        const pulse = 1 + Math.sin(t * 3.2 + i * 0.9) * 0.03 + breathe;
        const isTail = i === pts.length - 1;
        const segR = bodyR * (isTail ? 0.82 : 0.96) * pulse;

        return (
          <g key={`seg-${i}`} transform={`translate(${pt.x}, ${pt.y}) rotate(${segAngle})`}>
            {/* Segment base bulb */}
            <circle cx="0" cy="0" r={segR} fill={`url(#worm-body-${uid})`} />

            {/* Ventral belly cushion */}
            <ellipse cx="0" cy={segR * 0.3} rx={segR * 0.72} ry={segR * 0.42} fill={`url(#worm-belly-${uid})`} />

            {/* Dorsal spots / dapples */}
            <circle cx={-segR * 0.24} cy={-segR * 0.34} r={segR * 0.2} fill={spotsColor} opacity="0.4" />
            <circle cx={segR * 0.26} cy={-segR * 0.36} r={segR * 0.16} fill={spotsColor} opacity="0.35" />

            {/* Volumetric 3D specular highlight shine */}
            <ellipse cx={-segR * 0.18} cy={-segR * 0.44} rx={segR * 0.36} ry={segR * 0.17} fill="#ffffff" opacity="0.38" />

            {/* Segment ring groove */}
            <path
              d={`M ${-segR * 0.7} 0 Q 0 ${-segR * 0.42} ${segR * 0.7} 0`}
              stroke="rgba(255, 255, 255, 0.28)"
              strokeWidth={Math.max(0.7, cell * 0.03)}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M ${-segR * 0.62} ${segR * 0.1} Q 0 ${segR * 0.32} ${segR * 0.62} ${segR * 0.1}`}
              stroke="rgba(0, 0, 0, 0.1)"
              strokeWidth={Math.max(0.6, cell * 0.025)}
              fill="none"
              strokeLinecap="round"
            />

            {/* Tail tip details */}
            {isTail && (
              <g>
                <circle cx={segR * 0.32} cy="0" r={segR * 0.3} fill={highlight} opacity="0.55" />
                <circle cx={segR * 0.48} cy="0" r={segR * 0.16} fill={primary} opacity="0.75" />
              </g>
            )}
          </g>
        );
      })}

      {/* 5. Expressive 3D Cartoon Head Segment */}
      <g transform={`translate(${head.x}, ${head.y}) rotate(${headAngle})`} filter={`url(#worm-shadow-${uid})`}>
        {/* Head Base Bulb */}
        <circle cx="0" cy="0" r={bodyR * 1.04} fill={`url(#worm-head-${uid})`} />

        {/* Snout projection forward */}
        <ellipse cx={bodyR * 0.42} cy="0" rx={bodyR * 0.7} ry={bodyR * 0.74} fill={`url(#worm-head-${uid})`} />

        {/* Chin / ventral jaw */}
        <ellipse cx={bodyR * 0.26} cy={bodyR * 0.3} rx={bodyR * 0.62} ry={bodyR * 0.42} fill={`url(#worm-belly-${uid})`} />

        {/* Forehead 3D gloss shine */}
        <ellipse cx={-bodyR * 0.12} cy={-bodyR * 0.4} rx={bodyR * 0.4} ry={bodyR * 0.2} fill="#ffffff" opacity="0.5" />

        {/* Cute bouncy antennae with glowing chartreuse tip spheres */}
        <g>
          <path
            d={`M ${-bodyR * 0.04} ${-bodyR * 0.72} Q ${bodyR * 0.08} ${-bodyR * 1.18} ${-bodyR * 0.14} ${-bodyR * 1.38}`}
            stroke={secondary}
            strokeWidth={Math.max(1.1, cell * 0.05)}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={-bodyR * 0.15} cy={-bodyR * 1.4} r={Math.max(1.5, cell * 0.065)} fill={antennaeColor} stroke={secondary} strokeWidth="0.6" />
          <circle cx={-bodyR * 0.18} cy={-bodyR * 1.43} r={Math.max(0.7, cell * 0.03)} fill="#ffffff" opacity="0.85" />

          <path
            d={`M ${-bodyR * 0.04} ${bodyR * 0.72} Q ${bodyR * 0.08} ${bodyR * 1.18} ${-bodyR * 0.14} ${bodyR * 1.38}`}
            stroke={secondary}
            strokeWidth={Math.max(1.1, cell * 0.05)}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={-bodyR * 0.15} cy={bodyR * 1.4} r={Math.max(1.5, cell * 0.065)} fill={antennaeColor} stroke={secondary} strokeWidth="0.6" />
          <circle cx={-bodyR * 0.18} cy={bodyR * 1.37} r={Math.max(0.7, cell * 0.03)} fill="#ffffff" opacity="0.85" />
        </g>

        {/* Rosy Blushing Cheeks */}
        <ellipse cx={bodyR * 0.24} cy={-bodyR * 0.58} rx={bodyR * 0.22} ry={bodyR * 0.14} fill={blushColor} opacity={isHappy || isAnticipating ? 0.62 : 0.4} />
        <ellipse cx={bodyR * 0.24} cy={bodyR * 0.58} rx={bodyR * 0.22} ry={bodyR * 0.14} fill={blushColor} opacity={isHappy || isAnticipating ? 0.62 : 0.4} />

        {/* Eyes */}
        {[-1, 1].map((side) => {
          const eyeY = side * bodyR * 0.4;
          const eyeX = bodyR * 0.16;
          const eyeR = bodyR * 0.33;

          return (
            <g key={`eye-${side}`} transform={`translate(${eyeX}, ${eyeY})`}>
              <ellipse cx="0" cy="0.7" rx={eyeR * 1.03} ry={eyeR * 1.03 * blink} fill="#000000" opacity="0.16" />
              <ellipse cx="0" cy="0" rx={eyeR} ry={eyeR * blink} fill="#ffffff" stroke="rgba(0, 0, 0, 0.14)" strokeWidth="0.7" />

              {blink > 0.4 && (
                <>
                  {isFailed ? (
                    <g stroke={eyeColor} strokeWidth="2" strokeLinecap="round">
                      <line x1={-eyeR * 0.42} y1={-eyeR * 0.42} x2={eyeR * 0.42} y2={eyeR * 0.42} />
                      <line x1={eyeR * 0.42} y1={-eyeR * 0.42} x2={-eyeR * 0.42} y2={eyeR * 0.42} />
                    </g>
                  ) : isHappy && blink > 0.7 ? (
                    <path
                      d={`M ${-eyeR * 0.52} ${eyeR * 0.08} Q 0 ${-eyeR * 0.46} ${eyeR * 0.52} ${eyeR * 0.08}`}
                      stroke={eyeColor}
                      strokeWidth={Math.max(1.6, cell * 0.07)}
                      strokeLinecap="round"
                      fill="none"
                    />
                  ) : (
                    <g transform={`translate(${pupilOffsetX}, ${pupilOffsetY})`}>
                      <circle cx="0" cy="0" r={eyeR * 0.5} fill={eyeColor} />
                      <circle cx={-eyeR * 0.17} cy={-eyeR * 0.17} r={eyeR * 0.18} fill="#ffffff" />
                      <circle cx={eyeR * 0.14} cy={eyeR * 0.14} r={eyeR * 0.08} fill="#ffffff" opacity="0.85" />
                    </g>
                  )}
                </>
              )}
            </g>
          );
        })}

        {/* Mouth */}
        <g transform={`translate(${bodyR * 0.8}, 0)`}>
          {isEating ? (
            <g>
              <ellipse cx="0" cy="0" rx={bodyR * 0.3} ry={bodyR * 0.33} fill="#3b080f" />
              <ellipse cx={bodyR * 0.05} cy={bodyR * 0.1} rx={bodyR * 0.2} ry={bodyR * 0.16} fill="#ff4d6d" />
              <circle cx={-bodyR * 0.1} cy={-bodyR * 0.16} r={bodyR * 0.07} fill="#ffffff" />
            </g>
          ) : isAnticipating ? (
            <g>
              <ellipse cx="0" cy="0" rx={bodyR * 0.2} ry={bodyR * 0.23} fill="#4a0e17" />
              <circle cx="0" cy={bodyR * 0.07} r={bodyR * 0.1} fill="#ff6b8b" />
            </g>
          ) : isHappy ? (
            <g>
              <path
                d={`M ${-bodyR * 0.16} ${-bodyR * 0.18} Q ${bodyR * 0.14} 0 ${-bodyR * 0.16} ${bodyR * 0.18}`}
                stroke="#330a10"
                strokeWidth={Math.max(1.3, cell * 0.055)}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          ) : isFailed ? (
            <path
              d={`M ${bodyR * 0.04} ${-bodyR * 0.16} Q ${-bodyR * 0.16} 0 ${bodyR * 0.04} ${bodyR * 0.16}`}
              stroke="#330a10"
              strokeWidth={Math.max(1.3, cell * 0.055)}
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <g>
              <path
                d={`M ${-bodyR * 0.1} ${-bodyR * 0.16} Q ${bodyR * 0.1} 0 ${-bodyR * 0.1} ${bodyR * 0.16}`}
                stroke="#330a10"
                strokeWidth={Math.max(1.2, cell * 0.05)}
                fill="none"
                strokeLinecap="round"
              />
              <circle cx={bodyR * 0.02} cy="0" r={bodyR * 0.05} fill="#ff6b8b" opacity="0.75" />
            </g>
          )}
        </g>
      </g>

      {/* Eating Crunch / Bite Sparkles */}
      {isEating && (
        <g transform={`translate(${head.x + Math.cos(headAngle * Math.PI / 180) * bodyR * 1.2}, ${head.y + Math.sin(headAngle * Math.PI / 180) * bodyR * 1.2})`}>
          <circle cx="0" cy="0" r={cell * 0.14} fill="#fbbf24" opacity="0.9" />
          <circle cx={cell * 0.16} cy={-cell * 0.1} r={cell * 0.08} fill="#ef4444" opacity="0.9" />
          <circle cx={-cell * 0.14} cy={cell * 0.12} r={cell * 0.07} fill="#22c55e" opacity="0.9" />
          <polygon points="0,-3.5 1.3,-0.9 3.5,0 1.3,0.9 0,3.5 -1.3,0.9 -3.5,0 -1.3,-0.9" fill="#ffffff" />
        </g>
      )}
    </svg>
  );
}

/* ===================================================
   SCENIC WORLD BACKDROP
   Full-screen atmospheric landscapes matching "Grow Worm: Maze Adventure"
   1 Sunset Mountain Vista, 2 Sunny Glade & River, 3 Desert Canyon,
   4 Enchanted Twilight Forest, 5 Volcanic Caldera
   =================================================== */
export function ScenicWorldBackdrop({ worldId = 1, animTime = 0 }) {
  const t = animTime * 0.001;

  if (worldId === 1) {
    // WORLD 1: Sunset Mountain Vista (apricot, peach, lavender gradient with mountain silhouettes)
    return (
      <svg className="scenic-world-svg" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="w1-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="35%" stopColor="#f472b6" />
            <stop offset="68%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>
          <radialGradient id="w1-sun" cx="50%" cy="58%" r="45%">
            <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#fde68a" stopOpacity="0.75" />
            <stop offset="55%" stopColor="#fbbf24" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky gradient */}
        <rect width="1000" height="800" fill="url(#w1-sky)" />

        {/* Setting Sun */}
        <circle cx="500" cy="460" r="160" fill="url(#w1-sun)" />
        <circle cx="500" cy="460" r="75" fill="#fffbeb" opacity="0.95" />

        {/* Distant Puffy Sunset Clouds */}
        <g opacity="0.45" fill="#ffffff">
          <ellipse cx="180" cy="220" rx="90" ry="24" />
          <ellipse cx="230" cy="205" rx="60" ry="32" />
          <ellipse cx="780" cy="260" rx="120" ry="28" />
          <ellipse cx="830" cy="245" rx="70" ry="34" />
        </g>

        {/* Far Mountains Silhouette (Dusky Purple) */}
        <path
          d="M 0 520 L 120 440 L 260 500 L 410 410 L 580 510 L 730 430 L 880 490 L 1000 420 L 1000 800 L 0 800 Z"
          fill="#4f46e5"
          opacity="0.55"
        />

        {/* Mid Mountains Ridge (Warm Indigo / Mauve) */}
        <path
          d="M 0 580 L 160 500 L 320 570 L 510 470 L 680 560 L 840 480 L 1000 550 L 1000 800 L 0 800 Z"
          fill="#3730a3"
          opacity="0.75"
        />

        {/* Near Rolling Hills (Lush sunset meadow crests) */}
        <path
          d="M 0 660 Q 250 580 500 650 T 1000 620 L 1000 800 L 0 800 Z"
          fill="#1e1b4b"
          opacity="0.92"
        />

        {/* Drifting sunset dandelion motes */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const cx = (120 + i * 140 + Math.sin(t + i) * 35) % 1000;
          const cy = (320 + i * 65 + Math.cos(t * 1.2 + i) * 25) % 800;
          return <circle key={i} cx={cx} cy={cy} r={2.4 + (i % 3)} fill="#fef08a" opacity="0.6" />;
        })}
      </svg>
    );
  }

  if (worldId === 2) {
    // WORLD 2: Sunny Glade & Clear River (bright blue sky, rolling green hills, river ribbon)
    return (
      <svg className="scenic-world-svg" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="w2-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
          <linearGradient id="w2-river" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        <rect width="1000" height="800" fill="url(#w2-sky)" />

        {/* Golden Sun & Radiant Flares */}
        <circle cx="820" cy="180" r="60" fill="#fef08a" />
        <circle cx="820" cy="180" r="110" fill="#fde047" opacity="0.25" />

        {/* Puffy White Clouds */}
        <g fill="#ffffff" opacity="0.85">
          <ellipse cx="260" cy="160" rx="90" ry="28" />
          <ellipse cx="300" cy="140" rx="55" ry="34" />
          <ellipse cx="580" cy="200" rx="110" ry="32" />
          <ellipse cx="630" cy="180" rx="65" ry="38" />
        </g>

        {/* Far Green Hills */}
        <path d="M 0 540 Q 300 440 600 520 T 1000 490 L 1000 800 L 0 800 Z" fill="#86efac" opacity="0.75" />
        {/* Mid Hills */}
        <path d="M 0 600 Q 240 520 540 590 T 1000 570 L 1000 800 L 0 800 Z" fill="#4ade80" opacity="0.88" />
        {/* Near Hill */}
        <path d="M 0 670 Q 350 590 700 660 T 1000 640 L 1000 800 L 0 800 Z" fill="#22c55e" />

        {/* Winding Blue River Ribbon */}
        <path
          d="M 450 630 C 490 670 410 720 480 800 L 570 800 C 510 720 580 670 540 630 Z"
          fill="url(#w2-river)"
          opacity="0.9"
        />
      </svg>
    );
  }

  if (worldId === 3) {
    // WORLD 3: Desert Canyon & Sandstone (terracotta plateaus, saguaros, amber dusk)
    return (
      <svg className="scenic-world-svg" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="w3-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c2410c" />
            <stop offset="45%" stopColor="#ea580c" />
            <stop offset="78%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fef3c7" />
          </linearGradient>
        </defs>

        <rect width="1000" height="800" fill="url(#w3-sky)" />

        {/* Huge Warm Sun */}
        <circle cx="500" cy="420" r="100" fill="#fffbeb" opacity="0.95" />
        <circle cx="500" cy="420" r="180" fill="#fde68a" opacity="0.3" />

        {/* Distant Mesa Silhouettes */}
        <path
          d="M 0 540 L 110 540 L 130 500 L 260 500 L 280 540 L 460 540 L 480 470 L 620 470 L 640 540 L 780 540 L 800 480 L 930 480 L 950 540 L 1000 540 L 1000 800 L 0 800 Z"
          fill="#9a3412"
          opacity="0.65"
        />

        {/* Near Terracotta Plateaus */}
        <path
          d="M 0 620 L 180 620 L 210 560 L 390 560 L 420 620 L 680 620 L 710 540 L 890 540 L 920 620 L 1000 620 L 1000 800 L 0 800 Z"
          fill="#7c2d12"
        />

        {/* Warm Dune Forefront */}
        <path d="M 0 710 Q 300 660 600 700 T 1000 680 L 1000 800 L 0 800 Z" fill="#451a03" />
      </svg>
    );
  }

  if (worldId === 4) {
    // WORLD 4: Enchanted Twilight (deep purple twilight, bioluminescent giant mushrooms)
    return (
      <svg className="scenic-world-svg" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="w4-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="45%" stopColor="#4c1d95" />
            <stop offset="80%" stopColor="#701a75" />
            <stop offset="100%" stopColor="#831843" />
          </linearGradient>
        </defs>

        <rect width="1000" height="800" fill="url(#w4-sky)" />

        {/* Luminous Giant Full Moon */}
        <circle cx="780" cy="220" r="85" fill="#fdf4ff" opacity="0.9" />
        <circle cx="780" cy="220" r="140" fill="#f0abfc" opacity="0.25" />

        {/* Twinkling Stars */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <circle
            key={i}
            cx={(i * 85 + 40) % 980}
            cy={(i * 55 + 30) % 400}
            r={1.8 + (i % 2) * 1.2}
            fill="#ffffff"
            opacity={0.4 + ((i * 3 + Math.floor(t * 2)) % 5) * 0.12}
          />
        ))}

        {/* Distant Enchanted Forest Tree Canopy */}
        <path
          d="M 0 540 Q 150 470 300 530 T 600 500 T 900 520 T 1000 490 L 1000 800 L 0 800 Z"
          fill="#3b0764"
          opacity="0.8"
        />

        {/* Giant Glowing Mushroom Silhouettes */}
        <g transform="translate(180, 520)">
          <rect x="22" y="50" width="16" height="90" rx="8" fill="#581c87" />
          <ellipse cx="30" cy="50" rx="65" ry="36" fill="#a855f7" />
          <circle cx="5" cy="45" r="9" fill="#f0abfc" opacity="0.9" />
          <circle cx="45" cy="38" r="11" fill="#67e8f9" opacity="0.9" />
          <circle cx="28" cy="22" r="8" fill="#fdf4ff" opacity="0.9" />
        </g>
        <g transform="translate(760, 560)">
          <rect x="18" y="40" width="14" height="70" rx="7" fill="#581c87" />
          <ellipse cx="25" cy="40" rx="50" ry="28" fill="#c084fc" />
          <circle cx="10" cy="35" r="7" fill="#67e8f9" opacity="0.9" />
          <circle cx="35" cy="30" r="8" fill="#fdf4ff" opacity="0.9" />
        </g>

        {/* Ground ridge */}
        <path d="M 0 680 Q 300 620 600 670 T 1000 650 L 1000 800 L 0 800 Z" fill="#2e1065" />
      </svg>
    );
  }

  // WORLD 5: Volcanic Caldera & Peaks (crimson dusk, dark obsidian crags, rising embers)
  return (
    <svg className="scenic-world-svg" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="w5-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1917" />
          <stop offset="35%" stopColor="#451a03" />
          <stop offset="70%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>

      <rect width="1000" height="800" fill="url(#w5-sky)" />

      {/* Fiery Sunset Caldera Glow */}
      <circle cx="500" cy="450" r="170" fill="#f97316" opacity="0.35" />
      <circle cx="500" cy="450" r="90" fill="#fbbf24" opacity="0.7" />

      {/* Obsidian Volcano Ridges */}
      <path
        d="M 0 550 L 140 450 L 280 540 L 440 380 L 590 530 L 740 430 L 890 520 L 1000 460 L 1000 800 L 0 800 Z"
        fill="#292524"
        opacity="0.85"
      />
      <path
        d="M 0 630 L 200 530 L 400 620 L 620 510 L 820 610 L 1000 540 L 1000 800 L 0 800 Z"
        fill="#1c1917"
      />

      {/* Rising Embers */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const cx = (100 + i * 120 + Math.sin(t * 1.5 + i) * 30) % 1000;
        const cy = (600 - ((t * 60 + i * 80) % 500));
        return <circle key={i} cx={cx} cy={cy} r={2 + (i % 3)} fill="#fb923c" opacity="0.8" />;
      })}
    </svg>
  );
}

/* ===================================================
   CHUNKY 3D BEVELED BLOCKS (Wall & Obstacles)
   Rich tactile 3D blocks with bright top highlights and deep shadow bevels
   =================================================== */
export function PremiumStoneWallSVG({ worldId = 1, variant = 0 }) {
  const p = worldPalette(worldId);
  const uid = `wall-${worldId}-${variant}`;

  // World 1: Rich warm terracotta earth block with lush 3D grass dripping over top
  if (worldId === 1) {
    return (
      <svg className="premium-wall" viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`w1-earth-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a16207" />
            <stop offset="60%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id={`w1-grass-top-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="45%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>

        {/* Block Shadow */}
        <rect x="4" y="24" width="92" height="72" rx="14" fill="#000000" opacity="0.28" />

        {/* Earth Block Body (Front Face) */}
        <rect x="4" y="16" width="92" height="76" rx="14" fill={`url(#w1-earth-${uid})`} />

        {/* Stone / Earth Texture Specks */}
        <circle cx="24" cy="58" r="3.2" fill="#d97706" opacity="0.45" />
        <circle cx="72" cy="68" r="4" fill="#451a03" opacity="0.55" />
        <circle cx="48" cy="74" r="2.8" fill="#d97706" opacity="0.35" />

        {/* Lush Grass Top Cap with organic dripping fringes */}
        <path
          d="M 4 24 C 4 13 13 4 24 4 L 76 4 C 87 4 96 13 96 24 C 96 34 88 38 82 34 C 76 30 72 38 64 36 C 56 34 50 42 42 38 C 34 34 28 42 20 38 C 12 34 4 36 4 24 Z"
          fill={`url(#w1-grass-top-${uid})`}
        />

        {/* Bright Grass Top Specular Edge Highlight */}
        <path d="M 12 8 L 88 8" stroke="#bbf7d0" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      </svg>
    );
  }

  // World 2: Chiseled Glacial Ice Block
  if (worldId === 2) {
    return (
      <svg className="premium-wall" viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`w2-ice-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
        </defs>
        <rect x="4" y="24" width="92" height="72" rx="14" fill="#000000" opacity="0.22" />
        <rect x="4" y="16" width="92" height="76" rx="14" fill={`url(#w2-ice-${uid})`} />
        {/* Ice Facet Crystal Highlights */}
        <path d="M 14 16 L 36 38 L 86 16 Z" fill="#ffffff" opacity="0.5" />
        <path d="M 36 38 L 52 82 L 86 16 Z" fill="#7dd3fc" opacity="0.4" />
        <path d="M 14 16 L 86 16" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      </svg>
    );
  }

  // World 3: Sandstone Terracotta Block
  if (worldId === 3) {
    return (
      <svg className="premium-wall" viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`w3-sand-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="35%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#7c2d12" />
          </linearGradient>
        </defs>
        <rect x="4" y="24" width="92" height="72" rx="14" fill="#000000" opacity="0.28" />
        <rect x="4" y="16" width="92" height="76" rx="14" fill={`url(#w3-sand-${uid})`} />
        {/* Sandstone Layer Strata */}
        <path d="M 8 36 H 92 M 8 56 H 92 M 8 72 H 92" stroke="#7c2d12" strokeWidth="2.5" opacity="0.35" />
        <path d="M 12 18 H 88" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      </svg>
    );
  }

  // World 4: Mystic Amethyst Rune Block
  if (worldId === 4) {
    return (
      <svg className="premium-wall" viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`w4-rune-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="40%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
        </defs>
        <rect x="4" y="24" width="92" height="72" rx="14" fill="#000000" opacity="0.32" />
        <rect x="4" y="16" width="92" height="76" rx="14" fill={`url(#w4-rune-${uid})`} />
        {/* Glowing Crystal Inset */}
        <polygon points="50,30 68,48 50,66 32,48" fill="#e879f9" opacity="0.85" />
        <polygon points="50,35 62,48 50,61 38,48" fill="#ffffff" opacity="0.9" />
        <path d="M 12 18 H 88" stroke="#f5d0fe" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      </svg>
    );
  }

  // World 5: Obsidian Basalt & Magma Block
  return (
    <svg className="premium-wall" viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`w5-lava-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#57534e" />
          <stop offset="40%" stopColor="#292524" />
          <stop offset="100%" stopColor="#0c0a09" />
        </linearGradient>
      </defs>
      <rect x="4" y="24" width="92" height="72" rx="14" fill="#000000" opacity="0.35" />
      <rect x="4" y="16" width="92" height="76" rx="14" fill={`url(#w5-lava-${uid})`} />
      {/* Glowing Magma Fissure */}
      <path d="M 18 68 L 38 48 L 56 60 L 78 40" stroke="#f97316" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M 22 66 L 38 50 L 54 58 L 74 42" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M 12 18 H 88" stroke="#78716c" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/* ===================================================
   PUSHABLE STONE BLOCK (Moveable)
   Chiseled grey granite with square/cross relief and 3D bevels
   =================================================== */
export function PremiumStoneBlockSVG({ hits = 2, worldId = 1 }) {
  const cracked = hits <= 1;
  const uid = `push-stone-${worldId}-${hits}`;

  return (
    <svg viewBox="0 0 100 100" style={{ width: '96%', height: '96%', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`stone-body-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="40%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      {/* Soft Contact Drop Shadow */}
      <rect x="8" y="20" width="84" height="74" rx="14" fill="#000000" opacity="0.25" />

      {/* Main Chiseled Block */}
      <rect x="8" y="12" width="84" height="76" rx="14" fill={`url(#stone-body-${uid})`} stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.5" />

      {/* Inner Inset Cross Carving (Moveable Block Mark) */}
      <rect x="22" y="26" width="56" height="48" rx="8" fill="#64748b" opacity="0.5" />
      <path d="M 50 28 V 72 M 24 50 H 76" stroke="#334155" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
      <path d="M 50 28 V 72 M 24 50 H 76" stroke="#f1f5f9" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

      {/* Top Edge Specular Highlight */}
      <path d="M 14 14 H 86" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />

      {/* Damage Cracks if damaged */}
      {cracked && (
        <path d="M 28 22 L 44 42 L 34 62 L 62 76 M 66 28 L 52 48 L 74 64" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
      )}
    </svg>
  );
}

/* ===================================================
   BUZZSAW HAZARD TILE
   High-contrast 14-tooth rotating circular steel blade
   =================================================== */
export function BuzzsawHazardSVG({ animTime = 0 }) {
  const rot = (animTime * 0.45) % 360;

  return (
    <svg viewBox="0 0 100 100" style={{ width: '96%', height: '96%', overflow: 'visible' }}>
      <defs>
        <radialGradient id="buzz-steel" cx="42%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>
        <radialGradient id="buzz-center" cx="40%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>
      </defs>

      {/* Pit Shadow */}
      <circle cx="50" cy="54" r="42" fill="#000000" opacity="0.32" />

      {/* Rotating Sawblade */}
      <g transform={`rotate(${rot} 50 50)`}>
        {/* 14 Razor-Sharp Steel Teeth */}
        <polygon
          points="50,6 56,20 68,10 70,26 84,20 80,36 94,36 86,50 94,64 80,64 84,80 70,74 68,90 56,80 50,94 44,80 32,90 30,74 16,80 20,64 6,64 14,50 6,36 20,36 16,20 30,26 32,10 44,20"
          fill="url(#buzz-steel)"
          stroke="#cbd5e1"
          strokeWidth="1.2"
        />
        {/* Blade Rim Bevel Ring */}
        <circle cx="50" cy="50" r="30" fill="none" stroke="#64748b" strokeWidth="2.5" opacity="0.6" />
        {/* Central Steel Bolt */}
        <circle cx="50" cy="50" r="14" fill="url(#buzz-center)" stroke="#94a3b8" strokeWidth="1.8" />
        <circle cx="50" cy="50" r="5" fill="#f8fafc" />
      </g>
    </svg>
  );
}

/* ===================================================
   PLUMP 3D RED APPLE (Food Collectible)
   Juicy cartoon apple with realistic indent, curved stem,
   vibrant leaf, specular highlight & gentle bobbing
   =================================================== */
export function PremiumAppleSVG({ collected = false, bobPhase = 0, worldId = 1 }) {
  const bob = Math.sin(bobPhase * 1.2) * 1.6;
  const rot = Math.sin(bobPhase * 0.8) * 2;
  const uid = `apple-${worldId}`;

  return (
    <svg
      className={`premium-apple ${collected ? 'collected' : ''}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{
        width: '72%',
        height: '72%',
        overflow: 'visible',
        transform: collected ? 'scale(0.15)' : `translateY(${bob}px) rotate(${rot}deg)`,
        opacity: collected ? 0 : 1,
        transition: collected ? 'transform 0.28s ease, opacity 0.28s ease' : 'opacity 0.2s ease',
        transformOrigin: '50% 72%',
      }}
    >
      <defs>
        {/* Luscious red radial gradient with bright gloss reflection */}
        <radialGradient id={`apple-red-${uid}`} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="14%" stopColor="#fca5a5" />
          <stop offset="35%" stopColor="#ef4444" />
          <stop offset="78%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>

        {/* Leaf green gradient */}
        <linearGradient id={`apple-leaf-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* Stem brown gradient */}
        <linearGradient id={`apple-stem-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a16207" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
      </defs>

      {/* Floor Contact Shadow (shrinks when apple bobs up) */}
      <ellipse
        cx="50"
        cy="90"
        rx={22 - Math.abs(bob) * 1.2}
        ry={6 - Math.abs(bob) * 0.35}
        fill="#000000"
        opacity="0.2"
      />

      {/* Wooden Curved Stem */}
      <path
        d="M 50 36 C 48 22 56 14 65 10"
        stroke={`url(#apple-stem-${uid})`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Vibrant Green Leaf */}
      <g transform="translate(62, 8) rotate(22)">
        <path
          d="M 0 12 C 10 -4 30 -2 34 10 C 30 22 10 26 0 16 Z"
          fill={`url(#apple-leaf-${uid})`}
          stroke="#15803d"
          strokeWidth="1"
        />
        <path d="M 2 13 Q 15 8 28 12" stroke="#bbf7d0" strokeWidth="1.2" fill="none" opacity="0.6" />
      </g>

      {/* Plump 3D Apple Body */}
      <path
        d="M 50 34 C 34 26 14 36 14 62 C 14 84 34 94 50 89 C 66 94 86 84 86 62 C 86 36 66 26 50 34 Z"
        fill={`url(#apple-red-${uid})`}
        stroke="#991b1b"
        strokeWidth="1.2"
      />

      {/* Volumetric Gloss Specular Reflection */}
      <ellipse cx="34" cy="48" rx="8" ry="14" fill="#ffffff" opacity="0.45" transform="rotate(-18 34 48)" />
      <circle cx="30" cy="42" r="3.2" fill="#ffffff" opacity="0.85" />
      <circle cx="36" cy="56" r="1.8" fill="#ffffff" opacity="0.65" />

      {/* Gentle Sparkle Glint */}
      <g transform="translate(70, 42)">
        <polygon points="0,-5 1.5,-1.2 5,0 1.5,1.2 0,5 -1.5,1.2 -5,0 -1.5,-1.2" fill="#ffffff" opacity="0.9" />
      </g>
    </svg>
  );
}

/* ===================================================
   SWIRLING COSMIC VORTEX PORTAL (Level Exit)
   Deep black accretion core with swirling neon accretion rings
   =================================================== */
export function PremiumPortalSVG({ unlocked = false, pulsePhase = 0, worldId = 1 }) {
  const p = worldPalette(worldId);
  const pulse = 1 + Math.sin(pulsePhase * 2.5) * 0.03;
  const rot = (pulsePhase * 60) % 360;
  const uid = `portal-${worldId}`;

  return (
    <svg
      className={`premium-portal ${unlocked ? 'unlocked' : 'locked'}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{
        width: '82%',
        height: '82%',
        overflow: 'visible',
        transform: `scale(${unlocked ? pulse : 1})`,
        transformOrigin: '50% 50%',
      }}
    >
      <defs>
        {/* Core Black Hole Gradient */}
        <radialGradient id={`portal-core-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="65%" stopColor="#0f172a" />
          <stop offset="100%" stopColor={unlocked ? p.portal : '#334155'} />
        </radialGradient>

        {/* Accretion Ring Gradient */}
        <linearGradient id={`portal-ring-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor={unlocked ? p.portal : '#94a3b8'} />
          <stop offset="100%" stopColor={unlocked ? p.glow : '#64748b'} />
        </linearGradient>
      </defs>

      {/* Ambient Ground Shadow */}
      <ellipse cx="50" cy="88" rx="34" ry="8" fill="#000000" opacity="0.25" />

      {/* Swirling Cosmic Accretion Rings */}
      <g transform={`rotate(${rot} 50 50)`}>
        {/* Outer Ring */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={`url(#portal-ring-${uid})`}
          strokeWidth={unlocked ? '4.5' : '3'}
          strokeDasharray="14 10 6 8"
          opacity={unlocked ? 0.95 : 0.4}
        />
        {/* Mid Spiral Ring */}
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="none"
          stroke={unlocked ? p.glow : '#64748b'}
          strokeWidth="3.2"
          strokeDasharray="8 6"
          opacity={unlocked ? 0.9 : 0.35}
        />
      </g>

      {/* Reverse Swirling Inner Arm */}
      <g transform={`rotate(${-rot * 1.5} 50 50)`}>
        <circle
          cx="50"
          cy="50"
          r="24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeDasharray="6 8"
          opacity={unlocked ? 0.85 : 0.25}
        />
      </g>

      {/* Deep Black Hole Center */}
      <circle cx="50" cy="50" r="18" fill={`url(#portal-core-${uid})`} stroke={unlocked ? p.portal : '#475569'} strokeWidth="2" />

      {/* Twinkling Star Core when Unlocked */}
      {unlocked ? (
        <g transform={`rotate(${rot * 2} 50 50)`}>
          <polygon points="50,36 53,47 64,50 53,53 50,64 47,53 36,50 47,47" fill="#ffffff" />
          <circle cx="50" cy="50" r="4.5" fill="#ffffff" />
        </g>
      ) : (
        /* Padlock icon when locked */
        <g transform="translate(42, 40)" opacity="0.85">
          <rect x="0" y="8" width="16" height="12" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1.8" />
          <path d="M 3 8 V 5 A 5 5 0 0 1 13 5 V 8" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

/* ===================================================
   ADDITIONAL TILES (Grass, Crates, Ice, Treasure)
   =================================================== */
export function PremiumGrassTileSVG({ pulsePhase = 0, worldId = 1 }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '92%', height: '92%', overflow: 'visible' }}>
      <ellipse cx="50" cy="80" rx="28" ry="8" fill="#000" opacity="0.18" />
      <path d="M 30 78 Q 40 38 50 78 Q 60 38 70 78" stroke="#16a34a" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M 38 78 Q 46 46 54 78 Q 62 46 70 76" stroke="#4ade80" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

export function PremiumCrateTileSVG({ worldId = 1 }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '96%', height: '96%', overflow: 'visible' }}>
      <rect x="8" y="20" width="84" height="74" rx="10" fill="#000" opacity="0.25" />
      <rect x="8" y="12" width="84" height="76" rx="10" fill="#d97706" stroke="#78350f" strokeWidth="2" />
      <rect x="14" y="18" width="72" height="64" rx="6" fill="#b45309" />
      <path d="M 14 18 L 86 82 M 86 18 L 14 82" stroke="#78350f" strokeWidth="5" />
      <circle cx="50" cy="50" r="5" fill="#fef3c7" opacity="0.5" />
    </svg>
  );
}

export function PremiumIceTileSVG({ pulsePhase = 0, worldId = 2 }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '96%', height: '96%', overflow: 'visible' }}>
      <rect x="8" y="16" width="84" height="76" rx="14" fill="#38bdf8" />
      <rect x="8" y="8" width="84" height="76" rx="14" fill="#f0f9ff" stroke="#7dd3fc" strokeWidth="2" opacity="0.9" />
      <path d="M 20 20 L 40 40 L 80 20" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.75" />
      <polygon points="50,30 65,50 50,70 35,50" fill="#bae6fd" opacity="0.5" />
    </svg>
  );
}

export function PremiumTreasureTileSVG({ pulsePhase = 0, worldId = 1 }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '94%', height: '94%', overflow: 'visible' }}>
      <ellipse cx="50" cy="84" rx="28" ry="7" fill="#000" opacity="0.25" />
      <rect x="20" y="46" width="60" height="36" rx="8" fill="#92400e" stroke="#451a03" strokeWidth="2" />
      <rect x="18" y="32" width="64" height="20" rx="9" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
      <rect x="44" y="46" width="12" height="16" rx="3" fill="#fde047" stroke="#92400e" />
      <circle cx="50" cy="40" r="5" fill="#38bdf8" />
    </svg>
  );
}

/* ===================================================
   WORLD PROPS & PARTICLES
   =================================================== */
export function WorldBackgroundSVG({ worldId = 1 }) {
  return <ScenicWorldBackdrop worldId={worldId} animTime={0} />;
}

export function WorldTreeSVG({ worldId = 1 }) {
  return (
    <svg viewBox="0 0 90 130" style={{ width: '100%', height: '100%' }}>
      <rect x="40" y="70" width="10" height="50" rx="4" fill="#92400e" />
      <circle cx="45" cy="46" r="30" fill="#22c55e" />
      <circle cx="24" cy="58" r="20" fill="#16a34a" />
      <circle cx="66" cy="58" r="20" fill="#4ade80" opacity="0.95" />
      <circle cx="45" cy="26" r="16" fill="#86efac" opacity="0.5" />
    </svg>
  );
}

export function WorldBushSVG({ worldId = 1 }) {
  return (
    <svg viewBox="0 0 80 60" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="40" cy="44" rx="30" ry="13" fill="#14532d" />
      <circle cx="20" cy="36" r="14" fill="#22c55e" />
      <circle cx="40" cy="28" r="17" fill="#4ade80" />
      <circle cx="60" cy="36" r="14" fill="#16a34a" />
    </svg>
  );
}

export function WorldRockSVG({ worldId = 1 }) {
  return (
    <svg viewBox="0 0 80 60" style={{ width: '100%', height: '100%' }}>
      <path d="M 10 52 L 22 20 L 40 10 L 58 22 L 70 52 Z" fill="#64748b" />
      <path d="M 22 20 L 40 10 L 35 34 Z" fill="#ffffff" opacity="0.3" />
    </svg>
  );
}

export function WorldMushroomSVG({ worldId = 4 }) {
  return (
    <svg viewBox="0 0 70 80" style={{ width: '100%', height: '100%' }}>
      <rect x="30" y="42" width="10" height="28" rx="4" fill="#ede9fe" />
      <ellipse cx="35" cy="36" rx="28" ry="16" fill="#d946ef" />
      <circle cx="22" cy="34" r="3.2" fill="#fdf4ff" opacity="0.9" />
      <circle cx="36" cy="28" r="4" fill="#fdf4ff" opacity="0.85" />
      <circle cx="48" cy="35" r="3" fill="#fdf4ff" opacity="0.85" />
    </svg>
  );
}

export function WorldCrystalSVG({ worldId = 2 }) {
  return (
    <svg viewBox="0 0 60 80" style={{ width: '100%', height: '100%' }}>
      <path d="M 30 4 L 46 28 L 40 74 L 20 74 L 14 28 Z" fill="#38bdf8" opacity="0.88" />
      <path d="M 30 4 L 40 74 L 20 74 Z" fill="#bae6fd" opacity="0.55" />
    </svg>
  );
}

export function WorldIceCrystalSVG({ worldId = 2 }) {
  return (
    <svg viewBox="0 0 60 90" style={{ width: '100%', height: '100%' }}>
      <path d="M 30 2 L 42 24 L 30 86 L 18 24 Z" fill="#e0f2fe" opacity="0.92" />
      <path d="M 30 2 L 30 86 M 18 24 L 42 24" stroke="#7dd3fc" strokeWidth="2" />
    </svg>
  );
}

export function WorldPlanetSVG({ worldId = 5 }) {
  return (
    <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%' }}>
      <circle cx="30" cy="30" r="22" fill="#ea580c" />
      <circle cx="30" cy="30" r="26" fill="#f97316" opacity="0.2" />
    </svg>
  );
}

export function FloatingParticleSVG({ worldId = 1 }) {
  return (
    <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%' }}>
      <circle cx="10" cy="10" r="3.5" fill="#bef264" />
      <circle cx="10" cy="10" r="7" fill="#84cc16" opacity="0.3" />
    </svg>
  );
}

export function WorldFireflySVG({ worldId = 1, delay = 0 }) {
  return (
    <svg viewBox="0 0 20 20" style={{ width: '100%', height: '100%', animation: `pulse 2s ease-in-out ${delay}s infinite` }}>
      <circle cx="10" cy="10" r="3.5" fill="#bef264" />
      <circle cx="10" cy="10" r="7" fill="#84cc16" opacity="0.3" />
    </svg>
  );
}
