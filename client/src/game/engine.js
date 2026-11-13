export const same = (a, b) => a[0] === b[0] && a[1] === b[1];

const TILE_GRASS = 'grass';
const TILE_STONE = 'stone';
const TILE_CRATE = 'crate';
const TILE_ICE = 'ice';
const TILE_TREASURE = 'treasure';

function getDynamic(level, state) {
  return {
    keys: state.keys ?? (level.keys || []).map(p => [...p]),
    doors: state.doors ?? (level.doors || []).map(p => [...p]),
    hazards: level.hazards || [],
    movingBlocks: state.movingBlocks ?? (level.movingBlocks || []).map(p => [...p]),
    grass: state.grass ?? (level.grass || []).map(p => [...p]),
    stoneBlocks: state.stoneBlocks ?? (level.stoneBlocks || []).map(s => ({ ...s })),
    crates: state.crates ?? (level.crates || []).map(p => [...p]),
    ice: level.ice || [],
    treasure: state.treasure ?? (level.treasure || []).map(p => [...p])
  };
}

function posIn(list, pos) {
  return list.some(p => same(p, pos));
}
function blockedKind(pos, level, dyn) {
  if (posIn(level.walls, pos)) return 'wall';
  if (posIn(dyn.doors, pos)) return 'door';
  if (posIn(dyn.crates, pos)) return 'crate';
  if (posIn(dyn.stoneBlocks.map(s => s.pos), pos)) return 'stone';
  if (posIn(dyn.movingBlocks, pos)) return 'block';
  return null;
}

export function step(state, direction, level) {
  if (state.status !== 'playing') return state;

  const delta = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0]
  }[direction];

  if (!delta) return state;

  const dyn = getDynamic(level, state);
  const head = [state.worm[0][0] + delta[0], state.worm[0][1] + delta[1]];

  // Bounds check
  if (head[0] < 0 || head[1] < 0 || head[0] >= level.size || head[1] >= level.size) {
    return {
      ...state,
      status: 'failed',
      moves: state.moves + 1,
      reason: 'You wandered beyond the garden edges.'
    };
  }

  const kind = blockedKind(head, level, dyn);
  if (kind) {
    let reason = 'A stone wall blocks your path.';
    if (kind === 'door') reason = 'A locked gate blocks your path.';
    else if (kind === 'crate') reason = 'A wooden crate blocks your path.';
    else if (kind === 'stone') reason = 'A stone block blocks your path.';
    else if (kind === 'block') reason = 'A heavy block blocks your path.';
    return {
      ...state,
      status: 'failed',
      moves: state.moves + 1,
      reason
    };
  }

  // Ice: slide one additional tile in the same direction when possible.
  let landing = head;
  let slid = false;
  if (posIn(dyn.ice, head)) {
    const slide = [head[0] + delta[0], head[1] + delta[1]];
    const slideKind = blockedKind(slide, level, dyn);
    const slideInBounds =
      slide[0] >= 0 && slide[1] >= 0 && slide[0] < level.size && slide[1] < level.size;
    const body = state.apples.some(a => same(a, slide)) ? state.worm : state.worm.slice(0, -1);
    const hitBody = body.some(b => same(b, slide));
    if (slideInBounds && !slideKind && !dyn.hazards.some(h => same(h, slide)) && !hitBody) {
      landing = slide;
      slid = true;
    }
  }

  // Hazard check on landing tile
  if (dyn.hazards.some(h => same(h, landing))) {
    return {
      ...state,
      status: 'failed',
      moves: state.moves + 1,
      reason: 'You slithered into a hazard!'
    };
  }

  // Eating / collection checks on landing tile
  const eating = state.apples.some(a => same(a, landing));
  const pickedKey = dyn.keys.some(k => same(k, head));
  const clearedGrass = posIn(dyn.grass, head) || (slid && posIn(dyn.grass, landing));
  const collectedTreasure = posIn(dyn.treasure, head) || (slid && posIn(dyn.treasure, landing));

  // Body collision check (exclude tail since it moves unless eating)
  const body = eating ? state.worm : state.worm.slice(0, -1);
  const hitBody = body.some(b => same(b, landing));

  if (hitBody) {
    return {
      ...state,
      status: 'failed',
      moves: state.moves + 1,
      reason: 'You tangled into your own tail!'
    };
  }

  // Move worm
  const newWorm = eating
    ? [landing, ...state.worm]
    : [landing, ...state.worm.slice(0, -1)];

  // Remove eaten apple / collected key
  const newApples = eating
    ? state.apples.filter(a => !same(a, landing))
    : state.apples;
  const newKeys = pickedKey ? dyn.keys.filter(k => !same(k, head)) : dyn.keys;
  const newDoors = pickedKey ? [] : dyn.doors;

  // Clear grass under the landing tile
  const newGrass = clearedGrass
    ? dyn.grass.filter(g => !same(g, head) && !same(g, landing))
    : dyn.grass;

  // Collect treasure under the landing tile
  const newTreasure = collectedTreasure
    ? dyn.treasure.filter(t => !same(t, head) && !same(t, landing))
    : dyn.treasure;

  const newMoves = state.moves + 1;

  // Move limit check
  if (newMoves > level.moveLimit) {
    return {
      ...state,
      status: 'failed',
      worm: newWorm,
      apples: newApples,
      keys: newKeys,
      doors: newDoors,
      movingBlocks: dyn.movingBlocks,
      grass: newGrass,
      stoneBlocks: dyn.stoneBlocks,
      crates: dyn.crates,
      ice: dyn.ice,
      treasure: newTreasure,
      moves: newMoves,
      reason: 'Move limit exceeded. Try a more efficient path!'
    };
  }

  // Portal check (requires all apples collected; doors open when keys taken)
  const portalReady = newApples.length === 0 && same(landing, level.portal);

  const scoreDelta =
    (eating ? 10 : 0) +
    (pickedKey ? 5 : 0) +
    (clearedGrass ? 2 : 0) +
    (collectedTreasure ? 25 : 0);

  return {
    ...state,
    worm: newWorm,
    apples: newApples,
    keys: newKeys,
    doors: newDoors,
    movingBlocks: dyn.movingBlocks,
    grass: newGrass,
    stoneBlocks: dyn.stoneBlocks,
    crates: dyn.crates,
    ice: dyn.ice,
    treasure: newTreasure,
    moves: newMoves,
    score: state.score + scoreDelta,
    status: portalReady ? 'completed' : 'playing',
    reason: eating ? 'Apple collected!' : pickedKey ? 'Key collected! Gates opened.'
      : clearedGrass ? 'Grass cleared.' : collectedTreasure ? 'Treasure found!'
      : portalReady ? 'Portal reached!' : slid ? 'Ice slide.' : ''
  };
}

export const initialState = level => ({
  worm: level.worm.map(p => [...p]),
  apples: level.apples.map(p => [...p]),
  keys: (level.keys || []).map(p => [...p]),
  doors: (level.doors || []).map(p => [...p]),
  movingBlocks: (level.movingBlocks || []).map(p => [...p]),
  grass: (level.grass || []).map(p => [...p]),
  stoneBlocks: (level.stoneBlocks || []).map(s => ({ pos: [...s.pos], hits: s.hits || 2 })),
  crates: (level.crates || []).map(p => [...p]),
  ice: (level.ice || []).map(p => [...p]),
  treasure: (level.treasure || []).map(p => [...p]),
  moves: 0,
  score: 0,
  status: 'playing',
  reason: ''
});

// Helper for getting valid moves from a position
export function getValidMoves(pos, worm, apples, walls, size, moveLimit, currentMoves, extras = {}) {
  const moves = [];
  const directions = [
    { name: 'up', delta: [0, -1] },
    { name: 'down', delta: [0, 1] },
    { name: 'left', delta: [-1, 0] },
    { name: 'right', delta: [1, 0] }
  ];
  const doors = extras.doors || [];
  const movingBlocks = extras.movingBlocks || [];
  const hazards = extras.hazards || [];
  const crates = extras.crates || [];
  const stoneBlocks = extras.stoneBlocks || [];

  for (const dir of directions) {
    const nextPos = [pos[0] + dir.delta[0], pos[1] + dir.delta[1]];

    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] >= size || nextPos[1] >= size) continue;
    if (walls.some(w => same(w, nextPos))) continue;
    if (doors.some(d => same(d, nextPos))) continue;
    if (movingBlocks.some(b => same(b, nextPos))) continue;
    if (crates.some(c => same(c, nextPos))) continue;
    if (stoneBlocks.some(s => same(s.pos, nextPos))) continue;
    if (hazards.some(h => same(h, nextPos))) continue;

    const eating = apples.some(a => same(a, nextPos));
    const body = eating ? worm : worm.slice(0, -1);
    if (body.some(b => same(b, nextPos))) continue;

    moves.push({ direction: dir.name, position: nextPos, eating });
  }

  return moves;
}

// Check if a state is winnable (has path to at least one target)
export function isWinnable(state, level) {
  const head = state.worm[0];
  const targets = state.apples.length > 0 ? state.apples : [level.portal];
  for (const target of targets) {
    if (hasPath(head, target, state, level)) return true;
  }
  return false;
}

function hasPath(start, goal, state, level) {
  const queue = [start];
  const visited = new Set();
  const key = p => `${p[0]},${p[1]}`;
  visited.add(key(start));
  const dyn = getDynamic(level, state);
  const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

  while (queue.length > 0) {
    const current = queue.shift();
    if (same(current, goal)) return true;

    for (const [dx, dy] of directions) {
      const next = [current[0] + dx, current[1] + dy];
      if (next[0] < 0 || next[1] < 0 || next[0] >= level.size || next[1] >= level.size) continue;
      if (visited.has(key(next))) continue;
      const kind = blockedKind(next, level, dyn);
      if (kind) continue;
      if (dyn.hazards.some(h => same(h, next))) continue;

      const eating = state.apples.some(a => same(a, next));
      const body = eating ? state.worm : state.worm.slice(0, -1);
      if (body.some(b => same(b, next))) continue;

      visited.add(key(next));
      queue.push(next);
    }
  }
  return false;
}

/* Power-up effect appliers. Each returns a new state or null if not applicable. */

export function applyBomb(state, level, center) {
  const cx = center[0], cy = center[1];
  const clearedCrates = state.crates.filter(c => Math.abs(c[0] - cx) + Math.abs(c[1] - cy) <= 1).length > 0;
  const hitStone = state.stoneBlocks.some(s => Math.abs(s.pos[0] - cx) + Math.abs(s.pos[1] - cy) <= 1);
  let newStones = state.stoneBlocks;
  if (hitStone) {
    newStones = state.stoneBlocks.map(s => {
      const dist = Math.abs(s.pos[0] - cx) + Math.abs(s.pos[1] - cy);
      if (dist <= 1) return { ...s, hits: Math.max(0, s.hits - 1) };
      return s;
    }).filter(s => s.hits > 0);
  }
  const newCrates = clearedCrates ? state.crates.filter(c => Math.abs(c[0] - cx) + Math.abs(c[1] - cy) > 1) : state.crates;
  return {
    ...state,
    crates: newCrates,
    stoneBlocks: newStones
  };
}

export function applyLightning(state, level, axis, index) {
  // axis: 'row' or 'col', index: row/col coordinate
  const remove = pos => axis === 'row' ? pos[1] === index : pos[0] === index;
  let newCrates = state.crates;
  let newStones = state.stoneBlocks;
  const cratesHit = state.crates.some(remove);
  const stonesHit = state.stoneBlocks.some(s => remove(s.pos));
  if (cratesHit) newCrates = state.crates.filter(p => !remove(p));
  if (stonesHit) newStones = state.stoneBlocks.map(s => remove(s.pos) ? { ...s, hits: Math.max(0, s.hits - 1) } : s).filter(s => s.hits > 0);
  return { ...state, crates: newCrates, stoneBlocks: newStones };
}

export function applyHammer(state, level, pos) {
  const stoneIdx = state.stoneBlocks.findIndex(s => same(s.pos, pos));
  const crateIdx = state.crates.findIndex(c => same(c, pos));
  let newStones = state.stoneBlocks;
  let newCrates = state.crates;
  let broke = false;
  if (stoneIdx !== -1) {
    const s = state.stoneBlocks[stoneIdx];
    newStones = state.stoneBlocks.map((s2, i) => i === stoneIdx ? { ...s2, hits: Math.max(0, s2.hits - 1) } : s2).filter(s2 => s2.hits > 0);
    broke = true;
  }
  if (crateIdx !== -1) {
    newCrates = state.crates.filter((c, i) => i !== crateIdx);
    broke = true;
  }
  return broke ? { ...state, crates: newCrates, stoneBlocks: newStones } : null;
}

export function applyMagicKey(state, level) {
  // Unlock all doors (consume one key effect without a key item)
  if (state.doors.length === 0) return null;
  return { ...state, doors: [] };
}

export function applyRainbow(state, level, type) {
  // Remove all collectibles of a given type: 'apples' | 'treasure' | 'grass'
  if (type === 'apples') return { ...state, apples: [] };
  if (type === 'treasure') return { ...state, treasure: [] };
  if (type === 'grass') return { ...state, grass: [] };
  return null;
}

export function applyExtraMoves(state, amount) {
  return { ...state }; // moves handled via bonusMoves at the caller level
}
