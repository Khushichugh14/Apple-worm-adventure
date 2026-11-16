import React, { useMemo } from 'react';
import { ContinuousWormSVG } from '../GameElements';

export default function WormRenderer({ renderWorm, levelSize, wormSkin, wormExpression, currentSkin, facing, animTime }) {
  const segs = useMemo(() => {
    if (!renderWorm || !renderWorm.length) return [];
    return renderWorm.map((seg, idx) => [seg[0], seg[1]]);
  }, [renderWorm]);

  if (!segs.length) return null;

  return (
    <div className="worm-overlay-layer" aria-hidden="true">
      <ContinuousWormSVG
        segments={segs}
        wormSkin={wormSkin}
        expression={wormExpression}
        skinColor={currentSkin}
        animTime={animTime}
        facing={facing}
        levelSize={levelSize}
      />
    </div>
  );
}
