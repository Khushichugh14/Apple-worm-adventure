import React from 'react';
import {
  Apple as AppleIcon, Star as StarIcon, Coins as CoinsIcon, Volume2 as Volume2Icon, VolumeX as VolumeXIcon,
  ShoppingBag as ShoppingBagIcon, Award as AwardIcon, Settings as SettingsIcon, User as UserIcon,
  Sparkles as SparklesIcon, Compass as CompassIcon
} from 'lucide-react';

export default function HUD({
  levelId,
  currentWorld,
  game,
  level,
  bonusMoves,
  liveStars,
  coins,
  sound,
  user,
  moveProgress,
  totalStarsEarned,
  notice,
  solverHint,
  onOpenMap,
  onToggleSound,
  onOpenShop,
  onOpenAchievements,
  onOpenSettings,
  onOpenAuth,
  onDismissNotice,
  onDismissHint,
}) {
  return (
    <>
      <header className="game-arcade-hud redesigned-hud">
        <div className="hud-top-row">
          <button className="hud-level-chip" onClick={onOpenMap} title="Levels & realms">
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
            <button className={`hud-action-icon-btn ${sound ? 'active' : ''}`} onClick={onToggleSound} title="Sound">{sound ? <Volume2Icon size={15} /> : <VolumeXIcon size={15} />}</button>
            <button className="hud-action-icon-btn" onClick={onOpenShop} title="Shop"><ShoppingBagIcon size={15} /></button>
            <button className="hud-action-icon-btn" onClick={onOpenAchievements} title="Badges"><AwardIcon size={15} /></button>
            <button className="hud-action-icon-btn" onClick={onOpenSettings} title="Settings"><SettingsIcon size={15} /></button>
            <button className="hud-action-icon-btn hud-user-avatar" onClick={onOpenAuth} title={user ? user.name : 'Sign in'}>{user ? user.name[0].toUpperCase() : <UserIcon size={14} />}</button>
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

      {game.apples.length === 0 ? (
        <div className="notice-banner-pill notice-success" key="portal-open">
          <SparklesIcon size={16} /> <span>All apples collected! The portal is open.</span>
        </div>
      ) : notice && game.status === 'playing' ? (
        <div className="notice-banner-pill">
          <span>{notice}</span>
          <button className="toast-dismiss" onClick={onDismissNotice}>×</button>
        </div>
      ) : null}

      {solverHint && (
        <div className="solver-hint-pill">
          <CompassIcon size={16} style={{ color: '#38bdf8' }} />
          <span>Suggested: Slither <b>{solverHint.nextDirection.toUpperCase()}</b> ({solverHint.distance} steps to {solverHint.targetLabel})</span>
          <button className="toast-dismiss" onClick={onDismissHint}>×</button>
        </div>
      )}
    </>
  );
}
