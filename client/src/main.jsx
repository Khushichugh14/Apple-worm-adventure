import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Apple, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Award,
  ChevronRight, CircleHelp, Coins, Gamepad2, Gem, Lightbulb,
  LockKeyhole, RotateCcw, Settings, ShieldCheck, Sparkles, Star,
  Trophy, Volume2, VolumeX, Zap, User as UserIcon, LogOut, Check, X, Edit2,
  Compass, Play, RefreshCw, Flame, Crown, Flag, AlertCircle,
  Maximize2, Minimize2, Music, Undo2, HelpCircle, MapPin, ShoppingBag,
  Heart, Gift, Palette, Crown as CrownIcon, KeyRound,
  Leaf, Mountain, TreePine, Trophy as TrophyIcon, Target, Medal, Gem as GemIcon, Plus
} from 'lucide-react';
import { GAME_NAME, API_URL } from './config/gameConfig';
import { LEVELS, WORLDS } from './data/levels';
import { initialState, step, same, applyBomb, applyLightning, applyHammer, applyMagicKey, applyRainbow } from './game/engine';
import { playSound, startBgm, stopBgm, setSfxVolume, setMusicVolume } from './game/audio';
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

// Icon mapping for world icons
const WorldIcons = {
  leaf: Leaf,
  mountain: Mountain,
  gem: Gem,
  'tree-pine': TreePine,
  sparkles: Sparkles,
};

const WorldIcon = ({ name, size = 20, className = '' }) => {
  const Icon = WorldIcons[name] || Sparkles;
  return <Icon size={size} className={className} />;
};

/* ===================================================
   PREMIUM CUSTOM VECTOR GRAPHIC COMPONENTS
   =================================================== */

// 1. Enhanced Premium Worm Head with Detailed Anatomy, Expressions & Micro-Animations
function WormHeadSVG({ facing = 'right', skinId = 'emerald', expression = 'idle', skinColor = {}, time = 0 }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;
  const gradId = `wormGrad-${skin.id}-${expression}`;

  const isEating = expression === 'eating';
  const isMoving = expression === 'moving';
  const isHappy = expression === 'happy';
  const isIdle = !isEating && !isMoving && !isHappy;
  const eyeRy = isEating ? 5 : isHappy ? 7 : 10;
  const pupilR = isEating ? 3 : isHappy ? 4.5 : 5;
  const blinkProgress = isIdle ? (Math.sin(time * 0.003) * 0.5 + 0.5) : 0;
  const shouldBlink = isIdle && blinkProgress > 0.98;
  const eyeScale = shouldBlink ? 0.15 : 1;
  const pupilOffsetX = isEating ? 3 : isMoving ? 2.5 : 2.2;
  const pupilOffsetY = isEating ? 1.5 : 0;

  return (
    <svg className={`worm-head-svg-container facing-${facing} ${isMoving ? 'moving' : ''} ${isEating ? 'eating' : ''} ${isHappy ? 'happy' : ''} ${isIdle ? 'idle' : ''}`} viewBox="0 0 120 120">
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="35%" stopColor={primary} />
          <stop offset="70%" stopColor={secondary} />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.85" />
        </radialGradient>
        <radialGradient id={`${gradId}-belly`} cx="50%" cy="65%" r="60%">
          <stop offset="0%" stopColor={highlight} stopOpacity="0.6" />
          <stop offset="50%" stopColor={primary} stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id={`${gradId}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gradId}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
        <filter id="headDropShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
        </filter>
        <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="60" cy="85" rx="36" ry="12" fill="rgba(0,0,0,0.18)" filter="url(#headDropShadow)" />

      {/* Head sprout/antenna with subtle sway */}
      <g className="head-sprout" transform="translate(52, 8)" style={{ transformOrigin: '50% 100%' }}>
        <path d="M6 22 C3 10, 18 4, 28 12 C33 18, 22 26, 8 22 Z" fill="#4ade80" stroke="#14532d" strokeWidth="1.8" />
        <path d="M7 22 C15 14, 22 12, 27 13" stroke="#14532d" strokeWidth="1.4" fill="none" opacity="0.7" />
        <path d="M7 22 Q3 30 6 36" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="14" cy="16" r="2" fill="#86efac" opacity="0.8" />
      </g>

      {/* Main head body - layered for depth */}
      <ellipse cx="60" cy="65" rx="48" ry="44" fill={`url(#${gradId})`} filter="url(#headDropShadow)" />
      <ellipse cx="60" cy="58" rx="42" ry="28" fill={`url(#${gradId}-shine)`} opacity="0.4" />
      <ellipse cx="60" cy="78" rx="38" ry="16" fill={`url(#${gradId}-belly)`} />

      {/* Subtle body ridges/segments on head */}
      <g stroke="rgba(255,255,255,0.12)" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M22 58 Q60 82 98 58" />
        <path d="M26 64 Q60 85 94 64" strokeWidth="2" opacity="0.08" />
        <path d="M30 70 Q60 88 90 70" strokeWidth="1.5" opacity="0.06" />
      </g>

      {/* Cheek blush marks */}
      <ellipse cx="28" cy="72" rx={isEating ? 10 : 8} ry={isEating ? 6 : 5} fill="#fb7185" opacity={isEating ? 0.9 : isHappy ? 0.6 : 0.45} />
      <ellipse cx="92" cy="72" rx={isEating ? 10 : 8} ry={isEating ? 6 : 5} fill="#fb7185" opacity={isEating ? 0.9 : isHappy ? 0.6 : 0.45} />

      {/* Eyes - expressive with lids, pupils, highlights, reflections */}
      <g transform="translate(42, 50)">
        {/* Eye white with lid */}
        <ellipse cx="0" cy="0" rx="11" ry={eyeRy * eyeScale} fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
        {!shouldBlink && (
          <g className="worm-eye-pupil">
            <circle cx={pupilOffsetX} cy={pupilOffsetY} r={pupilR * eyeScale} fill="#0f172a" />
            <circle cx={pupilOffsetX - 2} cy={pupilOffsetY - 3} r="2.8" fill="#ffffff" />
            <circle cx={pupilOffsetX + 2.5} cy={pupilOffsetY + 1.5} r="1.2" fill="#ffffff" opacity="0.9" />
            {/* Subtle iris color reflection */}
            <circle cx={pupilOffsetX - 1} cy={pupilOffsetY - 1} r={pupilR * 0.6} fill={highlight} opacity="0.3" />
          </g>
        )}
        {isHappy && !shouldBlink && <path d="M-9 2 Q0 -6 9 2" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />}
        {/* Eyelid for blink/expression */}
        {shouldBlink && <path d="M-11 0 Q0 -4 11 0" stroke="#0f172a" strokeWidth="3" fill="none" />}
      </g>
      <g transform="translate(78, 50)">
        <ellipse cx="0" cy="0" rx="11" ry={eyeRy * eyeScale} fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
        {!shouldBlink && (
          <g className="worm-eye-pupil">
            <circle cx={pupilOffsetX} cy={pupilOffsetY} r={pupilR * eyeScale} fill="#0f172a" />
            <circle cx={pupilOffsetX - 2} cy={pupilOffsetY - 3} r="2.8" fill="#ffffff" />
            <circle cx={pupilOffsetX + 2.5} cy={pupilOffsetY + 1.5} r="1.2" fill="#ffffff" opacity="0.9" />
            <circle cx={pupilOffsetX - 1} cy={pupilOffsetY - 1} r={pupilR * 0.6} fill={highlight} opacity="0.3" />
          </g>
        )}
        {isHappy && !shouldBlink && <path d="M-9 2 Q0 -6 9 2" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />}
        {shouldBlink && <path d="M-11 0 Q0 -4 11 0" stroke="#0f172a" strokeWidth="3" fill="none" />}
      </g>

      {/* Eyebrows for expression */}
      {isMoving && (
        <g stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M30 38 Q42 30 54 38" />
          <path d="M66 38 Q78 30 90 38" />
        </g>
      )}
      {isEating && (
        <g stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M30 38 Q42 44 54 38" />
          <path d="M66 38 Q78 44 90 38" />
        </g>
      )}

      {/* Mouth variations */}
      {isEating ? (
        <g transform="translate(60, 85)">
          <ellipse cx="0" cy="0" rx="14" ry="10" fill="#3d0a0a" stroke="#0f172a" strokeWidth="1.8" />
          <ellipse cx="0" cy="3" rx="8" ry="5" fill="#fb7185" opacity="0.9" />
          <ellipse cx="-5" cy="1" rx="2" ry="1.5" fill="#ffffff" opacity="0.3" />
          <ellipse cx="5" cy="1" rx="2" ry="1.5" fill="#ffffff" opacity="0.3" />
        </g>
      ) : isHappy ? (
        <path d="M38 82 Q60 100 82 82" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" fill="none" filter="url(#innerGlow)" />
      ) : (
        <path d="M46 78 Q60 90 74 78" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      )}

      {/* Subtle nostril dots */}
      {!isEating && !shouldBlink && (
        <g opacity="0.4">
          <circle cx="48" cy="62" r="1.5" fill="#0f172a" />
          <circle cx="72" cy="62" r="1.5" fill="#0f172a" />
        </g>
      )}
    </svg>
  );
}

// 2. Enhanced Worm Body Segment with Detailed Texture & Depth
function WormSegmentSVG({ skinId = 'emerald', scale = 1, index = 0, skinColor = {} }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;
  const gradId = `segGrad-${skin.id}-${index}`;
  const stripe = index % 2 === 0;
  const segmentVariant = index % 4; // 4 visual variants for variety

  return (
    <svg className="worm-segment-svg-container" style={{ '--seg-scale': scale, '--seg-i': index }} viewBox="0 0 120 120">
      <defs>
        <radialGradient id={gradId} cx="32%" cy="28%" r="75%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="40%" stopColor={primary} />
          <stop offset="80%" stopColor={secondary} />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.8" />
        </radialGradient>
        <linearGradient id={`${gradId}-shade`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={`${gradId}-stripe`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="45%" stopColor="transparent" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <filter id="segShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
        </filter>
        <filter id="segInnerGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="60" cy="78" rx={34 * scale} ry={12 * scale} fill="rgba(0,0,0,0.15)" filter="url(#segShadow)" />

      {/* Segment body - main shape */}
      <ellipse cx="60" cy="62" rx={46 * scale} ry={34 * scale} fill={`url(#${gradId})`} filter="url(#segShadow)" />
      <ellipse cx="60" cy="58" rx={42 * scale} ry={24 * scale} fill={`url(#${gradId}-shade)`} filter="url(#segInnerGlow)" />

      {/* Belly highlight */}
      <ellipse cx="60" cy="76" rx={34 * scale} ry={14 * scale} fill="rgba(255,255,255,0.08)" />

      {/* Stripe pattern for visual variety */}
      {stripe && (
        <ellipse cx="60" cy="62" rx={40 * scale} ry={28 * scale} fill={`url(#${gradId}-stripe)`} />
      )}

      {/* Segment ring ridges for 3D feel */}
      <g stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6">
        <path d={`M20 ${stripe ? 60 : 54} Q60 ${stripe ? 78 : 50} 100 ${stripe ? 60 : 54}`} />
        <path d={`M26 ${stripe ? 64 : 58} Q60 ${stripe ? 80 : 54} 94 ${stripe ? 64 : 58}`} strokeWidth="1.5" opacity="0.4" />
      </g>

      {/* Subtle highlight spots */}
      <ellipse cx="44" cy="44" rx={10 * scale} ry={6 * scale} fill="#ffffff" opacity="0.25" transform={`rotate(-20 44 44)`} />
      <circle cx="72" cy="68" r={3 * scale} fill={highlight} opacity="0.35" />

      {/* Variant-specific decorative details */}
      {segmentVariant === 0 && (
        <g opacity="0.3">
          <circle cx="38" cy="70" r={2.5 * scale} fill="#ffffff" />
          <circle cx="82" cy="70" r={2.5 * scale} fill="#ffffff" />
        </g>
      )}
      {segmentVariant === 1 && (
        <ellipse cx="60" cy="48" rx={18 * scale} ry={4 * scale} fill="#ffffff" opacity="0.12" />
      )}
      {segmentVariant === 2 && (
        <g stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="none">
          <path d="M40 48 Q60 40 80 48" />
          <path d="M42 56 Q60 48 78 56" strokeWidth="1" opacity="0.5" />
        </g>
      )}
      {segmentVariant === 3 && (
        <circle cx="60" cy="62" r={8 * scale} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      )}

      {/* Segment edge rim */}
      <ellipse cx="60" cy="62" rx={46 * scale} ry={34 * scale} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    </svg>
  );
}

// 3. Enhanced Worm Tail with Tapered Design & Subtle Animation
function WormTailSVG({ skinId = 'emerald', skinColor = {} }) {
  const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const primary = skinColor.primary || skin.primary;
  const secondary = skinColor.secondary || skin.secondary;
  const highlight = skinColor.highlight || skin.highlight;
  const gradId = `tailGrad-${skin.id}`;

  return (
    <svg className="worm-tail-svg-container" viewBox="0 0 120 120">
      <defs>
        <radialGradient id={gradId} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="40%" stopColor={primary} />
          <stop offset="75%" stopColor={secondary} />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.7" />
        </radialGradient>
        <linearGradient id={`${gradId}-tip`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={secondary} />
          <stop offset="100%" stopColor={primary} stopOpacity="0.5" />
        </linearGradient>
        <filter id="tailShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="55" cy="80" rx="20" ry="8" fill="rgba(0,0,0,0.12)" filter="url(#tailShadow)" />

      {/* Tail main body - tapered */}
      <path d="M20 55 C22 28, 52 18, 84 38 C102 50, 102 68, 80 78 C48 95, 16 88, 20 55 Z" fill={`url(#${gradId})`} filter="url(#tailShadow)" />

      {/* Belly highlight on tail */}
      <path d="M32 52 Q55 42 78 54" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M36 58 Q55 52 74 58" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />

      {/* Tail tip accent */}
      <ellipse cx="88" cy="56" rx="6" ry="4" fill={`url(#${gradId}-tip)`} />
      <circle cx="90" cy="54" r="1.5" fill="#ffffff" opacity="0.6" />

      {/* Subtle scale pattern */}
      <g stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5">
        <path d="M32 50 Q55 40 78 50" />
        <path d="M34 56 Q55 46 76 56" strokeWidth="1" opacity="0.3" />
        <path d="M36 62 Q55 52 74 62" strokeWidth="1" opacity="0.2" />
      </g>

      {/* Highlight spots */}
      <circle cx="42" cy="46" r="4" fill="#ffffff" opacity="0.22" />
      <circle cx="76" cy="52" r="2.5" fill={highlight} opacity="0.4" />
    </svg>
  );
}

// 4. Premium Juicy Candy Apple with Detailed 3D Look, Sparkles & Physics
function JuicyAppleSVG({ collected = false, bobPhase = 0 }) {
  const bobY = Math.sin(bobPhase) * 3;
  const bobRotate = Math.sin(bobPhase * 0.7) * 1.5;

  return (
    <svg className="apple-svg-container" viewBox="0 0 120 120" style={{ 
      animation: collected ? 'none' : 'appleBreathingBob 3s ease-in-out infinite alternate',
      transform: `translateY(${bobY}px) rotate(${bobRotate}deg)`
    }}>
      <defs>
        <radialGradient id="appleBodyGrad" cx="30%" cy="25%" r="78%">
          <stop offset="0%" stopColor="#fff5f5" />
          <stop offset="10%" stopColor="#ffcccc" />
          <stop offset="30%" stopColor="#ff6b6b" />
          <stop offset="55%" stopColor="#ef4444" />
          <stop offset="75%" stopColor="#dc2626" />
          <stop offset="90%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#6b1010" />
        </radialGradient>
        <radialGradient id="appleSpecular" cx="28%" cy="22%" r="35%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="appleRimLight" cx="70%" cy="70%" r="50%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor="#ff8787" stopOpacity="0.4" />
        </radialGradient>
        <linearGradient id="appleLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="30%" stopColor="#4ade80" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <linearGradient id="appleStemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="50%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <radialGradient id="appleGlowAura" cx="50%" cy="65%" r="55%">
          <stop offset="0%" stopColor="rgba(239,68,68,0.25)" />
          <stop offset="100%" stopColor="rgba(239,68,68,0)" />
        </radialGradient>
        <radialGradient id="appleSubsurface" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffaaaa" stopOpacity="0.15" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="appleGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.5" />
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.3" />
        </filter>
        <filter id="appleSparkle" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="appleInnerShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feOffset dx="0" dy="3" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </defs>

      {/* Ground glow/aura */}
      <ellipse cx="60" cy="95" rx="30" ry="10" fill="url(#appleGlowAura)" />

      {/* Main apple body with layered depth */}
      <path
        d="M60 40 C35 40, 16 58, 16 78 C16 98, 38 106, 60 100 C82 106, 104 98, 104 78 C104 58, 85 40, 60 40 Z"
        fill="url(#appleBodyGrad)"
        filter="url(#appleGlow)"
      />

      {/* Subsurface scattering glow */}
      <path
        d="M60 40 C35 40, 16 58, 16 78 C16 98, 38 106, 60 100 C82 106, 104 98, 104 78 C104 58, 85 40, 60 40 Z"
        fill="url(#appleSubsurface)"
      />

      {/* Primary specular highlight */}
      <ellipse cx="38" cy="52" rx="18" ry="22" fill="url(#appleSpecular)" transform="rotate(-20 38 52)" />

      {/* Secondary specular highlight */}
      <ellipse cx="34" cy="48" rx="7" ry="9" fill="#ffffff" opacity="0.5" transform="rotate(-25 34 48)" />
      <circle cx="28" cy="58" r="2.5" fill="#ffffff" opacity="0.35" />

      {/* Rim light on opposite side */}
      <path
        d="M60 40 C85 40, 104 58, 104 78 C104 98, 82 106, 60 100"
        fill="none" stroke="url(#appleRimLight)" strokeWidth="4" strokeLinecap="round" opacity="0.6"
      />

      {/* Inner shadow for depth */}
      <path
        d="M60 40 C35 40, 16 58, 16 78 C16 98, 38 106, 60 100 C82 106, 104 98, 104 78 C104 58, 85 40, 60 40 Z"
        fill="url(#appleBodyGrad)"
        filter="url(#appleInnerShadow)"
        opacity="0.15"
      />

      {/* Stem */}
      <path d="M60 38 Q64 22 70 14" stroke="url(#appleStemGrad)" strokeWidth="5.5" strokeLinecap="round" fill="none" filter="url(#appleGlow)" />
      <path d="M60 38 Q57 26 55 18" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />

      {/* Leaf with detailed veins */}
      <g transform="translate(72, 14) rotate(12)">
        <path d="M0 14 C6 2, 22 2, 28 12 C32 20, 18 26, 0 18 Z" fill="url(#appleLeafGrad)" stroke="#14532d" strokeWidth="1.8" />
        <path d="M0 14 Q12 8 24 10" stroke="#14532d" strokeWidth="1.4" fill="none" opacity="0.7" />
        <path d="M6 13 Q12 14 18 16" stroke="#bbf7d0" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M8 16 Q13 18 19 19" stroke="#bbf7d0" strokeWidth="0.8" fill="none" opacity="0.4" />
      </g>

      {/* Orbiting sparkle particles */}
      <g className="apple-sparkle-star s1" transform="translate(20, 30)" style={{ animation: 'sparkleOrbit 3.2s ease-in-out infinite' }}>
        <polygon points="7,0 9,5 15,7 9,9 7,14 5,9 0,7 5,5" fill="#fef08a" filter="url(#appleSparkle)" />
      </g>
      <g className="apple-sparkle-star s2" transform="translate(88, 80)" style={{ animation: 'sparkleOrbit 3.8s ease-in-out infinite reverse' }}>
        <polygon points="6,0 8,3 12,5 8,7 6,10 4,7 0,5 4,3" fill="#fde68a" filter="url(#appleSparkle)" />
      </g>
      <g className="apple-sparkle-star s3" transform="translate(92, 32)" style={{ animation: 'sparkleOrbit 4.5s ease-in-out infinite' }}>
        <polygon points="5,0 6,2 9,4 6,6 5,8 4,6 0,4 4,2" fill="#fff7ed" filter="url(#appleSparkle)" opacity="0.9" />
      </g>
      <g className="apple-sparkle-star s4" transform="translate(18, 78)" style={{ animation: 'sparkleOrbit 2.9s ease-in-out infinite reverse' }}>
        <polygon points="4,0 5,2 8,3 5,4 4,6 3,4 0,3 3,2" fill="#fef3c7" filter="url(#appleSparkle)" opacity="0.7" />
      </g>
    </svg>
  );
}

// 5. Premium Cosmic Galaxy Stargate Portal with Multi-Layer Effects
function CosmicPortalSVG({ unlocked = false, pulsePhase = 0 }) {
  const pulseScale = 1 + Math.sin(pulsePhase) * 0.08;
  const ringRotate = pulsePhase * 0.3;

  return (
    <svg className={`portal-svg-container ${unlocked ? 'unlocked' : 'locked'}`} viewBox="0 0 140 140" style={{ transform: unlocked ? `scale(${pulseScale})` : 'scale(1)' }}>
      <defs>
        <radialGradient id="portalVoidGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={unlocked ? '#ffffff' : '#3d1a6b'} />
          <stop offset="15%" stopColor={unlocked ? '#67e8f9' : '#2e1065'} />
          <stop offset="35%" stopColor={unlocked ? '#a78bfa' : '#1e0a3d'} />
          <stop offset="60%" stopColor={unlocked ? '#8b5cf6' : '#0f051a'} />
          <stop offset="100%" stopColor="rgba(2,6,23,0.1)" />
        </radialGradient>
        <radialGradient id="portalCoreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={unlocked ? '#ffffff' : '#4c1d95'} stopOpacity="0.9" />
          <stop offset="40%" stopColor={unlocked ? '#22d3ee' : '#312e81'} stopOpacity="0.6" />
          <stop offset="70%" stopColor={unlocked ? '#c084fc' : '#1e1e3f'} stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="portalRuneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="25%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="75%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="portalRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.1" />
        </linearGradient>
        <filter id="portalGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1.2 0 0 0  0 0 1.5 0 0  0 0 0 2 0" result="brightened" />
          <feMerge>
            <feMergeNode in="brightened" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="portalRingGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="particleGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer ambient glow rings */}
      {unlocked && (
        <g filter="url(#portalGlow)" opacity="0.6">
          <circle cx="70" cy="70" r="62" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="16 8" opacity="0.4" style={{ animation: 'portalRingSpin 20s linear infinite' }} />
          <circle cx="70" cy="70" r="56" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="10 10" opacity="0.35" style={{ animation: 'portalRingSpin 15s linear infinite reverse' }} />
          <circle cx="70" cy="70" r="50" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="6 6" opacity="0.3" style={{ animation: 'portalRingSpin 12s linear infinite' }} />
        </g>
      )}

      {/* Main portal ring - outer frame */}
      <circle 
        cx="70" cy="70" r="60" 
        fill="none" 
        stroke={unlocked ? 'url(#portalRuneGrad)' : '#334155'} 
        strokeWidth={unlocked ? 5 : 4} 
        strokeDasharray={unlocked ? '14 6 4 6' : '8 8'} 
        opacity={unlocked ? 1 : 0.7} 
        filter={unlocked ? 'url(#portalGlow)' : 'none'}
        style={{ animation: unlocked ? 'portalRingSpin 8s linear infinite' : 'none' }}
      />

      {/* Inner ring */}
      <circle cx="70" cy="70" r="54" fill="none" stroke={unlocked ? '#e0f2fe' : '#475569'} strokeWidth="2" opacity={unlocked ? 0.6 : 0.4} />

      {/* Pulsing inner ring */}
      <circle 
        className="portal-pulse-ring" 
        cx="70" cy="70" r="48" 
        fill="url(#portalCoreGrad)" 
        filter={unlocked ? 'url(#portalRingGlow)' : 'none'}
        opacity={unlocked ? 0.8 : 0.3}
      />

      {/* Mystical runes around the ring */}
      <g stroke="#a78bfa" strokeWidth="1.5" fill="none" opacity={unlocked ? 0.7 : 0.3}>
        <circle cx="70" cy="70" r="66" strokeDasharray="4 12" style={{ animation: 'portalRingSpin 30s linear infinite reverse' }} />
      </g>

      {unlocked ? (
        <g className="portal-galaxy-spin" filter="url(#portalGlow)">
          {/* Spiral arms */}
          <path d="M70 70 Q95 35 120 55" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M70 70 Q45 105 20 85" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M70 70 Q105 95 85 120" stroke="#fbbf24" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M70 70 Q35 45 55 20" stroke="#fb7185" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.8" />
          
          {/* Central core */}
          <circle cx="70" cy="70" r="14" fill="#ffffff" opacity="0.95" filter="url(#portalGlow)" />
          <circle cx="70" cy="70" r="9" fill="#22d3ee" filter="url(#portalGlow)" />
          <circle cx="70" cy="70" r="5" fill="#ffffff" opacity="0.9" />
          
          {/* Orbiting particles */}
          <g style={{ animation: 'galaxySpinOrbit 6s linear infinite' }}>
            <circle cx="100" cy="45" r="2.5" fill="#fff" filter="url(#particleGlow)" />
            <circle cx="40" cy="95" r="2" fill="#fff" opacity="0.9" filter="url(#particleGlow)" />
            <circle cx="105" cy="90" r="1.5" fill="#fff" opacity="0.8" filter="url(#particleGlow)" />
            <circle cx="35" cy="45" r="1.8" fill="#fff" opacity="0.85" filter="url(#particleGlow)" />
            <circle cx="112" cy="70" r="1.2" fill="#fbbf24" filter="url(#particleGlow)" />
            <circle cx="28" cy="70" r="1.2" fill="#fb7185" filter="url(#particleGlow)" />
          </g>
          
          {/* Inner particle ring */}
          <g style={{ animation: 'galaxySpinOrbit 4s linear infinite reverse' }}>
            <circle cx="85" cy="50" r="1.5" fill="#22d3ee" filter="url(#particleGlow)" />
            <circle cx="55" cy="90" r="1.2" fill="#a78bfa" filter="url(#particleGlow)" />
            <circle cx="90" cy="90" r="1" fill="#fbbf24" filter="url(#particleGlow)" />
            <circle cx="50" cy="50" r="1" fill="#fb7185" filter="url(#particleGlow)" />
          </g>
        </g>
      ) : (
        <g transform="translate(48, 45)" opacity="0.85" filter="url(#portalGlow)">
          {/* Lock body */}
          <rect x="4" y="16" width="28" height="22" rx="5" fill="#1e1e3f" stroke="#475569" strokeWidth="2" />
          <rect x="8" y="20" width="20" height="14" rx="3" fill="none" stroke="#64748b" strokeWidth="1" opacity="0.5" />
          
          {/* Shackle */}
          <path d="M12 16 V8 C12 3, 26 3, 26 8 V16" stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M12 16 V8 C12 3, 26 3, 26 8 V16" stroke="#cbd5e1" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
          
          {/* Keyhole */}
          <circle cx="18" cy="27" r="3" fill="#020617" />
          <rect x="17" y="29" width="2" height="6" rx="1" fill="#020617" />
          
          {/* Lock particles */}
          <circle cx="18" cy="12" r="1.5" fill="#64748b" opacity="0.6" style={{ animation: 'lockParticleFloat 2s ease-in-out infinite' }} />
          <circle cx="28" cy="18" r="1" fill="#475569" opacity="0.5" style={{ animation: 'lockParticleFloat 2.5s ease-in-out infinite reverse' }} />
        </g>
      )}
    </svg>
  );
}

// 5b. Premium Grass Tile - Must be cleared to complete grass levels
function GrassTileSVG({ pulsePhase = 0 }) {
  const sway = Math.sin(pulsePhase * 0.5) * 3;
  return (
    <svg className="grass-tile-svg-container" viewBox="0 0 120 120" style={{ transform: `translateY(${sway}px)` }}>
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

// 5c. Premium Stone Block - Multi-hit obstacle with cracks
function StoneBlockSVG({ hits = 2, pulsePhase = 0 }) {
  const crack = hits <= 1;
  const glow = hits <= 1 ? 'rgba(251,191,36,0.4)' : 'transparent';
  return (
    <svg className="stone-block-svg-container" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="stoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="50%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
        <linearGradient id="stoneEdge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6b7280" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1f2937" stopOpacity="0" />
        </linearGradient>
        <filter id="stoneShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.7" />
        </filter>
      </defs>
      <rect x="10" y="10" width="100" height="100" rx="14" fill="url(#stoneGrad)" stroke="#4b5563" strokeWidth="3" filter="url(#stoneShadow)" />
      <rect x="14" y="14" width="92" height="92" rx="10" fill="none" stroke={glow} strokeWidth="2" opacity={hits <= 1 ? 0.8 : 0} />
      <rect x="16" y="16" width="88" height="88" rx="8" fill="url(#stoneEdge)" opacity="0.3" />
      {/* Cracks that deepen as hits decrease */}
      {hits <= 1 && (
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
      <text x="60" y="65" text-anchor="middle" fill="#9ca3af" font-family="var(--font-ui)" font-size="13" font-weight="800" opacity={hits === 2 ? 0.6 : 0}>{hits}</text>
    </svg>
  );
}

// 5d. Premium Wooden Crate - Blocks movement, breakable
function CrateTileSVG({ pulsePhase = 0 }) {
  const shake = Math.sin(pulsePhase * 2) * 1;
  return (
    <svg className="crate-tile-svg-container" viewBox="0 0 120 120" style={{ transform: `rotate(${shake}deg)` }}>
      <defs>
        <linearGradient id="crateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a16207" />
          <stop offset="40%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id="crateEdge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d97706" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#451a03" stopOpacity="0" />
        </linearGradient>
        <filter id="crateShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>
      <rect x="8" y="8" width="104" height="104" rx="6" fill="url(#crateGrad)" stroke="#78350f" strokeWidth="3" filter="url(#crateShadow)" />
      <rect x="12" y="12" width="96" height="96" rx="4" fill="none" stroke="url(#crateEdge)" strokeWidth="1.5" opacity="0.5" />
      {/* Crate slats */}
      <g stroke="#451a03" strokeWidth="3" strokeLinecap="round" opacity="0.7">
        <line x1="20" y1="30" x2="100" y2="30" />
        <line x1="20" y1="60" x2="100" y2="60" />
        <line x1="20" y1="90" x2="100" y2="90" />
        <line x1="30" y1="20" x2="30" y2="100" />
        <line x1="60" y1="20" x2="60" y2="100" />
        <line x1="90" y1="20" x2="90" y2="100" />
      </g>
      {/* Cross brace */}
      <path d="M35 35 Q60 60 85 35 M35 85 Q60 60 85 85" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* Nails */}
      <g fill="#78350f">
        <circle cx="22" y="32" r="1.5" />
        <circle cx="98" y="32" r="1.5" />
        <circle cx="22" y="88" r="1.5" />
        <circle cx="98" y="88" r="1.5" />
      </g>
    </svg>
  );
}

// 5e. Premium Ice Tile - Slippery surface that causes sliding
function IceTileSVG({ pulsePhase = 0 }) {
  const shimmer = Math.sin(pulsePhase) * 0.3 + 0.7;
  return (
    <svg className="ice-tile-svg-container" viewBox="0 0 120 120">
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

// 5f. Premium Treasure Tile - Hidden reward with sparkling gem
function TreasureTileSVG({ pulsePhase = 0 }) {
  const sparkle = Math.sin(pulsePhase * 2) > 0;
  return (
    <svg className="treasure-tile-svg-container" viewBox="0 0 120 120">
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
      {/* Gem on top */}
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

// 6. Premium 3D Carved Stone Wall with World-Specific Variants, Moss, Cracks & Runes
function StoneWallSVG({ worldId = 1, variant = 0, seed = 0 }) {
  const themes = {
    1: { // Mossy Meadow - Organic, overgrown stone
      base: ['#2d4a35', '#1e3a26', '#142d1b'],
      moss: ['#4ade80', '#22c55e', '#166534'],
      accent: '#86efac',
      edge: '#bbf7d0',
      rune: '#4ade80',
      glyph: 'leaf',
      decor: 'moss'
    },
    2: { // Stone Ruins - Ancient, weathered sandstone
      base: ['#785c3a', '#5c4528', '#3d2e15'],
      moss: ['#fcd34d', '#d97706', '#92400e'],
      accent: '#fde68a',
      edge: '#fef08a',
      rune: '#f59e0b',
      glyph: 'sun',
      decor: 'cracks'
    },
    3: { // Crystal Caverns - Crystalline, icy stone
      base: ['#1e3a5f', '#0f2440', '#081830'],
      moss: ['#67e8f9', '#0ea5e9', '#0369a1'],
      accent: '#bae6fd',
      edge: '#e0f2fe',
      rune: '#38bdf8',
      glyph: 'crystal',
      decor: 'crystals'
    },
    4: { // Mystic Orchard - Arcane, purple-tinged stone
      base: ['#3d1a5c', '#2a1045', '#1a0830'],
      moss: ['#c084fc', '#a855f7', '#7e22ce'],
      accent: '#e9d5ff',
      edge: '#f5f0ff',
      rune: '#a855f7',
      glyph: 'arcane',
      decor: 'runes'
    },
    5: { // Celestial Sanctuary - Ethereal, star-touched stone
      base: ['#4a1a3d', '#351028', '#22081a'],
      moss: ['#f9a8d4', '#f43f5e', '#be185d'],
      accent: '#fce7f3',
      edge: '#fff0f5',
      rune: '#f472b6',
      glyph: 'star',
      decor: 'stars'
    },
  };
  const t = themes[worldId] || themes[1];
  const rx = [10, 12, 8, 14, 10, 12][variant % 6];
  const gid = `wall-${worldId}-${variant}-${seed % 4}`;
  const decorSeed = (seed * 9301 + 49297) % 233280;
  const decorRand = decorSeed / 233280;
  const crackSeed = ((seed + 1) * 9301 + 49297) % 233280;
  const crackRand = crackSeed / 233280;
  const runeSeed = ((seed + 2) * 9301 + 49297) % 233280;
  const runeRand = runeSeed / 233280;

  return (
    <svg className="wall-svg-container" viewBox="0 0 120 120">
      <defs>
        <linearGradient id={`${gid}-top`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={t.base[0]} stopOpacity="0.95" />
          <stop offset="35%" stopColor={t.base[1]} stopOpacity="0.98" />
          <stop offset="70%" stopColor={t.base[2]} />
          <stop offset="100%" stopColor={t.base[2]} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`${gid}-edge`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={t.edge} stopOpacity="0.4" />
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${gid}-moss`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={t.moss[0]} stopOpacity="0" />
          <stop offset="30%" stopColor={t.moss[1]} stopOpacity="0.3" />
          <stop offset="60%" stopColor={t.moss[2]} stopOpacity="0.6" />
          <stop offset="100%" stopColor={t.moss[2]} stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id={`${gid}-crystal`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={t.accent} stopOpacity="0.4" />
          <stop offset="50%" stopColor={t.moss[1]} stopOpacity="0.2" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id={`${gid}-shadow`} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.7" />
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
        </filter>
        <filter id={`${gid}-innerGlow`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main block with depth shadow */}
      <rect x="6" y="6" width="108" height="108" rx={rx} fill={`url(#${gid}-top)`} stroke="#050810" strokeWidth="3.5" filter={`url(#${gid}-shadow)`} />
      
      {/* Inner bevel highlight */}
      <rect x="12" y="12" width="96" height="96" rx={Math.max(6, rx - 4)} fill="none" stroke={t.edge} strokeWidth="1.5" opacity="0.25" />
      
      {/* Inner shadow bevel */}
      <rect x="10" y="10" width="100" height="100" rx={Math.max(5, rx - 3)} fill="none" stroke="#020617" strokeWidth="1.5" opacity="0.2" />

      {/* Horizontal stratification lines */}
      <g stroke="#020617" strokeWidth="1.2" opacity="0.18">
        <path d={`M14 ${26 + (variant % 3) * 2} H106`} />
        <path d={`M14 ${48 + (variant % 4) * 3} H106`} />
        <path d={`M14 ${72 + (variant % 3) * 2} H106`} />
        <path d={`M14 ${90 + (variant % 2) * 3} H106`} />
      </g>

      {/* Vertical stratification lines */}
      <g stroke="#020617" strokeWidth="1" opacity="0.12">
        <path d={`M${32 + (variant % 4) * 3} 14 V${92 + (variant % 3) * 2}`} />
        <path d={`M${58 + (variant % 5) * 2} 14 V${92 + (variant % 4) * 2}`} />
        <path d={`M${84 + (variant % 3) * 2} 14 V${92 + (variant % 2) * 3}`} />
      </g>

      {/* Inner highlight overlay */}
      <rect x="14" y="14" width="92" height="92" rx={Math.max(4, rx - 5)} fill={`url(#${gid}-edge)`} opacity="0.25" />

      {/* World-specific decorative elements */}
      <g opacity="0.9" filter="url(#${gid}-innerGlow)">
        {/* Glyph/Symbol */}
        {t.glyph === 'leaf' && (
          <path d="M60 28 C78 38, 80 65, 60 92 C40 65, 42 38, 60 28 Z" stroke={t.rune} strokeWidth="2.5" fill="rgba(255,255,255,0.06)" />
        )}
        {t.glyph === 'sun' && (
          <g stroke={t.rune} strokeWidth="2" fill="rgba(255,255,255,0.06)">
            <circle cx="60" cy="60" r="14" />
            <path d="M60 32 V40 M60 80 V88 M32 60 H40 M80 60 H88 M40 40 L47 47 M73 73 L80 80 M73 47 L80 40 M47 73 L40 80" />
          </g>
        )}
        {t.glyph === 'crystal' && (
          <g>
            <path d="M60 24 L92 60 L60 96 L28 60 Z" stroke={t.rune} strokeWidth="2.5" fill="rgba(255,255,255,0.06)" />
            <line x1="60" y1="24" x2="60" y2="96" stroke={t.rune} strokeWidth="1.6" opacity="0.5" />
            <line x1="28" y1="60" x2="92" y2="60" stroke={t.rune} strokeWidth="1.6" opacity="0.5" />
            <line x1="40" y1="42" x2="80" y2="78" stroke={t.rune} strokeWidth="1" opacity="0.3" />
            <line x1="80" y1="42" x2="40" y2="78" stroke={t.rune} strokeWidth="1" opacity="0.3" />
          </g>
        )}
        {t.glyph === 'arcane' && (
          <g stroke={t.rune} strokeWidth="2" fill="rgba(255,255,255,0.05)">
            <circle cx="60" cy="60" r="18" />
            <path d="M60 34 L85 78 H35 Z" />
            <circle cx="60" cy="60" r="5" fill={t.rune} />
            <circle cx="60" cy="60" r="10" strokeDasharray="3 3" fill="none" />
          </g>
        )}
        {t.glyph === 'star' && (
          <g>
            <path d="M60 24 L68 48 L94 52 L75 70 L79 96 L60 82 L41 96 L45 70 L26 52 L52 48 Z" stroke={t.rune} strokeWidth="2.2" fill="rgba(255,255,255,0.08)" />
            <circle cx="60" cy="60" r="5" fill={t.edge} opacity="0.9" />
            <circle cx="60" cy="60" r="12" stroke={t.rune} strokeWidth="1" strokeDasharray="2 4" fill="none" opacity="0.4" />
          </g>
        )}

        {/* Central core */}
        <circle cx="60" cy="60" r="6.5" fill={t.rune} opacity="0.6" />

        {/* Decor based on world type */}
        {t.decor === 'moss' && (
          <g fill={t.moss[1]} opacity="0.7">
            {decorRand > 0.3 && <circle cx="20" cy="20" r="4" />}
            {decorRand > 0.5 && <ellipse cx="100" cy="22" rx="5" ry="3" />}
            {decorRand > 0.65 && <circle cx="18" cy="98" r="3.5" />}
            {decorRand > 0.8 && <ellipse cx="102" cy="95" rx="4" ry="5" />}
            {decorRand > 0.45 && <circle cx="42" cy="32" r="2.5" />}
            {decorRand > 0.75 && <circle cx="78" cy="88" r="3" />}
            {/* Moss patches along edges */}
            <ellipse cx="60" cy="16" rx="12" ry="4" fill="url(#${gid}-moss)" opacity="0.5" />
            <ellipse cx="60" cy="104" rx="10" ry="3" fill="url(#${gid}-moss)" opacity="0.4" />
          </g>
        )}

        {t.decor === 'cracks' && (
          <g stroke="#1a1508" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.5">
            {crackRand > 0.4 && <path d="M20 20 Q40 30 50 20 Q60 15 80 25" />}
            {crackRand > 0.6 && <path d="M25 95 Q45 80 65 90" />}
            {crackRand > 0.3 && <path d="M20 30 V60 Q50 65 80 60" />}
            {crackRand > 0.7 && <path d="M10 50 Q30 55 50 50 Q70 45 110 55" />}
            {crackRand > 0.55 && <path d="M50 10 Q55 35 50 60" />}
          </g>
        )}

        {t.decor === 'crystals' && (
          <g fill={t.moss[1]} opacity="0.6">
            {decorRand > 0.35 && <path d="M60 20 L68 35 L52 35 Z" />}
            {decorRand > 0.55 && <path d="M25 60 L38 52 L38 68 Z" />}
            {decorRand > 0.7 && <path d="M95 60 L82 52 L82 68 Z" />}
            {decorRand > 0.45 && <path d="M60 100 L68 85 L52 85 Z" />}
            {decorRand > 0.6 && <circle cx="35" cy="35" r="2" />}
            {decorRand > 0.8 && <circle cx="85" cy="85" r="2.5" />}
            {/* Crystal shimmer line */}
            <line x1="60" y1="10" x2="60" y2="30" stroke={t.accent} strokeWidth="1.5" opacity="0.5" />
            <line x1="60" y1="90" x2="60" y2="110" stroke={t.accent} strokeWidth="1.5" opacity="0.5" />
          </g>
        )}

        {t.decor === 'runes' && (
          <g stroke={t.rune} strokeWidth="1.5" fill="none" opacity="0.5">
            {runeRand > 0.4 && <circle cx="25" cy="25" r="8" />}
            {runeRand > 0.6 && <path d="M25 17 V33 M17 25 H33" />}
            {runeRand > 0.5 && <path d="M95 95 L80 80 M95 80 L80 95" />}
            {runeRand > 0.7 && <path d="M35 85 L45 75 L55 85 M40 80 L50 80" />}
            {runeRand > 0.3 && <circle cx="60" cy="60" r="15" strokeDasharray="4 4" />}
          </g>
        )}

        {t.decor === 'stars' && (
          <g fill={t.accent} opacity="0.7">
            {decorRand > 0.25 && <circle cx="18" cy="18" r="1.8" />}
            {decorRand > 0.4 && <circle cx="102" cy="22" r="1.2" />}
            {decorRand > 0.55 && <circle cx="22" cy="102" r="1.5" />}
            {decorRand > 0.7 && <circle cx="98" cy="98" r="1" />}
            {decorRand > 0.35 && <circle cx="40" cy="35" r="1.3" />}
            {decorRand > 0.65 && <circle cx="80" cy="85" r="1.6" />}
            {decorRand > 0.45 && <circle cx="60" cy="25" r="2" />}
            {decorRand > 0.75 && <circle cx="60" cy="95" r="1.8" />}
            {/* Ethereal shimmer */}
            <ellipse cx="60" cy="60" rx="25" ry="15" fill="none" stroke={t.rune} strokeWidth="0.8" strokeDasharray="3 6" opacity="0.3" />
          </g>
        )}
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
  const [levelTransition, setLevelTransition] = useState(null); // { from, to, phase: 'out'|'in' }
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
  const [wormTrailParticles, setWormTrailParticles] = useState([]);

  // Power-up inventory & selection
  const [powerUps, setPowerUps] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('powerUps') || '{}');
      return { bomb: 0, lightning: 0, rainbow: 0, hammer: 0, extraMoves: 0, magicKey: 0, ...saved };
    } catch { return { bomb: 0, lightning: 0, rainbow: 0, hammer: 0, extraMoves: 0, magicKey: 0 }; }
  });
  const [selectedPowerUp, setSelectedPowerUp] = useState(null);

  // Claimed achievements (coin rewards claimed once)
  const [claimedAchievements, setClaimedAchievements] = useState(() => {
    try { return JSON.parse(localStorage.getItem('claimedAchievements') || '[]'); } catch { return []; }
  });

  // Level objective modal
  const [objectiveModal, setObjectiveModal] = useState(false);

  // Player profile
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || 'Gardener');
  const [playerAvatar, setPlayerAvatar] = useState(() => localStorage.getItem('playerAvatar') || 'A');
  const [profileEditing, setProfileEditing] = useState(false);

  // Daily rewards calendar & streak
  const [dailyStreak, setDailyStreak] = useState(() => Number(localStorage.getItem('dailyStreak') || '0'));
  const [dailyCalendar, setDailyCalendar] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dailyCalendar') || '[]'); } catch { return []; }
  });

  // Settings
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('settings') || '{}'); } catch { return {}; }
  });
  const musicVolume = settings.musicVolume !== undefined ? settings.musicVolume : 0.5;
  const sfxVolume = settings.sfxVolume !== undefined ? settings.sfxVolume : 0.7;
  const [settingsModal, setSettingsModal] = useState(false);

  // Total playing time
  const [gameTime, setGameTime] = useState(() => Number(localStorage.getItem('gameTime') || '0'));


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
  const [animTime, setAnimTime] = useState(0);

  // Current World
  const currentWorld = WORLDS.find(w => levelId >= w.range[0] && levelId <= w.range[1]) || WORLDS[0];
  const currentSkin = SKINS.find(s => s.id === wormSkin) || SKINS[0];

  // Animation time for worm idle effects
  useEffect(() => {
    if (reducedMotion) return;
    let start = performance.now();
    const tick = () => {
      setAnimTime(performance.now() - start);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [reducedMotion]);

  // Track total playing time
  useEffect(() => {
    const id = setInterval(() => {
      if (game.status === 'playing') setGameTime(t => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [game.status]);

  // Apply audio volume preferences to the Web Audio context
  useEffect(() => {
    setSfxVolume(sfxVolume);
    setMusicVolume(musicVolume);
    if (music) startBgm(true);
  }, [musicVolume, sfxVolume, music]);

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
    
    // Show objective preview for new levels, go straight for replays
    if (id !== levelId) {
      setLevelId(id);
      setLevelPreview(targetLvl);
      playSound('click', sound);
      return;
    }

    // Replay / restart current level
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

      // Create worm trail particles
      const oldHead = old.worm[0];
      const newHead = next.worm[0];
      const trailParticles = Array.from({ length: 3 }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        x: (oldHead[0] / level.size) * 100 + (100 / (level.size * 2)) + (Math.random() - 0.5) * 8,
        y: (oldHead[1] / level.size) * 100 + (Math.random() - 0.5) * 8,
        size: 3 + Math.random() * 4,
        color: currentSkin.primary || '#34d399',
        opacity: 0.6,
        life: 1.0,
      }));
      setWormTrailParticles(prev => [...prev, ...trailParticles].slice(-30));

      // Fade out trail particles
      setTimeout(() => {
        setWormTrailParticles(prev => prev.map(p => ({ ...p, life: 0 })));
      }, 50);
      setTimeout(() => {
        setWormTrailParticles(prev => prev.filter(p => p.life > 0));
      }, 600);

      // Apple collection audio & popup
      const didEat = next.apples.length < old.apples.length;
      if (didEat) {
        playSound('eat', sound);
        setWormExpression('eating');
        setBoardFx(fx => ({ ...fx, eat: true }));
        setTimeout(() => setBoardFx(fx => ({ ...fx, eat: false })), 420);
        // Subtle screen shake on eat
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

        // Portal entry particle burst
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

        // Particle burst on wall/body collision
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

  // Apply a selected power-up to a board position
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
    if ((game.grass || []).some(g => same(g, p))) c += ' grass-tile';
    if ((game.stoneBlocks || []).some(s => same(s.pos, p))) c += ' stone-block-tile';
    if ((game.crates || []).some(c => same(c, p))) c += ' crate-tile';
    if ((game.ice || []).some(i => same(i, p))) c += ' ice-tile';
    if ((game.treasure || []).some(t => same(t, p))) c += ' treasure-tile';
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
      { id: 'first-step', title: 'First Bite', desc: 'Complete any level', icon: Apple, coinReward: 10, unlocked: completedCount >= 1 },
      { id: 'garden-10', title: 'Garden Explorer', desc: 'Complete 10 levels', icon: Compass, coinReward: 25, unlocked: completedCount >= 10 },
      { id: 'garden-25', title: 'Trailblazer', desc: 'Complete 25 levels', icon: MapPin, coinReward: 50, unlocked: completedCount >= 25 },
      { id: 'garden-50', title: 'Realm Master', desc: 'Complete all 50 levels', icon: CrownIcon, coinReward: 100, unlocked: completedCount >= 50 },
      { id: 'perfect-5', title: 'Precision', desc: 'Earn 3 stars on 5 levels', icon: Target, coinReward: 30, unlocked: perfectLevels >= 5 },
      { id: 'perfect-20', title: 'Perfectionist', desc: 'Earn 3 stars on 20 levels', icon: GemIcon, coinReward: 75, unlocked: perfectLevels >= 20 },
      { id: 'world-clear', title: 'World Conqueror', desc: 'Clear every level in any realm', icon: TrophyIcon, coinReward: 60, unlocked: worldClears >= 1 },
      { id: 'collector', title: 'Skin Collector', desc: 'Own 3 or more worm skins', icon: Palette, coinReward: 40, unlocked: ownedSkins.length >= 3 },
      { id: 'wealthy', title: 'Coin Hoarder', desc: 'Hold 300+ coins', icon: Coins, coinReward: 50, unlocked: coins >= 300 },
      { id: 'star-50', title: 'Stargazer', desc: 'Earn 50 total stars', icon: Star, coinReward: 80, unlocked: totalStarsEarned >= 50 },
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

  // Ambient particles for background - enhanced multi-layer system
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

  // World-specific particles
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
  const boardScale = level.size >= 11 ? 0.9 : level.size >= 9 ? 0.96 : 1;

  return (
    <div
      className={`game-master-container ${screenShake ? 'screen-shake' : ''} ${reducedMotion ? 'reduced-motion' : ''} ${highContrast ? 'high-contrast' : ''} ${colorblindMode ? 'colorblind' : ''} ${levelIntro ? 'level-intro' : ''} ${boardFx.warp ? 'fx-warp' : ''} ${boardFx.impact ? 'fx-impact' : ''} ${boardFx.eat ? 'fx-eat' : ''} ${levelTransition?.phase === 'out' ? 'level-transition-out' : ''} ${levelTransition?.phase === 'in' ? 'level-transition-in' : ''}`}
      data-world={currentWorld.id}
      data-budget={moveBudgetState}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >


      {/* AMBIENT LAYERS - Enhanced Multi-Layer Parallax System */}
      <div className="ambient-layers" aria-hidden="true">
        {/* Far Layer - Distant Stars/Motes */}
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

        {/* Mid Layer - Floating Organic Particles */}
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

        {/* Near Layer - Large Soft Glow Orbs */}
        <div className="ambient-layer ambient-near-layer" style={{ '--orb-color-1': ambientNearOrbs[0].color, '--orb-color-2': ambientNearOrbs[1].color, '--orb-color-3': ambientNearOrbs[2].color }}>
          {ambientNearOrbs.slice(0, 3).map((orb, i) => (
            <div key={i} className="ambient-near-orb" style={{ ...orb }} />
          ))}
        </div>

        {/* Grid Pattern Overlay */}
        <div className="ambient-layer ambient-grid-overlay" />

        {/* World-Specific Atmospheric Effects */}
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
              {[1, 2, 3].map(i => (
                <Star
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
            <div className="coin-badge-pill compact" title="Coins"><Coins size={14} /><span>{coins}</span></div>
            <button className={`hud-action-icon-btn ${sound ? 'active' : ''}`} onClick={() => setSound(!sound)} title="Sound">{sound ? <Volume2 size={15} /> : <VolumeX size={15} />}</button>
            <button className="hud-action-icon-btn" onClick={() => setShopModal(true)} title="Shop"><ShoppingBag size={15} /></button>
            <button className="hud-action-icon-btn" onClick={() => setAchievementsModal(true)} title="Badges"><Award size={15} /></button>
            <button className="hud-action-icon-btn" onClick={() => setSettingsModal(true)} title="Settings"><Settings size={15} /></button>
            <button className="hud-action-icon-btn hud-user-avatar" onClick={() => setAuthModal(user ? 'profile' : 'login')} title={user ? user.name : 'Sign in'}>{user ? user.name[0].toUpperCase() : <UserIcon size={14} />}</button>
          </div>
        </div>
        <div className="hud-progress-strip" aria-hidden="true">
          <div className="hud-progress-track">
            <span className="hud-progress-fill" style={{ width: `${moveProgress.pct}%` }} />
            <span className="hud-progress-par" style={{ left: `${moveProgress.parPct}%` }} />
          </div>
          <span className="hud-progress-meta">Par {level.parMoves} · <Star size={14} style={{ verticalAlign: 'middle', marginLeft: 2, fill: '#fbbf24' }} /> {totalStarsEarned}/150</span>
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
                const levelVariant = ` level-variant-${((level.id + r + c2) % 6)}`;

                return (
                  <div key={i} className={c + levelVariant + (showDecor ? ' has-decor' : '')} onClick={() => {
                    if (selectedPowerUp) applyPowerUp(selectedPowerUp, p);
                  }}>
                    {showDecor && <span className={`tile-decor decor-${currentWorld.id} d-${Math.floor(decor * 4)}`} aria-hidden="true" />}
                    {boardFx?.trail?.some(t => same(t, p)) && <span className="tile-trail-fx" aria-hidden="true" />}
                    {isAppleCell ? (
                      <JuicyAppleSVG collected={justCollected} bobPhase={(animTime * 0.001 + p[0] * 0.5 + p[1] * 0.3) % (Math.PI * 2)} />
                    ) : isPortalCell ? (
                      <CosmicPortalSVG unlocked={game.apples.length === 0} pulsePhase={animTime * 0.001} />
                    ) : isKeyCell ? (
                      <span className="mechanic-icon key-icon" title="Key"><KeyRound size={18} /></span>
                    ) : isDoorCell ? (
                      <span className="mechanic-icon door-icon" title="Locked Gate"><LockKeyhole size={18} /></span>
                    ) : isHazardCell ? (
                      <span className="mechanic-icon hazard-icon" title="Hazard"><Flame size={18} /></span>
                    ) : isBlockCell ? (
                      <span className="mechanic-icon block-icon" title="Block"><ShieldCheck size={18} /></span>
                    ) : isWallCell ? (
                      <StoneWallSVG worldId={currentWorld.id} variant={(level.id + r * 3 + c2) % 4} seed={level.id + r * 7 + c2 * 3} />
                    ) : isGrassCell ? (
                      <GrassTileSVG pulsePhase={animTime * 0.001} />
                    ) : isStoneCell ? (
                      <StoneBlockSVG hits={(game.stoneBlocks || []).find(s => same(s.pos, p))?.hits || 2} pulsePhase={animTime * 0.001} />
                    ) : isCrateCell ? (
                      <CrateTileSVG pulsePhase={animTime * 0.001} />
                    ) : isIceCell ? (
                      <IceTileSVG pulsePhase={animTime * 0.001} />
                    ) : isTreasureCell ? (
                      <TreasureTileSVG pulsePhase={animTime * 0.001} />
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
                        <WormHeadSVG facing={facing} skinId={wormSkin} expression={wormExpression} skinColor={currentSkin} time={animTime} />
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
          {Object.entries(powerUps).map(([type, count]) => (
            <button
              key={type}
              className={`dock-action-btn ${selectedPowerUp === type ? 'active' : ''} powerup-btn`}
              onClick={() => setSelectedPowerUp(selectedPowerUp === type ? null : type)}
              title={type}
              disabled={count <= 0 && selectedPowerUp !== type}
            >
              {type === 'bomb' && <Zap size={16} />}
              {type === 'lightning' && <Zap size={16} />}
              {type === 'rainbow' && <Gem size={16} />}
              {type === 'hammer' && <ShieldCheck size={16} />}
              {type === 'extraMoves' && <Plus size={16} />}
              {type === 'magicKey' && <KeyRound size={16} />}
              <span>{count > 0 ? count : selectedPowerUp === type ? 'SELECT' : '—'}</span>
            </button>
          ))}
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
                <strong style={{ color: '#fbbf24' }}>
                  {(levelProgress[levelId]?.bestStars || earnedStars) > 0
                    ? [...Array(levelProgress[levelId]?.bestStars || earnedStars)].map((_, i) => (
                        <Star key={i} size={16} fill="#fbbf24" style={{ marginRight: 2 }} />
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
                ? <span><GemIcon size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Flawless precision! You matched the master Par moves target.</span>
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
                  <Zap size={14} /> +5 Moves (<Coins size={14} style={{ verticalAlign: 'middle' }} /> 30)
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
                <span><Compass size={16} /> All Realms</span>
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
                    <span><WorldIcon name={w.icon} size={16} /> {w.name}</span>
                    <span className="world-progress-badge">{worldCompleted}/10</span>
                  </button>
                );
              })}
            </div>

            {/* World Preview Thumbnail */}
            {selectedWorldTab > 0 && (() => {
              const previewWorld = WORLDS.find(w => w.id === selectedWorldTab);
              if (!previewWorld) return null;
              const worldLevels = LEVELS.filter(l => l.worldId === selectedWorldTab);
              const completedInWorld = completed.filter(id => id >= previewWorld.range[0] && id <= previewWorld.range[1]).length;
              return (
                <div className="world-preview-thumbnail" style={{ '--world-preview-color': previewWorld.color }}>
                  <div className="world-preview-header">
                    <WorldIcon name={previewWorld.icon} size={32} className="world-preview-icon" />
                    <div className="world-preview-info">
                      <h3>{previewWorld.name}</h3>
                      <p>{worldLevels[0]?.objective || previewWorld.objective}</p>
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
                      <span className="world-preview-stat-value"><Star size={14} style={{ verticalAlign: 'middle', fill: '#fbbf24', marginRight: 2 }} /> {completedInWorld * 3}</span>
                      <span className="world-preview-stat-label">Max Stars</span>
                    </div>
                  </div>
                </div>
              );
            })()}

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
                        <WormHeadSVG facing="right" skinId={wormSkin} skinColor={currentSkin} time={animTime} />
                      </div>
                    )}
                    <span className="level-node-number">
                      {unlocked ? String(l.id).padStart(2, '0') : <LockKeyhole size={18} />}
                    </span>
                    <span className="level-node-stars-label">
                      {best > 0 ? (
                        <>
                          {[...Array(3)].map((_, i) => (
                            <Star
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
                            <Star key={i} size={12} fill="transparent" stroke="#64748b" strokeWidth={2} />
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
                <strong><Apple size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {levelPreview.apples.length}</strong>
              </div>
              <div className="level-preview-stat">
                <small>PAR MOVES (<Star size={12} fill="#fbbf24" style={{ verticalAlign: 'middle' }} /><Star size={12} fill="#fbbf24" style={{ verticalAlign: 'middle' }} /><Star size={12} fill="#fbbf24" style={{ verticalAlign: 'middle' }} />)</small>
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
                        <div className="podium-stars-count"><Star size={14} fill="#fbbf24" style={{ verticalAlign: 'middle', marginRight: 4 }} /> {entry.totalStars || 0}</div>
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
                      <span className="leaderboard-stars"><Star size={14} fill="#fbbf24" style={{ verticalAlign: 'middle', marginRight: 4 }} /> {entry.totalStars || 0}</span>
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
                    <span style={{ color: '#fbbf24', marginLeft: 16, fontWeight: 800 }}><Star size={14} fill="#fbbf24" style={{ verticalAlign: 'middle', marginRight: 4 }} /> {myRank.totalStars} Stars</span>
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
                    <span className="key-badge"><ArrowUp size={14} /></span>
                    <span className="key-badge"><ArrowDown size={14} /></span>
                    <span className="key-badge"><ArrowLeft size={14} /></span>
                    <span className="key-badge"><ArrowRight size={14} /></span>
                    <span className="key-badge">WASD</span>
                  </div>
                </div>
              </div>

              <div className="how-to-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <div className="step-title"><Apple size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Eat Apples</div>
                  <div className="step-desc">Collect all apples in the garden. Each apple makes your worm grow longer!</div>
                </div>
              </div>

              <div className="how-to-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <div className="step-title"><Compass size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Enter the Portal</div>
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

            {/* DAILY REWARDS CALENDAR */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: '#a78bfa', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em' }}>Daily Streak Calendar</span>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>{dailyStreak} day{dailyStreak !== 1 ? 's' : ''} streak</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{day}</div>
                ))}
                {Array.from({ length: 30 }).map((_, d) => {
                  const claimed = dailyCalendar.includes(d + 1);
                  const today = d + 1 === new Date().getDate();
                  return (
                    <div
                      key={d}
                      style={{
                        width: 26, height: 26, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        background: claimed ? '#34d399' : (today ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.04)'),
                        color: claimed ? '#ffffff' : (today ? '#a78bfa' : '#94a3b8'),
                        border: today ? '1px solid #a78bfa' : 'none',
                        cursor: claimed || today ? 'pointer' : 'default',
                        opacity: claimed ? 1 : 0.6
                      }}
                      title={`Day ${d + 1}${claimed ? ' — claimed' : ''}`}
                    >
                      {d + 1}
                    </div>
                  );
                })}
              </div>
              <p style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>Green = claimed · Purple = today</p>
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
                        <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 800 }}><Coins size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} /> +{a.coinReward}</span>
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
                          if (token) {
                            fetch(`${API_URL}/player/wallet/spend`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ amount: -a.coinReward, item: `ACHIEVEMENT_${a.id}` })
                            }).catch(() => {});
                          }
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
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={() => setReducedMotion(!reducedMotion)}
                  className="settings-checkbox"
                />
                <div>
                  <strong>Reduced Motion</strong>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Disable animations and screen shake</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={() => setHighContrast(!highContrast)}
                  className="settings-checkbox"
                />
                <div>
                  <strong>High Contrast</strong>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Enhanced visibility for all elements</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="checkbox"
                  checked={colorblindMode}
                  onChange={() => setColorblindMode(!colorblindMode)}
                  className="settings-checkbox"
                />
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
                {!profileEditing && (
                  <button className="modal-secondary-btn" style={{ width: 'auto', padding: '8px 16px', marginRight: 8 }} onClick={() => setProfileEditing(true)}>
                    <Edit2 size={14} /> Edit Profile
                  </button>
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
                    <LogOut size={16} /> Sign Out
                  </button>
                )}
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