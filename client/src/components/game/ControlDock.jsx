import React from 'react';
import {
  Undo2 as Undo2Icon, RefreshCw as RefreshCwIcon, Lightbulb as LightbulbIcon,
  Zap as ZapIcon, Bomb as BombIcon, Gem as GemIcon2, ShieldCheck as ShieldCheckIcon, Plus as PlusIcon, KeyRound as KeyRoundIcon,
  ArrowUp as ArrowUpIcon, ArrowDown as ArrowDownIcon, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon
} from 'lucide-react';

const NO_TARGET_POWER_UPS = new Set(['magicKey', 'extraMoves']);

export default function ControlDock({
  historyLength,
  onUndo,
  onRestart,
  onHint,
  powerUps,
  selectedPowerUp,
  onSelectPowerUp,
  onApplyPowerUp,
  onMove,
}) {
  const handlePowerUpClick = (type, count) => {
    if (count <= 0) return;
    if (NO_TARGET_POWER_UPS.has(type)) {
      onApplyPowerUp(type, null);
    } else {
      onSelectPowerUp(selectedPowerUp === type ? null : type);
    }
  };

  return (
    <footer className="game-bottom-dock">
      <div className="dock-controls-left">
        <button className="dock-action-btn" onClick={onUndo} disabled={!historyLength} title="Undo last move (Z)">
          <Undo2Icon size={16} /> <span>UNDO</span>
        </button>
        <button className="dock-action-btn" onClick={onRestart} title="Restart (R)">
          <RefreshCwIcon size={16} /> <span>RESET</span>
        </button>
        <button className="dock-action-btn hint-btn" onClick={onHint} title="Show hint (H)">
          <LightbulbIcon size={16} /> <span>HINT</span>
        </button>
        {Object.entries(powerUps).map(([type, count]) => {
          const isActive = selectedPowerUp === type;
          const isNoTarget = NO_TARGET_POWER_UPS.has(type);
          const isDisabled = count <= 0;
          return (
            <button
              key={type}
              className={`dock-action-btn ${isActive && !isNoTarget ? 'active' : ''} powerup-btn ${isNoTarget ? 'powerup-no-target' : ''}`}
              onClick={() => handlePowerUpClick(type, count)}
              title={type}
              disabled={isDisabled}
            >
              {type === 'bomb' && <BombIcon size={16} className={`powerup-icon powerup-${type}`} />}
              {type === 'lightning' && <ZapIcon size={16} className={`powerup-icon powerup-${type}`} />}
              {type === 'rainbow' && <GemIcon2 size={16} className={`powerup-icon powerup-${type}`} />}
              {type === 'hammer' && <ShieldCheckIcon size={16} className={`powerup-icon powerup-${type}`} />}
              {type === 'extraMoves' && <PlusIcon size={16} className={`powerup-icon powerup-${type}`} />}
              {type === 'magicKey' && <KeyRoundIcon size={16} className={`powerup-icon powerup-${type}`} />}
              <span>{count > 0 ? count : isActive ? 'SELECT' : '—'}</span>
            </button>
          );
        })}
      </div>

      <div className="virtual-dpad-cluster" onTouchStart={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}>
        <button type="button" className="dpad-direction-button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); onMove('up'); }} aria-label="Move Up">
          <ArrowUpIcon size={22} />
        </button>
        <div className="dpad-row-keys">
          <button type="button" className="dpad-direction-button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); onMove('left'); }} aria-label="Move Left">
            <ArrowLeftIcon size={22} />
          </button>
          <button type="button" className="dpad-direction-button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); onMove('down'); }} aria-label="Move Down">
            <ArrowDownIcon size={22} />
          </button>
          <button type="button" className="dpad-direction-button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); onMove('right'); }} aria-label="Move Right">
            <ArrowRightIcon size={22} />
          </button>
        </div>
      </div>
    </footer>
  );
}
