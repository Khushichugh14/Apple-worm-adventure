import React, { useMemo } from 'react';
import { ContinuousWormSVG } from '../GameElements';

export default function WormRenderer({ renderWorm, levelSize, wormSkin, wormExpression, currentSkin, facing, animTime, growing }) {
  const segments = useMemo(() => (renderWorm || []).map((seg) => [seg[0], seg[1]]), [renderWorm]);
  if (!segments.length) return null;

  return (
    <div className="worm-overlay-layer" aria-hidden="true">
      <ContinuousWormSVG
        segments={segments}
        wormSkin={wormSkin}
        expression={wormExpression}
        skinColor={currentSkin}
        animTime={animTime}
        facing={facing}
        levelSize={levelSize}
        growing={growing}
      />
    </div>
  );
}
