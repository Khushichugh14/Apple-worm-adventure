import React from 'react';
import { same } from '../../game/engine';
import {
  PremiumAppleSVG, PremiumPortalSVG, PremiumStoneWallSVG,
  PremiumGrassTileSVG, PremiumStoneBlockSVG, PremiumCrateTileSVG,
  PremiumIceTileSVG, PremiumTreasureTileSVG,
  WorldBackgroundSVG, WorldTreeSVG, WorldMushroomSVG,
  WorldCrystalSVG, WorldIceCrystalSVG, WorldPlanetSVG,
  FloatingParticleSVG
} from '../GameElements';
import { KeyRound as KeyRoundIcon, LockKeyhole as LockKeyholeIcon, Flame as FlameIcon, ShieldCheck as ShieldCheckIcon } from 'lucide-react';
import WormRenderer from './WormRenderer';

const DECORATION_COMPONENTS = {
  1: WorldTreeSVG,
  2: WorldMushroomSVG,
  3: WorldCrystalSVG,
  4: WorldIceCrystalSVG,
  5: WorldPlanetSVG,
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
}) {
  const worldId = currentWorld?.id || 1;
  const DecorIcon = DECORATION_COMPONENTS[worldId] || WorldTreeSVG;

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
              const isIceCell = (game.ice || []).some(i => same(i, p));
              const isTreasureCell = (game.treasure || []).some(t => same(t, t));
              const isEmpty = !isWallCell && !isPortalCell && !isAppleCell && !isKeyCell && !isDoorCell && !isHazardCell && !isBlockCell && !isGrassCell && !isStoneCell && !isCrateCell && !isIceCell && !isTreasureCell && !game.worm.some(w => same(w, p));
              const showDecor = isEmpty && decor > 0.82;
              const levelVariant = ` level-variant-${((level.id + r + c2) % 6)}`;
              const floorClass = getFloorStyle(r, c2);

              return (
                <div
                  key={i}
                  className={`garden-tile-cell ${floorClass}${levelVariant}${showDecor ? ' has-decor' : ''}${isWallCell ? ' wall' : ''}${isKeyCell ? ' key-tile' : ''}${isDoorCell ? ' door-tile' : ''}${isHazardCell ? ' hazard-tile' : ''}${isBlockCell ? ' block-tile' : ''}${isAppleCell ? ' apple' : ''}${isPortalCell ? ' portal' : ''}${hint && game.apples.length && same(game.apples[0], p) ? ' hinted' : ''}${showHintPath && solverHint && solverHint.path && solverHint.path.some(pt => same(pt, p)) ? ' hint-path hint-path-anim' : ''}${boardFx?.trail?.some(t => same(t, p)) ? ' worm-trail' : ''}${isHead(p) ? ' head' : ''}${game.worm.some(w => same(w, p)) ? ' worm' : ''}${isGrassCell ? ' grass-tile' : ''}${isStoneCell ? ' stone-block-tile' : ''}${isCrateCell ? ' crate-tile' : ''}${isIceCell ? ' ice-tile' : ''}${isTreasureCell ? ' treasure-tile' : ''}`}
                  onClick={() => { if (selectedPowerUp) onApplyPowerUp(selectedPowerUp, p); }}
                  aria-label={
                    isPortalCell ? (game.apples.length === 0 ? 'Portal open' : 'Portal locked') :
                    isAppleCell ? 'Apple' : isWallCell ? 'Wall' : isKeyCell ? 'Key' : isDoorCell ? 'Locked gate' :
                    isHazardCell ? 'Hazard' : isGrassCell ? 'Grass' : isStoneCell ? 'Stone block' :
                    isCrateCell ? 'Crate' : isIceCell ? 'Ice' : isTreasureCell ? 'Treasure' : 'Tile'
                  }
                >
                  {/* Floor texture for empty cells */}
                  {isEmpty && (
                    <div className="floor-texture" aria-hidden="true" />
                  )}

                  {showDecor && <span className={`tile-decor decor-${worldId} d-${Math.floor(decor * 4)}`} aria-hidden="true" />}

                  {boardFx?.trail?.some(t => same(t, p)) && <span className="tile-trail-fx" aria-hidden="true" />}

                  {isAppleCell ? (
                    <PremiumAppleSVG collected={false} bobPhase={(animTime * 0.001 + p[0] * 0.5 + p[1] * 0.3) % (Math.PI * 2)} worldId={worldId} />
                  ) : isPortalCell ? (
                    <div className={`portal-cell-wrap ${game.apples.length === 0 ? 'open' : 'locked'}`}>
                      <PremiumPortalSVG unlocked={game.apples.length === 0} pulsePhase={animTime * 0.001} worldId={worldId} />
                      <span className="portal-state-badge">{game.apples.length === 0 ? 'OPEN' : `${game.apples.length}`}</span>
                    </div>
                  ) : isKeyCell ? (
                    <span className="mechanic-icon key-icon" title="Collect key to open gates"><KeyRoundIcon size={18} /></span>
                  ) : isDoorCell ? (
                    <span className="mechanic-icon door-icon" title="Locked gate - find a key"><LockKeyholeIcon size={18} /></span>
                  ) : isHazardCell ? (
                    <span className="mechanic-icon hazard-icon" title="Hazard - avoid"><FlameIcon size={18} /></span>
                  ) : isBlockCell ? (
                    <span className="mechanic-icon block-icon" title="Block"><ShieldCheckIcon size={18} /></span>
                  ) : isWallCell ? (
                    <PremiumStoneWallSVG worldId={worldId} variant={(level.id + r * 3 + c2) % 4} seed={level.id + r * 7 + c2 * 3} />
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

          {/* Perimeter Environmental Decorations - Surround the board, never on playable cells */}
          <div className="perimeter-decorations" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`perim-top-${i}`} className="perim-item perim-top" style={{ left: `${(i * 100) / 6}%` }}>
                <DecorIcon worldId={worldId} variant={i} />
              </div>
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`perim-bottom-${i}`} className="perim-item perim-bottom" style={{ left: `${(i * 100) / 6}%` }}>
                <DecorIcon worldId={worldId} variant={i} />
              </div>
            ))}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`perim-left-${i}`} className="perim-item perim-left" style={{ top: `${(i * 100) / 4}%` }}>
                <DecorIcon worldId={worldId} variant={i + 6} />
              </div>
            ))}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`perim-right-${i}`} className="perim-item perim-right" style={{ top: `${(i * 100) / 4}%` }}>
                <DecorIcon worldId={worldId} variant={i + 10} />
              </div>
            ))}
          </div>

          <WormRenderer
            renderWorm={renderWorm}
            levelSize={level.size}
            wormSkin={wormSkin}
            wormExpression={wormExpression}
            currentSkin={currentSkin}
            facing={facing}
            animTime={animTime}
          />
        </div>
      </div>
    </main>
  );
}
