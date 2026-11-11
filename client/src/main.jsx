import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Apple, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Award,
  ChevronRight, CircleHelp, Coins, Gamepad2, Gem, Lightbulb,
  LockKeyhole, RotateCcw, Settings, ShieldCheck, Sparkles, Star,
  Trophy, Volume2, VolumeX, Zap, User as UserIcon, LogOut, Check, X,
  Compass, Play, RefreshCw, Flame, Crown, Flag, AlertCircle,
  Maximize2, Minimize2, Music, Undo2, HelpCircle, MapPin, ShoppingBag,
  Heart, Gift, Palette, Crown as CrownIcon
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

// 1. Cute Expressive Worm Head with Dynamic Expressions
function WormHeadSVG({ facing = 'right', skinId = 'emerald', expression = 'idle', skinColor = {} }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;
  const gradId = `wormGrad-${skin.id}-${expression}`;

  const isEating = expression === 'eating';
  const isMoving = expression === 'moving';
  const isHappy = expression === 'happy';

  return (
    <svg className={`worm-head-svg-container facing-${facing} ${isMoving ? 'moving' : ''} ${isEating ? 'eating' : ''} ${!isMoving && !isEating ? 'idle' : ''}`} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.6))' }}>
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="60%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </radialGradient>
        <filter id="headDropShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Head Leaf Sprout - animated */}
      <g className="head-sprout-leaf" transform="translate(46, 8)" style={{ transformOrigin: '50% 100%' }}>
        <path d="M4 14 C4 4, 18 2, 20 8 C22 14, 12 18, 4 14 Z" fill="#4ade80" stroke="#15803d" strokeWidth="1.5" />
        <path d="M4 14 C10 10, 16 9, 19 8" stroke="#166534" strokeWidth="1" fill="none" />
        <path d="M4 14 Q2 20 4 24" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {isHappy && <animateTransform attributeName="transform" type="rotate" from="10 20 20" to="-10 20 20" dur="0.5s" repeatCount="indefinite" />}
      </g>

      {/* Main Head Base */}
      <circle cx="50" cy="54" r="40" fill={`url(#${gradId})`} filter="url(#headDropShadow)" />

      {/* Specular Head Highlight */}
      <ellipse cx="38" cy="32" rx="14" ry="9" fill="#ffffff" opacity="0.45" transform="rotate(-20 38 32)" />

      {/* Rosy Cheeks - animate when eating */}
      <ellipse cx="24" cy="62" rx={isEating ? 8 : 6} ry={isEating ? 5 : 4} fill="#fb7185" opacity={isEating ? 1 : 0.8} style={{ transition: 'all 0.1s' }} />
      <ellipse cx="76" cy="62" rx={isEating ? 8 : 6} ry={isEating ? 5 : 4} fill="#fb7185" opacity={isEating ? 1 : 0.8} style={{ transition: 'all 0.1s' }} />

      {/* Kawaii Cartoon Eyes - expressive */}
      {/* Left Eye */}
      <g transform="translate(32, 42)" style={{ transformOrigin: '0 0' }}>
        <ellipse cx="0" cy="0" rx="8" ry={isEating ? 6 : 11} fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="2" cy={isEating ? 0 : 0} r={isEating ? 3 : 5} fill="#0f172a" style={{ transition: 'all 0.1s' }} />
        <circle cx="0.5" cy="-2" r="2.5" fill="#ffffff" />
        <circle cx="3" cy="2" r="1" fill="#ffffff" />
        {isHappy && (
          <g transform="scale(1, 0.3)">
            <ellipse cx="0" cy="6" rx="8" ry="3" fill="#0f172a" />
          </g>
        )}
      </g>

      {/* Right Eye */}
      <g transform="translate(68, 42)" style={{ transformOrigin: '0 0' }}>
        <ellipse cx="0" cy="0" rx="8" ry={isEating ? 6 : 11} fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="2" cy={isEating ? 0 : 0} r={isEating ? 3 : 5} fill="#0f172a" style={{ transition: 'all 0.1s' }} />
        <circle cx="0.5" cy="-2" r="2.5" fill="#ffffff" />
        <circle cx="3" cy="2" r="1" fill="#ffffff" />
        {isHappy && (
          <g transform="scale(1, 0.3)">
            <ellipse cx="0" cy="6" rx="8" ry="3" fill="#0f172a" />
          </g>
        )}
      </g>

      {/* Mouth - expressive based on state */}
      {isEating ? (
        <g transform="translate(50, 70)">
          <ellipse cx="0" cy="0" rx="12" ry="8" fill="#0f172a" />
          <ellipse cx="0" cy="0" rx="8" ry="4" fill="#1e293b" />
        </g>
      ) : isHappy ? (
        <path d="M35 70 Q50 82 65 70" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M42 66 Q50 75 58 66" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
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

  return (
    <svg className="worm-segment-svg-container" style={{ '--seg-scale': scale }} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={gradId} cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="65%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill={`url(#${gradId})`} />
      <ellipse cx="38" cy="34" rx="14" ry="8" fill="#ffffff" opacity="0.4" transform="rotate(-25 38 34)" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.1" />
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
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="60%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </radialGradient>
      </defs>
      <path d="M20 50 C20 28, 48 20, 75 35 C90 44, 90 56, 75 65 C48 80, 20 72, 20 50 Z" fill={`url(#${gradId})`} />
      <circle cx="38" cy="44" r="7" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}

// 4. Luscious 3D Candy Apple with Sparkle
function JuicyAppleSVG({ collected = false }) {
  return (
    <svg className="apple-svg-container" viewBox="0 0 100 100" style={{ animation: collected ? 'none' : 'appleBreathingBob 2.5s ease-in-out infinite alternate' }}>
      <defs>
        <radialGradient id="appleBodyGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ff7b7b" />
          <stop offset="45%" stopColor="#ef4444" />
          <stop offset="85%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        <linearGradient id="appleLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <filter id="appleGlow">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.55" />
        </filter>
        <filter id="appleSparkle">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Wooden Stem */}
      <path d="M50 26 Q55 14 62 10" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" fill="none" />

      {/* Vibrant Green Leaf */}
      <path d="M54 22 C64 12, 78 14, 82 20 C84 26, 72 32, 58 26 Z" fill="url(#appleLeafGrad)" stroke="#166534" strokeWidth="1.5" />
      <path d="M54 22 Q68 18 80 20" stroke="#14532d" strokeWidth="1" fill="none" />

      {/* 3D Apple Main Body */}
      <path
        d="M50 34 C30 34, 14 48, 14 68 C14 86, 32 94, 50 90 C68 94, 86 86, 86 68 C86 48, 70 34, 50 34 Z"
        fill="url(#appleBodyGrad)"
        filter="url(#appleGlow)"
      />

      {/* Specular Curved Gloss Highlight */}
      <path d="M26 48 C24 60, 30 74, 38 80" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.65" />
      <circle cx="34" cy="44" r="3.5" fill="#ffffff" opacity="0.8" />

      {/* Orbiting Sparkle Stars - animated */}
      <g className="apple-sparkle-star s1" transform="translate(18, 28)" style={{ animation: 'sparkleOrbit 3s ease-in-out infinite' }}>
        <polygon points="6,0 8,4 12,6 8,8 6,12 4,8 0,6 4,4" fill="#fef08a" filter="url(#appleSparkle)" />
      </g>
      <g className="apple-sparkle-star s2" transform="translate(76, 74)" style={{ animation: 'sparkleOrbit 3s ease-in-out infinite reverse' }}>
        <polygon points="5,0 7,3 10,5 7,7 5,10 3,7 0,5 3,3" fill="#fef08a" filter="url(#appleSparkle)" />
      </g>
      <g className="apple-sparkle-star s3" transform="translate(82, 30)" style={{ animation: 'sparkleOrbit 4s ease-in-out infinite' }}>
        <polygon points="4,0 5,2 7,4 5,6 4,8 3,6 1,4 3,2" fill="#fef08a" filter="url(#appleSparkle)" opacity="0.8" />
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
          <stop offset="0%" stopColor={unlocked ? '#ffffff' : '#3b0764'} />
          <stop offset="35%" stopColor={unlocked ? '#38bdf8' : '#1e1b4b'} />
          <stop offset="70%" stopColor={unlocked ? '#8b5cf6' : '#0f172a'} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="portalRuneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
        <filter id="portalGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer Runic Stargate Ring */}
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke={unlocked ? 'url(#portalRuneGrad)' : '#475569'}
        strokeWidth="3.5"
        strokeDasharray={unlocked ? '10 4 6 4' : '6 6'}
        filter={unlocked ? 'url(#portalGlow)' : 'none'}
      />

      {/* Galaxy Core Vortex */}
      <circle className="portal-pulse-ring" cx="50" cy="50" r="38" fill="url(#portalVoidGrad)" />

      {unlocked ? (
        /* Unlocked Spiraling Nebula Rays */
        <g className="portal-galaxy-spin" filter="url(#portalGlow)">
          <path d="M50 50 Q65 30 85 45" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M50 50 Q35 70 15 55" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M50 50 Q70 65 55 85" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M50 50 Q30 35 45 15" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
          <circle cx="50" cy="50" r="9" fill="#ffffff" />
          <circle cx="50" cy="50" r="5" fill="#38bdf8" />
        </g>
      ) : (
        /* Locked Dormant Padlock */
        <g transform="translate(36, 34)">
          <rect x="5" y="12" width="18" height="15" rx="3" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M8 12 V7 C8 3.5, 20 3.5, 20 7 V12" stroke="#cbd5e1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="14" cy="18" r="2" fill="#0f172a" />
          <path d="M14 20 V23" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
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
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="wallBevelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <filter id="wallShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Main Beveled Block */}
      <rect x="4" y="4" width="92" height="92" rx="10" fill="url(#wallTopGrad)" stroke="#1e293b" strokeWidth="3" filter="url(#wallShadow)" />
      <rect x="8" y="8" width="84" height="84" rx="8" fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity="0.35" />

      {/* Carved Ancient Rune Glyph */}
      <path d="M50 24 L74 50 L50 76 L26 50 Z" stroke="#cbd5e1" strokeWidth="2" fill="none" opacity="0.75" />
      <circle cx="50" cy="50" r="6" fill="#38bdf8" opacity="0.75" />
      <line x1="50" y1="24" x2="50" y2="76" stroke="#cbd5e1" strokeWidth="1.5" opacity="0.6" />
      <line x1="26" y1="50" x2="74" y2="50" stroke="#cbd5e1" strokeWidth="1.5" opacity="0.6" />
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
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('coins');
    return saved !== null ? Number(saved) : 125;
  });
  const [sound, setSound] = useState(() => localStorage.getItem('sound') !== 'false');
  const [music, setMusic] = useState(() => localStorage.getItem('music') === 'true');
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

  // Modals & Screen States
  const [mapModal, setMapModal] = useState(false);
  const [leaderboardModal, setLeaderboardModal] = useState(false);
  const [shopModal, setShopModal] = useState(false);
  const [howToPlayModal, setHowToPlayModal] = useState(false);
  const [levelPreview, setLevelPreview] = useState(null);
  const [selectedWorldTab, setSelectedWorldTab] = useState(0);

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

  const level = LEVELS[levelId - 1] || LEVELS[0];
  const [game, setGame] = useState(() => initialState(LEVELS[levelId - 1] || LEVELS[0]));

  // Current World
  const currentWorld = WORLDS.find(w => levelId >= w.range[0] && levelId <= w.range[1]) || WORLDS[0];
  const currentSkin = SKINS.find(s => s.id === wormSkin) || SKINS[0];

  // Persist guest progress to localStorage
  useEffect(() => {
    localStorage.setItem('coins', coins);
    localStorage.setItem('completedLevels', JSON.stringify(completed));
    localStorage.setItem('currentLevel', levelId);
    localStorage.setItem('sound', String(sound));
    localStorage.setItem('music', String(music));
    localStorage.setItem('wormSkin', wormSkin);
    localStorage.setItem('ownedSkins', JSON.stringify(ownedSkins));
  }, [coins, completed, levelId, sound, music, wormSkin, ownedSkins]);

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
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          if (data.user.coins !== undefined) setCoins(data.user.coins);
          if (data.user.completedLevels && data.user.completedLevels.length) {
            setCompleted(prev => Array.from(new Set([...prev, ...data.user.completedLevels, data.user.currentLevel])));
            setLevelId(data.user.currentLevel || 1);
          }
          if (data.user.ownedSkins && data.user.ownedSkins.length) {
            setOwnedSkins(prev => Array.from(new Set([...prev, ...data.user.ownedSkins])));
          }
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
      });
  }, [token]);

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
    setGame(initialState(targetLvl));
    setBonusMoves(0);
    setHistory([]);
    setHint(false);
    setSolverHint(null);
    setNotice('');
    setFacing('right');
    setWormExpression('idle');
    setStarPopStage(0);
    setConfettiParticles([]);
    setLevelPreview(null);
    setMapModal(false);
    playSound('click', sound);
  }, [sound]);

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

  // Smooth move with 180-degree neck collision prevention
  const move = useCallback(dir => {
    setGame(old => {
      if (old.status !== 'playing') return old;

      // Prevent 180° instant reverse into neck if worm length >= 2
      if (old.worm.length >= 2) {
        const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
        if (delta) {
          const nextHead = [old.worm[0][0] + delta[0], old.worm[0][1] + delta[1]];
          if (same(nextHead, old.worm[1])) return old;
        }
      }

      setFacing(dir);
      setWormExpression('moving');
      setHistory(h => [...h.slice(-35), old]);
      setSolverHint(null);

      const effectiveLevel = { ...level, moveLimit: level.moveLimit + bonusMoves };
      const next = step(old, dir, effectiveLevel);

      // Apple collection audio & popup
      const didEat = next.apples.length < old.apples.length;
      if (didEat) {
        playSound('eat', sound);
        setWormExpression('eating');
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
        if (next.apples.length === 0) {
          playSound('portalOpen', sound);
          setNotice('✨ All apples collected! The Cosmic Portal has awakened!');
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

        // Stagger star pops
        setStarPopStage(0);
        setTimeout(() => { setStarPopStage(1); playSound('star', sound); }, 220);
        setTimeout(() => { if (stars >= 2) { setStarPopStage(2); playSound('star', sound); } }, 480);
        setTimeout(() => { if (stars >= 3) { setStarPopStage(3); playSound('star', sound); } }, 740);

        setCompleted(prev => (prev.includes(levelId + 1) ? prev : [...prev, Math.min(50, levelId + 1)]));
        setCoins(c => c + 25);

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
    if (history.length) {
      playSound('undo', sound);
      const prev = history[history.length - 1];
      setGame(prev);
      setHistory(h => h.slice(0, -1));
      setSolverHint(null);
      setNotice('Move undone. Slither safely!');
    }
  };

  const restart = () => {
    playSound('undo', sound);
    setGame(initialState(level));
    setBonusMoves(0);
    setHistory([]);
    setSolverHint(null);
    setStarPopStage(0);
    setConfettiParticles([]);
    setWormExpression('idle');
    setNotice('Garden reset. Plan your turns carefully!');
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
    if (game.worm.some(w => same(w, p))) c += ' worm';
    if (game.worm.length && same(game.worm[0], p)) c += ' head';
    if (game.apples.some(a => same(a, p))) c += ' apple';
    if (same(level.portal, p)) c += ' portal';
    if (hint && game.apples.length && same(game.apples[0], p)) c += ' hinted';
    if (solverHint && solverHint.path && solverHint.path.some(pt => same(pt, p))) c += ' hint-path';
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

  // Live star calculation
  const liveStars = useMemo(() => {
    return calculateStars(game.moves, level.moveLimit + bonusMoves, level.parMoves);
  }, [game.moves, level.moveLimit, level.parMoves, bonusMoves]);

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

  return (
    <div
      className={`game-master-container ${screenShake ? 'screen-shake' : ''}`}
      data-world={currentWorld.id}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      {/* AMBIENT LAYERS */}
      <div className="ambient-layers">
        {/* Gradient Orbs */}
        <div className="ambient-layer ambient-orbs-layer" style={{ '--orb-color-1': ambientOrbs[0].color, '--orb-color-2': ambientOrbs[1].color, '--orb-color-3': ambientOrbs[2].color }}>
          {ambientOrbs.map((orb, i) => (
            <div key={i} className="ambient-orb" style={{ ...orb }} />
          ))}
        </div>

        {/* Floating Motes */}
        <div className="ambient-layer ambient-motes-layer">
          {ambientMotes.map((mote, i) => (
            <FloatingParticle key={i} {...mote} />
          ))}
        </div>

        {/* Grid Overlay */}
        <div className="ambient-layer ambient-grid-overlay" />
      </div>

      {/* TOP ARCADE GLASS HUD */}
      <header className="game-arcade-hud">
        <div className="hud-cluster hud-cluster-left">
          <div className="hud-brand-pill" onClick={() => setMapModal(true)} title="Browse Realms & Levels">
            <div className="brand-icon-wrapper">
              <Apple size={20} />
            </div>
            <span className="brand-title-text">APPLE WORM</span>
          </div>

          <div className="hud-realm-tag" style={{ borderColor: `${currentWorld.color}66` }}>
            <span className="realm-glow-indicator" style={{ backgroundColor: currentWorld.color }} />
            <span>{currentWorld.name} • Lv. {String(levelId).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Center Live Metrics */}
        <div className="hud-cluster hud-cluster-center">
          <div className="hud-metric-pill">
            <span>MOVES:</span>
            <b>{game.moves}/{level.moveLimit + bonusMoves}</b>
            <small>(Par: {level.parMoves})</small>
          </div>

          <div className="hud-metric-pill hud-stars-display" title="Stars rating based on moves">
            <span className={`star-icon-unit ${liveStars >= 1 ? 'earned' : ''}`}>★</span>
            <span className={`star-icon-unit ${liveStars >= 2 ? 'earned' : ''}`}>★</span>
            <span className={`star-icon-unit ${liveStars >= 3 ? 'earned' : ''}`}>★</span>
          </div>

          <div className="hud-metric-pill hud-apples-counter">
            <span>🍎 {game.apples.length} left</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="hud-cluster hud-cluster-right">
          <div className="coin-badge-pill" title="Garden Coins">
            <Coins size={16} />
            <span>{coins}</span>
          </div>

          <button className="hud-nav-tab-btn" onClick={() => setMapModal(true)} title="Open Level Map (M)">
            <MapPin size={15} /> Realms
          </button>

          <button className="hud-nav-tab-btn" onClick={() => setLeaderboardModal(true)} title="Hall of Fame (L)">
            <Trophy size={15} /> Rank
          </button>

          <button className="hud-action-icon-btn" onClick={() => setShopModal(true)} title="Skins & Boosters (S)">
            <ShoppingBag size={16} />
          </button>

          <button
            className={`hud-action-icon-btn ${music ? 'active' : ''}`}
            onClick={toggleMusic}
            title={music ? 'Mute Music (M)' : 'Play Music (M)'}
          >
            <Music size={16} />
          </button>

          <button
            className={`hud-action-icon-btn ${sound ? 'active' : ''}`}
            onClick={() => setSound(!sound)}
            title={sound ? 'Mute SFX' : 'Unmute SFX'}
          >
            {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            className="hud-action-icon-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            className="hud-action-icon-btn"
            onClick={() => setHowToPlayModal(true)}
            title="How to Play Tutorial"
          >
            <CircleHelp size={16} />
          </button>

          <button
            className="hud-action-icon-btn hud-user-avatar"
            onClick={() => setAuthModal(user ? 'profile' : 'login')}
            title={user ? `${user.name} (Signed in)` : 'Sign in / Profile'}
          >
            {user ? user.name[0].toUpperCase() : 'G'}
          </button>
        </div>
      </header>

      {/* NOTICE TOAST */}
      {notice && game.status === 'playing' && (
        <div className="notice-banner-pill">
          <span>{notice}</span>
          <button className="toast-dismiss" onClick={() => setNotice('')}>×</button>
        </div>
      )}

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
              <div
                key={s.id}
                className="floating-points-toast"
                style={{ left: `${pctX}%`, top: `${pctY}%` }}
              >
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
                const segmentIdx = game.worm.findIndex(w => same(w, p));
                const isWormHead = segmentIdx === 0;
                const isWormTail = segmentIdx > 0 && segmentIdx === game.worm.length - 1;
                const isAppleCell = isApple(p);
                const justCollected = isAppleCell && game.apples.length < (level.apples.length);

                return (
                  <div key={i} className={cellClass(p) + (justCollected ? ' apple-collected' : '')}>
                    {isWormHead ? (
                      <WormHeadSVG
                        facing={facing}
                        skinId={wormSkin}
                        expression={wormExpression}
                        skinColor={currentSkin}
                      />
                    ) : isWormTail ? (
                      <WormTailSVG skinId={wormSkin} skinColor={currentSkin} />
                    ) : segmentIdx > 0 ? (
                      <WormSegmentSVG
                        skinId={wormSkin}
                        scale={Math.max(0.7, 1 - (segmentIdx * 0.035))}
                        index={segmentIdx}
                        skinColor={currentSkin}
                      />
                    ) : isAppleCell ? (
                      <JuicyAppleSVG collected={justCollected} />
                    ) : same(level.portal, p) ? (
                      <CosmicPortalSVG unlocked={game.apples.length === 0} />
                    ) : level.walls.some(w => same(w, p)) ? (
                      <StoneWallSVG />
                    ) : null}
                  </div>
                );
              })}
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
          <button className="dock-action-btn hint-btn" onClick={triggerSmartHint} title="BFS Shortest Route Hint (H)">
            <Lightbulb size={16} /> <span>HINT</span>
          </button>
          <button className="dock-action-btn boost-btn" onClick={buyBoost} title="Buy +5 moves for 30 coins">
            <Zap size={16} /> <span>+5 MOVES</span>
          </button>
        </div>

        {/* Virtual Ergonomic D-Pad */}
        <div className="virtual-dpad-cluster">
          <button className="dpad-direction-button" onClick={() => move('up')} aria-label="Move Up">
            <ArrowUp size={22} />
          </button>
          <div className="dpad-row-keys">
            <button className="dpad-direction-button" onClick={() => move('left')} aria-label="Move Left">
              <ArrowLeft size={22} />
            </button>
            <button className="dpad-direction-button" onClick={() => move('down')} aria-label="Move Down">
              <ArrowDown size={22} />
            </button>
            <button className="dpad-direction-button" onClick={() => move('right')} aria-label="Move Right">
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
                <strong>+25 🪙</strong>
              </div>
              <div className="summary-metric-card">
                <small>SCORE</small>
                <strong>+{game.score}</strong>
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 22 }}>
              {game.moves <= level.parMoves
                ? '🌟 Flawless precision! You matched the master Par moves target.'
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
                  <Zap size={14} /> +5 Moves (30🪙)
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
                <span>🌐 All Realms</span>
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
                const isDone = completed.includes(l.id) && l.id < Math.max(...completed);
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
                      {isDone ? '★★★' : unlocked ? '★☆☆' : 'LOCKED'}
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
                <strong>{levelPreview.apples.length} 🍎</strong>
              </div>
              <div className="level-preview-stat">
                <small>PAR MOVES (3★)</small>
                <strong style={{ color: '#fbbf24' }}>≤ {levelPreview.parMoves} moves</strong>
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
                    <span className="skin-badge locked">{skin.price} 🪙</span>
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
                    <div style={{ color: '#34d399', fontSize: 12, fontWeight: 700, marginTop: 4 }}>✓ Equipped</div>
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
                    <span className="key-badge">↑</span>
                    <span className="key-badge">↓</span>
                    <span className="key-badge">←</span>
                    <span className="key-badge">→</span>
                    <span className="key-badge">WASD</span>
                  </div>
                </div>
              </div>

              <div className="how-to-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <div className="step-title">Eat Apples 🍎</div>
                  <div className="step-desc">Collect all apples in the garden. Each apple makes your worm grow longer!</div>
                </div>
              </div>

              <div className="how-to-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <div className="step-title">Enter the Portal 🌀</div>
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