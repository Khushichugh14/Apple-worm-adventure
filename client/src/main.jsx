import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LEVELS, WORLDS } from './data/levels';
import { SKINS, calculateStars, WorldIcons, WorldIcon,
  WormHeadSVG, WormSegmentSVG, WormTailSVG,
  PremiumAppleSVG, PremiumPortalSVG, PremiumStoneWallSVG,
  PremiumGrassTileSVG, PremiumStoneBlockSVG, PremiumCrateTileSVG,
  PremiumIceTileSVG, PremiumTreasureTileSVG } from './components/GameElements';
import { initialState, step, same, applyBomb, applyLightning, applyHammer, applyMagicKey, applyRainbow } from './game/engine';
import { playSound, startBgm, stopBgm, setSfxVolume, setMusicVolume } from './game/audio';
import { findNextHint } from './game/solver';
import { API_URL } from './config/gameConfig';
import './style.css';

// Icons needed inline since not all re-exported
import {
  Apple as AppleIcon, ArrowDown as ArrowDownIcon, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, ArrowUp as ArrowUpIcon,
  Award as AwardIcon, ChevronRight as ChevronRightIcon, CircleHelp as CircleHelpIcon, Coins as CoinsIcon,
  Gamepad2 as Gamepad2Icon, Gem as GemIcon, Lightbulb as LightbulbIcon, LockKeyhole as LockKeyholeIcon,
  RotateCcw as RotateCcwIcon, Settings as SettingsIcon, ShieldCheck as ShieldCheckIcon, Sparkles as SparklesIcon,
  Star as StarIcon, Trophy as TrophyIcon, Volume2 as Volume2Icon, VolumeX as VolumeXIcon, Zap as ZapIcon,
  User as UserIcon, LogOut as LogOutIcon, Check as CheckIcon, X as XIcon, Edit2 as Edit2Icon,
  Compass as CompassIcon, Play as PlayIcon, RefreshCw as RefreshCwIcon, Flame as FlameIcon, Crown as CrownIcon,
  Flag as FlagIcon, AlertCircle as AlertCircleIcon, Maximize2 as Maximize2Icon, Minimize2 as Minimize2Icon,
  Music as MusicIcon, Undo2 as Undo2Icon, HelpCircle as HelpCircleIcon, MapPin as MapPinIcon,
  ShoppingBag as ShoppingBagIcon, Heart as HeartIcon, Gift as GiftIcon, Palette as PaletteIcon,
  Crown as CrownIcon2, KeyRound as KeyRoundIcon, Leaf as LeafIcon, Mountain as MountainIcon,
  TreePine as TreePineIcon, Trophy as TrophyIcon2, Target as TargetIcon, Medal as MedalIcon,
  Gem as GemIcon2, Plus as PlusIcon, Menu as MenuIcon, X as XIcon2, Home as HomeIcon,
  Settings as SettingsIcon2
} from 'lucide-react';

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

const LevelIcons = {
  leaf: LeafIcon,
  mountain: MountainIcon,
  gem: GemIcon2,
  'tree-pine': TreePineIcon,
  sparkles: SparklesIcon,
};
const LevelIcon = ({ name, size = 20 }) => {
  const Icon = LevelIcons[name] || SparklesIcon;
  return <Icon size={size} />;
};

function App() {
  const [levelId, setLevelId] = useState(() => {
    const saved = localStorage.getItem('currentLevel');
    return saved ? Math.min(50, Math.max(1, Number(saved))) : 1;
  });
  const [levelTransition, setLevelTransition] = useState(null);
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('completedLevels'));
      return Array.isArray(saved) && saved.length ? saved : [1];
    } catch { return [1]; }
  });
  const [levelProgress, setLevelProgress] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('levelProgress'));
      return saved && typeof saved === 'object' ? saved : {};
    } catch { return {}; }
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
    } catch { return ['emerald']; }
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
  const [wormTrailParticles, setWormTrailParticles] = useState([]);

  const [powerUps, setPowerUps] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('powerUps') || '{}');
      return { bomb: 0, lightning: 0, rainbow: 0, hammer: 0, extraMoves: 0, magicKey: 0, ...saved };
    } catch { return { bomb: 0, lightning: 0, rainbow: 0, hammer: 0, extraMoves: 0, magicKey: 0 }; }
  });
  const [selectedPowerUp, setSelectedPowerUp] = useState(null);

  const [claimedAchievements, setClaimedAchievements] = useState(() => {
    try { return JSON.parse(localStorage.getItem('claimedAchievements') || '[]'); } catch { return []; }
  });

  const [objectiveModal, setObjectiveModal] = useState(false);

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || 'Gardener');
  const [playerAvatar, setPlayerAvatar] = useState(() => localStorage.getItem('playerAvatar') || 'A');
  const [profileEditing, setProfileEditing] = useState(false);

  const [dailyStreak, setDailyStreak] = useState(() => Number(localStorage.getItem('dailyStreak') || '0'));
  const [dailyCalendar, setDailyCalendar] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dailyCalendar') || '[]'); } catch { return []; }
  });

  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('settings') || '{}'); } catch { return {}; }
  });
  const musicVolume = settings.musicVolume !== undefined ? settings.musicVolume : 0.5;
  const sfxVolume = settings.sfxVolume !== undefined ? settings.sfxVolume : 0.7;
  const [settingsModal, setSettingsModal] = useState(false);

  const [gameTime, setGameTime] = useState(() => Number(localStorage.getItem('gameTime') || '0'));

  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const touchStartRef = useRef({ x: 0, y: 0 });
  const moveTimeoutRef = useRef(null);
  const prevWormRef = useRef(null);
  const animFrameRef = useRef(null);

  const level = LEVELS[levelId - 1] || LEVELS[0];
  const [game, setGame] = useState(() => initialState(LEVELS[levelId - 1] || LEVELS[0]));
  const [renderWorm, setRenderWorm] = useState(() => (LEVELS[levelId - 1] || LEVELS[0]).worm.map(p => [...p]));
  const [moveTick, setMoveTick] = useState(0);
  const [animTime, setAnimTime] = useState(0);

  const currentWorld = WORLDS.find(w => levelId >= w.range[0] && levelId <= w.range[1]) || WORLDS[0];
  const currentSkin = SKINS.find(s => s.id === wormSkin) || SKINS[0];

  useEffect(() => {
    if (reducedMotion) return;
    let start = performance.now();
    const tick = () => {
      setAnimTime(performance.now() - start);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [reducedMotion]);

  useEffect(() => {
    const id = setInterval(() => {
      if (game.status === 'playing') setGameTime(t => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [game.status]);

  useEffect(() => {
    setSfxVolume(sfxVolume);
    setMusicVolume(musicVolume);
    if (music) startBgm(true);
  }, [musicVolume, sfxVolume, music]);

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
    localStorage.setItem('powerUps', JSON.stringify(powerUps));
    localStorage.setItem('settings', JSON.stringify(settings));
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('playerAvatar', playerAvatar);
    localStorage.setItem('dailyStreak', String(dailyStreak));
    localStorage.setItem('dailyCalendar', JSON.stringify(dailyCalendar));
    localStorage.setItem('claimedAchievements', JSON.stringify(claimedAchievements));
    localStorage.setItem('gameTime', String(gameTime));
  }, [coins, completed, levelProgress, levelId, sound, music, reducedMotion, highContrast, colorblindMode, wormSkin, ownedSkins, powerUps, settings, playerName, playerAvatar, dailyStreak, dailyCalendar, gameTime, claimedAchievements]);

  useEffect(() => { hideSplash(); }, []);

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

  const triggerScreenShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  }, []);

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
    if (id !== levelId) {
      setLevelId(id);
      setLevelPreview(targetLvl);
      playSound('click', sound);
      return;
    }
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
  }, [levelId, sound, reducedMotion]);

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

  const move = useCallback(dir => {
    setGame(old => {
      if (old.status !== 'playing') return old;
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

      const oldHead = old.worm[0];
      const soilColors = ['#8b5a2b', '#a67c52', '#784212', '#5d4037'];
      const trailParticles = Array.from({ length: 5 }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        x: (oldHead[0] / level.size) * 100 + (100 / (level.size * 2)) + (Math.random() - 0.5) * 12,
        y: (oldHead[1] / level.size) * 100 + (Math.random() - 0.5) * 12,
        size: 4 + Math.random() * 6,
        color: soilColors[Math.floor(Math.random() * soilColors.length)],
        opacity: 0.8,
        life: 1.0,
      }));
      setWormTrailParticles(prev => [...prev, ...trailParticles].slice(-40));
      setTimeout(() => {
        setWormTrailParticles(prev => prev.map(p => ({ ...p, life: 0 })));
      }, 50);
      setTimeout(() => {
        setWormTrailParticles(prev => prev.filter(p => p.life > 0));
      }, 600);

      const didEat = next.apples.length < old.apples.length;
      if (didEat) {
        playSound('eat', sound);
        setWormExpression('eating');
        setBoardFx(fx => ({ ...fx, eat: true }));
        setTimeout(() => setBoardFx(fx => ({ ...fx, eat: false })), 420);
        triggerScreenShake();
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
        } else {
          setNotice(`Apple collected! ${next.apples.length} remaining.`);
        }
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

        const portalPos = level.portal;
        triggerParticleBurst(
          (portalPos[0] / level.size) * 100 + (100 / (level.size * 2)),
          (portalPos[1] / level.size) * 100,
          '#a855f7'
        );
        triggerParticleBurst(
          (portalPos[0] / level.size) * 100 + (100 / (level.size * 2)),
          (portalPos[1] / level.size) * 100,
          '#06b6d4'
        );

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

        const isWallHit = next.reason && (next.reason.includes('wall') || next.reason.includes('gate') || next.reason.includes('block') || next.reason.includes('hazard') || next.reason.includes('tangled') || next.reason.includes('edges'));
        if (isWallHit) {
          const headPos = old.worm[0];
          triggerParticleBurst(
            (headPos[0] / level.size) * 100 + (100 / (level.size * 2)),
            (headPos[1] / level.size) * 100,
            next.reason.includes('hazard') ? '#f87171' : '#94a3b8'
          );
        }
      } else if (!didEat) {
        playSound('move', sound);
        setTimeout(() => setWormExpression('idle'), 100);
      }

      return next;
    });
  }, [level, levelId, sound, token, bonusMoves, triggerConfetti, triggerParticleBurst, triggerScreenShake]);

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

  const applyPowerUp = useCallback((type, pos) => {
    const count = powerUps[type] || 0;
    if (count <= 0 && selectedPowerUp !== type) return;
    if (!pos && type !== 'magicKey' && type !== 'extraMoves') return;

    let next = game;
    let soundName = 'click';

    if (type === 'bomb' && pos) {
      next = applyBomb(game, level, pos);
      soundName = 'boost';
    } else if (type === 'lightning' && pos) {
      next = applyLightning(game, level, 'row', pos[1]);
      soundName = 'boost';
    } else if (type === 'hammer' && pos) {
      next = applyHammer(game, level, pos);
      soundName = 'boost';
    } else if (type === 'magicKey') {
      next = applyMagicKey(game, level);
      soundName = 'boost';
    } else if (type === 'rainbow' && pos) {
      next = applyRainbow(game, level, 'grass');
      soundName = 'boost';
    } else if (type === 'extraMoves') {
      setBonusMoves(b => b + 5);
      setSelectedPowerUp(null);
      setNotice('Extra Moves: +5 bonus moves added!');
      playSound('boost', sound);
      return;
    }

    if (next === game) {
      setNotice(`No effect at this tile.`);
      return;
    }

    setGame(next);
    setPowerUps(prev => {
      const updated = { ...prev };
      if (updated[type] !== undefined) updated[type] = Math.max(0, updated[type] - 1);
      return updated;
    });
    setSelectedPowerUp(null);
    playSound(soundName, sound);
    setNotice(`${type.charAt(0).toUpperCase() + type.slice(1)} used!`);
    setMoveTick(t => t + 1);
  }, [game, level, powerUps, selectedPowerUp, token, sound, bonusMoves, setBonusMoves, setNotice, setMoveTick, playSound]);

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

  const isHead = p => game.worm.length && same(game.worm[0], p);
  const isApple = p => game.apples.some(a => same(a, p));

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
      { id: 'first-step', title: 'First Bite', desc: 'Complete any level', icon: AppleIcon, coinReward: 10, unlocked: completedCount >= 1 },
      { id: 'garden-10', title: 'Garden Explorer', desc: 'Complete 10 levels', icon: CompassIcon, coinReward: 25, unlocked: completedCount >= 10 },
      { id: 'garden-25', title: 'Trailblazer', desc: 'Complete 25 levels', icon: MapPinIcon, coinReward: 50, unlocked: completedCount >= 25 },
      { id: 'garden-50', title: 'Realm Master', desc: 'Complete all 50 levels', icon: CrownIcon, coinReward: 100, unlocked: completedCount >= 50 },
      { id: 'perfect-5', title: 'Precision', desc: 'Earn 3 stars on 5 levels', icon: TargetIcon, coinReward: 30, unlocked: perfectLevels >= 5 },
      { id: 'perfect-20', title: 'Perfectionist', desc: 'Earn 3 stars on 20 levels', icon: GemIcon, coinReward: 75, unlocked: perfectLevels >= 20 },
      { id: 'world-clear', title: 'World Conqueror', desc: 'Clear every level in any realm', icon: TrophyIcon, coinReward: 60, unlocked: worldClears >= 1 },
      { id: 'collector', title: 'Skin Collector', desc: 'Own 3 or more worm skins', icon: PaletteIcon, coinReward: 40, unlocked: ownedSkins.length >= 3 },
      { id: 'wealthy', title: 'Coin Hoarder', desc: 'Hold 300+ coins', icon: CoinsIcon, coinReward: 50, unlocked: coins >= 300 },
      { id: 'star-50', title: 'Stargazer', desc: 'Earn 50 total stars', icon: StarIcon, coinReward: 80, unlocked: totalStarsEarned >= 50 },
    ];
  }, [levelProgress, ownedSkins.length, coins, totalStarsEarned]);

  const dailyChallenge = useMemo(() => {
    const day = Math.floor(Date.now() / 86400000);
    const pick = LEVELS[day % LEVELS.length];
    const bonus = 15 + (day % 20);
    return { levelId: pick.id, title: pick.title, worldName: pick.worldName, bonus };
  }, []);

  const liveStars = useMemo(() => {
    return calculateStars(game.moves, level.moveLimit + bonusMoves, level.parMoves);
  }, [game.moves, level.moveLimit, level.parMoves, bonusMoves]);

  const moveProgress = useMemo(() => {
    const limit = level.moveLimit + bonusMoves;
    const used = Math.min(game.moves, limit);
    const par = level.parMoves || Math.ceil(limit * 0.55);
    return { pct: (used / Math.max(1, limit)) * 100, parPct: (par / Math.max(1, limit)) * 100 };
  }, [game.moves, level.moveLimit, bonusMoves, level.parMoves]);

  const displayedLevels = useMemo(() => {
    if (selectedWorldTab === 0) return LEVELS;
    return LEVELS.filter(l => l.worldId === selectedWorldTab);
  }, [selectedWorldTab]);

  const ambientFarMotes = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      left: `${(i * 37) % 100}%`,
      top: `${(i * 73) % 100}%`,
      color: currentWorld.color,
      size: 2 + (i % 4) * 1.5,
      duration: 15 + (i % 10) * 3,
      delay: (i % 8) * 2,
      maxOpacity: 0.15 + (i % 5) * 0.05,
      startX: ((i * 13) % 100) - 50,
      startY: 50 + ((i * 17) % 100),
      endX: ((i * 23) % 100) - 50,
      endY: -10 - ((i * 11) % 50),
    }));
  }, [currentWorld.color]);

  const ambientMidMotes = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      left: `${(i * 17) % 100}%`,
      color: currentWorld.color,
      size: 4 + (i % 6) * 3,
      duration: 10 + (i % 8) * 3,
      delay: (i % 6) * 1.5,
      maxOpacity: 0.25 + (i % 4) * 0.1,
      driftX: (i % 2 === 0 ? 1 : -1) * (30 + (i % 5) * 10),
      driftEnd: (i % 3 === 0 ? 1 : -1) * (40 + (i % 7) * 10),
    }));
  }, [currentWorld.color]);

  const ambientNearOrbs = useMemo(() => [
    { color: currentWorld.color, top: '-150px', left: '-150px', size: 500 },
    { color: currentWorld.color === '#10b981' ? '#38bdf8' : currentWorld.color === '#f59e0b' ? '#a855f7' : '#ec4899', bottom: '-100px', right: '-100px', size: 400 },
    { color: currentWorld.color === '#38bdf8' ? '#fbbf24' : currentWorld.color === '#a855f7' ? '#10b981' : '#38bdf8', top: '35%', left: '50%', size: 300 },
  ], [currentWorld.color]);

  const worldParticles = useMemo(() => {
    const count = 15;
    return Array.from({ length: count }).map((_, i) => ({
      left: `${(i * 100) / count + Math.random() * 20}%`,
      top: `${Math.random() * 100}%`,
      size: 4 + Math.random() * 8,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 4,
    }));
  }, [currentWorld.id]);

  const moveBudgetState = moveProgress.pct >= 100 ? 'danger' : moveProgress.pct >= 85 ? 'warn' : moveProgress.pct >= moveProgress.parPct ? 'caution' : 'safe';

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
        <div className="ambient-layer ambient-far-layer">
          {ambientFarMotes.map((mote, i) => (
            <div
              key={i}
              className="ambient-far-mote"
              style={{
                left: mote.left,
                top: mote.top,
                width: `${mote.size}px`,
                height: `${mote.size}px`,
                background: mote.color,
                animationDuration: `${mote.duration}s`,
                animationDelay: `${mote.delay}s`,
                '--max-opacity': mote.maxOpacity,
                '--start-x': `${mote.startX}px`,
                '--start-y': `${mote.startY}px`,
                '--end-x': `${mote.endX}px`,
                '--end-y': `${mote.endY}px`,
              }}
            />
          ))}
        </div>
        <div className="ambient-layer ambient-mid-layer">
          {ambientMidMotes.map((mote, i) => (
            <div
              key={i}
              className="ambient-mid-mote"
              style={{
                left: mote.left,
                width: `${mote.size}px`,
                height: `${mote.size}px`,
                background: mote.color,
                animationDuration: `${mote.duration}s`,
                animationDelay: `${mote.delay}s`,
                '--max-opacity': mote.maxOpacity,
                '--drift-x': `${mote.driftX}px`,
                '--drift-end': `${mote.driftEnd}px`,
              }}
            />
          ))}
        </div>
        <div className="ambient-layer ambient-near-layer" style={{ '--orb-color-1': ambientNearOrbs[0].color, '--orb-color-2': ambientNearOrbs[1].color, '--orb-color-3': ambientNearOrbs[2].color }}>
          {ambientNearOrbs.slice(0, 3).map((orb, i) => (
            <div key={i} className="ambient-near-orb" style={{ ...orb }} />
          ))}
        </div>
        <div className="ambient-layer ambient-grid-overlay" />
        <div className="ambient-layer ambient-world-fx" data-world={currentWorld.id}>
          {worldParticles.map((p, i) => (
            <div
              key={i}
              className="world-particle"
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* TOP BAR */}
      <header className="game-arcade-hud redesigned-hud">
        <div className="hud-top-row">
          <button className="hud-level-chip" onClick={() => setMapModal(true)} title="Levels & realms">
            <span className="hud-level-dot" style={{ background: currentWorld.color }} />
            <span className="hud-level-text"><strong>Level {levelId}</strong> <small>{currentWorld.name}</small></span>
          </button>

          <div className="hud-stats-row">
            <div className="hud-stat" title="Moves used / limit">
              <span className="hud-stat-label">Moves</span>
              <span className="hud-stat-value">{game.moves}<small>/{level.moveLimit + bonusMoves}</small></span>
            </div>
            <div className="hud-stat" title="Apples remaining">
              <AppleIcon size={14} />
              <span className="hud-stat-value">{game.apples.length}</span>
            </div>
            <div className="hud-stat stars" title="Current star rating">
              {[1, 2, 3].map(i => (
                <StarIcon
                  key={i}
                  size={16}
                  className={`star-icon-unit ${liveStars >= i ? 'earned' : ''}`}
                  fill={liveStars >= i ? '#fbbf24' : 'transparent'}
                  stroke={liveStars >= i ? '#fbbf24' : '#64748b'}
                  strokeWidth={liveStars >= i ? 0 : 2}
                />
              ))}
            </div>
          </div>

          <div className="hud-actions-compact">
            <div className="coin-badge-pill compact" title="Coins"><CoinsIcon size={14} /><span>{coins}</span></div>
            <button className={`hud-action-icon-btn ${sound ? 'active' : ''}`} onClick={() => setSound(!sound)} title="Sound">{sound ? <Volume2Icon size={15} /> : <VolumeXIcon size={15} />}</button>
            <button className="hud-action-icon-btn" onClick={() => setShopModal(true)} title="Shop"><ShoppingBagIcon size={15} /></button>
            <button className="hud-action-icon-btn" onClick={() => setAchievementsModal(true)} title="Badges"><AwardIcon size={15} /></button>
            <button className="hud-action-icon-btn" onClick={() => setSettingsModal(true)} title="Settings"><SettingsIcon size={15} /></button>
            <button className="hud-action-icon-btn hud-user-avatar" onClick={() => setAuthModal(user ? 'profile' : 'login')} title={user ? user.name : 'Sign in'}>{user ? user.name[0].toUpperCase() : <UserIcon size={14} />}</button>
          </div>
        </div>
        <div className="hud-progress-strip" aria-hidden="true">
          <div className="hud-progress-track">
            <span className="hud-progress-fill" style={{ width: `${moveProgress.pct}%` }} />
            <span className="hud-progress-par" style={{ left: `${moveProgress.parPct}%` }} />
          </div>
          <span className="hud-progress-meta">Par {level.parMoves} · <StarIcon size={14} style={{ verticalAlign: 'middle', marginLeft: 2, fill: '#fbbf24' }} /> {totalStarsEarned}/150</span>
        </div>
      </header>

      {/* NOTICE TOAST */}
      {game.apples.length === 0 ? (
        <div className="notice-banner-pill notice-success" key="portal-open">
          <SparklesIcon size={16} /> <span>All apples collected! The portal is open.</span>
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
          <CompassIcon size={16} style={{ color: '#38bdf8' }} />
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
            '--particle-angle': `${p.angle}deg`,
            '--particle-distance': `${p.distance}px`,
          }}
        >
        </div>
      ))}

      {/* WORM TRAIL PARTICLES */}
      {wormTrailParticles.map(p => (
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
            zIndex: 54,
            opacity: p.life * p.opacity,
            transform: `scale(${p.life})`,
            transition: 'opacity 500ms ease-out, transform 500ms ease-out',
          }}
        >
        </div>
      ))}

      {/* CENTER STAGE */}
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

          <div className="garden-floating-island" data-world={currentWorld.id}>
            <div className="garden-matrix-grid" style={{ '--grid-size': level.size }}>
              {board.map((p, i) => {
                const decorSeed = (i * 9301 + 49297) % 233280;
                const decor = decorSeed / 233280;
                const r = Math.floor(i / level.size);
                const c2 = i % level.size;
                const isWallCell = level.walls.some(w => same(w, p));
                const isPortalCell = same(level.portal, p);
                const isAppleCell = isApple(p);
                const isKeyCell = (game.keys || []).some(k => same(k, p));
                const isDoorCell = (game.doors || []).some(d => same(d, p));
                const isHazardCell = (level.hazards || []).some(h => same(h, p));
                const isBlockCell = (game.movingBlocks || level.movingBlocks || []).some(b => same(b, p));
                const isGrassCell = (game.grass || []).some(g => same(g, p));
                const isStoneCell = (game.stoneBlocks || []).some(s => same(s.pos, p));
                const isCrateCell = (game.crates || []).some(c => same(c, p));
                const isIceCell = (game.ice || []).some(i => same(i, p));
                const isTreasureCell = (game.treasure || []).some(t => same(t, p));
                const isEmpty = !isWallCell && !isPortalCell && !isAppleCell && !isKeyCell && !isDoorCell && !isHazardCell && !isBlockCell && !isGrassCell && !isStoneCell && !isCrateCell && !isIceCell && !isTreasureCell && !game.worm.some(w => same(w, p));
                const showDecor = isEmpty && decor > 0.78;
                const levelVariant = ` level-variant-${((level.id + r + c2) % 6)}`;

                return (
                  <div
                    key={i}
                    className={`garden-tile-cell${levelVariant}${showDecor ? ' has-decor' : ''}${isWallCell ? ' wall' : ''}${isKeyCell ? ' key-tile' : ''}${isDoorCell ? ' door-tile' : ''}${isHazardCell ? ' hazard-tile' : ''}${isBlockCell ? ' block-tile' : ''}${isAppleCell ? ' apple' : ''}${isPortalCell ? ' portal' : ''}${hint && game.apples.length && same(game.apples[0], p) ? ' hinted' : ''}${showHintPath && solverHint && solverHint.path && solverHint.path.some(pt => same(pt, p)) ? ' hint-path hint-path-anim' : ''}${boardFx?.trail?.some(t => same(t, p)) ? ' worm-trail' : ''}${isHead(p) ? ' head' : ''}${game.worm.some(w => same(w, p)) ? ' worm' : ''}`}
                    onClick={() => {
                      if (selectedPowerUp) applyPowerUp(selectedPowerUp, p);
                    }}
                  >
                    {showDecor && <span className={`tile-decor decor-${currentWorld.id} d-${Math.floor(decor * 4)}`} aria-hidden="true" />}
                    {boardFx?.trail?.some(t => same(t, p)) && <span className="tile-trail-fx" aria-hidden="true" />}
                    {isAppleCell ? (
                      <PremiumAppleSVG collected={false} bobPhase={(animTime * 0.001 + p[0] * 0.5 + p[1] * 0.3) % (Math.PI * 2)} />
                    ) : isPortalCell ? (
                      <PremiumPortalSVG unlocked={game.apples.length === 0} pulsePhase={animTime * 0.001} />
                    ) : isKeyCell ? (
                      <span className="mechanic-icon key-icon" title="Key"><KeyRoundIcon size={18} /></span>
                    ) : isDoorCell ? (
                      <span className="mechanic-icon door-icon" title="Locked Gate"><LockKeyholeIcon size={18} /></span>
                    ) : isHazardCell ? (
                      <span className="mechanic-icon hazard-icon" title="Hazard"><FlameIcon size={18} /></span>
                    ) : isBlockCell ? (
                      <span className="mechanic-icon block-icon" title="Block"><ShieldCheckIcon size={18} /></span>
                    ) : isWallCell ? (
                      <PremiumStoneWallSVG worldId={currentWorld.id} variant={(level.id + r * 3 + c2) % 4} seed={level.id + r * 7 + c2 * 3} />
                    ) : isGrassCell ? (
                      <PremiumGrassTileSVG pulsePhase={animTime * 0.001} />
                    ) : isStoneCell ? (
                      <PremiumStoneBlockSVG hits={(game.stoneBlocks || []).find(s => same(s.pos, p))?.hits || 2} pulsePhase={animTime * 0.001} />
                    ) : isCrateCell ? (
                      <PremiumCrateTileSVG pulsePhase={animTime * 0.001} />
                    ) : isIceCell ? (
                      <PremiumIceTileSVG pulsePhase={animTime * 0.001} />
                    ) : isTreasureCell ? (
                      <PremiumTreasureTileSVG pulsePhase={animTime * 0.001} />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="worm-overlay-layer" aria-hidden="true">
              {renderWorm.map((seg, idx) => {
                const x = (seg[0] / level.size) * 100;
                const y = (seg[1] / level.size) * 100;
                const isHeadSeg = idx === 0;
                const isTailSeg = idx === renderWorm.length - 1 && idx > 0;
                const wavePhase = (animTime * 0.002) + (idx * 0.6);
                return (
                  <div key={`w-${idx}`} className={`worm-overlay-seg ${isHeadSeg ? 'head' : ''} ${isTailSeg ? 'tail' : ''}`} style={{ left: `${x}%`, top: `${y}%`, width: `${100 / level.size}%`, height: `${100 / level.size}%`, zIndex: 30 - idx }}>
                    {isHeadSeg ? (
                      <WormHeadSVG facing={facing} skinId={wormSkin} expression={wormExpression} skinColor={currentSkin} time={animTime} />
                    ) : isTailSeg ? (
                      <WormTailSVG skinId={wormSkin} skinColor={currentSkin} time={animTime} />
                    ) : (
                      <WormSegmentSVG skinId={wormSkin} scale={Math.max(0.7, 1 - (idx * 0.035))} index={idx} skinColor={currentSkin} wavePhase={wavePhase} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM DOCK */}
      <footer className="game-bottom-dock">
        <div className="dock-controls-left">
          <button className="dock-action-btn" onClick={undo} disabled={!history.length} title="Undo last move (Z)">
            <Undo2Icon size={16} /> <span>UNDO</span>
          </button>
          <button className="dock-action-btn" onClick={restart} title="Restart (R)">
            <RefreshCwIcon size={16} /> <span>RESET</span>
          </button>
          <button className="dock-action-btn hint-btn" onClick={triggerSmartHint} title="Show hint (H)">
            <LightbulbIcon size={16} /> <span>HINT</span>
          </button>
          {Object.entries(powerUps).map(([type, count]) => (
            <button
              key={type}
              className={`dock-action-btn ${selectedPowerUp === type ? 'active' : ''} powerup-btn`}
              onClick={() => setSelectedPowerUp(selectedPowerUp === type ? null : type)}
              title={type}
              disabled={count <= 0 && selectedPowerUp !== type}
            >
              {type === 'bomb' && <ZapIcon size={16} />}
              {type === 'lightning' && <ZapIcon size={16} />}
              {type === 'rainbow' && <GemIcon2 size={16} />}
              {type === 'hammer' && <ShieldCheckIcon size={16} />}
              {type === 'extraMoves' && <PlusIcon size={16} />}
              {type === 'magicKey' && <KeyRoundIcon size={16} />}
              <span>{count > 0 ? count : selectedPowerUp === type ? 'SELECT' : '—'}</span>
            </button>
          ))}
        </div>

        <div className="virtual-dpad-cluster" onTouchStart={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}>
          <button type="button" className="dpad-direction-button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); move('up'); }} aria-label="Move Up">
            <ArrowUpIcon size={22} />
          </button>
          <div className="dpad-row-keys">
            <button type="button" className="dpad-direction-button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); move('left'); }} aria-label="Move Left">
              <ArrowLeftIcon size={22} />
            </button>
            <button type="button" className="dpad-direction-button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); move('down'); }} aria-label="Move Down">
              <ArrowDownIcon size={22} />
            </button>
            <button type="button" className="dpad-direction-button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); move('right'); }} aria-label="Move Right">
              <ArrowRightIcon size={22} />
            </button>
          </div>
        </div>
      </footer>

      {/* CELEBRATION CONFETTI */}
      {game.status === 'completed' && (
        <div className="celebration-confetti-stage">
          {confettiParticles.map(p => (
            <div key={p.id} className="confetti-flake" style={{
              background: p.color,
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size,
            }} />
          ))}
        </div>
      )}

      {/* VICTORY MODAL */}
      {game.status === 'completed' && (
        <div className="game-modal-backdrop">
          <div className="game-modal-panel victory-celebration-dialog">
            <div className="victory-trophy-pedestal">
              <TrophyIcon size={50} />
            </div>
            <span style={{ color: '#34d399', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em' }}>
              {currentWorld.name.toUpperCase()} • LEVEL {levelId}
            </span>
            <h2 className="modal-prominent-title">Garden Cleared!</h2>
            <div className="podium-stars-trio">
              <div className={`star-podium-slot ${starPopStage >= 1 ? 'earned' : ''}`}>
                <StarIcon size={36} fill={starPopStage >= 1 ? '#78350f' : 'none'} />
              </div>
              <div className={`star-podium-slot tall-center ${starPopStage >= 2 ? 'earned' : ''}`}>
                <StarIcon size={48} fill={starPopStage >= 2 ? '#78350f' : 'none'} />
              </div>
              <div className={`star-podium-slot ${starPopStage >= 3 ? 'earned' : ''}`}>
                <StarIcon size={36} fill={starPopStage >= 3 ? '#78350f' : 'none'} />
              </div>
            </div>
            <div className="stats-summary-grid">
              <div className="summary-metric-card">
                <small>MOVES</small>
                <strong>{game.moves} / {level.parMoves} par</strong>
              </div>
              <div className="summary-metric-card bonus">
                <small>COIN REWARD</small>
                <strong>+25 <CoinsIcon size={14} style={{ verticalAlign: 'middle' }} /></strong>
              </div>
              <div className="summary-metric-card">
                <small>SCORE</small>
                <strong>+{game.score}</strong>
              </div>
              <div className="summary-metric-card">
                <small>BEST STARS</small>
                <strong style={{ color: '#fbbf24' }}>
                  {(levelProgress[levelId]?.bestStars || earnedStars) > 0
                    ? [...Array(levelProgress[levelId]?.bestStars || earnedStars)].map((_, i) => (
                        <StarIcon key={i} size={16} fill="#fbbf24" style={{ marginRight: 2 }} />
                      ))
                    : '—'}
                </strong>
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
                ? <span><GemIcon size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Flawless precision!</span>
                : 'Well played! Slither into the next garden or replay to earn 3 stars.'}
            </p>
            <div className="modal-btn-row">
              <button className="modal-primary-btn" onClick={() => startLevel(Math.min(50, levelId + 1))}>
                Next Level <ChevronRightIcon size={18} />
              </button>
              <button className="modal-secondary-btn" onClick={restart}>
                <RotateCcwIcon size={16} /> Replay
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
              <AlertCircleIcon size={50} />
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
                  <RotateCcwIcon size={16} /> Undo Move (Z)
                </button>
              )}
              <button className="modal-primary-btn" onClick={restart}>
                Try Again (R)
              </button>
              {failureType?.type === 'moves' && (
                <button className="modal-secondary-btn" onClick={buyBoost} style={{ borderColor: '#f59e0b', color: '#fbbf24' }}>
                  <ZapIcon size={14} /> +5 Moves (<CoinsIcon size={14} style={{ verticalAlign: 'middle' }} /> 30)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SAGA MAP MODAL */}
      {mapModal && (
        <div className="game-modal-backdrop" onClick={() => setMapModal(false)}>
          <div className="game-modal-panel saga-world-map-dialog" onClick={e => e.stopPropagation()}>
            <button className="modal-close-cross-btn" onClick={() => setMapModal(false)}>×</button>
            <div className="saga-header-meta">
              <span>THE 5 REALMS</span>
              <h2>Choose Your Garden</h2>
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>50 handcrafted puzzle gardens.</p>
            </div>
            <div className="world-carousel-deck">
              <button
                className={`world-realm-tab-card ${selectedWorldTab === 0 ? 'active' : ''}`}
                onClick={() => setSelectedWorldTab(0)}
                style={{ '--world-tab-color': '#34d399' }}
              >
                <span><CompassIcon size={16} /> All Realms</span>
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
                    <span><LevelIcon name={w.icon} size={16} /> {w.name}</span>
                    <span className="world-progress-badge">{worldCompleted}/10</span>
                  </button>
                );
              })}
            </div>
            {selectedWorldTab > 0 && (() => {
              const previewWorld = WORLDS.find(w => w.id === selectedWorldTab);
              if (!previewWorld) return null;
              const worldLevels = LEVELS.filter(l => l.worldId === selectedWorldTab);
              const completedInWorld = completed.filter(id => id >= previewWorld.range[0] && id <= previewWorld.range[1]).length;
              return (
                <div className="world-preview-thumbnail" style={{ '--world-preview-color': previewWorld.color }}>
                  <div className="world-preview-header">
                    <LevelIcon name={previewWorld.icon} size={32} className="world-preview-icon" />
                    <div className="world-preview-info">
                      <h3>{previewWorld.name}</h3>
                      <p>{worldLevels[0]?.objective}</p>
                    </div>
                  </div>
                  <div className="world-preview-scene">
                    <div className="world-preview-tile" style={{ background: `linear-gradient(135deg, ${previewWorld.color}22, ${previewWorld.color}44)` }}>
                      <div className="world-preview-worm" style={{ background: `linear-gradient(135deg, ${previewWorld.color}, ${previewWorld.color}aa)` }} />
                    </div>
                  </div>
                  <div className="world-preview-stats">
                    <div className="world-preview-stat">
                      <span className="world-preview-stat-value">{completedInWorld}/10</span>
                      <span className="world-preview-stat-label">Levels Cleared</span>
                    </div>
                    <div className="world-preview-stat">
                      <span className="world-preview-stat-value">{worldLevels.length}</span>
                      <span className="world-preview-stat-label">Total Gardens</span>
                    </div>
                    <div className="world-preview-stat">
                      <span className="world-preview-stat-value"><StarIcon size={14} style={{ verticalAlign: 'middle', fill: '#fbbf24', marginRight: 2 }} /> {completedInWorld * 3}</span>
                      <span className="world-preview-stat-label">Max Stars</span>
                    </div>
                  </div>
                </div>
              );
            })()}
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
                        <WormHeadSVG facing="right" skinId={wormSkin} skinColor={currentSkin} time={animTime} />
                      </div>
                    )}
                    <span className="level-node-number">
                      {unlocked ? String(l.id).padStart(2, '0') : <LockKeyholeIcon size={18} />}
                    </span>
                    <span className="level-node-stars-label">
                      {best > 0 ? (
                        <>
                          {[...Array(3)].map((_, i) => (
                            <StarIcon
                              key={i}
                              size={12}
                              fill={i < best ? world.color : 'transparent'}
                              stroke={world.color}
                              strokeWidth={i < best ? 0 : 2}
                            />
                          ))}
                        </>
                      ) : unlocked ? (
                        <>
                          {[...Array(3)].map((_, i) => (
                            <StarIcon key={i} size={12} fill="transparent" stroke="#64748b" strokeWidth={2} />
                          ))}
                        </>
                      ) : (
                        'LOCKED'
                      )}
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
                <strong><AppleIcon size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {levelPreview.apples.length}</strong>
              </div>
              <div className="level-preview-stat">
                <small>PAR MOVES</small>
                <strong style={{ color: '#fbbf24' }}>≤ {levelPreview.parMoves} moves</strong>
              </div>
              <div className="level-preview-stat">
                <small>MOVE LIMIT</small>
                <strong>{levelPreview.moveLimit} moves</strong>
              </div>
            </div>
            <button className="modal-primary-btn" style={{ width: '100%' }} onClick={() => startLevel(levelPreview.id)}>
              <PlayIcon size={16} /> Enter Garden
            </button>
          </div>
        </div>
      )}

      {/* LEADERBOARD MODAL */}
      {leaderboardModal && (
        <div className="game-modal-backdrop" onClick={() => setLeaderboardModal(false)}>
          <div className="game-modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <button className="modal-close-cross-btn" onClick={() => setLeaderboardModal(false)}>×</button>
            <span style={{ color: '#fbbf24', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>HALL OF FAME</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, marginTop: 4 }}>Master Gardeners</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Top players ranked by stars.</p>
            {leaderboardLoading ? (
              <div style={{ display: 'grid', placeItems: 'center', padding: 40, color: '#94a3b8' }}>
                <RefreshCwIcon size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: 12 }}>Loading leaderboard...</p>
              </div>
            ) : (
              <>
                {leaderboard.length > 0 && (
                  <div className="podium-trio-stage">
                    {leaderboard.slice(0, 3).map((entry, idx) => (
                      <div
                        key={entry.id || idx}
                        className={`podium-pedestal-card ${idx === 0 ? 'first-place' : idx === 1 ? 'second-place' : 'third-place'}`}
                      >
                        <div className="podium-emblem">
                          {idx === 0 ? <CrownIcon2 size={36} fill="#fbbf24" /> : idx === 1 ? <AwardIcon size={32} fill="#94a3b8" /> : <FlagIcon size={32} fill="#b45309" />}
                        </div>
                        <div className="podium-player-name">{entry.name || 'Anonymous'}</div>
                        <div className="podium-stars-count"><StarIcon size={14} fill="#fbbf24" style={{ verticalAlign: 'middle', marginRight: 4 }} /> {entry.totalStars || 0}</div>
                      </div>
                    ))}
                  </div>
                )}
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
                      <span className="leaderboard-stars"><StarIcon size={14} fill="#fbbf24" style={{ verticalAlign: 'middle', marginRight: 4 }} /> {entry.totalStars || 0}</span>
                    </div>
                  ))}
                  {leaderboard.length <= 3 && (
                    <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                      <TrophyIcon size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                      <p>No rankings yet.</p>
                    </div>
                  )}
                  {myRank && (
                    <div style={{ marginTop: 16, padding: 12, background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 12, textAlign: 'center' }}>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>Your Rank: #{myRank.rank}</span>
                    </div>
                  )}
                </div>
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
                <CoinsIcon size={16} /> <span>{coins}</span>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Unlock unique worm appearances with your garden coins.</p>
            <div className="skins-grid">
              {SKINS.map(skin => (
                <div
                  key={skin.id}
                  className={`skin-card ${ownedSkins.includes(skin.id) ? 'owned' : 'locked'} ${wormSkin === skin.id ? 'selected' : ''}`}
                  onClick={() => ownedSkins.includes(skin.id) ? selectSkin(skin.id) : buySkin(skin.id)}
                >
                  {ownedSkins.includes(skin.id) && <span className="skin-badge owned">Owned</span>}
                  {!ownedSkins.includes(skin.id) && <span className="skin-badge locked">{skin.price} <CoinsIcon size={10} /></span>}
                  <div className="skin-preview" style={{
                    '--skin-primary': skin.primary,
                    '--skin-secondary': skin.secondary,
                    '--skin-glow': skin.glow,
                  }} />
                  <span className="skin-name">{skin.name}</span>
                  <span className="skin-label">{skin.label}</span>
                  {!ownedSkins.includes(skin.id) && (
                    <div className="skin-price">
                      <CoinsIcon size={14} /> {skin.price}
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
                  <div className="step-desc">Swipe or use arrow keys / WASD to move.</div>
                  <div className="step-keys">
                    <span className="key-badge"><ArrowUpIcon size={14} /></span>
                    <span className="key-badge"><ArrowDownIcon size={14} /></span>
                    <span className="key-badge"><ArrowLeftIcon size={14} /></span>
                    <span className="key-badge"><ArrowRightIcon size={14} /></span>
                    <span className="key-badge">WASD</span>
                  </div>
                </div>
              </div>
              <div className="how-to-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <div className="step-title"><AppleIcon size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Eat Apples</div>
                  <div className="step-desc">Collect all apples. Each apple makes your worm grow longer!</div>
                </div>
              </div>
              <div className="how-to-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <div className="step-title"><CompassIcon size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Enter the Portal</div>
                  <div className="step-desc">After eating all apples, the cosmic portal unlocks.</div>
                </div>
              </div>
              <div className="how-to-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <div className="step-title">Avoid Obstacles</div>
                  <div className="step-desc">Don't hit walls, the edge, or your own tail.</div>
                </div>
              </div>
              <div className="how-to-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <div className="step-title">Master Moves</div>
                  <div className="step-desc">Beat Par moves for 3 stars! Use H for hint, Z for undo.</div>
                </div>
              </div>
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
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, marginTop: 4 }}>Badges & Daily</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Track milestones and take on today's featured garden.</p>
            <div className="daily-challenge-card">
              <div className="daily-challenge-head"><GiftIcon size={18} /> <span>Daily Challenge</span></div>
              <strong>Level {String(dailyChallenge.levelId).padStart(2, '0')} — {dailyChallenge.title}</strong>
              <p>{dailyChallenge.worldName} • Bonus reward: +{dailyChallenge.bonus} coins on clear</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <button className="modal-primary-btn" style={{ flex: 1 }} onClick={() => { setAchievementsModal(false); startLevel(dailyChallenge.levelId); }}>
                  <PlayIcon size={15} /> Play Challenge
                </button>
                <button className="modal-secondary-btn" style={{ flex: 1 }} onClick={claimDailyReward} disabled={dailyRewardClaimed && !!token}>
                  <CoinsIcon size={14} /> {dailyRewardClaimed && token ? 'Reward Claimed' : 'Claim Daily Reward'}
                </button>
              </div>
              {dailyRewardMsg && <p style={{ marginTop: 8, fontSize: 12, color: '#a7f3d0' }}>{dailyRewardMsg}</p>}
            </div>
            <div className="achievements-grid">
              {achievements.map(a => {
                const Icon = a.icon;
                const alreadyClaimed = claimedAchievements.includes(a.id);
                const canClaim = a.unlocked && !alreadyClaimed;
                return (
                  <div key={a.id} className={`achievement-card ${a.unlocked ? 'unlocked' : 'locked'} ${alreadyClaimed ? 'claimed' : ''}`}>
                    <div className="achievement-icon" aria-hidden="true"><Icon size={28} /></div>
                    <div className="achievement-title">{a.title}</div>
                    <div className="achievement-desc">{a.desc}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                      <div className="achievement-state">{a.unlocked ? 'Unlocked' : 'Locked'}</div>
                      {a.coinReward && (
                        <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 800 }}><CoinsIcon size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} /> +{a.coinReward}</span>
                      )}
                    </div>
                    {canClaim && (
                      <button
                        className="modal-primary-btn"
                        style={{ marginTop: 8, width: '100%', fontSize: 12, padding: '6px 10px' }}
                        onClick={() => {
                          setCoins(c => c + a.coinReward);
                          setClaimedAchievements(prev => [...prev, a.id]);
                          setNotice(`${a.title} unlocked! +${a.coinReward} coins`);
                          playSound('boost', sound);
                        }}
                      >
                        Claim +{a.coinReward}
                      </button>
                    )}
                    {alreadyClaimed && (
                      <span style={{ marginTop: 6, fontSize: 11, color: '#34d399' }}>Reward claimed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {settingsModal && (
        <div className="game-modal-backdrop" onClick={() => setSettingsModal(false)}>
          <div className="game-modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <button className="modal-close-cross-btn" onClick={() => setSettingsModal(false)}>×</button>
            <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>PREFERENCES</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, marginTop: 4 }}>Settings</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Tailor your garden experience.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Music Volume</strong>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{Math.round(musicVolume * 100)}%</p>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={e => { const v = parseFloat(e.target.value); setSettings(prev => ({ ...prev, musicVolume: v })); setMusicVolume(v); }}
                  className="settings-slider"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>SFX Volume</strong>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{Math.round(sfxVolume * 100)}%</p>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sfxVolume}
                  onChange={e => { const v = parseFloat(e.target.value); setSettings(prev => ({ ...prev, sfxVolume: v })); setSfxVolume(v); }}
                  className="settings-slider"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="checkbox" checked={reducedMotion} onChange={() => setReducedMotion(!reducedMotion)} className="settings-checkbox" />
                <div>
                  <strong>Reduced Motion</strong>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Disable animations and screen shake</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="checkbox" checked={highContrast} onChange={() => setHighContrast(!highContrast)} className="settings-checkbox" />
                <div>
                  <strong>High Contrast</strong>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Enhanced visibility</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="checkbox" checked={colorblindMode} onChange={() => setColorblindMode(!colorblindMode)} className="settings-checkbox" />
                <div>
                  <strong>Colorblind Mode</strong>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Patterns and symbols alongside colors</p>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              <button className="modal-secondary-btn" style={{ flex: 1 }} onClick={() => setSettingsModal(false)}>Close</button>
              <button className="modal-primary-btn" style={{ flex: 1 }} onClick={() => { setSettingsModal(false); playSound('click', sound); }}>Apply</button>
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
              <div className="onboarding-card"><strong>Slither Smart</strong><p>Swipe or use arrows/WASD. Plan around your growing tail.</p></div>
              <div className="onboarding-card"><strong>Collect & Unlock</strong><p>Eat all apples to open the cosmic portal.</p></div>
              <div className="onboarding-card"><strong>Master Realms</strong><p>Earn stars, unlock skins, chase badges.</p></div>
              <div className="onboarding-card"><strong>Accessibility</strong><p>Use reduced motion, high contrast, colorblind modes.</p></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="modal-primary-btn" style={{ flex: 1 }} onClick={() => { setOnboardingOpen(false); localStorage.setItem('onboardingSeen', '1'); setHowToPlayModal(true); }}><CircleHelpIcon size={16} /> Full Tutorial</button>
              <button className="modal-secondary-btn" style={{ flex: 1 }} onClick={() => { setOnboardingOpen(false); localStorage.setItem('onboardingSeen', '1'); }}><PlayIcon size={16} /> Start Playing</button>
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
                  {profileEditing ? (
                    <input
                      type="text"
                      value={playerName}
                      onChange={e => setPlayerName(e.target.value)}
                      maxLength="1"
                      style={{ width: 32, height: 32, fontSize: 24, textAlign: 'center', background: 'transparent', border: 'none', color: '#fff' }}
                      autoFocus
                    />
                  ) : (
                    user.name[0].toUpperCase()
                  )}
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, marginBottom: 4 }}>{user.name}</h2>
                {!profileEditing && (
                  <div style={{ marginBottom: 16 }}>
                    <button className="modal-secondary-btn" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setProfileEditing(true)}><Edit2Icon size={14} /> Edit Profile</button>
                  </div>
                )}
                {profileEditing && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>Display Name</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={e => setPlayerName(e.target.value)}
                      style={{ width: '100%', maxWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 14, marginTop: 4 }}
                    />
                  </div>
                )}
                {profileEditing && (
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button className="modal-secondary-btn" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setProfileEditing(false)}>Cancel</button>
                    <button className="modal-primary-btn" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => {
                      setProfileEditing(false);
                      localStorage.setItem('playerName', playerName);
                      setNotice('Profile updated!');
                    }}>Save</button>
                  </div>
                )}
                {!profileEditing && (
                  <button className="modal-secondary-btn" style={{ width: '100%' }} onClick={handleLogout}>
                    <LogOutIcon size={16} /> Sign Out
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="auth-form">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, textAlign: 'center', marginBottom: 4 }}>
                  {authModal === 'register' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 20 }}>
                  {authModal === 'register' ? 'Join the garden adventure' : 'Sign in to sync progress'}
                </p>
                {authError && <div className="auth-error">{authError}</div>}
                {authModal === 'register' && (
                  <div className="auth-input-group">
                    <label>Display Name</label>
                    <input type="text" value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))} placeholder="Your worm name" autoComplete="name" required disabled={authLoading} />
                  </div>
                )}
                <div className="auth-input-group">
                  <label>Email</label>
                  <input type="email" value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} placeholder="you@garden.com" autoComplete="email" required disabled={authLoading} />
                </div>
                <div className="auth-input-group">
                  <label>Password</label>
                  <input type="password" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" autoComplete={authModal === 'register' ? 'new-password' : 'current-password'} required disabled={authLoading} />
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
