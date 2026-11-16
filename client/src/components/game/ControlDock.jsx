import React from 'react';
import {
  Undo2 as Undo2Icon, RefreshCw as RefreshCwIcon, Lightbulb as LightbulbIcon,
  Zap as ZapIcon, Gem as GemIcon2, ShieldCheck as ShieldCheckIcon, Plus as PlusIcon, KeyRound as KeyRoundIcon,
  ArrowUp as ArrowUpIcon, ArrowDown as ArrowDownIcon, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon
} from 'lucide-react';

export default function ControlDock({
  historyLength,
  onUndo,
  onRestart,
  onHint,
  powerUps,
  selectedPowerUp,
  onSelectPowerUp,
  onMove,
}) {
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
        {Object.entries(powerUps).map(([type, count]) => (
          <button
            key={type}
            className={`dock-action-btn ${selectedPowerUp === type ? 'active' : ''} powerup-btn`}
            onClick={() => onSelectPowerUp(selectedPowerUp === type ? null : type)}
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
