import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Apple, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Award,
  ChevronRight, CircleHelp, Coins, Gamepad2, Gem, Lightbulb,
  LockKeyhole, RotateCcw, Settings, ShieldCheck, Sparkles, Star,
  Trophy, Volume2, VolumeX, Zap, User as UserIcon, LogOut, Check, X,
  Compass, Play, RefreshCw, Flame, Crown, Flag, AlertCircle,
  Maximize2, Minimize2, Music, Undo2, HelpCircle, MapPin, ShoppingBag
} from 'lucide-react';
import { GAME_NAME, API_URL } from './config/gameConfig';
import { LEVELS, WORLDS } from './data/levels';
import { initialState, step, same } from './game/engine';
import { playSound, startBgm, stopBgm } from './game/audio';
import { findNextHint } from './game/solver';
import './style.css';

const SKINS = [
  { id: 'emerald', name: 'Emerald', primary: '#10b981', secondary: '#059669', highlight: '#86efac', label: 'Classic Garden' },
  { id: 'golden', name: 'Golden Sun', primary: '#f59e0b', secondary: '#d97706', highlight: '#fef08a', label: 'Radiant Glow' },
  { id: 'ruby', name: 'Ruby Flame', primary: '#e11d48', secondary: '#be123c', highlight: '#fda4af', label: 'Blazing Spark' },
  { id: 'amethyst', name: 'Cosmic Violet', primary: '#8b5cf6', secondary: '#6d28d9', highlight: '#e9d5ff', label: 'Mystic Aura' },
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

// 1. Cute Expressive Worm Head
function WormHeadSVG({ facing = 'right', skinId = 'emerald' }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const gradId = `wormGrad-${skin.id}`;

  return (
    <svg className={`worm-head-svg-container facing-${facing}`} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={skin.highlight} />
          <stop offset="60%" stopColor={skin.primary} />
          <stop offset="100%" stopColor={skin.secondary} />
        </radialGradient>
        <filter id="headDropShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Head Leaf Sprout */}
      <g className="head-sprout-leaf" transform="translate(46, 8)">
        <path d="M4 14 C4 4, 18 2, 20 8 C22 14, 12 18, 4 14 Z" fill="#4ade80" stroke="#15803d" strokeWidth="1.5" />
        <path d="M4 14 C10 10, 16 9, 19 8" stroke="#166534" strokeWidth="1" fill="none" />
        <path d="M4 14 Q2 20 4 24" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>

      {/* Main Head Base */}
      <circle cx="50" cy="54" r="40" fill={`url(#${gradId})`} filter="url(#headDropShadow)" />

      {/* Specular Head Highlight */}
      <ellipse cx="38" cy="32" rx="14" ry="9" fill="#ffffff" opacity="0.45" transform="rotate(-20 38 32)" />

      {/* Rosy Cheeks */}
      <ellipse cx="24" cy="62" rx="6" ry="4" fill="#fb7185" opacity="0.8" />
      <ellipse cx="76" cy="62" rx="6" ry="4" fill="#fb7185" opacity="0.8" />

      {/* Kawaii Cartoon Eyes */}
      {/* Left Eye */}
      <g transform="translate(32, 42)">
        <ellipse cx="0" cy="0" rx="8" ry="11" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="2" cy="0" r="5" fill="#0f172a" />
        <circle cx="0.5" cy="-2" r="2.5" fill="#ffffff" />
        <circle cx="3" cy="2" r="1" fill="#ffffff" />
      </g>

      {/* Right Eye */}
      <g transform="translate(68, 42)">
        <ellipse cx="0" cy="0" rx="8" ry="11" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="2" cy="0" r="5" fill="#0f172a" />
        <circle cx="0.5" cy="-2" r="2.5" fill="#ffffff" />
        <circle cx="3" cy="2" r="1" fill="#ffffff" />
      </g>

      {/* Cheerful Smile */}
      <path d="M42 66 Q50 75 58 66" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 2. Worm Body Segment
function WormSegmentSVG({ skinId = 'emerald', scale = 1 }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const gradId = `segGrad-${skin.id}`;

  return (
    <svg className="worm-segment-svg-container" style={{ '--seg-scale': scale }} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={gradId} cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor={skin.highlight} />
          <stop offset="65%" stopColor={skin.primary} />
          <stop offset="100%" stopColor={skin.secondary} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill={`url(#${gradId})`} />
      <ellipse cx="38" cy="34" rx="14" ry="8" fill="#ffffff" opacity="0.4" transform="rotate(-25 38 34)" />
    </svg>
  );
}

// 3. Worm Tail Segment
function WormTailSVG({ skinId = 'emerald' }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const gradId = `tailGrad-${skin.id}`;

  return (
    <svg className="worm-tail-svg-container" viewBox="0 0 100 100">
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={skin.highlight} />
          <stop offset="60%" stopColor={skin.primary} />
          <stop offset="100%" stopColor={skin.secondary} />
        </radialGradient>
      </defs>
      <path d="M20 50 C20 28, 48 20, 75 35 C90 44, 90 56, 75 65 C48 80, 20 72, 20 50 Z" fill={`url(#${gradId})`} />
      <circle cx="38" cy="44" r="7" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}

// 4. Luscious 3D Candy Apple
function JuicyAppleSVG() {
  return (
    <svg className="apple-svg-container" viewBox="0 0 100 100">
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

      {/* Orbiting Sparkle Stars */}
      <g className="apple-sparkle-star s1" transform="translate(18, 28)">
        <polygon points="6,0 8,4 12,6 8,8 6,12 4,8 0,6 4,4" fill="#fef08a" />
      </g>
      <g className="apple-sparkle-star s2" transform="translate(76, 74)">
        <polygon points="5,0 7,3 10,5 7,7 5,10 3,7 0,5 3,3" fill="#fef08a" />
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
      />

      {/* Galaxy Core Vortex */}
      <circle className="portal-pulse-ring" cx="50" cy="50" r="38" fill="url(#portalVoidGrad)" />

      {unlocked ? (
        /* Unlocked Spiraling Nebula Rays */
        <g className="portal-galaxy-spin">
          <path d="M50 50 Q65 30 85 45" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M50 50 Q35 70 15 55" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M50 50 Q70 65 55 85" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M50 50 Q30 35 45 15" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
          <circle cx="50" cy="50" r="9" fill="#ffffff" />
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
      </defs>

      {/* Main Beveled Block */}
      <rect x="4" y="4" width="92" height="92" rx="10" fill="url(#wallTopGrad)" stroke="#1e293b" strokeWidth="3" />
      <rect x="8" y="8" width="84" height="84" rx="8" fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity="0.35" />

      {/* Carved Ancient Rune Glyph */}
      <path d="M50 24 L74 50 L50 76 L26 50 Z" stroke="#cbd5e1" strokeWidth="2" fill="none" opacity="0.75" />
      <circle cx="50" cy="50" r="6" fill="#38bdf8" opacity="0.75" />
      <line x1="50" y1="24" x2="50" y2="76" stroke="#cbd5e1" strokeWidth="1.5" opacity="0.6" />
      <line x1="26" y1="50" x2="74" y2="50" stroke="#cbd5e1" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
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
  const [bonusMoves, setBonusMoves] = useState(0);
  const [facing, setFacing] = useState('right');
  const [floatingScores, setFloatingScores] = useState([]);
  const [starPopStage, setStarPopStage] = useState(0);
  const [confettiParticles, setConfettiParticles] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals & Screen States
  const [mapModal, setMapModal] = useState(false);
  const [leaderboardModal, setLeaderboardModal] = useState(false);
  const [shopModal, setShopModal] = useState(false);
  const [howToPlayModal, setHowToPlayModal] = useState(false);
  const [levelPreview, setLevelPreview] = useState(null);
  const [selectedWorldTab, setSelectedWorldTab] = useState(0); // 0 = all, 1..5 = world id

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | 'profile' | null
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Touch gesture tracking
  const touchStartRef = useRef({ x: 0, y: 0 });

  const level = LEVELS[levelId - 1] || LEVELS[0];
  const [game, setGame] = useState(() => initialState(LEVELS[levelId - 1] || LEVELS[0]));

  // Current World
  const currentWorld = WORLDS.find(w => levelId >= w.range[0] && levelId <= w.range[1]) || WORLDS[0];

  // Persist guest progress to localStorage
  useEffect(() => {
    localStorage.setItem('coins', coins);
    localStorage.setItem('completedLevels', JSON.stringify(completed));
    localStorage.setItem('currentLevel', levelId);
    localStorage.setItem('sound', String(sound));
    localStorage.setItem('music', String(music));
  }, [coins, completed, levelId, sound, music]);

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
    setStarPopStage(0);
    setConfettiParticles([]);
    setLevelPreview(null);
    setMapModal(false);
    playSound('click', sound);
  }, [sound]);

  // Spawn celebratory confetti
  const triggerConfetti = useCallback(() => {
    const colors = ['#10b981', '#fbbf24', '#38bdf8', '#c084fc', '#f43f5e', '#ffffff'];
    const particles = Array.from({ length: 48 }).map((_, idx) => ({
      id: idx,
      color: colors[idx % colors.length],
      left: Math.random() * 96 + '%',
      delay: Math.random() * 0.4 + 's',
      duration: (1.5 + Math.random() * 1.2) + 's',
      size: (6 + Math.random() * 8) + 'px'
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
      setHistory(h => [...h.slice(-35), old]);
      setSolverHint(null);

      const effectiveLevel = { ...level, moveLimit: level.moveLimit + bonusMoves };
      const next = step(old, dir, effectiveLevel);

      // Apple collection audio & popup
      const didEat = next.apples.length < old.apples.length;
      if (didEat) {
        playSound('eat', sound);
        const eatenApple = old.apples.find(a => same(a, next.worm[0]));
        if (eatenApple) {
          const scoreId = Date.now() + Math.random();
          setFloatingScores(prev => [...prev, { id: scoreId, x: eatenApple[0], y: eatenApple[1], text: '+10' }]);
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
      }

      if (next.status === 'completed') {
        const stars = calculateStars(next.moves, level.moveLimit + bonusMoves, level.parMoves);
        setEarnedStars(stars);
        playSound('complete', sound);
        triggerConfetti();

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
              }
            })
            .catch(() => {});
        }
      } else if (next.status === 'failed') {
        playSound('fail', sound);
        setNotice(next.reason);
      } else if (!didEat) {
        playSound('move', sound);
      }

      return next;
    });
  }, [level, levelId, sound, token, bonusMoves, triggerConfetti]);

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

  return (
    <div
      className="game-master-container"
      data-world={currentWorld.id}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* AMBIENT FLOATING MOTES */}
      <div className="ambient-particles-layer">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="ambient-particle-dot"
            style={{
              left: `${(i * 19) % 100}%`,
              width: `${4 + (i % 5) * 3}px`,
              height: `${4 + (i % 5) * 3}px`,
              background: currentWorld.color,
              animationDuration: `${7 + (i % 6) * 2}s`,
              animationDelay: `${(i % 5) * 1.5}s`
            }}
          />
        ))}
      </div>

      {/* TOP ARCADE GLASS HUD */}
      <header className="game-arcade-hud">
        <div className="hud-cluster-left">
          <div className="hud-brand-pill" onClick={() => setMapModal(true)} title="Browse Realms & Levels">
            <div className="brand-icon-wrapper">
              <Apple size={18} />
            </div>
            <span className="brand-title-text">APPLE WORM</span>
          </div>

          <div className="hud-realm-tag" style={{ borderColor: `${currentWorld.color}66` }}>
            <span className="realm-glow-indicator" style={{ backgroundColor: currentWorld.color }} />
            <span>{currentWorld.name} • Lv. {String(levelId).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Center Live Metrics */}
        <div className="hud-cluster-center">
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
        <div className="hud-cluster-right">
          <div className="coin-badge-pill" title="Garden Coins">
            <Coins size={16} />
            <span>{coins}</span>
          </div>

          <button className="hud-nav-tab-btn" onClick={() => setMapModal(true)} title="Open Level Map">
            <MapPin size={15} /> Realms
          </button>

          <button className="hud-nav-tab-btn" onClick={() => setLeaderboardModal(true)} title="Hall of Fame">
            <Trophy size={15} /> Rank
          </button>

          <button className="hud-action-icon-btn" onClick={() => setShopModal(true)} title="Skins & Boosters">
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
            title={sound ? 'Mute SFX (S)' : 'Unmute SFX (S)'}
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
            className="hud-action-icon-btn"
            onClick={() => setAuthModal(user ? 'profile' : 'login')}
            title={user ? `${user.name} (Signed in)` : 'Sign in / Profile'}
            style={{ borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', fontWeight: 800 }}
          >
            {user ? user.name[0].toUpperCase() : 'G'}
          </button>
        </div>
      </header>

      {/* NOTICE TOAST */}
      {notice && game.status === 'playing' && (
        <div className="notice-banner-pill">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* SOLVER HINT BANNER */}
      {solverHint && (
        <div className="solver-hint-pill">
          <Compass size={16} style={{ color: '#38bdf8' }} />
          <span>Suggested: Slither <b>{solverHint.nextDirection.toUpperCase()}</b> ({solverHint.distance} steps to {solverHint.targetLabel})</span>
          <button onClick={() => setSolverHint(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>×</button>
        </div>
      )}

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

                return (
                  <div key={i} className={cellClass(p)}>
                    {isWormHead ? (
                      <WormHeadSVG facing={facing} skinId={wormSkin} />
                    ) : isWormTail ? (
                      <WormTailSVG skinId={wormSkin} />
                    ) : segmentIdx > 0 ? (
                      <WormSegmentSVG
                        skinId={wormSkin}
                        scale={Math.max(0.72, 1 - (segmentIdx * 0.032))}
                      />
                    ) : isApple(p) ? (
                      <JuicyAppleSVG />
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
            <Undo2 size={16} /> UNDO
          </button>
          <button className="dock-action-btn" onClick={restart} title="Restart Garden (R)">
            <RotateCcw size={16} /> RESET
          </button>
          <button className="dock-action-btn" onClick={triggerSmartHint} title="BFS Shortest Route Hint (H)">
            <Lightbulb size={16} /> HINT
          </button>
          <button className="dock-action-btn boost-btn" onClick={buyBoost} title="Buy +5 moves for 30 coins">
            <Zap size={16} /> +5 MOVES
          </button>
        </div>

        {/* Virtual Ergonomic D-Pad */}
        <div className="virtual-dpad-cluster">
          <button className="dpad-direction-button" onClick={() => move('up')} aria-label="Up">
            <ArrowUp size={20} />
          </button>
          <div className="dpad-row-keys">
            <button className="dpad-direction-button" onClick={() => move('left')} aria-label="Left">
              <ArrowLeft size={20} />
            </button>
            <button className="dpad-direction-button" onClick={() => move('down')} aria-label="Down">
              <ArrowDown size={20} />
            </button>
            <button className="dpad-direction-button" onClick={() => move('right')} aria-label="Right">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </footer>

      {/* CELEBRATION CONFETTI STAGE */}
      {game.status === 'completed' && (
        <div className="celebration-confetti-stage">
          {confettiParticles.map(p => (
            <span
              key={p.id}
              className="confetti-flake"
              style={{
                background: p.color,
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
                width: p.size,
                height: p.size
              }}
            />
          ))}
        </div>
      )}

      {/* VICTORY CELEBRATION MODAL */}
      {game.status === 'completed' && (
        <div className="game-modal-backdrop">
          <div className="game-modal-panel victory-celebration-dialog">
            <div className="victory-trophy-pedestal">
              <Trophy size={44} />
            </div>

            <span style={{ color: '#34d399', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em' }}>
              {currentWorld.name.toUpperCase()} • LEVEL {levelId}
            </span>

            <h2 className="modal-prominent-title">Garden Cleared!</h2>

            <div className="podium-stars-trio">
              <div className={`star-podium-slot ${starPopStage >= 1 ? 'earned' : ''}`}>
                <Star size={32} fill={starPopStage >= 1 ? '#78350f' : 'none'} />
              </div>
              <div className={`star-podium-slot tall-center ${starPopStage >= 2 ? 'earned' : ''}`}>
                <Star size={42} fill={starPopStage >= 2 ? '#78350f' : 'none'} />
              </div>
              <div className={`star-podium-slot ${starPopStage >= 3 ? 'earned' : ''}`}>
                <Star size={32} fill={starPopStage >= 3 ? '#78350f' : 'none'} />
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
              <AlertCircle size={44} />
            </div>

            <span style={{ color: '#f43f5e', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em' }}>
              PUZZLE ATTEMPT FAILED
            </span>

            <h2 className="modal-prominent-title">{failureType?.title || 'Route Blocked'}</h2>

            <p style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 14 }}>
              {game.reason}
            </p>

            {failureType && (
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: 16, padding: '12px 16px', marginBottom: 20, textAlign: 'left', border: '1px solid var(--border-glass)' }}>
                <b style={{ color: '#fbbf24', fontSize: 12, display: 'block', marginBottom: 4 }}>STRATEGY TIP</b>
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
              <span style={{ color: '#34d399', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>THE 5 REALMS</span>
              <h2>Choose Your Garden</h2>
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>50 handcrafted puzzle gardens. Click any unlocked level to preview and play.</p>
            </div>

            {/* Realm Tabs */}
            <div className="world-carousel-deck">
              <button
                className={`world-realm-tab-card ${selectedWorldTab === 0 ? 'active' : ''}`}
                onClick={() => setSelectedWorldTab(0)}
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
                const unlocked = completed.includes(l.id) || completed.includes(l.id - 1) || l.id === 1;
                const isDone = completed.includes(l.id) && l.id < Math.max(...completed);
                const isCurrent = l.id === levelId;

                return (
                  <button
                    key={l.id}
                    className={`level-node-badge ${unlocked ? '' : 'locked'} ${isCurrent ? 'current-active' : ''}`}
                    onClick={() => unlocked && setLevelPreview(l)}
                  >
                    {isCurrent && (
                      <div className="level-node-mascot-head">
                        <WormHeadSVG facing="right" skinId={wormSkin} />
                      </div>
                    )}
                    <span className="level-node-number">
                      {unlocked ? String(l.id).padStart(2, '0') : <LockKeyhole size={16} />}
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
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, marginTop: 4 }}>
              Level {String(levelPreview.id).padStart(2, '0')}: {levelPreview.title}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '8px 0 16px' }}>{levelPreview.objective}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: 12, borderRadius: 14, border: '1px solid var(--border-glass)' }}>
                <small style={{ color: '#94a3b8', fontSize: 10, fontWeight: 800 }}>DIFFICULTY</small>
                <div style={{ color: levelPreview.worldColor, fontWeight: 800, fontSize: 14, marginTop: 3 }}>{levelPreview.difficulty}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: 12, borderRadius: 14, border: '1px solid var(--border-glass)' }}>
                <small style={{ color: '#94a3b8', fontSize: 10, fontWeight: 800 }}>APPLES TO EAT</small>
                <div style={{ fontWeight: 800, fontSize: 14, marginTop: 3 }}>{levelPreview.apples.length} 🍎</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: 12, borderRadius: 14, border: '1px solid var(--border-glass)' }}>
                <small style={{ color: '#94a3b8', fontSize: 10, fontWeight: 800 }}>PAR MOVES (3★)</small>
                <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: 14, marginTop: 3 }}>≤ {levelPreview.parMoves} moves</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: 12, borderRadius: 14, border: '1px solid var(--border-glass)' }}>
                <small style={{ color: '#94a3b8', fontSize: 10, fontWeight: 800 }}>MOVE LIMIT</small>
                <div style={{ fontWeight: 800, fontSize: 14, marginTop: 3 }}>{levelPreview.moveLimit} moves</div>
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
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, marginTop: 4 }}>Master Gardeners</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Top players ranked by stars earned, efficiency, and realms conquered.</p>

            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="podium-trio-stage">
                <div className="podium-pedestal-card">
                  <div className="podium-emblem">🥈</div>
                  <div className="podium-player-name">{leaderboard[1].name}</div>
                  <div className="podium-stars-count">⭐ {leaderboard[1].totalStars}</div>
                </div>
                <div className="podium-pedestal-card first-place">
                  <div className="podium-emblem">👑</div>
                  <div className="podium-player-name">{leaderboard[0].name}</div>
                  <div className="podium-stars-count">⭐ {leaderboard[0].totalStars}</div>
                </div>
                <div className="podium-pedestal-card">
                  <div className="podium-emblem">🥉</div>
                  <div className="podium-player-name">{leaderboard[2].name}</div>
                  <div className="podium-stars-count">⭐ {leaderboard[2].totalStars}</div>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <tbody>
                  {leaderboard.map((player, idx) => (
                    <tr key={player.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 800, color: '#94a3b8' }}>#{player.rank || idx + 1}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700 }}>{player.name} {player.isMe ? '(You)' : ''}</td>
                      <td style={{ padding: '8px 10px', color: '#fbbf24', fontWeight: 700, textAlign: 'right' }}>⭐ {player.totalStars}</td>
                      <td style={{ padding: '8px 10px', color: '#34d399', fontWeight: 700, textAlign: 'right' }}>{player.totalScore} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SHOP & SKINS WARDROBE MODAL */}
      {shopModal && (
        <div className="game-modal-backdrop" onClick={() => setShopModal(false)}>
          <div className="game-modal-panel" onClick={e => e.stopPropagation()}>
            <button className="modal-close-cross-btn" onClick={() => setShopModal(false)}>×</button>

            <span style={{ color: '#a855f7', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>GARDEN WARDROBE</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, marginTop: 4 }}>Skins & Boosters</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Customize your worm and stock up on booster moves.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '20px 0' }}>
              {SKINS.map(s => (
                <div
                  key={s.id}
                  onClick={() => { setWormSkin(s.id); localStorage.setItem('wormSkin', s.id); playSound('complete', sound); }}
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    background: wormSkin === s.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                    border: wormSkin === s.id ? `2px solid ${s.primary}` : '1px solid var(--border-glass)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: s.primary, boxShadow: `0 0 14px ${s.primary}88` }} />
                  <b style={{ fontSize: 13 }}>{s.name}</b>
                  <small style={{ color: '#94a3b8', fontSize: 10 }}>{wormSkin === s.id ? 'EQUIPPED' : 'TAP TO EQUIP'}</small>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: 14, borderRadius: 16, border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <b style={{ color: '#fbbf24', fontSize: 14, display: 'block' }}>⚡ Apple Boost (+5 Moves)</b>
                <small style={{ color: '#94a3b8', fontSize: 11 }}>Extend current puzzle move limit</small>
              </div>
              <button className="modal-primary-btn" onClick={buyBoost} disabled={coins < 30} style={{ padding: '8px 14px', fontSize: 12 }}>
                30 🪙 Buy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOW TO PLAY TUTORIAL MODAL */}
      {howToPlayModal && (
        <div className="game-modal-backdrop" onClick={() => setHowToPlayModal(false)}>
          <div className="game-modal-panel" onClick={e => e.stopPropagation()}>
            <button className="modal-close-cross-btn" onClick={() => setHowToPlayModal(false)}>×</button>

            <span style={{ color: '#34d399', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>TUTORIAL GUIDE</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, marginTop: 4 }}>How to Play</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '6px 0 16px' }}>Master the labyrinth gardens with smart turns!</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 14 }}>
                <span style={{ fontSize: 24 }}>🍏</span>
                <div>
                  <b style={{ fontSize: 13 }}>1. Eat All Apples</b>
                  <p style={{ color: '#94a3b8', fontSize: 12 }}>Each apple awards +10 score and extends your worm length by one segment.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 14 }}>
                <span style={{ fontSize: 24 }}>🌀</span>
                <div>
                  <b style={{ fontSize: 13 }}>2. Awaken the Portal</b>
                  <p style={{ color: '#94a3b8', fontSize: 12 }}>The cosmic portal is locked until every apple is consumed. Enter to clear the level!</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 14 }}>
                <span style={{ fontSize: 24 }}>🧱</span>
                <div>
                  <b style={{ fontSize: 13 }}>3. Avoid Traps & Tail</b>
                  <p style={{ color: '#94a3b8', fontSize: 12 }}>Crashing into stone walls, outside garden boundaries, or your own body fails the puzzle.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 14 }}>
                <span style={{ fontSize: 24 }}>🎮</span>
                <div>
                  <b style={{ fontSize: 13 }}>4. Fluid Controls</b>
                  <p style={{ color: '#94a3b8', fontSize: 12 }}>Desktop: Arrow Keys / WASD. Mobile: Swipe on screen or tap the virtual D-Pad. Hotkeys: Z (Undo), R (Reset), F (Fullscreen), H (BFS Hint).</p>
                </div>
              </div>
            </div>

            <button className="modal-primary-btn" style={{ width: '100%' }} onClick={() => setHowToPlayModal(false)}>
              Let's Slither!
            </button>
          </div>
        </div>
      )}

      {/* AUTH & PROFILE MODAL */}
      {authModal && (
        <div className="game-modal-backdrop" onClick={() => setAuthModal(null)}>
          <div className="game-modal-panel" onClick={e => e.stopPropagation()}>
            <button className="modal-close-cross-btn" onClick={() => setAuthModal(null)}>×</button>

            {authModal === 'profile' ? (
              <div>
                <span style={{ color: '#8b5cf6', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>GARDENER PROFILE</span>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, marginTop: 4 }}>{user?.name}</h2>
                <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Progress safely synced with MongoDB Atlas.</p>

                <div style={{ background: 'rgba(255,255,255,0.06)', padding: 16, borderRadius: 16, border: '1px solid var(--border-glass)', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>EMAIL: {user?.email}</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 14 }}>
                    <span>🪙 <b>{coins}</b> Coins</span>
                    <span>⭐ <b>{user?.totalStars || 0}</b> Stars</span>
                    <span>🌱 Level <b>{user?.currentLevel || levelId}</b></span>
                  </div>
                </div>

                <button className="modal-secondary-btn" style={{ width: '100%' }} onClick={handleLogout}>
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit}>
                <span style={{ color: '#34d399', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>
                  {authModal === 'register' ? 'NEW GARDENER' : 'WELCOME BACK'}
                </span>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, marginTop: 4 }}>
                  {authModal === 'register' ? 'Create Account' : 'Sign In'}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: '6px 0 16px' }}>
                  Sync your coins, stars, and garden progress across all your devices.
                </p>

                {authError && (
                  <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid #f43f5e', color: '#fca5a5', padding: '8px 12px', borderRadius: 10, fontSize: 12, marginBottom: 14 }}>
                    {authError}
                  </div>
                )}

                {authModal === 'register' && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: 4 }}>NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Khushi"
                      value={authForm.name}
                      onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: '#fff' }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: 4 }}>EMAIL</label>
                  <input
                    type="email"
                    required
                    placeholder="gardener@example.com"
                    value={authForm.email}
                    onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: 4 }}>PASSWORD</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', color: '#fff' }}
                  />
                </div>

                <button className="modal-primary-btn" type="submit" disabled={authLoading} style={{ width: '100%', marginBottom: 12 }}>
                  {authLoading ? 'Connecting...' : authModal === 'register' ? 'Create & Save' : 'Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthError(''); setAuthModal(authModal === 'register' ? 'login' : 'register'); }}
                  style={{ width: '100%', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}
                >
                  {authModal === 'register' ? 'Already have an account? Sign In' : "Don't have an account yet? Sign Up"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
