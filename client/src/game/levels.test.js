import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../data/levels.js';
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
  });
});

// Full solvability test: Using BFS state-space search (worm body + apples remaining)
// to verify all 50 levels can actually be won within their move limits!
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

test('Solvability verification for all 50 levels', () => {
  const unsolvable = [];
  LEVELS.forEach(lvl => {
    const res = solveLevelBFS(lvl, 30000);
    if (!res.solved) {
      unsolvable.push({ id: lvl.id, title: lvl.title, explored: res.explored });
    }
  });

  assert.equal(unsolvable.length, 0, `Unsolvable levels found: ${JSON.stringify(unsolvable)}`);
});

