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
  { id: 'emerald', name: 'Emerald', color: '#10b981', label: 'Classic Garden' },
  { id: 'golden', name: 'Golden Sun', color: '#f59e0b', label: 'Radiant Glow' },
  { id: 'ruby', name: 'Ruby Flame', color: '#ef4444', label: 'Blazing Spark' },
  { id: 'amethyst', name: 'Cosmic Violet', color: '#8b5cf6', label: 'Mystic Aura' },
];

function calculateStars(moves, limit, parMoves) {
  const par = parMoves || Math.ceil(limit * 0.55);
  if (moves <= par) return 3;
  if (moves <= Math.ceil(limit * 0.8)) return 2;
  return 1;
}

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

  // Modals
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
    const colors = ['#4ade80', '#fbbf24', '#38bdf8', '#c084fc', '#f43f5e', '#ffffff'];
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
          setNotice('✨ All apples collected! The Cosmic Portal is open!');
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

  const cycleSkin = () => {
    const currentIdx = SKINS.findIndex(s => s.id === wormSkin);
    const nextSkin = SKINS[(currentIdx + 1) % SKINS.length];
    setWormSkin(nextSkin.id);
    localStorage.setItem('wormSkin', nextSkin.id);
    playSound('complete', sound);
    setNotice(`Equipped ${nextSkin.name} skin!`);
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
    let c = 'grid-cell';
    if (level.walls.some(w => same(w, p))) c += ' wall';
    if (game.worm.some(w => same(w, p))) c += ` worm skin-${wormSkin}`;
    if (game.worm.length && same(game.worm[0], p)) c += ` head skin-head-${wormSkin}`;
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
    if (r.includes('wall')) return { type: 'wall', icon: '🧱', title: 'Stone Barrier Collision!', tip: 'Stone walls are unyielding. Use open corners to redirect your trajectory.' };
    if (r.includes('tail') || r.includes('body')) return { type: 'body', icon: '🐛', title: 'Tangled Slither!', tip: 'Your worm only grows longer when consuming apples. Calculate your loops before eating!' };
    if (r.includes('garden') || r.includes('beyond')) return { type: 'boundary', icon: '🌿', title: 'Garden Edge Reached!', tip: 'Stay within the garden borders. Keep your slither centered when turning.' };
    return { type: 'moves', icon: '⏳', title: 'Move Limit Exceeded!', tip: 'Find shorter paths with fewer unnecessary detours, or use an Apple Boost (+5 moves)!' };
  }, [game.status, game.reason]);

  // Live star calculation as player moves
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
      className="game-viewport"
      data-world={currentWorld.id}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* AMBIENT FLOATING MOTES */}
      <div className="ambient-motes">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="ambient-mote"
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
      <header className="game-hud-top">
        <div className="hud-group-left">
          <div className="brand-pill" onClick={() => setMapModal(true)} title="Browse Realms & Levels">
            <div className="brand-icon-box">
              <Apple size={18} />
            </div>
            <span className="brand-title">APPLE WORM</span>
          </div>

          <div className="realm-badge" style={{ borderColor: `${currentWorld.color}66` }}>
            <span className="realm-dot" style={{ backgroundColor: currentWorld.color }} />
            <span>{currentWorld.name} • Lv. {String(levelId).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Center Live Stats */}
        <div className="hud-group-center">
          <div className="hud-stat-pill moves-pill">
            <span>MOVES:</span>
            <b>{game.moves}/{level.moveLimit + bonusMoves}</b>
            <small>(Par: {level.parMoves})</small>
          </div>

          <div className="hud-stat-pill hud-stars-live" title="Stars rating based on moves">
            <span className={`hud-star ${liveStars >= 1 ? 'active' : ''}`}>★</span>
            <span className={`hud-star ${liveStars >= 2 ? 'active' : ''}`}>★</span>
            <span className={`hud-star ${liveStars >= 3 ? 'active' : ''}`}>★</span>
          </div>

          <div className="hud-stat-pill hud-apples-pill">
            <span>🍎 {game.apples.length} left</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="hud-group-right">
          <div className="coin-counter" title="Garden Coins">
            <Coins size={16} />
            <span>{coins}</span>
          </div>

          <button className="hud-text-btn" onClick={() => setMapModal(true)} title="Open Level Map">
            <MapPin size={15} /> Realms
          </button>

          <button className="hud-text-btn" onClick={() => setLeaderboardModal(true)} title="Hall of Fame">
            <Trophy size={15} /> Rank
          </button>

          <button className="hud-icon-btn" onClick={() => setShopModal(true)} title="Skins & Boosters">
            <ShoppingBag size={16} />
          </button>

          <button
            className={`hud-icon-btn ${music ? 'active' : ''}`}
            onClick={toggleMusic}
            title={music ? 'Mute Music (M)' : 'Play Music (M)'}
          >
            <Music size={16} />
          </button>

          <button
            className={`hud-icon-btn ${sound ? 'active' : ''}`}
            onClick={() => setSound(!sound)}
            title={sound ? 'Mute SFX (S)' : 'Unmute SFX (S)'}
          >
            {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            className="hud-icon-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            className="hud-icon-btn"
            onClick={() => setHowToPlayModal(true)}
            title="How to Play Tutorial"
          >
            <CircleHelp size={16} />
          </button>

          <button
            className="hud-avatar-btn"
            onClick={() => setAuthModal(user ? 'profile' : 'login')}
            title={user ? `${user.name} (Signed in)` : 'Sign in / Profile'}
          >
            {user ? user.name[0].toUpperCase() : 'G'}
          </button>
        </div>
      </header>

      {/* NOTICE TOAST */}
      {notice && game.status === 'playing' && (
        <div className="notice-toast">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* SOLVER HINT BANNER */}
      {solverHint && (
        <div className="hint-banner">
          <Compass size={16} style={{ color: '#38bdf8' }} />
          <span>Suggested: Slither <b>{solverHint.nextDirection.toUpperCase()}</b> ({solverHint.distance} steps to {solverHint.targetLabel})</span>
          <button onClick={() => setSolverHint(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* CENTER STAGE: 3D FLOATING GARDEN ISLAND */}
      <main className="game-stage">
        <div className="board-island-wrapper">
          {/* Floating score popups */}
          {floatingScores.map(s => {
            const pctX = (s.x / level.size) * 100 + (100 / (level.size * 2));
            const pctY = (s.y / level.size) * 100;
            return (
              <div
                key={s.id}
                className="floating-score"
                style={{ left: `${pctX}%`, top: `${pctY}%` }}
              >
                {s.text}
              </div>
            );
          })}

          <div
            className="board-island"
            data-world={currentWorld.id}
          >
            <div className="game-grid" style={{ '--grid-size': level.size }}>
              {board.map((p, i) => {
                const segmentIdx = game.worm.findIndex(w => same(w, p));
                const isWormHead = segmentIdx === 0;
                const isWormTail = segmentIdx > 0 && segmentIdx === game.worm.length - 1;

                return (
                  <div key={i} className={cellClass(p)}>
                    {isWormHead ? (
                      <div className={`worm-head-container face-${facing}`}>
                        <div className="worm-head-sprout">🌿</div>
                        <div className="worm-head-eyes">
                          <span className="worm-eye">
                            <span className="pupil" />
                            <span className="eye-shine" />
                          </span>
                          <span className="worm-eye">
                            <span className="pupil" />
                            <span className="eye-shine" />
                          </span>
                        </div>
                        <div className="worm-cheeks">
                          <span className="blush" />
                          <span className="blush" />
                        </div>
                        <div className="worm-mouth" />
                      </div>
                    ) : segmentIdx > 0 ? (
                      <div
                        className={`worm-segment ${isWormTail ? 'worm-tail' : ''}`}
                        style={{
                          '--segment-scale': Math.max(0.72, 1 - (segmentIdx * 0.032)),
                          '--segment-index': segmentIdx
                        }}
                      >
                        <span className="worm-segment-shine" />
                      </div>
                    ) : isApple(p) ? (
                      <div className="apple-wrapper">
                        <div className="apple-stem" />
                        <div className="apple-leaf" />
                        <div className="apple-body">
                          <div className="apple-highlight" />
                        </div>
                        <span className="apple-sparkle s1">✦</span>
                        <span className="apple-sparkle s2">✦</span>
                      </div>
                    ) : same(level.portal, p) ? (
                      <div className={`portal-vortex ${game.apples.length === 0 ? 'portal-unlocked' : 'portal-locked'}`}>
                        {game.apples.length > 0 ? (
                          <span className="portal-lock-icon">🔒</span>
                        ) : (
                          <span className="portal-ready-icon">🌀</span>
                        )}
                      </div>
                    ) : level.walls.some(w => same(w, p)) ? (
                      <div className="wall-block">
                        <span className="wall-rune">❖</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM FLOATING CONTROLLER & ACTION DOCK */}
      <footer className="game-dock">
        <div className="dock-actions-left">
          <button className="dock-btn" onClick={undo} disabled={!history.length} title="Undo last move (Z)">
            <Undo2 size={16} /> UNDO
          </button>
          <button className="dock-btn" onClick={restart} title="Restart Garden (R)">
            <RotateCcw size={16} /> RESET
          </button>
          <button className="dock-btn" onClick={triggerSmartHint} title="BFS Shortest Route Hint (H)">
            <Lightbulb size={16} /> HINT
          </button>
          <button className="dock-btn gold" onClick={buyBoost} title="Buy +5 moves for 30 coins">
            <Zap size={16} /> +5 MOVES
          </button>
        </div>

        {/* Virtual D-Pad for Mobile & Tablet touch */}
        <div className="virtual-dpad">
          <button className="dpad-key" onClick={() => move('up')} aria-label="Up">
            <ArrowUp size={20} />
          </button>
          <div className="dpad-row">
            <button className="dpad-key" onClick={() => move('left')} aria-label="Left">
              <ArrowLeft size={20} />
            </button>
            <button className="dpad-key" onClick={() => move('down')} aria-label="Down">
              <ArrowDown size={20} />
            </button>
            <button className="dpad-key" onClick={() => move('right')} aria-label="Right">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </footer>

      {/* CELEBRATION CONFETTI CANVAS */}
      {game.status === 'completed' && (
        <div className="confetti-canvas">
          {confettiParticles.map(p => (
            <span
              key={p.id}
              className="confetti-particle"
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

      {/* VICTORY MODAL OVERLAY */}
      {game.status === 'completed' && (
        <div className="modal-overlay">
          <div className="modal-dialog result-dialog">
            <div className="trophy-glow-box">
              <Trophy size={42} />
            </div>

            <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em' }}>
              {currentWorld.name.toUpperCase()} • LEVEL {levelId}
            </span>

            <h2 className="result-title">Garden Cleared!</h2>

            <div className="victory-stars-podium">
              <div className={`victory-star-node ${starPopStage >= 1 ? 'earned' : ''}`}>
                <Star size={30} fill={starPopStage >= 1 ? '#78350f' : 'none'} />
              </div>
              <div className={`victory-star-node center-star ${starPopStage >= 2 ? 'earned' : ''}`}>
                <Star size={40} fill={starPopStage >= 2 ? '#78350f' : 'none'} />
              </div>
              <div className={`victory-star-node ${starPopStage >= 3 ? 'earned' : ''}`}>
                <Star size={30} fill={starPopStage >= 3 ? '#78350f' : 'none'} />
              </div>
            </div>

            <div className="result-stats-row">
              <div className="result-stat-box">
                <small>MOVES</small>
                <strong>{game.moves} / {level.parMoves} par</strong>
              </div>
              <div className="result-stat-box bonus">
                <small>COIN REWARD</small>
                <strong>+25 🪙</strong>
              </div>
              <div className="result-stat-box">
                <small>SCORE</small>
                <strong>+{game.score}</strong>
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 22 }}>
              {game.moves <= level.parMoves
                ? '🌟 Flawless precision! You matched the master Par moves target.'
                : 'Well played! Slither into the next garden or replay to earn 3 stars.'}
            </p>

            <div className="modal-actions-row">
              <button
                className="modal-btn-primary"
                onClick={() => startLevel(Math.min(50, levelId + 1))}
              >
                Next Level <ChevronRight size={18} />
              </button>
              <button className="modal-btn-secondary" onClick={restart}>
                <RotateCcw size={16} /> Replay
              </button>
              <button className="modal-btn-secondary" onClick={() => setMapModal(true)}>
                Realms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAILURE MODAL OVERLAY */}
      {game.status === 'failed' && (
        <div className="modal-overlay">
          <div className="modal-dialog result-dialog">
            <div className="failure-glow-box">
              <AlertCircle size={42} />
            </div>

            <span style={{ color: '#f43f5e', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em' }}>
              PUZZLE ATTEMPT FAILED
            </span>

            <h2 className="result-title">{failureType?.title || 'Route Blocked'}</h2>

            <p style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 14 }}>
              {game.reason}
            </p>

            {failureType && (
              <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: 16, padding: '12px 16px', marginBottom: 20, textAlign: 'left', border: '1px solid var(--border-glass)' }}>
                <b style={{ color: '#fbbf24', fontSize: 12, display: 'block', marginBottom: 4 }}>STRATEGY TIP</b>
                <p style={{ color: '#94a3b8', fontSize: 13 }}>{failureType.tip}</p>
              </div>
            )}

            <div className="modal-actions-row">
              {history.length > 0 && (
                <button className="modal-btn-primary" onClick={undo} style={{ background: '#8b5cf6', borderColor: '#a855f7' }}>
                  <RotateCcw size={16} /> Undo Move (Z)
                </button>
              )}
              <button className="modal-btn-primary" onClick={restart}>
                Try Again (R)
              </button>
              {failureType?.type === 'moves' && (
                <button className="modal-btn-secondary" onClick={buyBoost} style={{ borderColor: '#f59e0b', color: '#fbbf24' }}>
                  <Zap size={14} /> +5 Moves (30🪙)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SAGA REALMS & LEVEL MAP MODAL */}
      {mapModal && (
        <div className="modal-overlay" onClick={() => setMapModal(false)}>
          <div className="modal-dialog saga-dialog" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setMapModal(false)}>×</button>

            <div className="saga-header">
              <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>THE 5 REALMS</span>
              <h2>Choose Your Garden</h2>
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>50 handcrafted puzzle gardens. Click any unlocked level to preview and play.</p>
            </div>

            {/* Realm Tabs */}
            <div className="world-tabs-carousel">
              <button
                className={`world-tab-card ${selectedWorldTab === 0 ? 'active' : ''}`}
                onClick={() => setSelectedWorldTab(0)}
              >
                <span>🌐 All Realms</span>
                <span className="world-tab-count">50</span>
              </button>
              {WORLDS.map(w => {
                const worldCompleted = completed.filter(id => id >= w.range[0] && id <= w.range[1]).length;
                return (
                  <button
                    key={w.id}
                    className={`world-tab-card ${selectedWorldTab === w.id ? 'active' : ''}`}
                    onClick={() => setSelectedWorldTab(w.id)}
                  >
                    <span>{w.icon} {w.name}</span>
                    <span className="world-tab-count">{worldCompleted}/10</span>
                  </button>
                );
              })}
            </div>

            {/* Level Grid */}
            <div className="saga-grid">
              {displayedLevels.map(l => {
                const unlocked = completed.includes(l.id) || completed.includes(l.id - 1) || l.id === 1;
                const isDone = completed.includes(l.id) && l.id < Math.max(...completed);
                const isCurrent = l.id === levelId;

                return (
                  <button
                    key={l.id}
                    className={`saga-node-btn ${unlocked ? '' : 'locked'} ${isCurrent ? 'current' : ''}`}
                    onClick={() => unlocked && setLevelPreview(l)}
                  >
                    {isCurrent && <span className="saga-node-mascot">🐛</span>}
                    <span className="saga-node-num">
                      {unlocked ? String(l.id).padStart(2, '0') : <LockKeyhole size={16} />}
                    </span>
                    <span className="saga-node-stars">
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
        <div className="modal-overlay" onClick={() => setLevelPreview(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setLevelPreview(null)}>×</button>

            <span style={{ color: levelPreview.worldColor, fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>
              {levelPreview.worldName.toUpperCase()}
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginTop: 4 }}>
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
              className="modal-btn-primary"
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
        <div className="modal-overlay" onClick={() => setLeaderboardModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <button className="modal-close-btn" onClick={() => setLeaderboardModal(false)}>×</button>

            <span style={{ color: '#fbbf24', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>HALL OF FAME</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginTop: 4 }}>Master Gardeners</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Top players ranked by stars earned, efficiency, and realms conquered.</p>

            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="podium-container">
                <div className="podium-step rank-2">
                  <div className="podium-crown">🥈</div>
                  <div className="podium-name">{leaderboard[1].name}</div>
                  <div className="podium-score">⭐ {leaderboard[1].totalStars}</div>
                </div>
                <div className="podium-step rank-1">
                  <div className="podium-crown">👑</div>
                  <div className="podium-name">{leaderboard[0].name}</div>
                  <div className="podium-score">⭐ {leaderboard[0].totalStars}</div>
                </div>
                <div className="podium-step rank-3">
                  <div className="podium-crown">🥉</div>
                  <div className="podium-name">{leaderboard[2].name}</div>
                  <div className="podium-score">⭐ {leaderboard[2].totalStars}</div>
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
                      <td style={{ padding: '8px 10px', color: '#4ade80', fontWeight: 700, textAlign: 'right' }}>{player.totalScore} pts</td>
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
        <div className="modal-overlay" onClick={() => setShopModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShopModal(false)}>×</button>

            <span style={{ color: '#a855f7', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>GARDEN WARDROBE</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginTop: 4 }}>Skins & Boosters</h2>
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
                    border: wormSkin === s.id ? `2px solid ${s.color}` : '1px solid var(--border-glass)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: s.color, boxShadow: `0 0 14px ${s.color}88` }} />
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
              <button className="modal-btn-primary" onClick={buyBoost} disabled={coins < 30} style={{ padding: '8px 14px', fontSize: 12 }}>
                30 🪙 Buy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOW TO PLAY TUTORIAL MODAL */}
      {howToPlayModal && (
        <div className="modal-overlay" onClick={() => setHowToPlayModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setHowToPlayModal(false)}>×</button>

            <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>TUTORIAL GUIDE</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginTop: 4 }}>How to Play</h2>
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

            <button className="modal-btn-primary" style={{ width: '100%' }} onClick={() => setHowToPlayModal(false)}>
              Let's Slither!
            </button>
          </div>
        </div>
      )}

      {/* AUTH & PROFILE MODAL */}
      {authModal && (
        <div className="modal-overlay" onClick={() => setAuthModal(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setAuthModal(null)}>×</button>

            {authModal === 'profile' ? (
              <div>
                <span style={{ color: '#8b5cf6', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>GARDENER PROFILE</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginTop: 4 }}>{user?.name}</h2>
                <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Progress safely synced with MongoDB Atlas.</p>

                <div style={{ background: 'rgba(255,255,255,0.06)', padding: 16, borderRadius: 16, border: '1px solid var(--border-glass)', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>EMAIL: {user?.email}</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 14 }}>
                    <span>🪙 <b>{coins}</b> Coins</span>
                    <span>⭐ <b>{user?.totalStars || 0}</b> Stars</span>
                    <span>🌱 Level <b>{user?.currentLevel || levelId}</b></span>
                  </div>
                </div>

                <button className="modal-btn-secondary" style={{ width: '100%' }} onClick={handleLogout}>
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit}>
                <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>
                  {authModal === 'register' ? 'NEW GARDENER' : 'WELCOME BACK'}
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginTop: 4 }}>
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

                <button className="modal-btn-primary" type="submit" disabled={authLoading} style={{ width: '100%', marginBottom: 12 }}>
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
