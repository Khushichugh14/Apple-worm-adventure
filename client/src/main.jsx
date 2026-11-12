import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Apple, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Award,
  ChevronRight, CircleHelp, Coins, Gamepad2, Gem, Lightbulb,
  LockKeyhole, RotateCcw, Settings, ShieldCheck, Sparkles, Star,
  Trophy, Volume2, VolumeX, Zap, User as UserIcon, LogOut, Check, X,
  Compass, Play, RefreshCw, Flame, Crown, Flag, AlertCircle,
  Maximize2, Minimize2, Music, Undo2, HelpCircle, MapPin, ShoppingBag,
  Heart, Gift, Palette, Crown as CrownIcon, KeyRound
} from 'lucide-react';
import { GAME_NAME, API_URL } from './config/gameConfig';
import { LEVELS, WORLDS } from './data/levels';
import { initialState, step, same } from './game/engine';
import { playSound, startBgm, stopBgm } from './game/audio';
import { findNextHint } from './game/solver';
import './style.css';

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err));
  });
}

const hideSplash = () => {
  const splash = document.getElementById('app-splash');
  if (splash) {
    splash.classList.add('hidden');
    setTimeout(() => splash.remove(), 450);
  }
};

const SKINS = [
  { id: 'emerald', name: 'Emerald', primary: '#10b981', secondary: '#059669', highlight: '#86efac', glow: 'rgba(52, 211, 153, 0.6)', label: 'Classic Garden', price: 0, owned: true },
  { id: 'golden', name: 'Golden Sun', primary: '#f59e0b', secondary: '#d97706', highlight: '#fef08a', glow: 'rgba(251, 191, 36, 0.6)', label: 'Radiant Glow', price: 500, owned: false },
  { id: 'ruby', name: 'Ruby Flame', primary: '#e11d48', secondary: '#be123c', highlight: '#fda4af', glow: 'rgba(244, 63, 94, 0.6)', label: 'Blazing Spark', price: 750, owned: false },
  { id: 'amethyst', name: 'Cosmic Violet', primary: '#8b5cf6', secondary: '#6d28d9', highlight: '#e9d5ff', glow: 'rgba(168, 85, 247, 0.6)', label: 'Mystic Aura', price: 1000, owned: false },
  { id: 'cyber', name: 'Neon Cyber', primary: '#06b6d4', secondary: '#0e7490', highlight: '#67e8f9', glow: 'rgba(6, 182, 212, 0.6)', label: 'Digital Edge', price: 1500, owned: false },
  { id: 'rose', name: 'Rose Quartz', primary: '#ec4899', secondary: '#be185d', highlight: '#fbcfe8', glow: 'rgba(236, 72, 153, 0.6)', label: 'Gentle Bloom', price: 1200, owned: false },
];

function calculateStars(moves, limit, parMoves) {
  const par = parMoves || Math.ceil(limit * 0.55);
  if (moves <= par) return 3;
  if (moves <= Math.ceil(limit * 0.8)) return 2;
  return 1;
}

/* ===================================================
   PREMIUM CUSTOM VECTOR GRAPHIC COMPONENTS
   =================================================== */

// 1. Expressive Worm Head with Dynamic Expressions
function WormHeadSVG({ facing = 'right', skinId = 'emerald', expression = 'idle', skinColor = {} }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;
  const gradId = `wormGrad-${skin.id}-${expression}`;

  const isEating = expression === 'eating';
  const isMoving = expression === 'moving';
  const isHappy = expression === 'happy';
  const eyeRy = isEating ? 6 : isHappy ? 7 : 11;
  const pupilR = isEating ? 3.2 : 5.2;

  return (
    <svg className={`worm-head-svg-container facing-${facing} ${isMoving ? 'moving' : ''} ${isEating ? 'eating' : ''} ${!isMoving && !isEating ? 'idle' : ''}`} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={gradId} cx="32%" cy="28%" r="70%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="45%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </radialGradient>
        <linearGradient id={`${gradId}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="headDropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      <ellipse cx="50" cy="60" rx="32" ry="14" fill="rgba(0,0,0,0.25)" />
      <g className="head-sprout-leaf" transform="translate(46, 6)" style={{ transformOrigin: '50% 100%' }}>
        <path d="M4 16 C2 6, 16 0, 24 8 C28 14, 18 20, 6 16 Z" fill="#4ade80" stroke="#166534" strokeWidth="1.6" />
        <path d="M5 16 C12 10, 18 9, 22 9" stroke="#14532d" strokeWidth="1.2" fill="none" />
        <path d="M4 16 Q1 22 3 28" stroke="#78350f" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>

      <ellipse cx="50" cy="54" rx="41" ry="39" fill={`url(#${gradId})`} filter="url(#headDropShadow)" />
      <ellipse cx="50" cy="48" rx="34" ry="24" fill={`url(#${gradId}-shine)`} opacity="0.35" />
      <path d="M18 56 Q50 72 82 56" stroke="rgba(255,255,255,0.18)" strokeWidth="5" fill="none" strokeLinecap="round" />

      <ellipse cx="37" cy="31" rx="14" ry="9" fill="#ffffff" opacity="0.45" transform="rotate(-18 37 31)" />
      <ellipse cx="24" cy="63" rx={isEating ? 8.5 : 6.5} ry={isEating ? 5.5 : 4.2} fill="#fb7185" opacity={isEating ? 0.95 : 0.75} />
      <ellipse cx="76" cy="63" rx={isEating ? 8.5 : 6.5} ry={isEating ? 5.5 : 4.2} fill="#fb7185" opacity={isEating ? 0.95 : 0.75} />

      <g transform="translate(33, 43)">
        <ellipse cx="0" cy="0" rx="9" ry={eyeRy} fill="#ffffff" stroke="#0f172a" strokeWidth="1.6" />
        <g className="worm-eye-pupil">
          <circle cx="2.2" cy={isEating ? 0.5 : 0} r={pupilR} fill="#0f172a" />
          <circle cx="0.2" cy="-2.2" r="2.6" fill="#ffffff" />
          <circle cx="3.6" cy="1.8" r="1.1" fill="#ffffff" opacity="0.9" />
        </g>
        {isHappy && <path d="M-6 1 Q0 -4 6 1" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />}
      </g>
      <g transform="translate(67, 43)">
        <ellipse cx="0" cy="0" rx="9" ry={eyeRy} fill="#ffffff" stroke="#0f172a" strokeWidth="1.6" />
        <g className="worm-eye-pupil">
          <circle cx="2.2" cy={isEating ? 0.5 : 0} r={pupilR} fill="#0f172a" />
          <circle cx="0.2" cy="-2.2" r="2.6" fill="#ffffff" />
          <circle cx="3.6" cy="1.8" r="1.1" fill="#ffffff" opacity="0.9" />
        </g>
        {isHappy && <path d="M-6 1 Q0 -4 6 1" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />}
      </g>

      {isEating ? (
        <g transform="translate(50, 71)">
          <ellipse cx="0" cy="0" rx="11" ry="8" fill="#450a0a" stroke="#0f172a" strokeWidth="1.5" />
          <ellipse cx="0" cy="2" rx="6" ry="3.5" fill="#fb7185" opacity="0.85" />
        </g>
      ) : isHappy ? (
        <path d="M36 70 Q50 83 64 70" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M41 67 Q50 75 59 67" stroke="#0f172a" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
}

// 2. Worm Body Segment
function WormSegmentSVG({ skinId = 'emerald', scale = 1, index = 0, skinColor = {} }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;
  const gradId = `segGrad-${skin.id}-${index}`;
  const stripe = index % 2 === 0;

  return (
    <svg className="worm-segment-svg-container" style={{ '--seg-scale': scale, '--seg-i': index }} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={gradId} cx="30%" cy="26%" r="70%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="55%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </radialGradient>
        <linearGradient id={`${gradId}-shade`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="56" rx="34" ry="16" fill="rgba(0,0,0,0.22)" />
      <circle cx="50" cy="50" r="42" fill={`url(#${gradId})`} />
      <circle cx="50" cy="50" r="42" fill={`url(#${gradId}-shade)`} />
      <path d={`M18 ${stripe ? 52 : 46} Q50 ${stripe ? 62 : 38} 82 ${stripe ? 52 : 46}`} stroke="rgba(255,255,255,0.22)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="37" cy="34" rx="14" ry="8" fill="#ffffff" opacity="0.38" transform="rotate(-22 37 34)" />
      <circle cx="50" cy="50" r="37" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
    </svg>
  );
}

// 3. Worm Tail Segment
function WormTailSVG({ skinId = 'emerald', skinColor = {} }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;
  const gradId = `tailGrad-${skin.id}`;

  return (
    <svg className="worm-tail-svg-container" viewBox="0 0 100 100">
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="55%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </radialGradient>
      </defs>
      <ellipse cx="46" cy="58" rx="24" ry="10" fill="rgba(0,0,0,0.2)" />
      <path d="M16 50 C18 26, 46 18, 74 34 C90 44, 90 58, 72 66 C46 80, 16 74, 16 50 Z" fill={`url(#${gradId})`} />
      <path d="M28 50 Q48 42 68 50" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="36" cy="43" r="7" fill="#ffffff" opacity="0.32" />
      <circle cx="72" cy="50" r="4" fill={highlight} opacity="0.5" />
    </svg>
  );
}

// 4. Luscious 3D Candy Apple with Sparkle
function JuicyAppleSVG({ collected = false }) {
  return (
    <svg className="apple-svg-container" viewBox="0 0 100 100" style={{ animation: collected ? 'none' : 'appleBreathingBob 2.5s ease-in-out infinite alternate' }}>
      <defs>
        <radialGradient id="appleBodyGrad" cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#ffd1d1" />
          <stop offset="25%" stopColor="#ff6b6b" />
          <stop offset="55%" stopColor="#ef4444" />
          <stop offset="85%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#6b1010" />
        </radialGradient>
        <linearGradient id="appleLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <radialGradient id="appleGlowAura" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="rgba(239,68,68,0.35)" />
          <stop offset="100%" stopColor="rgba(239,68,68,0)" />
        </radialGradient>
        <filter id="appleGlow">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#ef4444" floodOpacity="0.6" />
        </filter>
        <filter id="appleSparkle">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="50" cy="78" rx="26" ry="10" fill="url(#appleGlowAura)" />
      <path d="M50 28 Q55 15 63 10" stroke="#78350f" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M50 28 Q47 18 44 14" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />

      <g transform="translate(52, 12) rotate(8)">
        <path d="M2 12 C10 2, 28 2, 34 10 C36 18, 22 24, 4 16 Z" fill="url(#appleLeafGrad)" stroke="#14532d" strokeWidth="1.5" />
        <path d="M2 12 Q16 8 30 10" stroke="#14532d" strokeWidth="1.2" fill="none" opacity="0.8" />
        <path d="M10 11 Q14 14 18 16" stroke="#bbf7d0" strokeWidth="1" fill="none" opacity="0.6" />
      </g>

      <path
        d="M50 34 C28 34, 12 50, 12 69 C12 88, 30 96, 50 91 C70 96, 88 88, 88 69 C88 50, 72 34, 50 34 Z"
        fill="url(#appleBodyGrad)"
        filter="url(#appleGlow)"
      />
      <path d="M50 36 C40 36, 34 42, 34 50 C34 54, 38 56, 42 54 C46 50, 46 44, 50 44 C54 44, 54 50, 58 54 C62 56, 66 54, 66 50 C66 42, 60 36, 50 36 Z" fill="#7f1d1d" opacity="0.18" />

      <ellipse cx="32" cy="46" rx="10" ry="14" fill="#ffffff" opacity="0.28" transform="rotate(-18 32 46)" />
      <ellipse cx="30" cy="42" rx="4" ry="5" fill="#ffffff" opacity="0.55" />
      <circle cx="26" cy="52" r="2" fill="#ffffff" opacity="0.45" />

      <g className="apple-sparkle-star s1" transform="translate(16, 26)" style={{ animation: 'sparkleOrbit 3s ease-in-out infinite' }}>
        <polygon points="6,0 7.5,4 12,6 7.5,8 6,12 4.5,8 0,6 4.5,4" fill="#fef08a" filter="url(#appleSparkle)" />
      </g>
      <g className="apple-sparkle-star s2" transform="translate(76, 72)" style={{ animation: 'sparkleOrbit 3.4s ease-in-out infinite reverse' }}>
        <polygon points="5,0 6.5,3 10,5 6.5,7 5,10 3.5,7 0,5 3.5,3" fill="#fde68a" filter="url(#appleSparkle)" />
      </g>
      <g className="apple-sparkle-star s3" transform="translate(80, 28)" style={{ animation: 'sparkleOrbit 4.2s ease-in-out infinite' }}>
        <polygon points="4,0 5,2 8,4 5,6 4,8 3,6 0,4 3,2" fill="#fff7ed" filter="url(#appleSparkle)" opacity="0.9" />
      </g>
    </svg>
  );
}

// 5. Cosmic Galaxy Stargate Portal
function CosmicPortalSVG({ unlocked = false }) {
  return (
    <svg className={`portal-svg-container ${unlocked ? 'unlocked' : 'locked'}`} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="portalVoidGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={unlocked ? '#ffffff' : '#4c1d95'} />
          <stop offset="30%" stopColor={unlocked ? '#67e8f9' : '#312e81'} />
          <stop offset="60%" stopColor={unlocked ? '#8b5cf6' : '#0f172a'} />
          <stop offset="100%" stopColor="rgba(2,6,23,0.1)" />
        </radialGradient>
        <linearGradient id="portalRuneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="45%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
        <filter id="portalGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="50" cy="50" r="46" fill="none" stroke={unlocked ? 'url(#portalRuneGrad)' : '#334155'} strokeWidth="4" strokeDasharray={unlocked ? '12 5 4 5' : '7 7'} opacity={unlocked ? 1 : 0.7} filter={unlocked ? 'url(#portalGlow)' : 'none'} />
      <circle cx="50" cy="50" r="41" fill="none" stroke={unlocked ? '#e0f2fe' : '#475569'} strokeWidth="1.5" opacity="0.5" />
      <circle className="portal-pulse-ring" cx="50" cy="50" r="36" fill="url(#portalVoidGrad)" />

      {unlocked ? (
        <g className="portal-galaxy-spin" filter="url(#portalGlow)">
          <path d="M50 50 Q66 28 86 44" stroke="#22d3ee" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.95" />
          <path d="M50 50 Q34 72 14 56" stroke="#a78bfa" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.95" />
          <path d="M50 50 Q72 66 56 86" stroke="#fbbf24" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.85" />
          <path d="M50 50 Q28 34 44 14" stroke="#fb7185" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.85" />
          <circle cx="50" cy="50" r="10" fill="#ffffff" opacity="0.95" />
          <circle cx="50" cy="50" r="6" fill="#22d3ee" />
          <circle cx="66" cy="38" r="2" fill="#fff" />
          <circle cx="36" cy="62" r="1.8" fill="#fff" opacity="0.9" />
        </g>
      ) : (
        <g transform="translate(35, 33)" opacity="0.9">
          <rect x="4" y="12" width="22" height="17" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
          <path d="M8 12 V8 C8 3.5, 22 3.5, 22 8 V12" stroke="#cbd5e1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="15" cy="19" r="2.2" fill="#020617" />
          <rect x="14" y="20" width="2" height="4" rx="1" fill="#020617" />
        </g>
      )}
    </svg>
  );
}

// 6. 3D Carved Stone Wall
function StoneWallSVG() {
  return (
    <svg className="wall-svg-container" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="wallTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="45%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="wallEdgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.4" />
        </linearGradient>
        <filter id="wallShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.65" />
        </filter>
      </defs>

      <rect x="4" y="4" width="92" height="92" rx="12" fill="url(#wallTopGrad)" stroke="#0f172a" strokeWidth="3" filter="url(#wallShadow)" />
      <rect x="8" y="8" width="84" height="84" rx="9" fill="none" stroke="#e2e8f0" strokeWidth="1.2" opacity="0.22" />
      <path d="M10 28 H90 M10 52 H90 M10 76 H90" stroke="#0f172a" strokeWidth="1.2" opacity="0.28" />
      <path d="M32 10 V28 M68 28 V52 M45 52 V76 M58 76 V90 M24 52 V76" stroke="#0f172a" strokeWidth="1.2" opacity="0.22" />
      <rect x="12" y="12" width="76" height="76" rx="8" fill="url(#wallEdgeGrad)" opacity="0.35" />

      <g opacity="0.85">
        <path d="M50 22 L76 50 L50 78 L24 50 Z" stroke="#cbd5e1" strokeWidth="2.2" fill="rgba(56,189,248,0.08)" />
        <circle cx="50" cy="50" r="6.5" fill="#38bdf8" opacity="0.8" />
        <circle cx="50" cy="50" r="3" fill="#e0f2fe" opacity="0.9" />
        <line x1="50" y1="22" x2="50" y2="78" stroke="#cbd5e1" strokeWidth="1.4" opacity="0.55" />
        <line x1="24" y1="50" x2="76" y2="50" stroke="#cbd5e1" strokeWidth="1.4" opacity="0.55" />
      </g>
    </svg>
  );
}

// 7. Floating Particle Effect
function FloatingParticle({ x, y, color, size, duration, delay }) {
  const style = {
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    background: color,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  };
  return <span className="ambient-particle-dot" style={style} />;
}

// 8. Confetti Particle
function ConfettiParticle({ color, left, delay, duration, size }) {
  const style = {
    background: color,
    left,
    animationDelay: delay,
    animationDuration: duration,
    width: size,
    height: size,
  };
  return <span className="confetti-flake" style={style} />;
}

/* ===================================================
   MAIN APPLICATION
   =================================================== */
function App() {
  const [levelId, setLevelId] = useState(() => {
    const saved = localStorage.getItem('currentLevel');
    return saved ? Math.min(50, Math.max(1, Number(saved))) : 1;
  });
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('completedLevels'));
      return Array.isArray(saved) && saved.length ? saved : [1];
    } catch {
      return [1];
    }
  });
  const [levelProgress, setLevelProgress] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('levelProgress'));
      return saved && typeof saved === 'object' ? saved : {};
    } catch {
      return {};
    }
  });
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('coins');
    return saved !== null ? Number(saved) : 125;
  });
  const [sound, setSound] = useState(() => localStorage.getItem('sound') !== 'false');
  const [music, setMusic] = useState(() => localStorage.getItem('music') === 'true');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('reducedMotion') === 'true');
  const [history, setHistory] = useState([]);
  const [hint, setHint] = useState(false);
  const [solverHint, setSolverHint] = useState(null);
  const [notice, setNotice] = useState('');
  const [earnedStars, setEarnedStars] = useState(3);
  const [wormSkin, setWormSkin] = useState(() => localStorage.getItem('wormSkin') || 'emerald');
  const [ownedSkins, setOwnedSkins] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ownedSkins'));
      return Array.isArray(saved) ? saved : ['emerald'];
    } catch {
      return ['emerald'];
    }
  });
  const [bonusMoves, setBonusMoves] = useState(0);
  const [facing, setFacing] = useState('right');
  const [floatingScores, setFloatingScores] = useState([]);
  const [starPopStage, setStarPopStage] = useState(0);
  const [confettiParticles, setConfettiParticles] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wormExpression, setWormExpression] = useState('idle');
  const [particleBurst, setParticleBurst] = useState([]);
  const [screenShake, setScreenShake] = useState(false);
  const [levelIntro, setLevelIntro] = useState(false);

  // Modals & Screen States
  const [mapModal, setMapModal] = useState(false);
  const [leaderboardModal, setLeaderboardModal] = useState(false);
  const [shopModal, setShopModal] = useState(false);
  const [howToPlayModal, setHowToPlayModal] = useState(false);
  const [achievementsModal, setAchievementsModal] = useState(false);
  const [levelPreview, setLevelPreview] = useState(null);
  const [selectedWorldTab, setSelectedWorldTab] = useState(0);
  const [onboardingOpen, setOnboardingOpen] = useState(() => localStorage.getItem('onboardingSeen') !== '1');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('highContrast') === 'true');
  const [colorblindMode, setColorblindMode] = useState(() => localStorage.getItem('colorblindMode') === 'true');
  const [dailyRewardMsg, setDailyRewardMsg] = useState('');
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(() => localStorage.getItem('dailyRewardClaimedDate') === new Date().toISOString().slice(0,10));
  const [showHintPath, setShowHintPath] = useState(true);
  const [boardFx, setBoardFx] = useState({ trail: [], warp: false, impact: false, eat: false });

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Touch gesture tracking
  const touchStartRef = useRef({ x: 0, y: 0 });
  const moveTimeoutRef = useRef(null);
  const prevWormRef = useRef(null);
  const animFrameRef = useRef(null);

  const level = LEVELS[levelId - 1] || LEVELS[0];
  const [game, setGame] = useState(() => initialState(LEVELS[levelId - 1] || LEVELS[0]));
  const [renderWorm, setRenderWorm] = useState(() => (LEVELS[levelId - 1] || LEVELS[0]).worm.map(p => [...p]));
  const [moveTick, setMoveTick] = useState(0);

  // Current World
  const currentWorld = WORLDS.find(w => levelId >= w.range[0] && levelId <= w.range[1]) || WORLDS[0];
  const currentSkin = SKINS.find(s => s.id === wormSkin) || SKINS[0];

  // Persist guest progress to localStorage
  useEffect(() => {
    localStorage.setItem('coins', coins);
    localStorage.setItem('completedLevels', JSON.stringify(completed));
    localStorage.setItem('levelProgress', JSON.stringify(levelProgress));
    localStorage.setItem('currentLevel', levelId);
    localStorage.setItem('sound', String(sound));
    localStorage.setItem('music', String(music));
    localStorage.setItem('reducedMotion', String(reducedMotion));
    localStorage.setItem('highContrast', String(highContrast));
    localStorage.setItem('colorblindMode', String(colorblindMode));
    localStorage.setItem('wormSkin', wormSkin);
    localStorage.setItem('ownedSkins', JSON.stringify(ownedSkins));
  }, [coins, completed, levelProgress, levelId, sound, music, reducedMotion, highContrast, colorblindMode, wormSkin, ownedSkins]);

  useEffect(() => { hideSplash(); }, []);

  // Tile-to-tile worm interpolation
  useEffect(() => {
    if (reducedMotion) {
      setRenderWorm(game.worm.map(p => [...p]));
      return;
    }
    const prev = prevWormRef.current;
    if (!prev) {
      setRenderWorm(game.worm.map(p => [...p]));
      return;
    }
    const duration = 140;
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    const animate = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const k = ease(t);
      const nextWorm = game.worm.map((seg, i) => {
        const from = prev[i] || prev[prev.length - 1] || seg;
        return [from[0] + (seg[0] - from[0]) * k, from[1] + (seg[1] - from[1]) * k];
      });
      setRenderWorm(nextWorm);
      if (t < 1) animFrameRef.current = requestAnimationFrame(animate);
      else prevWormRef.current = null;
    };
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [moveTick, game.worm, reducedMotion]);

  // Fullscreen toggle & change detection
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const next = !prev;
      try {
        if (next) {
          const elem = document.documentElement;
          if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
          else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        } else {
          if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          }
        }
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const isNative = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isNative) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  // Ambient Music Toggle
  const toggleMusic = useCallback(() => {
    setMusic(prev => {
      const next = !prev;
      if (next) startBgm(true);
      else stopBgm();
      return next;
    });
  }, []);

  useEffect(() => {
    if (music) {
      const handleFirstInteraction = () => {
        startBgm(true);
        window.removeEventListener('pointerdown', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
      };
      window.addEventListener('pointerdown', handleFirstInteraction);
      window.addEventListener('keydown', handleFirstInteraction);
      return () => {
        window.removeEventListener('pointerdown', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
        stopBgm();
      };
    } else {
      stopBgm();
    }
  }, [music]);

  // Restore authenticated session on start
  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    const applyUser = (u) => {
      setUser(u);
      if (u.coins !== undefined) setCoins(u.coins);
      if (u.completedLevels && u.completedLevels.length) {
        setCompleted(prev => Array.from(new Set([...prev, ...u.completedLevels, u.currentLevel || 1])));
        setLevelId(prev => Math.max(prev, u.currentLevel || 1));
      }
      if (u.ownedSkins && u.ownedSkins.length) {
        setOwnedSkins(prev => Array.from(new Set([...prev, ...u.ownedSkins])));
      }
      if (u.levelProgress && typeof u.levelProgress === 'object') {
        setLevelProgress(prev => ({ ...u.levelProgress, ...prev }));
      }
      if (u.settings && typeof u.settings === 'object') {
        if (typeof u.settings.sound === 'boolean') setSound(u.settings.sound);
        if (typeof u.settings.music === 'boolean') setMusic(u.settings.music);
        if (typeof u.settings.reducedMotion === 'boolean') setReducedMotion(u.settings.reducedMotion);
      }
      if (u.dailyRewardClaimedAt) {
        const claimed = String(u.dailyRewardClaimedAt).slice(0,10) === new Date().toISOString().slice(0,10);
        setDailyRewardClaimed(claimed);
        if (claimed) localStorage.setItem('dailyRewardClaimedDate', new Date().toISOString().slice(0,10));
      }
    };
    fetch(`${API_URL}/player/sync`, { headers })
      .then(res => res.ok ? res.json() : fetch(`${API_URL}/auth/me`, { headers }).then(r => r.ok ? r.json() : Promise.reject()))
      .then(data => { if (data.user) applyUser(data.user); })
      .catch(() => fetch(`${API_URL}/auth/me`, { headers }).then(r => r.ok ? r.json() : Promise.reject()).then(data => { if (data.user) applyUser(data.user); }).catch(() => {
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
      }));
  }, [token]);

  const claimDailyReward = useCallback(async () => {
    if (!token) { setDailyRewardMsg('Sign in to claim daily rewards.'); setNotice('Sign in to claim daily rewards.'); return; }
    try {
      const res = await fetch(`${API_URL}/player/daily-reward`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        if (data.claimed) {
          setCoins(data.coins ?? coins);
          setDailyRewardClaimed(true);
          localStorage.setItem('dailyRewardClaimedDate', new Date().toISOString().slice(0,10));
          setDailyRewardMsg(data.message || `+${data.reward} coins claimed!`);
          setNotice(data.message || `Daily reward: +${data.reward} coins`);
          playSound('boost', sound);
        } else {
          setDailyRewardClaimed(true);
          localStorage.setItem('dailyRewardClaimedDate', new Date().toISOString().slice(0,10));
          setDailyRewardMsg(data.message || 'Already claimed today.');
        }
      } else {
        setDailyRewardMsg(data.error || 'Could not claim reward.');
      }
    } catch {
      setDailyRewardMsg('Network error claiming reward.');
    }
  }, [token, coins, sound]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(() => {
    setLeaderboardLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API_URL}/player/leaderboard`, { headers })
      .then(res => res.json())
      .then(data => {
        if (data.leaderboard) setLeaderboard(data.leaderboard);
        if (data.myRank) setMyRank(data.myRank);
      })
      .catch(() => {})
      .finally(() => setLeaderboardLoading(false));
  }, [token]);

  useEffect(() => {
    if (leaderboardModal) fetchLeaderboard();
  }, [leaderboardModal, fetchLeaderboard]);

  // Screen shake effect
  const triggerScreenShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  }, []);

  // Particle burst effect
  const triggerParticleBurst = useCallback((x, y, color) => {
    const particles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      color,
      size: 4 + Math.random() * 6,
      duration: 0.6 + Math.random() * 0.4,
      angle: Math.random() * 360,
      distance: 30 + Math.random() * 50,
    }));
    setParticleBurst(prev => [...prev, ...particles]);
    setTimeout(() => {
      setParticleBurst(prev => prev.filter(p => !particles.includes(p)));
    }, 1000);
  }, []);

  const startLevel = useCallback(id => {
    const targetLvl = LEVELS[id - 1] || LEVELS[0];
    setLevelId(id);
    const init = initialState(targetLvl);
    setGame(init);
    setRenderWorm(init.worm.map(p => [...p]));
    prevWormRef.current = null;
    setBonusMoves(0);
    setHistory([]);
    setHint(false);
    setSolverHint(null);
    setNotice('');
    setFacing('right');
    setWormExpression('idle');
    setStarPopStage(0);
    setConfettiParticles([]);
    setBoardFx({ trail: [], warp: false, impact: false, eat: false });
    setLevelPreview(null);
    setMapModal(false);
    setLevelIntro(true);
    setTimeout(() => setLevelIntro(false), reducedMotion ? 0 : 900);
    playSound('click', sound);
  }, [sound, reducedMotion]);

  // Spawn celebratory confetti
  const triggerConfetti = useCallback(() => {
    const colors = ['#10b981', '#fbbf24', '#38bdf8', '#c084fc', '#f43f5e', '#ffffff', '#4ade80', '#f472b6'];
    const particles = Array.from({ length: 60 }).map((_, idx) => ({
      id: idx,
      color: colors[idx % colors.length],
      left: Math.random() * 96 + '%',
      delay: Math.random() * 0.5 + 's',
      duration: (1.5 + Math.random() * 1.5) + 's',
      size: (6 + Math.random() * 10) + 'px'
    }));
    setConfettiParticles(particles);
  }, []);

  // Apply a move in the chosen direction
  const move = useCallback(dir => {
    setGame(old => {
      if (old.status !== 'playing') return old;

      // Ignore direct reverse into the neck (common snake behavior)
      if (old.worm.length >= 2) {
        const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
        if (delta) {
          const nextHead = [old.worm[0][0] + delta[0], old.worm[0][1] + delta[1]];
          if (same(nextHead, old.worm[1])) return old;
        }
      }

      setFacing(dir);
      setWormExpression('moving');
      prevWormRef.current = old.worm.map(p => [...p]);
      setHistory(h => [...h.slice(-35), old]);
      setSolverHint(null);

      const effectiveLevel = { ...level, moveLimit: level.moveLimit + bonusMoves };
      const next = step(old, dir, effectiveLevel);
      if (next === old) return old;
      setMoveTick(t => t + 1);
      setBoardFx(fx => ({ ...fx, trail: [old.worm[0], ...(fx.trail || [])].slice(0, 6) }));

      // Apple collection audio & popup
      const didEat = next.apples.length < old.apples.length;
      if (didEat) {
        playSound('eat', sound);
        setWormExpression('eating');
        setBoardFx(fx => ({ ...fx, eat: true }));
        setTimeout(() => setBoardFx(fx => ({ ...fx, eat: false })), 420);
        const eatenApple = old.apples.find(a => same(a, next.worm[0]));
        if (eatenApple) {
          const scoreId = Date.now() + Math.random();
          setFloatingScores(prev => [...prev, { id: scoreId, x: eatenApple[0], y: eatenApple[1], text: '+10' }]);
          triggerParticleBurst(
            (eatenApple[0] / level.size) * 100 + (100 / (level.size * 2)),
            (eatenApple[1] / level.size) * 100,
            '#fbbf24'
          );
          setTimeout(() => {
            setFloatingScores(prev => prev.filter(s => s.id !== scoreId));
          }, 850);
        }
        // Portal open notice handled in render when all apples are collected
        if (next.apples.length === 0) {
          playSound('portalOpen', sound);
        } else {
          setNotice(`Apple collected! ${next.apples.length} remaining.`);
        }
        // Reset expression after eating
        setTimeout(() => setWormExpression('happy'), 150);
        setTimeout(() => setWormExpression('idle'), 800);
      }

      if (next.status === 'completed') {
        const stars = calculateStars(next.moves, level.moveLimit + bonusMoves, level.parMoves);
        setEarnedStars(stars);
        playSound('complete', sound);
        triggerConfetti();
        triggerScreenShake();
        setBoardFx(fx => ({ ...fx, warp: true }));
        setTimeout(() => setBoardFx(fx => ({ ...fx, warp: false })), 900);

        // Stagger star pops
        setStarPopStage(0);
        setTimeout(() => { setStarPopStage(1); playSound('star', sound); }, 220);
        setTimeout(() => { if (stars >= 2) { setStarPopStage(2); playSound('star', sound); } }, 480);
        setTimeout(() => { if (stars >= 3) { setStarPopStage(3); playSound('star', sound); } }, 740);

        setCompleted(prev => (prev.includes(levelId + 1) ? prev : [...prev, Math.min(50, levelId + 1)]));
        setCoins(c => c + 25);
        setLevelProgress(prev => {
          const oldp = prev[levelId] || {};
          return {
            ...prev,
            [levelId]: {
              bestStars: Math.max(oldp.bestStars || 0, stars),
              bestMoves: oldp.bestMoves ? Math.min(oldp.bestMoves, next.moves) : next.moves,
              bestScore: Math.max(oldp.bestScore || 0, next.score),
            }
          };
        });

        // Sync with backend MongoDB if logged in
        if (token) {
          fetch(`${API_URL}/player/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ levelId, score: next.score, moves: next.moves, stars })
          })
            .then(res => res.ok ? res.json() : null)
            .then(saved => {
              if (saved) {
                setCoins(saved.coins);
                if (saved.completedLevels) {
                  setCompleted(prev => Array.from(new Set([...prev, ...saved.completedLevels, saved.currentLevel])));
                }
                if (saved.ownedSkins) {
                  setOwnedSkins(prev => Array.from(new Set([...prev, ...saved.ownedSkins])));
                }
              }
            })
            .catch(() => {});
        }
      } else if (next.status === 'failed') {
        playSound('fail', sound);
        setNotice(next.reason);
        triggerScreenShake();
        setWormExpression('idle');
        setBoardFx(fx => ({ ...fx, impact: true }));
        setTimeout(() => setBoardFx(fx => ({ ...fx, impact: false })), 520);
      } else if (!didEat) {
        playSound('move', sound);
        // Reset expression after move
        setTimeout(() => setWormExpression('idle'), 100);
      }

      return next;
    });
  }, [level, levelId, sound, token, bonusMoves, triggerConfetti, triggerParticleBurst, triggerScreenShake]);

  // Touch Swipe Handlers for mobile & tablet
  const handleTouchStart = e => {
    if (e.touches && e.touches.length > 0) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = e => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 24) {
      if (absX > absY) move(dx > 0 ? 'right' : 'left');
      else move(dy > 0 ? 'down' : 'up');
    }
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const onKey = e => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      const map = {
        ArrowUp: 'up', w: 'up', W: 'up',
        ArrowDown: 'down', s: 'down', S: 'down',
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right'
      };

      if (map[e.key]) {
        move(map[e.key]);
      } else if (e.key === 'z' || e.key === 'Z' || e.key === 'u' || e.key === 'U') {
        undo();
      } else if (e.key === 'r' || e.key === 'R') {
        restart();
      } else if (e.key === 'h' || e.key === 'H') {
        triggerSmartHint();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMusic();
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (game.status === 'completed') startLevel(Math.min(50, levelId + 1));
        else if (game.status === 'failed') restart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, game.status, levelId, startLevel, toggleFullscreen, toggleMusic]);

  const undo = () => {
    if (!history.length) return;
    playSound('click', sound);
    const prev = history[history.length - 1];
    setGame(prev);
    setRenderWorm(prev.worm.map(p => [...p]));
    prevWormRef.current = null;
    setHistory(h => h.slice(0, -1));
    setSolverHint(null);
  };

  const restart = () => {
    playSound('click', sound);
    startLevel(levelId);
  };

  const buyBoost = () => {
    if (coins < 30) {
      setNotice('Need at least 30 coins for an Apple Boost (+5 moves)!');
      return;
    }
    setCoins(c => c - 30);
    setBonusMoves(b => b + 5);
    playSound('boost', sound);
    setNotice('Apple Boost activated: +5 bonus moves added!');

    if (token) {
      fetch(`${API_URL}/player/wallet/spend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: 30, item: 'APPLE_BOOST' })
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.coins !== undefined) setCoins(data.coins);
        })
        .catch(() => {});
    }
  };

  const triggerSmartHint = () => {
    setHint(true);
    const effectiveLevel = { ...level, moveLimit: level.moveLimit + bonusMoves };
    const hintResult = findNextHint(game, effectiveLevel);
    if (hintResult) {
      setSolverHint(hintResult);
      playSound('eat', sound);
      setNotice(`BFS Guide: Head ${hintResult.nextDirection.toUpperCase()} toward ${hintResult.targetLabel} (${hintResult.distance} steps away).`);
    } else {
      setNotice('Watch your body carefully so you do not corner yourself!');
    }
  };

  // Auth submission
  const handleAuthSubmit = async e => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const isReg = authModal === 'register';
    const endpoint = isReg ? `${API_URL}/auth/register` : `${API_URL}/auth/login`;
    const payload = isReg
      ? { name: authForm.name, email: authForm.email, password: authForm.password }
      : { email: authForm.email, password: authForm.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      if (data.user.coins !== undefined) setCoins(data.user.coins);
      if (data.user.completedLevels && data.user.completedLevels.length) {
        setCompleted(prev => Array.from(new Set([...prev, ...data.user.completedLevels, data.user.currentLevel])));
        setLevelId(data.user.currentLevel || 1);
      }
      if (data.user.ownedSkins && data.user.ownedSkins.length) {
        setOwnedSkins(prev => Array.from(new Set([...prev, ...data.user.ownedSkins])));
      }
      setAuthModal(null);
      setNotice(`Welcome, ${data.user.name}! Cloud sync active.`);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setAuthModal(null);
    setNotice('Logged out. Playing in guest mode.');
  };

  const buySkin = (skinId) => {
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin || ownedSkins.includes(skinId)) return;

    if (coins < skin.price) {
      setNotice(`Need ${skin.price} coins to unlock ${skin.name}!`);
      return;
    }

    setCoins(c => c - skin.price);
    setOwnedSkins(prev => [...prev, skinId]);
    setWormSkin(skinId);
    playSound('boost', sound);
    setNotice(`Unlocked ${skin.name}!`);

    if (token) {
      fetch(`${API_URL}/player/wallet/spend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: skin.price, item: `SKIN_${skinId.toUpperCase()}` })
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.coins !== undefined) setCoins(data.coins);
        })
        .catch(() => {});
    }
  };

  const selectSkin = (skinId) => {
    if (ownedSkins.includes(skinId)) {
      setWormSkin(skinId);
      playSound('click', sound);
      setNotice(`Equipped ${SKINS.find(s => s.id === skinId)?.name}!`);
      setShopModal(false);
    }
  };

  const board = useMemo(
    () => Array.from({ length: level.size * level.size }, (_, i) => [i % level.size, Math.floor(i / level.size)]),
    [level]
  );

  const cellClass = p => {
    let c = 'garden-tile-cell';
    if (level.walls.some(w => same(w, p))) c += ' wall';
    if ((game.keys || level.keys || []).some(k => same(k, p))) c += ' key-tile';
    if ((game.doors || level.doors || []).some(d => same(d, p))) c += ' door-tile';
    if ((level.hazards || []).some(h => same(h, p))) c += ' hazard-tile';
    if ((game.movingBlocks || level.movingBlocks || []).some(b => same(b, p))) c += ' block-tile';
    if (game.worm.some(w => same(w, p))) c += ' worm';
    if (game.worm.length && same(game.worm[0], p)) c += ' head';
    if (game.apples.some(a => same(a, p))) c += ' apple';
    if (same(level.portal, p)) c += ' portal';
    if (hint && game.apples.length && same(game.apples[0], p)) c += ' hinted';
    if (showHintPath && solverHint && solverHint.path && solverHint.path.some(pt => same(pt, p))) c += ' hint-path hint-path-anim';
    if (boardFx?.trail?.some(t => same(t, p))) c += ' worm-trail';
    return c;
  };

  const isHead = p => game.worm.length && same(game.worm[0], p);
  const isApple = p => game.apples.some(a => same(a, p));

  // Failure type diagnostics
  const failureType = useMemo(() => {
    if (game.status !== 'failed') return null;
    const r = game.reason.toLowerCase();
    if (r.includes('wall')) return { type: 'wall', title: 'Stone Barrier Collision!', tip: 'Stone walls are unyielding. Use open corners to redirect your trajectory.' };
    if (r.includes('tail') || r.includes('body')) return { type: 'body', title: 'Tangled Slither!', tip: 'Your worm only grows longer when consuming apples. Calculate your loops before eating!' };
    if (r.includes('garden') || r.includes('beyond')) return { type: 'boundary', title: 'Garden Edge Reached!', tip: 'Stay within the garden borders. Keep your slither centered when turning.' };
    return { type: 'moves', title: 'Move Limit Exceeded!', tip: 'Find shorter paths with fewer unnecessary detours, or use an Apple Boost (+5 moves)!' };
  }, [game.status, game.reason]);

  const totalStarsEarned = useMemo(
    () => Object.values(levelProgress).reduce((sum, p) => sum + (p.bestStars || 0), 0),
    [levelProgress]
  );

  const achievements = useMemo(() => {
    const completedCount = Object.keys(levelProgress).length;
    const perfectLevels = Object.values(levelProgress).filter(p => p.bestStars === 3).length;
    const worldClears = WORLDS.filter(w => LEVELS.slice(w.range[0] - 1, w.range[1]).every(l => (levelProgress[l.id]?.bestStars || 0) > 0)).length;
    return [
      { id: 'first-step', title: 'First Bite', desc: 'Complete any level', icon: 'ðŸŽ', unlocked: completedCount >= 1 },
      { id: 'garden-10', title: 'Garden Explorer', desc: 'Complete 10 levels', icon: 'ðŸŒ¿', unlocked: completedCount >= 10 },
      { id: 'garden-25', title: 'Trailblazer', desc: 'Complete 25 levels', icon: 'ðŸ§­', unlocked: completedCount >= 25 },
      { id: 'garden-50', title: 'Realm Master', desc: 'Complete all 50 levels', icon: 'ðŸ†', unlocked: completedCount >= 50 },
      { id: 'perfect-5', title: 'Precision', desc: 'Earn 3 stars on 5 levels', icon: 'â­', unlocked: perfectLevels >= 5 },
      { id: 'perfect-20', title: 'Perfectionist', desc: 'Earn 3 stars on 20 levels', icon: 'âœ¨', unlocked: perfectLevels >= 20 },
      { id: 'world-clear', title: 'World Conqueror', desc: 'Clear every level in any realm', icon: 'ðŸ—ºï¸', unlocked: worldClears >= 1 },
      { id: 'collector', title: 'Skin Collector', desc: 'Own 3 or more worm skins', icon: 'ðŸŽ¨', unlocked: ownedSkins.length >= 3 },
      { id: 'wealthy', title: 'Coin Hoarder', desc: 'Hold 300+ coins', icon: 'ðŸª™', unlocked: coins >= 300 },
      { id: 'star-50', title: 'Stargazer', desc: 'Earn 50 total stars', icon: 'ðŸŒŸ', unlocked: totalStarsEarned >= 50 },
    ];
  }, [levelProgress, ownedSkins.length, coins, totalStarsEarned]);

  const dailyChallenge = useMemo(() => {
    const day = Math.floor(Date.now() / 86400000);
    const pick = LEVELS[day % LEVELS.length];
    const bonus = 15 + (day % 20);
    return { levelId: pick.id, title: pick.title, worldName: pick.worldName, bonus };
  }, []);

  // Live star calculation
  const liveStars = useMemo(() => {
    return calculateStars(game.moves, level.moveLimit + bonusMoves, level.parMoves);
  }, [game.moves, level.moveLimit, level.parMoves, bonusMoves]);

  const moveProgress = useMemo(() => {
    const limit = level.moveLimit + bonusMoves;
    const used = Math.min(game.moves, limit);
    const par = level.parMoves || Math.ceil(limit * 0.55);
    return { pct: (used / Math.max(1, limit)) * 100, parPct: (par / Math.max(1, limit)) * 100 };
  }, [game.moves, level.moveLimit, bonusMoves, level.parMoves]);

  // Filtered levels for saga map
  const displayedLevels = useMemo(() => {
    if (selectedWorldTab === 0) return LEVELS;
    return LEVELS.filter(l => l.worldId === selectedWorldTab);
  }, [selectedWorldTab]);

  // Ambient particles for background
  const ambientMotes = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      left: `${(i * 17) % 100}%`,
      color: currentWorld.color,
      size: 4 + (i % 6) * 3,
      duration: 8 + (i % 8) * 2,
      delay: (i % 6) * 1.3,
    }));
  }, [currentWorld.color]);

  // Ambient orbs
  const ambientOrbs = useMemo(() => [
    { color: currentWorld.color, top: '-100px', left: '-100px', size: 400 },
    { color: currentWorld.color === '#10b981' ? '#38bdf8' : currentWorld.color === '#f59e0b' ? '#a855f7' : '#ec4899', bottom: '-50px', right: '-50px', size: 300 },
    { color: currentWorld.color === '#38bdf8' ? '#fbbf24' : currentWorld.color === '#a855f7' ? '#10b981' : '#38bdf8', top: '30%', left: '50%', size: 250 },
  ], [currentWorld.color]);

  const moveBudgetState = moveProgress.pct >= 100 ? 'danger' : moveProgress.pct >= 85 ? 'warn' : moveProgress.pct >= moveProgress.parPct ? 'caution' : 'safe';
  const boardScale = level.size >= 11 ? 0.9 : level.size >= 9 ? 0.96 : 1;

  return (
    <div
      className={`game-master-container ${screenShake ? 'screen-shake' : ''} ${reducedMotion ? 'reduced-motion' : ''} ${highContrast ? 'high-contrast' : ''} ${colorblindMode ? 'colorblind' : ''} ${levelIntro ? 'level-intro' : ''} ${boardFx.warp ? 'fx-warp' : ''} ${boardFx.impact ? 'fx-impact' : ''} ${boardFx.eat ? 'fx-eat' : ''}`}
      data-world={currentWorld.id}
      data-budget={moveBudgetState}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >


      {/* AMBIENT LAYERS */}
      <div className="ambient-layers" aria-hidden="true">
        <div className="ambient-layer ambient-orbs-layer" style={{ '--orb-color-1': ambientOrbs[0].color, '--orb-color-2': ambientOrbs[1].color, '--orb-color-3': ambientOrbs[2].color }}>
          {ambientOrbs.slice(0, 2).map((orb, i) => (
            <div key={i} className="ambient-orb" style={{ ...orb }} />
          ))}
        </div>
      </div>

      {/* TOP BAR - restructured */}
      <header className="game-arcade-hud redesigned-hud">
        <div className="hud-top-row">
          <button className="hud-level-chip" onClick={() => setMapModal(true)} title="Levels & realms">
            <span className="hud-level-dot" style={{ background: currentWorld.color }} />
            <span className="hud-level-text"><strong>Level {levelId}</strong> <small>{currentWorld.name}</small></span>
          </button>

          <div className="hud-stats-row">
            <div className="hud-stat" title="Moves used / limit (par)">
              <span className="hud-stat-label">Moves</span>
              <span className="hud-stat-value">{game.moves}<small>/{level.moveLimit + bonusMoves}</small></span>
            </div>
            <div className="hud-stat" title="Apples remaining">
              <Apple size={14} />
              <span className="hud-stat-value">{game.apples.length}</span>
            </div>
            <div className="hud-stat stars" title="Current star rating">
              <span className={`star-icon-unit ${liveStars >= 1 ? 'earned' : ''}`}>★</span>
              <span className={`star-icon-unit ${liveStars >= 2 ? 'earned' : ''}`}>★</span>
              <span className={`star-icon-unit ${liveStars >= 3 ? 'earned' : ''}`}>★</span>
            </div>
          </div>

          <div className="hud-actions-compact">
            <div className="coin-badge-pill compact" title="Coins"><Coins size={14} /><span>{coins}</span></div>
            <button className={`hud-action-icon-btn ${sound ? 'active' : ''}`} onClick={() => setSound(!sound)} title="Sound">{sound ? <Volume2 size={15} /> : <VolumeX size={15} />}</button>
            <button className="hud-action-icon-btn" onClick={() => setShopModal(true)} title="Shop"><ShoppingBag size={15} /></button>
            <button className="hud-action-icon-btn" onClick={() => setAchievementsModal(true)} title="Badges"><Award size={15} /></button>
            <button className="hud-action-icon-btn hud-user-avatar" onClick={() => setAuthModal(user ? 'profile' : 'login')} title={user ? user.name : 'Sign in'}>{user ? user.name[0].toUpperCase() : <UserIcon size={14} />}</button>
          </div>
        </div>
        <div className="hud-progress-strip" aria-hidden="true">
          <div className="hud-progress-track">
            <span className="hud-progress-fill" style={{ width: `${moveProgress.pct}%` }} />
            <span className="hud-progress-par" style={{ left: `${moveProgress.parPct}%` }} />
          </div>
          <span className="hud-progress-meta">Par {level.parMoves} · {totalStarsEarned}/150 ★</span>
        </div>
      </header>

      {/* NOTICE TOAST */}
            {game.apples.length === 0 ? (
              <div className="notice-banner-pill notice-success" key="portal-open">
                <Sparkles size={16} /> <span>All apples collected! The portal is open.</span>
              </div>
            ) : notice && game.status === 'playing' ? (
              <div className="notice-banner-pill">
                <span>{notice}</span>
                <button className="toast-dismiss" onClick={() => setNotice('')}>×</button>
              </div>
            ) : null}

      {/* SOLVER HINT BANNER */}
          {solverHint && (
            <div className="solver-hint-pill">
              <Compass size={16} style={{ color: '#38bdf8' }} />
              <span>Suggested: Slither <b>{solverHint.nextDirection.toUpperCase()}</b> ({solverHint.distance} steps to {solverHint.targetLabel})</span>
              <button className="toast-dismiss" onClick={() => setSolverHint(null)}>×</button>
            </div>
          )}

      {/* PARTICLE BURSTS */}
      {particleBurst.map(p => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.color,
            pointerEvents: 'none',
            zIndex: 55,
            animation: `particleBurstAnim ${p.duration}s ease-out forwards`,
            transform: `rotate(${p.angle}deg) translateX(${p.distance}px)`,
          }}
        >
        </div>
      ))}

      {/* CENTER STAGE: 3D FLOATING GARDEN ISLAND */}
      <main className="game-play-stage">
        <div className="garden-board-wrapper">
          {/* Floating score popups */}
          {floatingScores.map(s => {
            const pctX = (s.x / level.size) * 100 + (100 / (level.size * 2));
            const pctY = (s.y / level.size) * 100;
            return (
              <div key={s.id} className="floating-points-toast" style={{ left: `${pctX}%`, top: `${pctY}%` }}>
                {s.text}
              </div>
            );
          })}

          <div
            className="garden-floating-island"
            data-world={currentWorld.id}
          >
            <div className="garden-matrix-grid" style={{ '--grid-size': level.size }}>
              {board.map((p, i) => {
                const decorSeed = (i * 9301 + 49297) % 233280;
                const decor = decorSeed / 233280;
                const isWallCell = level.walls.some(w => same(w, p));
                const isPortalCell = same(level.portal, p);
                const isAppleCell = isApple(p);
                const isKeyCell = (game.keys || []).some(k => same(k, p));
                const isDoorCell = (game.doors || []).some(d => same(d, p));
                const isHazardCell = (level.hazards || []).some(h => same(h, p));
                const isBlockCell = (game.movingBlocks || level.movingBlocks || []).some(b => same(b, p));
                const isEmpty = !isWallCell && !isPortalCell && !isAppleCell && !isKeyCell && !isDoorCell && !isHazardCell && !isBlockCell && !game.worm.some(w => same(w, p));
                const showDecor = isEmpty && decor > 0.78;
                const justCollected = false;
                let c = 'garden-tile-cell';
                if (isWallCell) c += ' wall';
                if (isKeyCell) c += ' key-tile';
                if (isDoorCell) c += ' door-tile';
                if (isHazardCell) c += ' hazard-tile';
                if (isBlockCell) c += ' block-tile';
                if (isAppleCell) c += ' apple';
                if (isPortalCell) c += ' portal';
                if (hint && game.apples.length && same(game.apples[0], p)) c += ' hinted';
                if (showHintPath && solverHint && solverHint.path && solverHint.path.some(pt => same(pt, p))) c += ' hint-path hint-path-anim';
                if (boardFx?.trail?.some(t => same(t, p))) c += ' worm-trail';

                return (
                  <div key={i} className={c + (showDecor ? ' has-decor' : '')}>
                    {showDecor && <span className={`tile-decor decor-${currentWorld.id} d-${Math.floor(decor * 4)}`} aria-hidden="true" />}
                    {boardFx?.trail?.some(t => same(t, p)) && <span className="tile-trail-fx" aria-hidden="true" />}
                    {isAppleCell ? (
                      <JuicyAppleSVG collected={justCollected} />
                    ) : isPortalCell ? (
                      <CosmicPortalSVG unlocked={game.apples.length === 0} />
                    ) : isKeyCell ? (
                      <span className="mechanic-icon key-icon" title="Key"><KeyRound size={18} /></span>
                    ) : isDoorCell ? (
                      <span className="mechanic-icon door-icon" title="Locked Gate"><LockKeyhole size={18} /></span>
                    ) : isHazardCell ? (
                      <span className="mechanic-icon hazard-icon" title="Hazard"><Flame size={18} /></span>
                    ) : isBlockCell ? (
                      <span className="mechanic-icon block-icon" title="Block"><ShieldCheck size={18} /></span>
                    ) : isWallCell ? (
                      <StoneWallSVG />
                    ) : null}
                  </div>
                );
              })}
              <div className="worm-overlay-layer" aria-hidden="true">
                {renderWorm.map((seg, idx) => {
                  const x = (seg[0] / level.size) * 100;
                  const y = (seg[1] / level.size) * 100;
                  const isHeadSeg = idx === 0;
                  const isTailSeg = idx === renderWorm.length - 1 && idx > 0;
                  return (
                    <div key={`w-${idx}`} className={`worm-overlay-seg ${isHeadSeg ? 'head' : ''} ${isTailSeg ? 'tail' : ''}`} style={{ left: `${x}%`, top: `${y}%`, width: `${100 / level.size}%`, height: `${100 / level.size}%`, zIndex: 30 - idx }}>
                      {isHeadSeg ? (
                        <WormHeadSVG facing={facing} skinId={wormSkin} expression={wormExpression} skinColor={currentSkin} />
                      ) : isTailSeg ? (
                        <WormTailSVG skinId={wormSkin} skinColor={currentSkin} />
                      ) : (
                        <WormSegmentSVG skinId={wormSkin} scale={Math.max(0.7, 1 - (idx * 0.035))} index={idx} skinColor={currentSkin} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM FLOATING ACTION DOCK */}
      <footer className="game-bottom-dock">
        <div className="dock-controls-left">
          <button className="dock-action-btn" onClick={undo} disabled={!history.length} title="Undo last move (Z)">
            <Undo2 size={16} /> <span>UNDO</span>
          </button>
          <button className="dock-action-btn" onClick={restart} title="Restart Garden (R)">
            <RotateCcw size={16} /> <span>RESET</span>
          </button>
          <button className="dock-action-btn hint-btn" onClick={triggerSmartHint} title="Show hint (H)">
            <Lightbulb size={16} /> <span>HINT</span>
          </button>
        </div>

        {/* Virtual Ergonomic D-Pad */}
        <div className="virtual-dpad-cluster" onTouchStart={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}>
          <button type="button" className="dpad-direction-button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); move('up'); }} aria-label="Move Up">
            <ArrowUp size={22} />
          </button>
          <div className="dpad-row-keys">
            <button type="button" className="dpad-direction-button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); move('left'); }} aria-label="Move Left">
              <ArrowLeft size={22} />
            </button>
            <button type="button" className="dpad-direction-button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); move('down'); }} aria-label="Move Down">
              <ArrowDown size={22} />
            </button>
            <button type="button" className="dpad-direction-button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); move('right'); }} aria-label="Move Right">
              <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </footer>

      {/* CELEBRATION CONFETTI STAGE */}
      {game.status === 'completed' && (
        <div className="celebration-confetti-stage">
          {confettiParticles.map(p => (
            <ConfettiParticle key={p.id} {...p} />
          ))}
        </div>
      )}

      {/* VICTORY CELEBRATION MODAL */}
      {game.status === 'completed' && (
        <div className="game-modal-backdrop">
          <div className="game-modal-panel victory-celebration-dialog">
            <div className="victory-trophy-pedestal">
              <Trophy size={50} />
            </div>

            <span style={{ color: '#34d399', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em' }}>
              {currentWorld.name.toUpperCase()} • LEVEL {levelId}
            </span>

            <h2 className="modal-prominent-title">Garden Cleared!</h2>

            <div className="podium-stars-trio">
              <div className={`star-podium-slot ${starPopStage >= 1 ? 'earned' : ''}`}>
                <Star size={36} fill={starPopStage >= 1 ? '#78350f' : 'none'} />
              </div>
              <div className={`star-podium-slot tall-center ${starPopStage >= 2 ? 'earned' : ''}`}>
                <Star size={48} fill={starPopStage >= 2 ? '#78350f' : 'none'} />
              </div>
              <div className={`star-podium-slot ${starPopStage >= 3 ? 'earned' : ''}`}>
                <Star size={36} fill={starPopStage >= 3 ? '#78350f' : 'none'} />
              </div>
            </div>

            <div className="stats-summary-grid">
              <div className="summary-metric-card">
                <small>MOVES</small>
                <strong>{game.moves} / {level.parMoves} par</strong>
              </div>
              <div className="summary-metric-card bonus">
                <small>COIN REWARD</small>
                <strong>+25 <Coins size={14} style={{ verticalAlign: 'middle' }} /></strong>
              </div>
              <div className="summary-metric-card">
                <small>SCORE</small>
                <strong>+{game.score}</strong>
              </div>
              <div className="summary-metric-card">
                <small>BEST STARS</small>
                <strong style={{ color: '#fbbf24' }}>{'★'.repeat(levelProgress[levelId]?.bestStars || earnedStars) || '—'}</strong>
              </div>
              <div className="summary-metric-card">
                <small>BEST MOVES</small>
                <strong>{levelProgress[levelId]?.bestMoves || game.moves}</strong>
              </div>
              <div className="summary-metric-card">
                <small>TOTAL STARS</small>
                <strong style={{ color: '#fbbf24' }}>{totalStarsEarned}/150</strong>
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 22 }}>
              {game.moves <= level.parMoves
                ? 'ðŸŒŸ Flawless precision! You matched the master Par moves target.'
                : 'Well played! Slither into the next garden or replay to earn 3 stars.'}
            </p>

            <div className="modal-btn-row">
              <button
                className="modal-primary-btn"
                onClick={() => startLevel(Math.min(50, levelId + 1))}
              >
                Next Level <ChevronRight size={18} />
              </button>
              <button className="modal-secondary-btn" onClick={restart}>
                <RotateCcw size={16} /> Replay
              </button>
              <button className="modal-secondary-btn" onClick={() => setMapModal(true)}>
                Realms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAILURE MODAL */}
      {game.status === 'failed' && (
        <div className="game-modal-backdrop">
          <div className="game-modal-panel victory-celebration-dialog">
            <div className="defeat-warning-pedestal">
              <AlertCircle size={50} />
            </div>

            <span style={{ color: '#f43f5e', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em' }}>
              PUZZLE ATTEMPT FAILED
            </span>

            <h2 className="modal-prominent-title">{failureType?.title || 'Route Blocked'}</h2>

            <p style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 14 }}>
              {game.reason}
            </p>

            {failureType && (
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: 16, padding: '14px 18px', marginBottom: 20, textAlign: 'left', border: '1px solid var(--border-glass)' }}>
                <b style={{ color: '#fbbf24', fontSize: 12, display: 'block', marginBottom: 6 }}>STRATEGY TIP</b>
                <p style={{ color: '#94a3b8', fontSize: 13 }}>{failureType.tip}</p>
              </div>
            )}

            <div className="modal-btn-row">
              {history.length > 0 && (
                <button className="modal-primary-btn" onClick={undo} style={{ background: '#8b5cf6', borderColor: '#a855f7' }}>
                  <RotateCcw size={16} /> Undo Move (Z)
                </button>
              )}
              <button className="modal-primary-btn" onClick={restart}>
                Try Again (R)
              </button>
              {failureType?.type === 'moves' && (
                <button className="modal-secondary-btn" onClick={buyBoost} style={{ borderColor: '#f59e0b', color: '#fbbf24' }}>
                  <Zap size={14} /> +5 Moves (30ðŸª™)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SAGA REALMS & LEVEL MAP MODAL */}
      {mapModal && (
        <div className="game-modal-backdrop" onClick={() => setMapModal(false)}>
          <div className="game-modal-panel saga-world-map-dialog" onClick={e => e.stopPropagation()}>
            <button className="modal-close-cross-btn" onClick={() => setMapModal(false)}>×</button>

            <div className="saga-header-meta">
              <span>THE 5 REALMS</span>
              <h2>Choose Your Garden</h2>
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>50 handcrafted puzzle gardens. Click any unlocked level to preview and play.</p>
            </div>

            {/* Realm Tabs */}
            <div className="world-carousel-deck">
              <button
                className={`world-realm-tab-card ${selectedWorldTab === 0 ? 'active' : ''}`}
                onClick={() => setSelectedWorldTab(0)}
                style={{ '--world-tab-color': '#34d399' }}
              >
                <span>ðŸŒ All Realms</span>
                <span className="world-progress-badge">50</span>
              </button>
              {WORLDS.map(w => {
                const worldCompleted = completed.filter(id => id >= w.range[0] && id <= w.range[1]).length;
                return (
                  <button
                    key={w.id}
                    className={`world-realm-tab-card ${selectedWorldTab === w.id ? 'active' : ''}`}
                    onClick={() => setSelectedWorldTab(w.id)}
                    style={{ '--world-tab-color': w.color }}
                  >
                    <span>{w.icon} {w.name}</span>
                    <span className="world-progress-badge">{worldCompleted}/10</span>
                  </button>
                );
              })}
            </div>

            {/* Level Grid */}
            <div className="level-pathway-grid">
              {displayedLevels.map(l => {
                const world = WORLDS.find(w => w.id === l.worldId) || WORLDS[0];
                const unlocked = completed.includes(l.id) || completed.includes(l.id - 1) || l.id === 1;
                const best = levelProgress[l.id]?.bestStars || 0;
                const isCurrent = l.id === levelId;

                return (
                  <button
                    key={l.id}
                    className={`level-node-badge ${unlocked ? '' : 'locked'} ${isCurrent ? 'current-active' : ''}`}
                    onClick={() => unlocked && setLevelPreview(l)}
                    style={{
                      '--world-node-color': world.color,
                      '--world-node-color-alt': world.color === '#10b981' ? '#34d399' : world.color === '#f59e0b' ? '#fbbf24' : world.color === '#38bdf8' ? '#a855f7' : world.color === '#a855f7' ? '#f472b6' : '#38bdf8',
                    }}
                  >
                    {isCurrent && (
                      <div className="level-node-mascot-head">
                        <WormHeadSVG facing="right" skinId={wormSkin} skinColor={currentSkin} />
                      </div>
                    )}
                    <span className="level-node-number">
                      {unlocked ? String(l.id).padStart(2, '0') : <LockKeyhole size={18} />}
                    </span>
                    <span className="level-node-stars-label">
                      {best >= 3 ? '★★★' : best === 2 ? '★★â˜†' : best === 1 ? '★â˜†â˜†' : unlocked ? 'â˜†â˜†â˜†' : 'LOCKED'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LEVEL PREVIEW MODAL */}
      {levelPreview && (
        <div className="game-modal-backdrop" onClick={() => setLevelPreview(null)}>
          <div className="game-modal-panel" onClick={e => e.stopPropagation()}>
            <button className="modal-close-cross-btn" onClick={() => setLevelPreview(null)}>×</button>

            <span style={{ color: levelPreview.worldColor, fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>
              {levelPreview.worldName.toUpperCase()}
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, marginTop: 4 }}>
              Level {String(levelPreview.id).padStart(2, '0')}: {levelPreview.title}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '8px 0 16px' }}>{levelPreview.objective}</p>

            <div className="level-preview-grid">
              <div className="level-preview-stat">
                <small>DIFFICULTY</small>
                <strong style={{ color: levelPreview.worldColor }}>{levelPreview.difficulty}</strong>
              </div>
              <div className="level-preview-stat">
                <small>APPLES TO EAT</small>
                <strong>{levelPreview.apples.length} ðŸŽ</strong>
              </div>
              <div className="level-preview-stat">
                <small>PAR MOVES (3★)</small>
                <strong style={{ color: '#fbbf24' }}>â‰¤ {levelPreview.parMoves} moves</strong>
              </div>
              <div className="level-preview-stat">
                <small>MOVE LIMIT</small>
                <strong>{levelPreview.moveLimit} moves</strong>
              </div>
            </div>

            <button
              className="modal-primary-btn"
              style={{ width: '100%' }}
              onClick={() => startLevel(levelPreview.id)}
            >
              <Play size={16} fill="currentColor" /> Enter Garden
            </button>
          </div>
        </div>
      )}

      {/* HALL OF FAME LEADERBOARD MODAL */}
      {leaderboardModal && (
        <div className="game-modal-backdrop" onClick={() => setLeaderboardModal(false)}>
          <div className="game-modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <button className="modal-close-cross-btn" onClick={() => setLeaderboardModal(false)}>×</button>

            <span style={{ color: '#fbbf24', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>HALL OF FAME</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, marginTop: 4 }}>Master Gardeners</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Top players ranked by stars earned, efficiency, and realms conquered.</p>

            {leaderboardLoading ? (
              <div style={{ display: 'grid', placeItems: 'center', padding: 40, color: '#94a3b8' }}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: 12 }}>Loading leaderboard...</p>
              </div>
            ) : (
              <>
                {/* Podium Top 3 */}
                {leaderboard.length > 0 && (
                  <div className="podium-trio-stage">
                    {leaderboard.slice(0, 3).map((entry, idx) => (
                      <div
                        key={entry.id || idx}
                        className={`podium-pedestal-card ${idx === 0 ? 'first-place' : idx === 1 ? 'second-place' : 'third-place'}`}
                      >
                        <div className="podium-emblem">
                          {idx === 0 ? <CrownIcon size={36} fill="#fbbf24" /> : idx === 1 ? <Award size={32} fill="#94a3b8" /> : <Flag size={32} fill="#b45309" />}
                        </div>
                        <div className="podium-player-name">{entry.name || 'Anonymous'}</div>
                        <div className="podium-stars-count">★ {entry.totalStars || 0}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Full Leaderboard List */}
                <div className="leaderboard-list">
                  {leaderboard.slice(3).map((entry, idx) => (
                    <div
                      key={entry.id || idx + 3}
                      className={`leaderboard-entry ${token && user && entry.id === user.id ? 'current-user' : ''}`}
                    >
                      <span className={`leaderboard-rank ${idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : ''}`}>
                        #{idx + 4}
                      </span>
                      <div className="leaderboard-avatar">
                        {(entry.name || 'A')[0].toUpperCase()}
                      </div>
                      <span className="leaderboard-name">{entry.name || 'Anonymous'}</span>
                      <span className="leaderboard-stars">★ {entry.totalStars || 0}</span>
                    </div>
                  ))}
                  {leaderboard.length <= 3 && (
                    <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                      <Trophy size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                      <p>No rankings yet. Be the first to conquer the gardens!</p>
                    </div>
                  )}
                </div>

                {myRank && (
                  <div style={{ marginTop: 16, padding: 12, background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 12, textAlign: 'center' }}>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>Your Rank: #{myRank.rank}</span>
                    <span style={{ color: '#fbbf24', marginLeft: 16, fontWeight: 800 }}>★ {myRank.totalStars} Stars</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* SHOP / SKINS MODAL */}
      {shopModal && (
        <div className="game-modal-backdrop" onClick={() => setShopModal(false)}>
          <div className="game-modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <button className="modal-close-cross-btn" onClick={() => setShopModal(false)}>×</button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <span style={{ color: '#fbbf24', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>WORM SKINS</span>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, marginTop: 4 }}>Customize Your Worm</h2>
              </div>
              <div className="coin-badge-pill">
                <Coins size={16} /> <span>{coins}</span>
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Unlock unique worm appearances with your garden coins. Equipped skins sync across devices.</p>

            <div className="skins-grid">
              {SKINS.map(skin => (
                <div
                  key={skin.id}
                  className={`skin-card ${ownedSkins.includes(skin.id) ? 'owned' : 'locked'} ${wormSkin === skin.id ? 'selected' : ''}`}
                  onClick={() => ownedSkins.includes(skin.id) ? selectSkin(skin.id) : buySkin(skin.id)}
                >
                  {ownedSkins.includes(skin.id) && (
                    <span className="skin-badge owned">Owned</span>
                  )}
                  {!ownedSkins.includes(skin.id) && (
                    <span className="skin-badge locked">{skin.price} <Coins size={10} /></span>
                  )}
                  <div className="skin-preview" style={{
                    '--skin-primary': skin.primary,
                    '--skin-secondary': skin.secondary,
                    '--skin-glow': skin.glow,
                  }} />
                  <span className="skin-name">{skin.name}</span>
                  <span className="skin-label">{skin.label}</span>
                  {!ownedSkins.includes(skin.id) && (
                    <div className="skin-price">
                      <Coins size={14} /> {skin.price}
                    </div>
                  )}
                  {ownedSkins.includes(skin.id) && wormSkin !== skin.id && (
                    <button
                      className="modal-primary-btn"
                      style={{ width: '100%', padding: '10px', fontSize: 13, marginTop: 4 }}
                      onClick={(e) => { e.stopPropagation(); selectSkin(skin.id); }}
                    >
                      Equip
                    </button>
                  )}
                  {wormSkin === skin.id && (
                    <div style={{ color: '#34d399', fontSize: 12, fontWeight: 700, marginTop: 4 }}>âœ“ Equipped</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HOW TO PLAY MODAL */}
      {howToPlayModal && (
        <div className="game-modal-backdrop" onClick={() => setHowToPlayModal(false)}>
          <div className="game-modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <button className="modal-close-cross-btn" onClick={() => setHowToPlayModal(false)}>×</button>

            <span style={{ color: '#38bdf8', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>TUTORIAL</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, marginTop: 4 }}>How to Play</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Guide your worm through puzzle gardens. Eat all apples, then enter the portal!</p>

            <div className="how-to-play-steps">
              <div className="how-to-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <div className="step-title">Move & Slither</div>
                  <div className="step-desc">Swipe or use arrow keys / WASD to move. Your worm slides one tile at a time.</div>
                  <div className="step-keys">
                    <span className="key-badge">â†‘</span>
                    <span className="key-badge">â†“</span>
                    <span className="key-badge">â†</span>
                    <span className="key-badge">â†’</span>
                    <span className="key-badge">WASD</span>
                  </div>
                </div>
              </div>

              <div className="how-to-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <div className="step-title">Eat Apples ðŸŽ</div>
                  <div className="step-desc">Collect all apples in the garden. Each apple makes your worm grow longer!</div>
                </div>
              </div>

              <div className="how-to-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <div className="step-title">Enter the Portal ðŸŒ€</div>
                  <div className="step-desc">After eating all apples, the cosmic portal unlocks. Slither into it to complete the level.</div>
                </div>
              </div>

              <div className="how-to-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <div className="step-title">Avoid Obstacles</div>
                  <div className="step-desc">Don't hit stone walls, the garden edge, or your own tail. Plan your path carefully!</div>
                </div>
              </div>

              <div className="how-to-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <div className="step-title">Master Moves</div>
                  <div className="step-desc">Finish within the move limit. Beat the Par moves for 3 stars! Use hints (H) or undo (Z) if stuck.</div>
                  <div className="step-keys">
                    <span className="key-badge">H - Hint</span>
                    <span className="key-badge">Z - Undo</span>
                    <span className="key-badge">R - Restart</span>
                  </div>
                </div>
              </div>

              <div className="how-to-step">
                <div className="step-number">6</div>
                <div className="step-content">
                  <div className="step-title">Earn & Customize</div>
                  <div className="step-desc">Earn coins to unlock worm skins, buy move boosts, and climb the global leaderboard!</div>
                  <div className="step-keys">
                    <span className="key-badge">Shop</span>
                    <span className="key-badge">Skins</span>
                    <span className="key-badge">Boosts</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, padding: 16, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Lightbulb size={18} style={{ color: '#38bdf8' }} />
                <strong style={{ color: '#38bdf8' }}>Pro Tips</strong>
              </div>
              <ul style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.8, paddingLeft: 20 }}>
                <li>Your worm's tail moves forward each turn (unless eating) - use this to your advantage!</li>
                <li>Create loops to reposition your head without wasting moves.</li>
                <li>Watch the live star rating in the HUD - it updates in real-time.</li>
                <li>Use the BFS Hint (H) for the optimal next move toward apples or portal.</li>
                <li>Apple Boost (+5 moves) costs 30 coins - save it for tricky expert levels.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ACHIEVEMENTS & DAILY CHALLENGE MODAL */}
      {achievementsModal && (
        <div className="game-modal-backdrop" onClick={() => setAchievementsModal(false)}>
          <div className="game-modal-panel achievements-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-cross-btn" onClick={() => setAchievementsModal(false)}>×</button>
            <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>PROGRESSION</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, marginTop: 4 }}>Badges & Daily Challenge</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Track milestones, replay highlights, and take on todayâ€™s featured garden.</p>

            <div className="daily-challenge-card" style={{ '--challenge-color': WORLDS.find(w => dailyChallenge.levelId >= w.range[0] && dailyChallenge.levelId <= w.range[1])?.color || '#38bdf8' }}>
              <div className="daily-challenge-head"><Gift size={18} /> <span>Daily Challenge</span></div>
              <strong>Level {String(dailyChallenge.levelId).padStart(2, '0')} — {dailyChallenge.title}</strong>
              <p>{dailyChallenge.worldName} • Bonus reward: +{dailyChallenge.bonus} coins on clear</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <button className="modal-primary-btn" style={{ flex: 1 }} onClick={() => { setAchievementsModal(false); startLevel(dailyChallenge.levelId); }}>
                  <Play size={15} /> Play Challenge
                </button>
                <button className="modal-secondary-btn" style={{ flex: 1 }} onClick={claimDailyReward} disabled={dailyRewardClaimed && !!token}>
                  <Coins size={14} /> {dailyRewardClaimed && token ? 'Reward Claimed' : 'Claim Daily Reward'}
                </button>
              </div>
              {dailyRewardMsg && <p style={{ marginTop: 8, fontSize: 12, color: '#a7f3d0' }}>{dailyRewardMsg}</p>}
            </div>

            <div className="achievements-grid">
              {achievements.map(a => (
                <div key={a.id} className={`achievement-card ${a.unlocked ? 'unlocked' : 'locked'}`}>
                  <div className="achievement-icon" aria-hidden="true">{a.icon}</div>
                  <div className="achievement-title">{a.title}</div>
                  <div className="achievement-desc">{a.desc}</div>
                  <div className="achievement-state">{a.unlocked ? 'Unlocked' : 'Locked'}</div>
                </div>
              ))}
            </div>

            <div className="undo-timeline-wrap">
              <div className="undo-timeline-head"><Undo2 size={14} /> Undo Timeline</div>
              <div className="undo-timeline" role="list" aria-label="Recent moves timeline">
                {history.length === 0 && <span className="undo-timeline-empty">No moves yet. Your recent steps will appear here for quick review.</span>}
                {history.slice(-12).map((h, idx, arr) => (
                  <button key={idx} className="undo-timeline-node" role="listitem" title={`Step ${history.length - arr.length + idx + 1}`} onClick={() => { setGame(h); setHistory(prev => prev.slice(0, prev.length - arr.length + idx)); }}>
                    <span>{history.length - arr.length + idx + 1}</span>
                  </button>
                ))}
                {history.length > 0 && <button className="undo-timeline-node current" role="listitem" title="Current state"><span>Now</span></button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ONBOARDING MODAL */}
      {onboardingOpen && (
        <div className="game-modal-backdrop" onClick={() => { setOnboardingOpen(false); localStorage.setItem('onboardingSeen', '1'); }}>
          <div className="game-modal-panel onboarding-modal" onClick={e => e.stopPropagation()}>
            <span style={{ color: '#34d399', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>WELCOME</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, marginTop: 4 }}>Start Your Adventure</h2>
            <p style={{ color: '#94a3b8', marginTop: 6 }}>A quick guide to the polished garden journey.</p>
            <div className="onboarding-grid">
              <div className="onboarding-card"><strong>Slither Smart</strong><p>Swipe or use arrows/WASD. Plan around your growing tail and move budget.</p></div>
              <div className="onboarding-card"><strong>Collect & Unlock</strong><p>Eat all apples to open the cosmic portal, then escape to clear the level.</p></div>
              <div className="onboarding-card"><strong>Master Realms</strong><p>Earn stars, unlock skins, chase badges, and take on daily challenges.</p></div>
              <div className="onboarding-card"><strong>Accessibility</strong><p>Use reduced motion, high contrast, and colorblind modes from the HUD anytime.</p></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="modal-primary-btn" style={{ flex: 1 }} onClick={() => { setOnboardingOpen(false); localStorage.setItem('onboardingSeen', '1'); setHowToPlayModal(true); }}><CircleHelp size={16} /> Full Tutorial</button>
              <button className="modal-secondary-btn" style={{ flex: 1 }} onClick={() => { setOnboardingOpen(false); localStorage.setItem('onboardingSeen', '1'); }}><Play size={16} /> Start Playing</button>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {authModal && (
        <div className="game-modal-backdrop" onClick={() => setAuthModal(null)}>
          <div className="game-modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <button className="modal-close-cross-btn" onClick={() => setAuthModal(null)}>×</button>

            {authModal === 'profile' && user ? (
              <div style={{ textAlign: 'center' }}>
                <div className="hud-user-avatar" style={{ width: 80, height: 80, margin: '0 auto 16px', fontSize: 32 }}>
                  {user.name[0].toUpperCase()}
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, marginBottom: 4 }}>{user.name}</h2>
                <p style={{ color: '#94a3b8', marginBottom: 20 }}>{user.email}</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-glass)' }}>
                    <small style={{ color: '#94a3b8', display: 'block', fontSize: 10 }}>COINS</small>
                    <strong style={{ color: '#fbbf24', fontSize: 18 }}>{user.coins || 0}</strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-glass)' }}>
                    <small style={{ color: '#94a3b8', display: 'block', fontSize: 10 }}>STARS</small>
                    <strong style={{ color: '#fbbf24', fontSize: 18 }}>{user.totalStars || 0}</strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-glass)' }}>
                    <small style={{ color: '#94a3b8', display: 'block', fontSize: 10 }}>LEVEL</small>
                    <strong style={{ color: '#34d399', fontSize: 18 }}>{user.currentLevel || 1}</strong>
                  </div>
                </div>
                <button className="modal-secondary-btn" style={{ width: '100%' }} onClick={handleLogout}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="auth-form">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, textAlign: 'center', marginBottom: 4 }}>
                  {authModal === 'register' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 20 }}>
                  {authModal === 'register' ? 'Join the garden adventure' : 'Sign in to sync progress across devices'}
                </p>

                {authError && <div className="auth-error">{authError}</div>}

                {authModal === 'register' && (
                  <div className="auth-input-group">
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={authForm.name}
                      onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your worm name"
                      autoComplete="name"
                      required
                      disabled={authLoading}
                    />
                  </div>
                )}

                <div className="auth-input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@garden.com"
                    autoComplete="email"
                    required
                    disabled={authLoading}
                  />
                </div>

                <div className="auth-input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    autoComplete={authModal === 'register' ? 'new-password' : 'current-password'}
                    required
                    disabled={authLoading}
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                  {authLoading ? 'Please wait...' : (authModal === 'register' ? 'Create Account' : 'Sign In')}
                </button>

                <div className="auth-switch">
                  {authModal === 'register' ? 'Already have an account? ' : 'New to the garden? '}
                  <button type="button" onClick={() => setAuthModal(authModal === 'register' ? 'login' : 'register')}>
                    {authModal === 'register' ? 'Sign In' : 'Register'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);