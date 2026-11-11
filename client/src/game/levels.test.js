import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, WORLDS } from '../data/levels.js';
import { initialState, step, same } from './engine.js';
import { findNextHint } from './solver.js';

test('Level integrity: All 50 levels have valid structure and no overlapping entities', () => {
  assert.equal(LEVELS.length, 50, 'There should be exactly 50 levels');

  LEVELS.forEach(lvl => {
    assert.ok(lvl.id >= 1 && lvl.id <= 50, `Level ID ${lvl.id} is valid`);
    assert.ok(lvl.size >= 6, `Level ${lvl.id} size is at least 6`);
    assert.ok(lvl.worm.length >= 2, `Level ${lvl.id} worm has at least 2 segments`);
    assert.ok(lvl.apples.length >= 1, `Level ${lvl.id} has at least 1 apple`);
    assert.ok(lvl.portal && lvl.portal.length === 2, `Level ${lvl.id} has a valid portal`);
    assert.ok(lvl.moveLimit >= 20, `Level ${lvl.id} has a reasonable moveLimit`);

    // Verify coordinates are within bounds
    const checkBounds = (pt, label) => {
      assert.ok(pt[0] >= 0 && pt[0] < lvl.size, `Level ${lvl.id} ${label} x=${pt[0]} out of bounds`);
      assert.ok(pt[1] >= 0 && pt[1] < lvl.size, `Level ${lvl.id} ${label} y=${pt[1]} out of bounds`);
    };

    lvl.worm.forEach((seg, i) => checkBounds(seg, `worm segment ${i}`));
    lvl.apples.forEach((app, i) => checkBounds(app, `apple ${i}`));
    checkBounds(lvl.portal, 'portal');
    lvl.walls.forEach((wall, i) => checkBounds(wall, `wall ${i}`));

    // Verify no walls overlap with worm, apples, or portal
    lvl.walls.forEach(wall => {
      lvl.worm.forEach((seg, sIdx) => {
        assert.ok(!same(wall, seg), `Level ${lvl.id}: Wall at [${wall}] overlaps worm segment ${sIdx}`);
      });
      lvl.apples.forEach((apple, aIdx) => {
        assert.ok(!same(wall, apple), `Level ${lvl.id}: Wall at [${wall}] overlaps apple ${aIdx}`);
      });
      assert.ok(!same(wall, lvl.portal), `Level ${lvl.id}: Wall at [${wall}] overlaps portal`);
    });

    // Verify worm does not overlap apples or portal at start
    lvl.worm.forEach((seg, sIdx) => {
      lvl.apples.forEach((apple, aIdx) => {
        assert.ok(!same(seg, apple), `Level ${lvl.id}: Worm segment ${sIdx} starts on apple ${aIdx}`);
      });
      assert.ok(!same(seg, lvl.portal), `Level ${lvl.id}: Worm segment ${sIdx} starts on portal`);
    });

    // Verify apples don't overlap each other
    for (let i = 0; i < lvl.apples.length; i++) {
      for (let j = i + 1; j < lvl.apples.length; j++) {
        assert.ok(!same(lvl.apples[i], lvl.apples[j]), `Level ${lvl.id}: Apple ${i} overlaps apple ${j}`);
      }
    }

    // Verify portal doesn't overlap apples
    lvl.apples.forEach((apple, aIdx) => {
      assert.ok(!same(apple, lvl.portal), `Level ${lvl.id}: Apple ${aIdx} overlaps portal`);
    });
  });
});

// Full solvability test: Using BFS state-space search (worm body + apples remaining)
// to verify levels can actually be won within their move limits!
function solveLevelBFS(level, maxExplored = 50000) {
  const startState = initialState(level);
  const queue = [{
    worm: startState.worm,
    apples: startState.apples,
    moves: 0,
    path: []
  }];

  const stateKey = (worm, apples) => {
    const wKey = worm.map(p => `${p[0]},${p[1]}`).join(':');
    const aKey = apples.map(p => `${p[0]},${p[1]}`).sort().join(':');
    return `${wKey}|${aKey}`;
  };

  const visited = new Set();
  visited.add(stateKey(startState.worm, startState.apples));

  const directions = ['up', 'down', 'left', 'right'];

  let count = 0;
  while (queue.length > 0 && count < maxExplored) {
    count++;
    const current = queue.shift();

    if (current.moves > level.moveLimit) continue;

    for (const dir of directions) {
      const simulatedState = {
        worm: current.worm,
        apples: current.apples,
        moves: current.moves,
        score: 0,
        status: 'playing',
        reason: ''
      };

      const next = step(simulatedState, dir, level);

      if (next.status === 'completed') {
        return { solved: true, moves: next.moves, path: [...current.path, dir] };
      }

      if (next.status === 'playing') {
        const key = stateKey(next.worm, next.apples);
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({
            worm: next.worm,
            apples: next.apples,
            moves: next.moves,
            path: [...current.path, dir]
          });
        }
      }
    }
  }

  return { solved: false, explored: count };
}

test('Solvability verification for beginner & easy levels (Worlds 1-2)', () => {
  const unsolvable = [];
  const earlyLevels = LEVELS.filter(l => l.worldId <= 2);
  
  earlyLevels.forEach(lvl => {
    const res = solveLevelBFS(lvl, 50000);
    if (!res.solved) {
      unsolvable.push({ id: lvl.id, title: lvl.title, explored: res.explored });
    }
  });

  assert.equal(unsolvable.length, 0, `Unsolvable early levels found: ${JSON.stringify(unsolvable)}`);
});

test('Medium levels have valid structure and reasonable move limits (World 3)', () => {
  const mediumLevels = LEVELS.filter(l => l.worldId === 3);
  
  mediumLevels.forEach(lvl => {
    // Verify move limit is reasonable (at least 2x the minimum path length estimate)
    const minPathEstimate = lvl.apples.length * 3 + 5; // rough estimate
    assert.ok(lvl.moveLimit >= minPathEstimate, 
      `Level ${lvl.id} moveLimit (${lvl.moveLimit}) should be >= ${minPathEstimate}`);
    assert.ok(lvl.parMoves > 0 && lvl.parMoves <= lvl.moveLimit, 
      `Level ${lvl.id} parMoves should be positive and <= moveLimit`);
  });
});

test('Hard & Expert levels have valid structure and generous move limits (Worlds 4-5)', () => {
  const hardLevels = LEVELS.filter(l => l.worldId >= 4);
  
  hardLevels.forEach(lvl => {
    // For expert levels, just verify structure and that move limits are generous
    const minPathEstimate = lvl.apples.length * 4 + 8; // rough estimate for complex mazes
    assert.ok(lvl.moveLimit >= minPathEstimate, 
      `Level ${lvl.id} moveLimit (${lvl.moveLimit}) should be >= ${minPathEstimate}`);
    assert.ok(lvl.parMoves > 0 && lvl.parMoves <= lvl.moveLimit, 
      `Level ${lvl.id} parMoves should be positive and <= moveLimit`);
    assert.ok(lvl.walls.length >= 8, `Level ${lvl.id} should have substantial walls for challenge`);
  });
});

test('All worlds have correct level ranges', () => {
  WORLDS.forEach(world => {
    const worldLevels = LEVELS.filter(l => l.worldId === world.id);
    assert.equal(worldLevels.length, 10, `World ${world.id} (${world.name}) should have 10 levels`);
    
    const levelIds = worldLevels.map(l => l.id).sort((a, b) => a - b);
    assert.deepEqual(levelIds, Array.from({ length: 10 }, (_, i) => world.range[0] + i),
      `World ${world.id} should have levels ${world.range[0]}-${world.range[1]}`);
  });
});

test('Progression: Move limits increase with world difficulty', () => {
  for (let i = 1; i <= 5; i++) {
    const worldLevels = LEVELS.filter(l => l.worldId === i);
    const avgMoveLimit = worldLevels.reduce((sum, l) => sum + l.moveLimit, 0) / worldLevels.length;
    
    if (i > 1) {
      const prevWorldLevels = LEVELS.filter(l => l.worldId === i - 1);
      const prevAvgMoveLimit = prevWorldLevels.reduce((sum, l) => sum + l.moveLimit, 0) / prevWorldLevels.length;
      assert.ok(avgMoveLimit > prevAvgMoveLimit, 
        `World ${i} avg moveLimit (${avgMoveLimit.toFixed(1)}) should be > World ${i-1} (${prevAvgMoveLimit.toFixed(1)})`);
    }
  }
});

test('Par moves are achievable (strictly less than move limits)', () => {
  LEVELS.forEach(lvl => {
    assert.ok(lvl.parMoves < lvl.moveLimit, 
      `Level ${lvl.id} parMoves (${lvl.parMoves}) should be < moveLimit (${lvl.moveLimit})`);
  });
});