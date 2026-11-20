import React from 'react';
import { same } from '../../game/engine';
import {
  PremiumAppleSVG, PremiumPortalSVG, PremiumStoneWallSVG,
  PremiumGrassTileSVG, PremiumStoneBlockSVG, PremiumCrateTileSVG,
  PremiumIceTileSVG, PremiumTreasureTileSVG,
  WorldBackgroundSVG, WorldTreeSVG, WorldBushSVG, WorldRockSVG, WorldMushroomSVG,
  WorldCrystalSVG, WorldIceCrystalSVG, WorldPlanetSVG,
  WorldFireflySVG,
} from '../GameElements';
import { KeyRound as KeyRoundIcon, LockKeyhole as LockKeyholeIcon, Flame as FlameIcon, ShieldCheck as ShieldCheckIcon, ArrowUp as ArrowUpIcon, ArrowDown as ArrowDownIcon, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, Sparkles as SparklesIcon, Gem as GemIcon, Zap as ZapIcon } from 'lucide-react';
import WormRenderer from './WormRenderer';

const DECORATION_COMPONENTS = {
  1: [WorldTreeSVG, WorldBushSVG, WorldMushroomSVG, WorldRockSVG, WorldBushSVG],
  2: [WorldIceCrystalSVG, WorldCrystalSVG, WorldRockSVG, WorldIceCrystalSVG],
  3: [WorldRockSVG, WorldTreeSVG, WorldBushSVG, WorldPlanetSVG, WorldRockSVG],
  4: [WorldMushroomSVG, WorldTreeSVG, WorldCrystalSVG, WorldBushSVG, WorldMushroomSVG],
  5: [WorldRockSVG, WorldPlanetSVG, WorldCrystalSVG, WorldRockSVG, WorldPlanetSVG],
};

const DIRECTION_ICONS = {
  up: ArrowUpIcon,
  down: ArrowDownIcon,
  left: ArrowLeftIcon,
  right: ArrowRightIcon,
};

const getDirectionIcon = (dir) => DIRECTION_ICONS[dir] || ArrowRightIcon;

const dirFrom = (a, b) => {
  if (b[1] < a[1]) return 'up';
  if (b[1] > a[1]) return 'down';
  if (b[0] < a[0]) return 'left';
  if (b[0] > a[0]) return 'right';
  return null;
};

// Enhanced tile depth calculation for 3D effect
const getTileDepth = (r, c, levelSize) => {
  const center = (levelSize - 1) / 2;
  const distX = Math.abs(c - center) / (levelSize / 2);
  const distY = Math.abs(r - center) / (levelSize / 2);
  return Math.max(distX, distY);
};

// Temporary uniform grid coloring for debugging - applies same green tint to ALL cells
const getTileStyle = (r, c, level, game, worldId, isWallCell, isPortalCell, isAppleCell, isEmpty, animTime) => {
  return {
    '--tile-bg': '#1a3d1a',
    '--tile-border': 'rgba(34, 197, 94, 0.4)',
  };
};

export default function Board({
  level,
  game,
  board,
  currentWorld,
  animTime,
  hint,
  solverHint,
  showHintPath,
  boardFx,
  renderWorm,
  wormSkin,
  wormExpression,
  currentSkin,
  facing,
  selectedPowerUp,
  onApplyPowerUp,
  floatingScores,
  growing = false,
}) {
  const worldId = currentWorld?.id || 1;
  const DecorIcons = DECORATION_COMPONENTS[worldId] || [WorldTreeSVG];

  const isApple = p => game.apples.some(a => same(a, p));
  const isHead = p => game.worm.length && same(game.worm[0], p);

  const getFloorStyle = (r, c) => {
    const checker = (r + c) % 2 === 0;
    return checker ? 'floor-tile-a' : 'floor-tile-b';
  };

  return (
    <main className="game-play-stage">
      <div className="garden-board-wrapper">
        {floatingScores.map(s => {
          const pctX = (s.x / level.size) * 100 + (100 / (level.size * 2));
          const pctY = (s.y / level.size) * 100;
          return (
            <div key={s.id} className="floating-points-toast" style={{ left: `${pctX}%`, top: `${pctY}%` }}>
              {s.text}
            </div>
          );
        })}

        <div className="garden-floating-island" data-world={worldId}>
          {/* World Background Layer - Rich environment behind the grid */}
          <div className="world-background-layer">
            <WorldBackgroundSVG worldId={worldId} />
            {/* Ambient firefly particles */}
            <div className="world-firefly-layer" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <WorldFireflySVG key={i} worldId={worldId} delay={i * 0.3} />
              ))}
            </div>
          </div>

          <div className="garden-matrix-grid" style={{ '--grid-size': level.size }}>
            {board.map((p, i) => {
              const r = Math.floor(i / level.size);
              const c2 = i % level.size;
              const decorSeed = (i * 9301 + 49297) % 233280;
              const decor = decorSeed / 233280;
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
              const isIceCell = (game.ice || []).some(ice => same(ice, p));
              const isTreasureCell = (game.treasure || []).some(t => same(t, p));
              const isWormCell = game.worm.some(w => same(w, p));
              const isEmpty = !isWallCell && !isPortalCell && !isAppleCell && !isKeyCell && !isDoorCell && !isHazardCell && !isBlockCell && !isGrassCell && !isStoneCell && !isCrateCell && !isIceCell && !isTreasureCell && !isWormCell;
              const showDecor = isEmpty && decor > 0.82;
              const levelVariant = ` level-variant-${((level.id + r + c2) % 6)}`;
              const floorClass = getFloorStyle(r, c2);
              const tileDepth = getTileDepth(r, c2, level.size);
              const depthStyle = {
                '--tile-depth': tileDepth,
                '--depth-shadow': `0 ${2 + tileDepth * 4}px ${4 + tileDepth * 8}px rgba(0,0,0,${0.3 + tileDepth * 0.2})`,
                ...getTileStyle(r, c2, level, game, worldId, isWallCell, isPortalCell, isAppleCell, isEmpty, animTime),
              };

              // Compute hint direction at this tile (direction to next path step)
              const hintPath = solverHint?.path || [];
              const hintIdx = hintPath.findIndex(pt => same(pt, p));
              const hintDir = hintIdx >= 0 && hintIdx < hintPath.length - 1 ? dirFrom(hintPath[hintIdx], hintPath[hintIdx + 1]) : null;
              const isHintPathTile = hintIdx >= 0;

              const tileClasses = [
                'garden-tile-cell',
                floorClass,
                levelVariant,
                showDecor && 'has-decor',
                isWallCell && 'wall',
                isKeyCell && 'key-tile',
                isDoorCell && 'door-tile',
                isHazardCell && 'hazard-tile',
                isBlockCell && 'block-tile',
                isAppleCell && 'apple',
                isPortalCell && 'portal',
                hint && game.apples.length && same(game.apples[0], p) && 'hinted',
                showHintPath && isHintPathTile && 'hint-path hint-path-anim',
                boardFx?.trail?.some(t => same(t, p)) && 'worm-trail',
                isGrassCell && 'grass-tile',
                isStoneCell && 'stone-block-tile',
                isCrateCell && 'crate-tile',
                isIceCell && 'ice-tile',
                isTreasureCell && 'treasure-tile',
                isWormCell && 'worm-body',
                isHead(p) && 'worm-head',
              ].filter(Boolean).join(' ');

              return (
                <div
                  key={i}
                  className={tileClasses}
                  onClick={() => { if (selectedPowerUp) onApplyPowerUp(selectedPowerUp, p); }}
                  aria-label={
                    isPortalCell ? (game.apples.length === 0 ? 'Portal open' : 'Portal locked') :
                    isAppleCell ? 'Apple' : isWallCell ? 'Wall' : isKeyCell ? 'Key' : isDoorCell ? 'Locked gate' :
                    isHazardCell ? 'Hazard' : isGrassCell ? 'Grass' : isStoneCell ? 'Stone block' :
                    isCrateCell ? 'Crate' : isIceCell ? 'Ice' : isTreasureCell ? 'Treasure' : 'Tile'
                  }
                  style={depthStyle}
                >
                  {/* Floor texture for empty cells */}
                  {isEmpty && (
                    <div className="floor-texture" aria-hidden="true" />
                  )}

                  {/* Ambient occlusion shadow at tile corners */}
                  <div className="tile-ao-shadow" aria-hidden="true" style={{ opacity: 0.15 + tileDepth * 0.15 }} />

                  {showDecor && <span className={`tile-decor decor-${worldId} d-${Math.floor(decor * 4)}`} aria-hidden="true" />}

                  {isHintPathTile && showHintPath && hintDir && (
                    <div className="hint-direction-arrow" style={{ animationDelay: `${hintIdx * 0.1}s` }}>
                      {(() => { const Icon = getDirectionIcon(hintDir); return <Icon size={14} />; })()}
                    </div>
                  )}

                  {boardFx?.trail?.some(t => same(t, p)) && <span className="tile-trail-fx" aria-hidden="true" />}

                  {isAppleCell ? (
                    <div className="tile-item-layer tile-apple-layer">
                      <PremiumAppleSVG collected={false} bobPhase={animTime * 0.002 + p[0] * 0.7 + p[1] * 0.45} worldId={worldId} />
                      {/* Apple glow particles */}
                      <div className="apple-glow-particles" aria-hidden="true">
                        {[0, 1, 2].map((j) => (
                          <span key={j} className="glow-particle" style={{ 
                            animationDelay: `${j * 0.3}s`,
                            left: `${20 + j * 20}%`,
                            top: `${20 + j * 15}%`
                          }} />
                        ))}
                      </div>
                    </div>
                  ) : isPortalCell ? (
                    <div className={`portal-cell-wrap tile-item-layer ${game.apples.length === 0 ? 'open' : 'locked'}`}>
                      <PremiumPortalSVG unlocked={game.apples.length === 0} pulsePhase={animTime * 0.001} worldId={worldId} />
                      <span className="portal-state-badge">{game.apples.length === 0 ? 'OPEN' : `${game.apples.length}`}</span>
                      {/* Portal ambient particles */}
                      {game.apples.length === 0 && (
                        <div className="portal-ambient-particles" aria-hidden="true">
                          {[0, 1, 2, 3].map((j) => (
                            <span key={j} className="portal-particle" style={{ 
                              animationDelay: `${j * 0.5}s`,
                              '--particle-angle': `${j * 90}deg`
                            }} />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : isKeyCell ? (
                    <span className="mechanic-icon key-icon tile-item-layer" title="Collect key to open gates"><KeyRoundIcon size={18} /></span>
                  ) : isDoorCell ? (
                    <span className="mechanic-icon door-icon tile-item-layer" title="Locked gate - find a key"><LockKeyholeIcon size={18} /></span>
                  ) : isHazardCell ? (
                    <span className="mechanic-icon hazard-icon tile-item-layer" title="Hazard - avoid"><FlameIcon size={18} /></span>
                  ) : isBlockCell ? (
                    <span className="mechanic-icon block-icon tile-item-layer" title="Block"><ShieldCheckIcon size={18} /></span>
                  ) : isWallCell ? (
                    <div className="tile-item-layer tile-wall-layer"><PremiumStoneWallSVG worldId={worldId} variant={(level.id + r * 3 + c2) % 4} /></div>
                  ) : isGrassCell ? (
                    <div className="tile-item-layer"><PremiumGrassTileSVG pulsePhase={animTime * 0.001} worldId={worldId} /></div>
                  ) : isStoneCell ? (
                    <div className="tile-item-layer"><PremiumStoneBlockSVG hits={(game.stoneBlocks || []).find(s => same(s.pos, p))?.hits || 2} worldId={worldId} /></div>
                  ) : isCrateCell ? (
                    <div className="tile-item-layer"><PremiumCrateTileSVG worldId={worldId} /></div>
                  ) : isIceCell ? (
                    <div className="tile-item-layer"><PremiumIceTileSVG pulsePhase={animTime * 0.001} worldId={worldId} /></div>
                  ) : isTreasureCell ? (
                    <div className="tile-item-layer">
                      <PremiumTreasureTileSVG pulsePhase={animTime * 0.001} worldId={worldId} />
                      {/* Treasure sparkle */}
                      <div className="treasure-sparkle" aria-hidden="true">
                        <SparklesIcon size={16} style={{ animation: 'sparklePulse 1.5s ease-in-out infinite' }} />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <WormRenderer
            renderWorm={renderWorm}
            levelSize={level.size}
            wormSkin={wormSkin}
            wormExpression={wormExpression}
            currentSkin={currentSkin}
            facing={facing}
            animTime={animTime}
            growing={growing}
            targetApple={game.apples[0] || null}
          />
        </div>

        {/* Perimeter Environmental Decorations - Surround board, outside overflow-hidden island */}
        <div className="perimeter-decorations" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => {
            const Comp = DecorIcons[i % DecorIcons.length];
            return (
              <div key={`perim-top-${i}`} className="perim-item perim-top" style={{ left: `${(i * 100) / 6}%` }}>
                <Comp worldId={worldId} variant={i} />
              </div>
            );
          })}
          {Array.from({ length: 6 }).map((_, i) => {
            const Comp = DecorIcons[i % DecorIcons.length];
            return (
              <div key={`perim-bottom-${i}`} className="perim-item perim-bottom" style={{ left: `${(i * 100) / 6}%` }}>
                <Comp worldId={worldId} variant={i} />
              </div>
            );
          })}
          {Array.from({ length: 4 }).map((_, i) => {
            const Comp = DecorIcons[(i + 6) % DecorIcons.length];
            return (
              <div key={`perim-left-${i}`} className="perim-item perim-left" style={{ top: `${(i * 100) / 4}%` }}>
                <Comp worldId={worldId} variant={i + 6} />
              </div>
            );
          })}
          {Array.from({ length: 4 }).map((_, i) => {
            const Comp = DecorIcons[(i + 10) % DecorIcons.length];
            return (
              <div key={`perim-right-${i}`} className="perim-item perim-right" style={{ top: `${(i * 100) / 4}%` }}>
                <Comp worldId={worldId} variant={i + 10} />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
