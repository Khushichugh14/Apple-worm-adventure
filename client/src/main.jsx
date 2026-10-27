import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Apple, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Award,
  ChevronRight, CircleHelp, Coins, Gamepad2, Gem, Lightbulb,
  LockKeyhole, RotateCcw, Settings, ShieldCheck, Sparkles, Star,
  Trophy, Volume2, VolumeX, Zap, User as UserIcon, LogOut, Check, X, Compass
} from 'lucide-react';
import { GAME_NAME, API_URL } from './config/gameConfig';
import { LEVELS } from './data/levels';
import { initialState, step, same } from './game/engine';
import { playSound } from './game/audio';
import { findNextHint } from './game/solver';
import './style.css';

const SKINS = [
  { id: 'emerald', name: 'Emerald', color: '#10b981', label: 'Classic Garden' },
  { id: 'golden', name: 'Golden Sun', color: '#f59e0b', label: 'Radiant Glow' },
  { id: 'ruby', name: 'Ruby Flame', color: '#ef4444', label: 'Blazing Spark' },
  { id: 'amethyst', name: 'Cosmic Violet', color: '#8b5cf6', label: 'Mystic Aura' },
];

function calculateStars(moves, limit) {
  if (moves <= Math.ceil(limit * 0.55)) return 3;
  if (moves <= Math.ceil(limit * 0.8)) return 2;
  return 1;
}

function App() {
  const [levelId, setLevelId] = useState(1);
  const [completed, setCompleted] = useState([1]);
  const [coins, setCoins] = useState(125);
  const [sound, setSound] = useState(true);
  const [mode, setMode] = useState('play');
  const [history, setHistory] = useState([]);
  const [hint, setHint] = useState(false);
  const [solverHint, setSolverHint] = useState(null);
  const [notice, setNotice] = useState('');
  const [earnedStars, setEarnedStars] = useState(3);
  const [wormSkin, setWormSkin] = useState(() => localStorage.getItem('wormSkin') || 'emerald');
  const [bonusMoves, setBonusMoves] = useState(0);

  // Auth & Cloud Save state
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | 'profile' | null
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const level = LEVELS[levelId - 1] || LEVELS[0];
  const [game, setGame] = useState(() => initialState(LEVELS[0]));

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
        // Token expired or invalid
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
      });
  }, [token]);

  const startLevel = useCallback(id => {
    setLevelId(id);
    setGame(initialState(LEVELS[id - 1]));
    setBonusMoves(0);
    setHistory([]);
    setHint(false);
    setSolverHint(null);
    setNotice('');
    setMode('play');
  }, []);

  const move = useCallback(dir => {
    setGame(old => {
      if (old.status !== 'playing') return old;
      setHistory(h => [...h.slice(-29), old]);
      setSolverHint(null); // Clear hint once player moves

      const next = step(old, dir, level);

      // Play sound effects
      const didEat = next.apples.length < old.apples.length;
      if (next.status === 'completed') {
        const stars = calculateStars(next.moves, level.moveLimit);
        setEarnedStars(stars);
        playSound('complete', sound);
        setCompleted(prev => (prev.includes(levelId + 1) ? prev : [...prev, Math.min(50, levelId + 1)]));
        setCoins(c => c + 25);
        setNotice(`Level complete! Earned ${stars} ★ and +25 coins.`);

        // Sync progress with backend MongoDB if logged in
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
      } else if (didEat) {
        playSound('eat', sound);
        setNotice('Delicious apple! Worm grew longer.');
      } else {
        playSound('move', sound);
        if (next.reason) setNotice(next.reason);
      }

      return next;
    });
  }, [level, levelId, sound, token]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = e => {
      const map = {
        ArrowUp: 'up', w: 'up', W: 'up',
        ArrowDown: 'down', s: 'down', S: 'down',
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right'
      };
      if (map[e.key]) {
        e.preventDefault();
        move(map[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  const undo = () => {
    if (history.length) {
      playSound('undo', sound);
      setGame(history[history.length - 1]);
      setHistory(h => h.slice(0, -1));
      setSolverHint(null);
      setNotice('Last move undone.');
    }
  };

  const restart = () => {
    playSound('undo', sound);
    setGame(initialState(level));
    setBonusMoves(0);
    setHistory([]);
    setSolverHint(null);
    setNotice('Puzzle reset. Find a new route!');
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
    playSound('complete', sound);
    setNotice('Apple Boost active: +5 extra moves granted!');
  };

  // BFS Smart solver dynamic hint
  const triggerSmartHint = () => {
    setHint(true);
    const hintResult = findNextHint(game, level);
    if (hintResult) {
      setSolverHint(hintResult);
      playSound('eat', sound);
      setNotice(`BFS Hint: Head ${hintResult.nextDirection.toUpperCase()} toward ${hintResult.targetLabel} (${hintResult.distance} steps away).`);
    } else {
      setNotice('Watch your body carefully so you do not trap yourself!');
    }
  };

  // Auth handlers
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
    setNotice('Logged out. Playing in local guest mode.');
  };

  const board = useMemo(
    () => Array.from({ length: level.size * level.size }, (_, i) => [i % level.size, Math.floor(i / level.size)]),
    [level]
  );

  const cellClass = p => {
    let c = 'cell';
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

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" onClick={() => setMode('play')}>
          <span className="brand-icon"><Apple size={21} /></span>
          <span>{GAME_NAME}<small>PUZZLE GARDENS</small></span>
        </a>
        <nav>
          <button className={mode === 'play' ? 'nav-active' : ''} onClick={() => setMode('play')}>
            <Gamepad2 size={16} /> Play
          </button>
          <button className={mode === 'levels' ? 'nav-active' : ''} onClick={() => setMode('levels')}>
            <Gem size={16} /> Levels
          </button>
          <button className={mode === 'rewards' ? 'nav-active' : ''} onClick={() => setMode('rewards')}>
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
            className="icon-button"
            aria-label="Toggle sound"
            onClick={() => setSound(!sound)}
            title={sound ? 'Mute sound' : 'Unmute sound'}
          >
            {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
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

      {/* Auth Modal */}
      {authModal && (
        <div className="modal-backdrop" onClick={() => setAuthModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setAuthModal(null)}>×</button>

            {authModal === 'profile' ? (
              <div>
                <h2>Gardener Profile</h2>
                <p>Your journey is safely backed up to MongoDB Atlas.</p>
                <div style={{ marginBottom: 18, background: '#101221', padding: 14, borderRadius: 12, border: '1px solid #33364f' }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name}</div>
                  <div style={{ color: '#8f92a9', fontSize: 12, marginTop: 4 }}>{user?.email}</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12 }}>
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

      {mode === 'play' ? (
        <main className="layout">
          <aside className="left-column">
            <div className="eyebrow"><span className="live-dot" /> GARDEN ADVENTURE</div>
            <h1>Eat. Solve.<br /><em>Grow.</em></h1>
            <p className="intro">A clever worm. A magical labyrinth. Find the optimal route to feast and escape.</p>

            <div className="level-card">
              <div className="level-card-top">
                <div>
                  <span className="muted-label">LEVEL {String(levelId).padStart(2, '0')}</span>
                  <h2>{level.title}</h2>
                </div>
                <span className="difficulty">{level.difficulty}</span>
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

              <div className="mockup-game-tips">
                <div className="tips-title">🌱 GAME TIPS</div>
                <ul>
                  <li>Collect ALL apples to open the portal</li>
                  <li>Worm body grows with every apple eaten</li>
                  <li>Avoid walls and your own body tail!</li>
                </ul>
              </div>

              <div className="quick-action-btns">
                <button className="action-btn-primary" onClick={restart}>RESET</button>
                <button className="action-btn-secondary" onClick={triggerSmartHint}>HINT</button>
                <button className="action-btn-secondary" onClick={() => setMode('levels')}>MAP</button>
              </div>
            </div>

            <div className="tip-card">
              <span className="tip-icon"><Lightbulb size={18} /></span>
              <div>
                <b>Pro Strategy</b>
                <p>{hint ? 'Glowing dots show the shortest BFS route.' : 'Turn corners wisely so you do not corner yourself.'}</p>
              </div>
            </div>

            <div className="mini-stats">
              <div>
                <span className="stat-icon green"><Apple size={17} /></span>
                <span><b>{game.score}</b><small>PUZZLE SCORE</small></span>
              </div>
              <div>
                <span className="stat-icon yellow"><Star size={17} /></span>
                <span><b>{completed.length * 3 - 2}</b><small>STARS EARNED</small></span>
              </div>
            </div>
          </aside>

          <section className="game-column">
            <div className="game-panel">
              <div className="game-panel-head">
                <div>
                  <span className="muted-label">THE MOSSY MEADOW</span>
                  <h2>Level {String(levelId).padStart(2, '0')} <span className="level-sub">/ 50</span></h2>
                </div>
                <div className="panel-tools">
                  <span className="moves-chip">
                    MOVES <b>{game.moves}/{level.moveLimit + bonusMoves}</b>
                    {bonusMoves > 0 && <small className="bonus-tag">+{bonusMoves}</small>}
                  </span>
                  <button className="small-icon" onClick={undo} disabled={!history.length} title="Undo move">
                    <RotateCcw size={17} />
                  </button>
                  <button className="small-icon" onClick={restart} title="Reset puzzle">
                    <RotateCcw size={17} />
                  </button>
                </div>
              </div>

              <div className="board-wrap">
                <div className="board" style={{ '--grid-size': level.size }}>
                  {board.map((p, i) => (
                    <div key={i} className={cellClass(p)}>
                      {isHead(p) ? (
                        <span className="worm-avatar-face">
                          <span className="face-eyes">👀</span>
                        </span>
                      ) : game.worm.some(w => same(w, p)) ? (
                        <span className="worm-dot" />
                      ) : isApple(p) ? (
                        <div className="apple-wrapper">
                          <span className="apple-sparkle">✦</span>
                          <Apple className="apple-svg" size={23} fill="currentColor" />
                        </div>
                      ) : same(level.portal, p) ? (
                        <div className="portal-vortex">
                          <span className="portal-glyph">🌀</span>
                        </div>
                      ) : level.walls.some(w => same(w, p)) ? (
                        <span className="wall-glyph">❖</span>
                      ) : null}
                    </div>
                  ))}
                </div>

                {solverHint && (
                  <div className="hint-banner">
                    <span>
                      <Compass size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      Suggested Next Move: <b>{solverHint.nextDirection}</b> ({solverHint.distance} steps to {solverHint.targetLabel})
                    </span>
                    <button onClick={() => setSolverHint(null)} style={{ background: 'none', border: 'none', color: '#c9c1ff', cursor: 'pointer' }}>×</button>
                  </div>
                )}

                <div className="board-caption">
                  <span><i className={`legend-dot skin-${wormSkin}`} /> Worm ({SKINS.find(s => s.id === wormSkin)?.name})</span>
                  <span><i className="legend-dot apple-legend" /> Apple</span>
                  <span><i className="legend-dot portal-legend" /> Portal</span>
                </div>
              </div>

              {game.status !== 'playing' && (
                <div className="result-overlay">
                  <div className="result-icon">
                    {game.status === 'completed' ? <Trophy size={32} /> : <RotateCcw size={32} />}
                  </div>
                  <h2>{game.status === 'completed' ? 'Garden cleared!' : 'Try another route'}</h2>
                  {game.status === 'completed' && (
                    <div className="stars-earned">
                      {Array.from({ length: earnedStars }).map((_, idx) => (
                        <Star key={idx} size={28} fill="#f3d777" />
                      ))}
                    </div>
                  )}
                  <p>
                    {game.status === 'completed'
                      ? `Completed in ${game.moves} moves! +25 coins earned${user ? ' & synced to cloud' : ''}.`
                      : game.reason}
                  </p>
                  <div className="result-actions">
                    <button
                      className="primary-button"
                      onClick={() => (game.status === 'completed' ? startLevel(Math.min(50, levelId + 1)) : restart())}
                    >
                      {game.status === 'completed' ? 'Next level' : 'Try again'} <ChevronRight size={17} />
                    </button>
                    <button className="outline-button" onClick={() => setMode('levels')}>
                      Level map
                    </button>
                  </div>
                </div>
              )}

              {notice && game.status === 'playing' && (
                <div className="notice">
                  <span>{notice}</span>
                  <button onClick={() => setNotice('')} aria-label="Dismiss">×</button>
                </div>
              )}

              <div className="controls-row">
                <div className="control-copy">
                  <b>Make your move</b>
                  <span>Arrow keys / WASD or tap pad</span>
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
                <span><b>Fair-play rewards</b><small>Optional bonuses, never required</small></span>
              </div>
              <div>
                <span className="below-icon purple"><Zap size={17} /></span>
                <span><b>Smart moves</b><small>Every step counts</small></span>
              </div>
              <button className="text-button" onClick={triggerSmartHint}>
                <Lightbulb size={16} /> Get a hint
              </button>
            </div>
          </section>

          <aside className="right-column">
            {/* Mockup Objectives Card */}
            <div className="objective-panel">
              <div className="panel-badge-header">
                <span className="objective-symbol"><Trophy size={16} /></span>
                <span className="panel-title">OBJECTIVES</span>
              </div>

              <div className="objective-box">
                <div className="objective-label-row">
                  <span className="objective-label">COLLECTED APPLES</span>
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

            {/* Mockup Reward Shop Card */}
            <div className="reward-shop-panel">
              <div className="panel-badge-header">
                <span className="reward-symbol"><Sparkles size={16} /></span>
                <span className="panel-title">REWARD SHOP</span>
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

            <div className="achievement-card">
              <div className="achievement-badge"><Award size={21} /></div>
              <div>
                <b>Garden explorer</b>
                <p>Complete levels to collect stars and unlock achievements.</p>
                <div className="star-row">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} />
                  <span>{completed.length}/50 levels</span>
                </div>
              </div>
            </div>
          </aside>
        </main>
      ) : mode === 'levels' ? (
        <main className="secondary-page">
          <div className="eyebrow">YOUR JOURNEY</div>
          <h1>Choose your <em>garden.</em></h1>
          <p className="intro">Each garden has a new twist. Complete a level to unlock the next.</p>
          <div className="level-grid">
            {LEVELS.map(l => {
              const unlocked = completed.includes(l.id) || completed.includes(l.id - 1) || l.id === 1;
              const done = completed.includes(l.id) && l.id < levelId;
              return (
                <button
                  key={l.id}
                  className={`level-tile ${unlocked ? '' : 'locked'} ${l.id === levelId ? 'selected' : ''}`}
                  onClick={() => unlocked && startLevel(l.id)}
                >
                  <span className="tile-number">
                    {unlocked ? String(l.id).padStart(2, '0') : <LockKeyhole size={18} />}
                  </span>
                  <b>{l.title}</b>
                  <small>{l.difficulty}</small>
                  <span className="tile-stars">{done ? '★★★' : unlocked ? '★☆☆' : 'LOCKED'}</span>
                </button>
              );
            })}
          </div>
        </main>
      ) : (
        <main className="secondary-page">
          <div className="eyebrow">VELoop ECONOMY</div>
          <h1>Your reward <em>garden.</em></h1>
          <p className="intro">Rewards should feel valuable, optional, and fair. Sync your stats with your account.</p>
          <div className="wallet-hero">
            <span className="wallet-icon"><Coins size={30} /></span>
            <div>
              <small>{user ? `${user.name.toUpperCase()}'S WALLET` : 'DEMO WALLET BALANCE'}</small>
              <strong>{coins} <span>coins</span></strong>
            </div>
            <span className="wallet-note">
              <ShieldCheck size={15} /> {user ? 'Cloud Synced' : 'Prototype mode'}
            </span>
          </div>
          <div className="reward-grid">
            <div className="reward-detail">
              <span>💡</span>
              <h3>Smart Hint</h3>
              <p>BFS pathfinder highlights the optimal route toward the closest apple.</p>
              <button className="outline-button" onClick={() => { triggerSmartHint(); setMode('play'); }}>
                Use hint
              </button>
            </div>
            <div className="reward-detail">
              <span>🛟</span>
              <h3>Revive</h3>
              <p>In production, restore a server-saved checkpoint after a verified ad.</p>
              <button className="outline-button" onClick={() => setNotice('Revive checkpoint is ready for advertising SDK integration.')}>
                How it works
              </button>
            </div>
            <div className="reward-detail">
              <span>👤</span>
              <h3>Cloud Account</h3>
              <p>{user ? `Signed in as ${user.email}` : 'Sign up or log in to persist your coins & level progress across devices.'}</p>
              <button className="outline-button" onClick={() => setAuthModal(user ? 'profile' : 'login')}>
                {user ? 'Manage Profile' : 'Sign In / Register'}
              </button>
            </div>
          </div>
          <div className="security-note">
            <ShieldCheck size={20} />
            <div>
              <b>Designed for fair rewards & secure storage</b>
              <p>Player stats, authentication with bcrypt/JWT, and wallet ledgers are managed by the Express/MongoDB server. Full unit & integration testing is in place.</p>
            </div>
          </div>
        </main>
      )}

      <footer>
        <span>© 2026 {GAME_NAME}</span>
        <span>Made for curious minds <span className="footer-heart">♥</span></span>
        <button onClick={() => setNotice('Use arrow keys / WASD on desktop, or the on-screen controls on mobile. Collect every apple before entering the portal.')}>
          <CircleHelp size={15} /> How to play
        </button>
        <button onClick={() => setNotice('Audio effects: ' + (sound ? 'Sound is ON.' : 'Sound is MUTED.'))}>
          <Settings size={15} /> Settings
        </button>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
