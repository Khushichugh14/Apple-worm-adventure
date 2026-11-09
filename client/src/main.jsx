import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Apple, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Award,
  ChevronRight, CircleHelp, Coins, Gamepad2, Gem, Lightbulb,
  LockKeyhole, RotateCcw, Settings, ShieldCheck, Sparkles, Star,
  Trophy, Volume2, VolumeX, Zap, User as UserIcon, LogOut, Check, X,
  Compass, Play, RefreshCw, Flame, Crown, Flag, AlertCircle,
  Maximize2, Minimize2, Music, Undo2, HelpCircle
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
  const [mode, setMode] = useState('play'); // 'play' | 'levels' | 'rewards' | 'leaderboard'
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
  const [selectedWorldTab, setSelectedWorldTab] = useState(0); // 0 = all, 1..5 = specific world
  const [levelPreview, setLevelPreview] = useState(null);
  const [howToPlayModal, setHowToPlayModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {});
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
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
      if (next) {
        startBgm(true);
      } else {
        stopBgm();
      }
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

  // Fetch leaderboard data when opening leaderboard tab
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
    if (mode === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [mode, fetchLeaderboard]);

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
    setMode('play');
    playSound('click', sound);
  }, [sound]);

  // Spawn celebratory confetti
  const triggerConfetti = useCallback(() => {
    const colors = ['#b9f36c', '#f3d777', '#38bdf8', '#c084fc', '#ff6c72', '#ffffff'];
    const particles = Array.from({ length: 42 }).map((_, idx) => ({
      id: idx,
      color: colors[idx % colors.length],
      left: Math.random() * 95 + '%',
      delay: Math.random() * 0.4 + 's',
      duration: (1.6 + Math.random() * 1) + 's',
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
          if (same(nextHead, old.worm[1])) {
            return old; // Safely ignore 180° neck reverse
          }
        }
      }

      setFacing(dir);
      setHistory(h => [...h.slice(-35), old]);
      setSolverHint(null);

      const next = step(old, dir, level);

      // Play sound and animation for apple eaten
      const didEat = next.apples.length < old.apples.length;
      if (didEat) {
        playSound('eat', sound);
        // Show floating +10 animation at eaten apple position
        const eatenApple = old.apples.find(a => same(a, next.worm[0]));
        if (eatenApple) {
          const scoreId = Date.now() + Math.random();
          setFloatingScores(prev => [...prev, { id: scoreId, x: eatenApple[0], y: eatenApple[1], text: '+10' }]);
          setTimeout(() => {
            setFloatingScores(prev => prev.filter(s => s.id !== scoreId));
          }, 850);
        }
        // If this was the last apple, play portal activation sound!
        if (next.apples.length === 0) {
          playSound('portalOpen', sound);
          setNotice('✨ All apples collected! The portal has awakened.');
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
        setNotice(`Garden cleared! Earned ${stars} ★ and +25 coins.`);

        // Sync with backend MongoDB if logged in
        if (token) {
          fetch(`${API_URL}/player/progress`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              levelId,
              score: next.score,
              moves: next.moves,
              stars
            })
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
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleTouchEnd = e => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 26) {
      if (absX > absY) {
        move(dx > 0 ? 'right' : 'left');
      } else {
        move(dy > 0 ? 'down' : 'up');
      }
    }
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const onKey = e => {
      // Prevent page scrolling on navigation keys while playing
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
        if (game.status === 'completed') {
          startLevel(Math.min(50, levelId + 1));
        } else if (game.status === 'failed') {
          restart();
        }
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
      setNotice('Move undone. Find a safer path!');
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

    // Sync spend with server if logged in
    if (token) {
      fetch(`${API_URL}/player/wallet/spend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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
    const hintResult = findNextHint(game, level);
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
    let c = 'cell';
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

  // Determine current world
  const currentWorld = WORLDS.find(w => levelId >= w.range[0] && levelId <= w.range[1]) || WORLDS[0];

  // Failure reason helpers
  const failureType = useMemo(() => {
    if (game.status !== 'failed') return null;
    const r = game.reason.toLowerCase();
    if (r.includes('wall')) return { type: 'wall', icon: '🧱', title: 'Stone Barrier Collision!', tip: 'Stone walls are unyielding. Use open corners to redirect your trajectory.' };
    if (r.includes('tail') || r.includes('body')) return { type: 'body', icon: '🐛', title: 'Tangled Slither!', tip: 'Your worm only grows longer when consuming apples. Calculate your loops before eating!' };
    if (r.includes('garden') || r.includes('beyond')) return { type: 'boundary', icon: '🌿', title: 'Garden Edge Reached!', tip: 'Stay within the garden borders. Keep your slither centered when turning.' };
    return { type: 'moves', icon: '⏳', title: 'Move Limit Exceeded!', tip: 'Find shorter paths with fewer unnecessary detours, or use an Apple Boost (+5 moves)!' };
  }, [game.status, game.reason]);

  // Filtered levels for level map
  const displayedLevels = useMemo(() => {
    if (selectedWorldTab === 0) return LEVELS;
    return LEVELS.filter(l => l.worldId === selectedWorldTab);
  }, [selectedWorldTab]);

  // Shared Game Board Content (Used in both Standard and Fullscreen modes)
  const renderGameBoard = () => (
    <div
      className="board-wrap"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Floating Score Popups */}
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

      <div className="board" data-world={currentWorld.id} style={{ '--grid-size': level.size }}>
        {board.map((p, i) => {
          const segmentIdx = game.worm.findIndex(w => same(w, p));
          const isWormHead = segmentIdx === 0;
          const isWormTail = segmentIdx > 0 && segmentIdx === game.worm.length - 1;

          return (
            <div key={i} className={cellClass(p)}>
              {isWormHead ? (
                <div className={`worm-head-container face-${facing}`}>
                  <div className="worm-head-eyes">
                    <span className="worm-eye"><span className="pupil" /></span>
                    <span className="worm-eye"><span className="pupil" /></span>
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
                    '--segment-scale': Math.max(0.68, 1 - (segmentIdx * 0.035)),
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

      {solverHint && (
        <div className="hint-banner">
          <span>
            <Compass size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Suggested Move: <b>{solverHint.nextDirection}</b> ({solverHint.distance} steps to {solverHint.targetLabel})
          </span>
          <button onClick={() => setSolverHint(null)} style={{ background: 'none', border: 'none', color: '#c9c1ff', cursor: 'pointer' }}>×</button>
        </div>
      )}

      <div className="board-caption">
        <span><i className={`legend-dot skin-${wormSkin}`} /> Worm ({SKINS.find(s => s.id === wormSkin)?.name})</span>
        <span><i className="legend-dot apple-legend" /> Apple ({game.apples.length} left)</span>
        <span><i className="legend-dot portal-legend" /> Portal</span>
      </div>
    </div>
  );

  return (
    <div className={`app-shell ${isFullscreen ? 'fullscreen-active' : ''}`}>
      {/* TOPBAR */}
      <header className="topbar">
        <a className="brand" href="#home" onClick={() => setMode('play')}>
          <span className="brand-icon"><Apple size={22} /></span>
          <div>
            <span>{GAME_NAME}</span>
            <small>PUZZLE GARDENS</small>
          </div>
        </a>

        <nav>
          <button className={mode === 'play' ? 'nav-active' : ''} onClick={() => { setMode('play'); playSound('click', sound); }}>
            <Gamepad2 size={16} /> Play
          </button>
          <button className={mode === 'levels' ? 'nav-active' : ''} onClick={() => { setMode('levels'); playSound('click', sound); }}>
            <Gem size={16} /> Realms
          </button>
          <button className={mode === 'leaderboard' ? 'nav-active' : ''} onClick={() => { setMode('leaderboard'); playSound('click', sound); }}>
            <Trophy size={16} /> Rank
          </button>
          <button className={mode === 'rewards' ? 'nav-active' : ''} onClick={() => { setMode('rewards'); playSound('click', sound); }}>
            <Sparkles size={16} /> Rewards
          </button>
        </nav>

        <div className="top-actions">
          {user ? (
            <span className="sync-badge" title="Cloud save active in MongoDB">
              <Check size={13} /> Cloud Active
            </span>
          ) : null}
          <span className="coin-pill"><Coins size={16} />{coins}</span>
          <button
            className={`icon-button ${music ? 'active-glow' : ''}`}
            aria-label="Toggle ambient music"
            onClick={toggleMusic}
            title={music ? 'Mute ambient music (M)' : 'Play ambient music (M)'}
          >
            <Music size={17} />
          </button>
          <button
            className="icon-button"
            aria-label="Toggle sound effects"
            onClick={() => setSound(!sound)}
            title={sound ? 'Mute sound (S)' : 'Unmute sound (S)'}
          >
            {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            className="icon-button"
            aria-label="Toggle Fullscreen"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <button
            className="icon-button"
            aria-label="How to play"
            onClick={() => setHowToPlayModal(true)}
            title="How to play tutorial"
          >
            <CircleHelp size={17} />
          </button>
          <button
            className="avatar"
            title={user ? `${user.name} (Logged in)` : 'Sign in / Profile'}
            onClick={() => setAuthModal(user ? 'profile' : 'login')}
          >
            {user ? user.name[0].toUpperCase() : 'G'}
          </button>
        </div>
      </header>

      {/* HOW TO PLAY TUTORIAL MODAL */}
      {howToPlayModal && (
        <div className="modal-backdrop" onClick={() => setHowToPlayModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setHowToPlayModal(false)}>×</button>
            <span className="muted-label" style={{ color: '#b9f36c' }}>GAME TUTORIAL</span>
            <h2>How to Play</h2>
            <p>Master the gardens with clever slithering and route planning!</p>

            <div className="tutorial-steps">
              <div className="tutorial-step-card">
                <span className="tutorial-icon">🍏</span>
                <div>
                  <b>1. Eat All Apples</b>
                  <p>Every apple gives you +10 points and causes your worm to grow longer by one segment.</p>
                </div>
              </div>

              <div className="tutorial-step-card">
                <span className="tutorial-icon">🌀</span>
                <div>
                  <b>2. Awaken the Portal</b>
                  <p>The cosmic portal stays locked until every single apple is consumed. Once open, enter it to win!</p>
                </div>
              </div>

              <div className="tutorial-step-card">
                <span className="tutorial-icon">🧱</span>
                <div>
                  <b>3. Avoid Obstacles & Your Tail</b>
                  <p>Hitting stone walls, crossing the garden boundaries, or crashing into your own body fails the puzzle.</p>
                </div>
              </div>

              <div className="tutorial-step-card">
                <span className="tutorial-icon">⭐</span>
                <div>
                  <b>4. Aim for 3-Star Mastery</b>
                  <p>Each level has a target Par move limit. Plan tight routes to unlock 3 gold stars!</p>
                </div>
              </div>

              <div className="tutorial-step-card">
                <span className="tutorial-icon">🎮</span>
                <div>
                  <b>5. Smooth Controls</b>
                  <p>Use <b>Arrow Keys</b> or <b>WASD</b> on desktop. On mobile, swipe in any direction or use the virtual D-Pad. Press <b>Z</b> to Undo, <b>R</b> to Reset, and <b>F</b> for Fullscreen!</p>
                </div>
              </div>
            </div>

            <button
              className="primary-button"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setHowToPlayModal(false)}
            >
              Let's Slither!
            </button>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {authModal && (
        <div className="modal-backdrop" onClick={() => setAuthModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setAuthModal(null)}>×</button>

            {authModal === 'profile' ? (
              <div>
                <h2>Gardener Profile</h2>
                <p>Your journey is safely backed up to MongoDB Atlas.</p>
                <div style={{ marginBottom: 18, background: '#0e101e', padding: 16, borderRadius: 14, border: '1px solid #33364f' }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name}</div>
                  <div style={{ color: '#8f92a9', fontSize: 12, marginTop: 4 }}>{user?.email}</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 13 }}>
                    <span>🪙 <b>{coins}</b> Coins</span>
                    <span>⭐ <b>{user?.totalStars || 0}</b> Stars</span>
                    <span>🌱 Level <b>{user?.currentLevel || levelId}</b></span>
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="outline-button" onClick={handleLogout} style={{ width: '100%' }}>
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit}>
                <h2>{authModal === 'register' ? 'Create Account' : 'Welcome Back'}</h2>
                <p>
                  {authModal === 'register'
                    ? 'Save your progress, stars, and coins across devices.'
                    : 'Sign in to sync your puzzle progress to the cloud.'}
                </p>

                {authError && <div className="error-box">{authError}</div>}

                {authModal === 'register' && (
                  <div className="form-group">
                    <label>Gardener Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Khushi"
                      value={authForm.name}
                      onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="gardener@example.com"
                    value={authForm.email}
                    onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  />
                </div>

                <div className="modal-actions">
                  <button className="primary-button" type="submit" disabled={authLoading} style={{ width: '100%', justifyContent: 'center' }}>
                    {authLoading ? 'Connecting...' : authModal === 'register' ? 'Sign Up & Save' : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    className="modal-switch"
                    onClick={() => {
                      setAuthError('');
                      setAuthModal(authModal === 'register' ? 'login' : 'register');
                    }}
                  >
                    {authModal === 'register'
                      ? 'Already have an account? Sign In'
                      : "Don't have an account yet? Sign Up"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* LEVEL PREVIEW MODAL */}
      {levelPreview && (
        <div className="modal-backdrop" onClick={() => setLevelPreview(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setLevelPreview(null)}>×</button>
            <div className="muted-label" style={{ color: levelPreview.worldColor }}>{levelPreview.worldName.toUpperCase()}</div>
            <h2>Level {String(levelPreview.id).padStart(2, '0')}: {levelPreview.title}</h2>
            <p>{levelPreview.objective}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '16px 0 22px' }}>
              <div style={{ background: '#111322', padding: '10px 12px', borderRadius: 12, border: '1px solid #2d3047' }}>
                <small style={{ color: '#8c90a8', fontSize: 9, display: 'block', fontWeight: 700 }}>DIFFICULTY</small>
                <b style={{ color: levelPreview.worldColor, fontSize: 13 }}>{levelPreview.difficulty}</b>
              </div>
              <div style={{ background: '#111322', padding: '10px 12px', borderRadius: 12, border: '1px solid #2d3047' }}>
                <small style={{ color: '#8c90a8', fontSize: 9, display: 'block', fontWeight: 700 }}>APPLES TO EAT</small>
                <b style={{ fontSize: 13 }}>{levelPreview.apples.length} 🍎</b>
              </div>
              <div style={{ background: '#111322', padding: '10px 12px', borderRadius: 12, border: '1px solid #2d3047' }}>
                <small style={{ color: '#8c90a8', fontSize: 9, display: 'block', fontWeight: 700 }}>PAR MOVES (3★)</small>
                <b style={{ color: '#f3d777', fontSize: 13 }}>≤ {levelPreview.parMoves} moves</b>
              </div>
              <div style={{ background: '#111322', padding: '10px 12px', borderRadius: 12, border: '1px solid #2d3047' }}>
                <small style={{ color: '#8c90a8', fontSize: 9, display: 'block', fontWeight: 700 }}>MOVE LIMIT</small>
                <b style={{ fontSize: 13 }}>{levelPreview.moveLimit} moves</b>
              </div>
            </div>

            <button
              className="primary-button"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => startLevel(levelPreview.id)}
            >
              <Play size={16} fill="currentColor" /> Enter Garden
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN CONSOLE MODE */}
      {isFullscreen && mode === 'play' && (
        <div className="fullscreen-container">
          {/* Top Floating HUD */}
          <div className="fullscreen-top-hud">
            <div className="fullscreen-level-info">
              <button
                className="action-btn-secondary"
                onClick={toggleFullscreen}
                title="Exit Fullscreen (F)"
                style={{ padding: '6px 10px' }}
              >
                <Minimize2 size={15} /> Exit
              </button>
              <div>
                <span className="muted-label" style={{ color: currentWorld.color }}>{currentWorld.name}</span>
                <h3>Level {String(levelId).padStart(2, '0')}: {level.title}</h3>
              </div>
            </div>

            <div className="fullscreen-hud-stats">
              <span className="moves-chip">
                MOVES <b>{game.moves}/{level.moveLimit + bonusMoves}</b>
                <small style={{ color: '#f3d777', marginLeft: 4 }}>(Par: {level.parMoves})</small>
              </span>
              <span className="coin-pill"><Coins size={15} />{coins}</span>
              <button
                className={`icon-button ${music ? 'active-glow' : ''}`}
                onClick={toggleMusic}
                title={music ? 'Mute Music (M)' : 'Play Music (M)'}
              >
                <Music size={16} />
              </button>
              <button
                className="icon-button"
                onClick={() => setSound(!sound)}
                title={sound ? 'Mute Sound (S)' : 'Unmute Sound (S)'}
              >
                {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>
          </div>

          {/* Centered Large Board */}
          <div className="fullscreen-board-area">
            {renderGameBoard()}

            {/* In-game Overlays in Fullscreen */}
            {game.status !== 'playing' && (
              <div className="result-overlay">
                {game.status === 'completed' ? (
                  <>
                    <div className="result-icon-box victory">
                      <Trophy size={36} />
                    </div>
                    <span className="muted-label" style={{ color: '#b9f36c' }}>{currentWorld.name.toUpperCase()}</span>
                    <h2>Garden Cleared!</h2>

                    <div className="victory-stars-box">
                      <div className={`star-podium ${starPopStage >= 1 ? 'earned' : 'unearned'}`}>
                        <Star size={34} fill={starPopStage >= 1 ? '#f3d777' : 'none'} />
                      </div>
                      <div className={`star-podium ${starPopStage >= 2 ? 'earned' : 'unearned'}`}>
                        <Star size={42} fill={starPopStage >= 2 ? '#f3d777' : 'none'} />
                      </div>
                      <div className={`star-podium ${starPopStage >= 3 ? 'earned' : 'unearned'}`}>
                        <Star size={34} fill={starPopStage >= 3 ? '#f3d777' : 'none'} />
                      </div>
                    </div>

                    <div className="victory-stats-row">
                      <div className="victory-stat-card">
                        <small>MOVES</small>
                        <strong>{game.moves} <span style={{ fontSize: 11, color: '#8c90a8' }}>/ {level.parMoves} par</span></strong>
                      </div>
                      <div className="victory-stat-card bonus">
                        <small>COIN REWARD</small>
                        <strong>+25 🪙</strong>
                      </div>
                      <div className="victory-stat-card">
                        <small>SCORE</small>
                        <strong>+{game.score}</strong>
                      </div>
                    </div>

                    <div className="result-actions">
                      <button
                        className="primary-button"
                        onClick={() => startLevel(Math.min(50, levelId + 1))}
                      >
                        Next Level <ChevronRight size={17} />
                      </button>
                      <button className="outline-button" onClick={restart}>
                        <RotateCcw size={15} /> Replay
                      </button>
                      <button className="outline-button" onClick={() => { toggleFullscreen(); setMode('levels'); }}>
                        Realms Map
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="result-icon-box failure">
                      <AlertCircle size={36} />
                    </div>
                    <span className="muted-label" style={{ color: '#f87171' }}>TRY AGAIN</span>
                    <h2>{failureType?.title || 'Route Blocked'}</h2>
                    <p className="result-reason">{game.reason}</p>

                    {failureType && (
                      <div className="failure-tip-box">
                        <span style={{ fontSize: 18 }}>💡</span>
                        <div>
                          <b>Strategy Hint</b>
                          <p>{failureType.tip}</p>
                        </div>
                      </div>
                    )}

                    <div className="result-actions">
                      {history.length > 0 && (
                        <button className="primary-button" onClick={undo} style={{ background: '#7c3aed', color: '#fff' }}>
                          <RotateCcw size={15} /> Undo Move (Z)
                        </button>
                      )}
                      <button className="primary-button" onClick={restart}>
                        Try Again (R)
                      </button>
                      {failureType?.type === 'moves' && (
                        <button className="outline-button" onClick={buyBoost} style={{ borderColor: '#f59e0b', color: '#fcd34d' }}>
                          <Zap size={14} /> +5 Moves (30🪙)
                        </button>
                      )}
                      <button className="outline-button" onClick={triggerSmartHint}>
                        <Lightbulb size={14} /> BFS Hint
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bottom Floating Quick Actions */}
          <div className="fullscreen-bottom-hud">
            <div className="fullscreen-quick-actions">
              <button className="action-btn-primary" onClick={restart} title="Reset puzzle (R)">
                <RotateCcw size={14} /> RESET
              </button>
              <button className="action-btn-secondary" onClick={undo} disabled={!history.length} title="Undo move (Z)">
                <Undo2 size={14} /> UNDO
              </button>
              <button className="action-btn-secondary" onClick={triggerSmartHint} title="BFS Hint (H)">
                <Lightbulb size={14} /> HINT
              </button>
            </div>

            <div className="dpad">
              <button onClick={() => move('up')} aria-label="Move up"><ArrowUp /></button>
              <div>
                <button onClick={() => move('left')} aria-label="Move left"><ArrowLeft /></button>
                <button onClick={() => move('down')} aria-label="Move down"><ArrowDown /></button>
                <button onClick={() => move('right')} aria-label="Move right"><ArrowRight /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: PLAY MODE (Standard) */}
      {mode === 'play' && !isFullscreen ? (
        <main className="layout">
          {/* LEFT COLUMN */}
          <aside className="left-column">
            <div className="eyebrow"><span className="live-dot" /> {currentWorld.name}</div>
            <h1>Eat. Solve.<br /><em>Grow.</em></h1>
            <p className="intro">{currentWorld.subtitle}</p>

            <div className="level-card">
              <div className="level-card-top">
                <div>
                  <span className="muted-label">LEVEL {String(levelId).padStart(2, '0')}</span>
                  <h2>{level.title}</h2>
                </div>
                <span className={`difficulty ${level.difficulty.toLowerCase()}`}>{level.difficulty}</span>
              </div>

              <div className="progress-section">
                <div className="progress-row">
                  <span>PROGRESS</span>
                  <b>{Math.round((completed.length / 50) * 100)}%</b>
                </div>
                <div className="progress-segmented">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span
                      key={i}
                      className={`seg-bar ${i < Math.max(1, Math.round((completed.length / 50) * 10)) ? 'filled' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <div className="quick-action-btns">
                <button className="action-btn-primary" onClick={restart} title="Reset puzzle (R)">
                  <RotateCcw size={14} /> RESET
                </button>
                <button className="action-btn-secondary" onClick={triggerSmartHint} title="BFS Shortest Path Hint (H)">
                  <Lightbulb size={14} /> HINT
                </button>
                <button className="action-btn-secondary" onClick={toggleFullscreen} title="Enter Fullscreen (F)">
                  <Maximize2 size={14} /> FULL
                </button>
              </div>
            </div>

            <div className="tip-card">
              <span className="tip-icon"><Lightbulb size={18} /></span>
              <div>
                <b>Pro Strategy</b>
                <p>{hint ? 'Glowing dots show the shortest BFS route.' : 'Turn corners wisely so you do not corner your growing tail.'}</p>
              </div>
            </div>

            <div className="mini-stats">
              <div>
                <span className="stat-icon green"><Apple size={18} /></span>
                <div>
                  <b>{game.score}</b>
                  <small>SCORE</small>
                </div>
              </div>
              <div>
                <span className="stat-icon yellow"><Star size={18} /></span>
                <div>
                  <b>{completed.length * 3 - 2}</b>
                  <small>STARS</small>
                </div>
              </div>
            </div>
          </aside>

          {/* CENTER GAME COLUMN */}
          <section className="game-column">
            <div className="game-panel">
              <div className="game-panel-head">
                <div>
                  <span className="muted-label" style={{ color: currentWorld.color }}>{currentWorld.name.toUpperCase()}</span>
                  <h2>Level {String(levelId).padStart(2, '0')} <span className="level-sub">/ 50</span></h2>
                </div>
                <div className="panel-tools">
                  <span className="moves-chip">
                    MOVES <b>{game.moves}/{level.moveLimit + bonusMoves}</b>
                    {bonusMoves > 0 && <small className="bonus-tag">+{bonusMoves}</small>}
                  </span>
                  <button className="small-icon" onClick={undo} disabled={!history.length} title="Undo move (Z)">
                    <RotateCcw size={16} />
                  </button>
                  <button className="small-icon" onClick={restart} title="Reset puzzle (R)">
                    <RefreshCw size={16} />
                  </button>
                  <button className="small-icon" onClick={toggleFullscreen} title="Fullscreen (F)">
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>

              {/* 2.5D BOARD */}
              {renderGameBoard()}

              {/* CELEBRATION CONFETTI */}
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

              {/* VICTORY & FAILURE OVERLAYS */}
              {game.status !== 'playing' && (
                <div className="result-overlay">
                  {game.status === 'completed' ? (
                    <>
                      <div className="result-icon-box victory">
                        <Trophy size={36} />
                      </div>
                      <span className="muted-label" style={{ color: '#b9f36c' }}>{currentWorld.name.toUpperCase()}</span>
                      <h2>Garden Cleared!</h2>

                      {/* Animated Star Podium */}
                      <div className="victory-stars-box">
                        <div className={`star-podium ${starPopStage >= 1 ? 'earned' : 'unearned'}`}>
                          <Star size={34} fill={starPopStage >= 1 ? '#f3d777' : 'none'} />
                        </div>
                        <div className={`star-podium ${starPopStage >= 2 ? 'earned' : 'unearned'}`}>
                          <Star size={42} fill={starPopStage >= 2 ? '#f3d777' : 'none'} />
                        </div>
                        <div className={`star-podium ${starPopStage >= 3 ? 'earned' : 'unearned'}`}>
                          <Star size={34} fill={starPopStage >= 3 ? '#f3d777' : 'none'} />
                        </div>
                      </div>

                      <div className="victory-stats-row">
                        <div className="victory-stat-card">
                          <small>MOVES</small>
                          <strong>{game.moves} <span style={{ fontSize: 11, color: '#8c90a8' }}>/ {level.parMoves} par</span></strong>
                        </div>
                        <div className="victory-stat-card bonus">
                          <small>COIN REWARD</small>
                          <strong>+25 🪙</strong>
                        </div>
                        <div className="victory-stat-card">
                          <small>SCORE</small>
                          <strong>+{game.score}</strong>
                        </div>
                      </div>

                      <p className="result-reason">
                        {game.moves <= level.parMoves
                          ? '🌟 Flawless precision! You met the master par target.'
                          : 'Well played! Slither into the next garden or replay for 3 stars.'}
                      </p>

                      <div className="result-actions">
                        <button
                          className="primary-button"
                          onClick={() => startLevel(Math.min(50, levelId + 1))}
                        >
                          Next Level <ChevronRight size={17} />
                        </button>
                        <button className="outline-button" onClick={restart}>
                          <RotateCcw size={15} /> Replay
                        </button>
                        <button className="outline-button" onClick={() => setMode('levels')}>
                          Realms Map
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="result-icon-box failure">
                        <AlertCircle size={36} />
                      </div>
                      <span className="muted-label" style={{ color: '#f87171' }}>TRY AGAIN</span>
                      <h2>{failureType?.title || 'Route Blocked'}</h2>

                      <p className="result-reason">{game.reason}</p>

                      {failureType && (
                        <div className="failure-tip-box">
                          <span style={{ fontSize: 18 }}>💡</span>
                          <div>
                            <b>Strategy Hint</b>
                            <p>{failureType.tip}</p>
                          </div>
                        </div>
                      )}

                      <div className="result-actions">
                        {history.length > 0 && (
                          <button className="primary-button" onClick={undo} style={{ background: '#7c3aed', color: '#fff' }}>
                            <RotateCcw size={15} /> Undo Move (Z)
                          </button>
                        )}
                        <button className="primary-button" onClick={restart}>
                          Try Again (R)
                        </button>
                        {failureType?.type === 'moves' && (
                          <button className="outline-button" onClick={buyBoost} style={{ borderColor: '#f59e0b', color: '#fcd34d' }}>
                            <Zap size={14} /> +5 Moves (30🪙)
                          </button>
                        )}
                        <button className="outline-button" onClick={triggerSmartHint}>
                          <Lightbulb size={14} /> BFS Hint
                        </button>
                        <button className="outline-button" onClick={() => setMode('levels')}>
                          Realms Map
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {notice && game.status === 'playing' && (
                <div className="notice">
                  <span>{notice}</span>
                  <button onClick={() => setNotice('')} aria-label="Dismiss">×</button>
                </div>
              )}

              {/* CONTROLS */}
              <div className="controls-row">
                <div className="control-copy">
                  <b>Make your move</b>
                  <span>Arrow keys / WASD, swipe, or tap pad</span>
                </div>
                <div className="dpad">
                  <button onClick={() => move('up')} aria-label="Move up"><ArrowUp /></button>
                  <div>
                    <button onClick={() => move('left')} aria-label="Move left"><ArrowLeft /></button>
                    <button onClick={() => move('down')} aria-label="Move down"><ArrowDown /></button>
                    <button onClick={() => move('right')} aria-label="Move right"><ArrowRight /></button>
                  </div>
                </div>
              </div>
            </div>

            <div className="below-board">
              <div>
                <span className="below-icon"><ShieldCheck size={17} /></span>
                <div>
                  <b>Fair-play puzzles</b>
                  <small>Skill-driven gardens, zero paywalls</small>
                </div>
              </div>
              <div>
                <span className="below-icon purple"><Zap size={17} /></span>
                <div>
                  <b>Master precision</b>
                  <small>Beat Par moves for 3★</small>
                </div>
              </div>
              <button className="text-button" onClick={triggerSmartHint}>
                <Lightbulb size={16} /> Get a hint
              </button>
            </div>
          </section>

          {/* RIGHT COLUMN */}
          <aside className="right-column">
            {/* OBJECTIVES */}
            <div className="objective-panel">
              <div className="panel-badge-header">
                <span className="objective-symbol"><Trophy size={16} /></span>
                <span className="panel-title">OBJECTIVES</span>
              </div>

              <div className="objective-box">
                <div className="objective-label-row">
                  <span>COLLECTED APPLES</span>
                  <span className="objective-count">
                    <b>{level.apples.length - game.apples.length}</b>/{level.apples.length}
                  </span>
                </div>
                <div className="apple-icons-track">
                  {Array.from({ length: level.apples.length }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`apple-token ${idx < (level.apples.length - game.apples.length) ? 'collected' : 'pending'}`}
                    >
                      🍎
                    </span>
                  ))}
                </div>
              </div>

              <div className="portal-status-box">
                <div className="portal-status-label">PORTAL STATUS</div>
                {game.apples.length > 0 ? (
                  <div className="portal-badge locked">
                    <span className="badge-icon">🔒</span>
                    <div>
                      <b className="badge-title">LOCKED</b>
                      <small className="badge-sub">until {game.apples.length} apple{game.apples.length > 1 ? 's are' : ' is'} eaten</small>
                    </div>
                  </div>
                ) : (
                  <div className="portal-badge ready">
                    <span className="badge-icon">🌀</span>
                    <div>
                      <b className="badge-title">PORTAL OPEN!</b>
                      <small className="badge-sub">Slither in to complete the level</small>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* REWARD SHOP */}
            <div className="reward-shop-panel">
              <div className="panel-badge-header">
                <span className="reward-symbol"><Sparkles size={16} /></span>
                <span className="panel-title">GARDEN REWARDS</span>
              </div>

              <div className="shop-grid">
                <button className="shop-card" onClick={cycleSkin} title="Cycle to next worm skin">
                  <div className={`shop-icon-box skin-${wormSkin}`}>🐛</div>
                  <b>Worm Skin</b>
                  <span className="shop-sub">{SKINS.find(s => s.id === wormSkin)?.name}</span>
                  <span className="shop-price-btn">Switch</span>
                </button>

                <button className="shop-card" onClick={buyBoost} title="Add +5 moves for 30 coins">
                  <div className="shop-icon-box boost-box">⚡</div>
                  <b>Apple Boost</b>
                  <span className="shop-sub">+5 Moves</span>
                  <span className="shop-price-btn">30 🪙</span>
                </button>

                <button className="shop-card" onClick={triggerSmartHint} title="BFS Shortest Path Hint">
                  <div className="shop-icon-box hint-box">💡</div>
                  <b>Smart Hint</b>
                  <span className="shop-sub">BFS Solver</span>
                  <span className="shop-price-btn">Free</span>
                </button>
              </div>
            </div>

            {/* ACHIEVEMENTS */}
            <div className="achievement-card">
              <div className="achievement-badge"><Award size={22} /></div>
              <div>
                <b>Garden Explorer</b>
                <p>Complete levels to collect stars and unlock higher realms.</p>
                <div className="star-row">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} />
                  <span>{completed.length}/50 levels unlocked</span>
                </div>
              </div>
            </div>
          </aside>
        </main>
      ) : mode === 'levels' ? (
        /* VIEW: LEVEL MAP MODE */
        <main className="secondary-page">
          <div className="eyebrow">THE 5 REALMS</div>
          <h1>Choose your <em>garden.</em></h1>
          <p className="intro">50 masterfully crafted labyrinth gardens across 5 magical realms. Click any unlocked level to preview and play.</p>

          {/* Jump to Current Level Banner */}
          <div className="jump-banner">
            <div className="jump-info">
              <span className="jump-mascot">🐛</span>
              <div className="jump-text">
                <b>Active Garden: Level {levelId} - {level.title}</b>
                <small>World {currentWorld.id}: {currentWorld.name} • {completed.length} of 50 Cleared</small>
              </div>
            </div>
            <button className="primary-button" onClick={() => startLevel(levelId)}>
              Slither In <ChevronRight size={16} />
            </button>
          </div>

          {/* World Filter Tabs */}
          <div className="world-tabs">
            <button
              className={`world-tab-btn ${selectedWorldTab === 0 ? 'active' : ''}`}
              onClick={() => setSelectedWorldTab(0)}
            >
              <span>🌐</span> All Realms <span className="world-tab-badge">50</span>
            </button>
            {WORLDS.map(w => {
              const worldCompleted = completed.filter(id => id >= w.range[0] && id <= w.range[1]).length;
              return (
                <button
                  key={w.id}
                  className={`world-tab-btn ${selectedWorldTab === w.id ? 'active' : ''}`}
                  onClick={() => setSelectedWorldTab(w.id)}
                >
                  <span>{w.icon}</span> {w.name}
                  <span className="world-tab-badge">{worldCompleted}/10</span>
                </button>
              );
            })}
          </div>

          {/* Level Grid */}
          <div className="level-grid">
            {displayedLevels.map(l => {
              const unlocked = completed.includes(l.id) || completed.includes(l.id - 1) || l.id === 1;
              const isDone = completed.includes(l.id) && l.id < Math.max(...completed);
              const isCurrent = l.id === levelId;

              return (
                <button
                  key={l.id}
                  className={`level-tile ${unlocked ? '' : 'locked'} ${isCurrent ? 'current-active' : ''}`}
                  onClick={() => unlocked && setLevelPreview(l)}
                  title={unlocked ? `Level ${l.id}: ${l.title}` : `Complete Level ${l.id - 1} to unlock`}
                >
                  {isCurrent && <span className="current-badge">YOU ARE HERE</span>}

                  <div className="tile-top-row">
                    <span className="tile-number">
                      {unlocked ? String(l.id).padStart(2, '0') : <LockKeyhole size={18} />}
                    </span>
                    <span className={`difficulty ${l.difficulty.toLowerCase()}`}>{l.difficulty}</span>
                  </div>

                  <b>{l.title}</b>
                  <small>{l.worldName}</small>

                  <div className="tile-footer">
                    <span className="tile-stars">{isDone ? '★★★' : unlocked ? '★☆☆' : 'LOCKED'}</span>
                    <span className="tile-par">Par: {l.parMoves}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      ) : mode === 'leaderboard' ? (
        /* VIEW: LEADERBOARD MODE */
        <main className="secondary-page">
          <div className="eyebrow">HALL OF FAME</div>
          <h1>Master <em>gardeners.</em></h1>
          <p className="intro">Top players ranked by stars earned, puzzle precision, and realms mastered.</p>

          <div className="leaderboard-container">
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="podium-grid">
                {/* 2nd Place */}
                <div className="podium-card rank-2">
                  <div className="podium-trophy">🥈</div>
                  <span className="podium-rank-badge">RANK 2</span>
                  <div className="podium-name">{leaderboard[1].name}</div>
                  <span className="podium-title">Level {leaderboard[1].currentLevel}</span>
                  <div className="podium-stats">
                    <span><Star size={13} fill="currentColor" /> {leaderboard[1].totalStars}</span>
                    <span><Apple size={13} /> {leaderboard[1].totalScore}</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="podium-card rank-1">
                  <div className="podium-trophy">👑</div>
                  <span className="podium-rank-badge">CHAMPION</span>
                  <div className="podium-name">{leaderboard[0].name}</div>
                  <span className="podium-title">Level {leaderboard[0].currentLevel}</span>
                  <div className="podium-stats">
                    <span><Star size={14} fill="currentColor" /> {leaderboard[0].totalStars}</span>
                    <span><Apple size={14} /> {leaderboard[0].totalScore}</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="podium-card rank-3">
                  <div className="podium-trophy">🥉</div>
                  <span className="podium-rank-badge">RANK 3</span>
                  <div className="podium-name">{leaderboard[2].name}</div>
                  <span className="podium-title">Level {leaderboard[2].currentLevel}</span>
                  <div className="podium-stats">
                    <span><Star size={13} fill="currentColor" /> {leaderboard[2].totalStars}</span>
                    <span><Apple size={13} /> {leaderboard[2].totalScore}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Current Player Rank Banner */}
            {myRank && (
              <div className="my-rank-banner">
                <div className="my-rank-left">
                  <span className="my-rank-number">#{myRank.rank}</span>
                  <div>
                    <b>{myRank.name} (You)</b>
                    <small>Level {myRank.currentLevel} • {myRank.completedCount || completed.length} Gardens Cleared</small>
                  </div>
                </div>
                <div className="my-rank-stats">
                  <span style={{ color: '#f3d777' }}>⭐ {myRank.totalStars} Stars</span>
                  <span style={{ color: '#b9f36c' }}>🍎 {myRank.totalScore} Score</span>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            <table className="leaderboard-table">
              <tbody>
                {leaderboard.map((player, idx) => (
                  <tr
                    key={player.id || idx}
                    className={`leaderboard-row ${player.isMe ? 'is-me' : ''}`}
                  >
                    <td className="leaderboard-cell">#{player.rank || idx + 1}</td>
                    <td className="leaderboard-cell">
                      <div className="gardener-info">
                        <b>{player.name} {player.isMe ? '(You)' : ''}</b>
                        <small>Level {player.currentLevel} • {player.completedCount || 0} Cleared</small>
                      </div>
                    </td>
                    <td className="leaderboard-cell" style={{ color: '#f3d777', fontWeight: 700 }}>
                      ⭐ {player.totalStars}
                    </td>
                    <td className="leaderboard-cell" style={{ color: '#b9f36c', fontWeight: 700 }}>
                      {player.totalScore} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      ) : (
        /* VIEW: REWARDS & WALLET MODE */
        <main className="secondary-page">
          <div className="eyebrow">VELOOP ECONOMY</div>
          <h1>Your reward <em>garden.</em></h1>
          <p className="intro">Rewards are fair, optional, and transparent. Sync your wallet across devices with your account.</p>

          <div className="wallet-hero">
            <span className="wallet-icon"><Coins size={32} /></span>
            <div>
              <small>{user ? `${user.name.toUpperCase()}'S WALLET` : 'GARDEN WALLET BALANCE'}</small>
              <strong>{coins} <span>coins</span></strong>
            </div>
            <span className="wallet-note">
              <ShieldCheck size={16} /> {user ? 'Cloud Synced' : 'Guest Ledger'}
            </span>
          </div>

          <div className="reward-grid">
            <div className="reward-detail">
              <span>💡</span>
              <h3>Smart Hint</h3>
              <p>BFS pathfinder highlights the optimal shortest route toward the closest apple or portal.</p>
              <button className="outline-button" onClick={() => { triggerSmartHint(); setMode('play'); }}>
                Use Hint
              </button>
            </div>

            <div className="reward-detail">
              <span>⚡</span>
              <h3>Apple Boost</h3>
              <p>Add +5 extra moves to your current level budget. Great for exploring challenging mazes.</p>
              <button className="primary-button" onClick={buyBoost} disabled={coins < 30}>
                Buy for 30 🪙
              </button>
            </div>

            <div className="reward-detail">
              <span>👤</span>
              <h3>Cloud Sync</h3>
              <p>{user ? `Signed in as ${user.email}. Progress backed up to MongoDB.` : 'Sign up or log in to persist your coins & level progress across devices.'}</p>
              <button className="outline-button" onClick={() => setAuthModal(user ? 'profile' : 'login')}>
                {user ? 'Manage Profile' : 'Sign In / Register'}
              </button>
            </div>
          </div>

          <div className="security-note">
            <ShieldCheck size={22} />
            <div>
              <b>Designed for fair rewards & secure storage</b>
              <p>Player stats, authentication with bcrypt/JWT, and wallet ledgers are managed by the Express/MongoDB server. Full unit & integration testing is in place.</p>
            </div>
          </div>
        </main>
      )}

      {/* FOOTER */}
      <footer>
        <span>© 2026 {GAME_NAME}</span>
        <span>Made for curious minds <span className="footer-heart">♥</span></span>
        <button onClick={() => setHowToPlayModal(true)}>
          <CircleHelp size={15} /> How to play
        </button>
        <button onClick={toggleFullscreen}>
          <Maximize2 size={15} /> Fullscreen (F)
        </button>
        <button onClick={() => setNotice('Audio: Sound ' + (sound ? 'ON' : 'OFF') + ', Music ' + (music ? 'ON' : 'OFF'))}>
          <Settings size={15} /> Audio Settings
        </button>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
