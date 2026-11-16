import React, { useMemo } from 'react';
import { WormHeadSVG, WormSegmentSVG, WormTailSVG } from '../GameElements';

function angleDeg(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
}

export default function WormRenderer({ renderWorm, levelSize, wormSkin, wormExpression, currentSkin, facing, animTime }) {
  const segs = useMemo(() => {
    if (!renderWorm || !renderWorm.length) return [];
    return renderWorm.map((seg, idx) => {
      let ang = 0;
      if (idx === 0) {
        // Head orientation
        if (renderWorm.length > 1) {
          const bodyNext = renderWorm[1];
          ang = angleDeg(bodyNext[0], bodyNext[1], seg[0], seg[1]);
        } else {
          ang = { right: 0, down: 90, left: 180, up: -90 }[facing] ?? 0;
        }
      } else {
        // Body / Tail: oriented towards the segment ahead
        const segAhead = renderWorm[idx - 1];
        ang = angleDeg(seg[0], seg[1], segAhead[0], segAhead[1]);
      }
      return { seg, idx, ang };
    });
  }, [renderWorm, facing]);

  if (!segs.length) return null;

  return (
    <div className="worm-overlay-layer" aria-hidden="true">
      {/* Render from tail to head so head sits on top */}
      {segs.slice().reverse().map(({ seg, idx, ang }) => {
        const x = (seg[0] / levelSize) * 100;
        const y = (seg[1] / levelSize) * 100;
        const isHeadSeg = idx === 0;
        const isTailSeg = idx === renderWorm.length - 1 && idx > 0;
        const wavePhase = (animTime * 0.004) + (idx * 0.8);
        const crawlPulse = 1 + Math.sin(animTime * 0.005 + idx * 0.6) * 0.035;

        return (
          <div
            key={`w-${idx}`}
            className={`worm-overlay-seg ${isHeadSeg ? 'head' : ''} ${isTailSeg ? 'tail' : ''}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${100 / levelSize}%`,
              height: `${100 / levelSize}%`,
              zIndex: 60 - idx,
              transform: `scale(${crawlPulse})`,
              transformOrigin: '50% 50%',
            }}
          >
            {isHeadSeg ? (
              <WormHeadSVG facing={facing} skinId={wormSkin} expression={wormExpression} skinColor={currentSkin} time={animTime} angle={ang} />
            ) : isTailSeg ? (
              <WormTailSVG skinId={wormSkin} skinColor={currentSkin} time={animTime} angle={ang} />
            ) : (
              <WormSegmentSVG
                skinId={wormSkin}
                scale={1}
                index={idx}
                skinColor={currentSkin}
                wavePhase={wavePhase}
                angle={ang}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
