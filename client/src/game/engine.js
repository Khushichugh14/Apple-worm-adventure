export const same = (a, b) => a[0] === b[0] && a[1] === b[1];

function getDynamic(level, state) {
  return {
    keys: state.keys ?? (level.keys || []).map(p => [...p]),
    doors: state.doors ?? (level.doors || []).map(p => [...p]),
    hazards: level.hazards || [],
    movingBlocks: state.movingBlocks ?? (level.movingBlocks || []).map(p => [...p])
  };
}

function isBlocked(pos, level, dyn) {
  if (level.walls.some(w => same(w, pos))) return true;
  if (dyn.doors.some(d => same(d, pos))) return true;
  if (dyn.movingBlocks.some(b => same(b, pos))) return true;
  return false;
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

  // Wall/door/block check
  if (isBlocked(head, level, dyn)) {
    const hitDoor = dyn.doors.some(d => same(d, head));
    const hitBlock = dyn.movingBlocks.some(b => same(b, head));
    return {
      ...state,
      status: 'failed',
      moves: state.moves + 1,
      reason: hitDoor ? 'A locked gate blocks your path.' : hitBlock ? 'A heavy block blocks your path.' : 'A stone wall blocks your path.'
    };
  }

  // Hazard check
  if (dyn.hazards.some(h => same(h, head))) {
    return {
      ...state,
      status: 'failed',
      moves: state.moves + 1,
      reason: 'You slithered into a hazard!'
    };
  }

  // Eating check
  const eating = state.apples.some(a => same(a, head));
  const pickedKey = dyn.keys.some(k => same(k, head));

  // Body collision check (exclude tail since it moves unless eating)
  const body = eating ? state.worm : state.worm.slice(0, -1);
  const hitBody = body.some(b => same(b, head));

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
    ? [head, ...state.worm]
    : [head, ...state.worm.slice(0, -1)];

  // Remove eaten apple / collected key
  const newApples = eating
    ? state.apples.filter(a => !same(a, head))
    : state.apples;
  const newKeys = pickedKey ? dyn.keys.filter(k => !same(k, head)) : dyn.keys;
  // Open doors when any key collected (simple mechanic)
  const newDoors = pickedKey ? [] : dyn.doors;

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
      moves: newMoves,
      reason: 'Move limit exceeded. Try a more efficient path!'
    };
  }

  // Portal check (requires all apples collected; doors open when keys taken)
  const portalReady = newApples.length === 0 && same(head, level.portal);

  return {
    ...state,
    worm: newWorm,
    apples: newApples,
    keys: newKeys,
    doors: newDoors,
    movingBlocks: dyn.movingBlocks,
    moves: newMoves,
    score: state.score + (eating ? 10 : 0) + (pickedKey ? 5 : 0),
    status: portalReady ? 'completed' : 'playing',
    reason: eating ? 'Apple collected!' : pickedKey ? 'Key collected! Gates opened.' : portalReady ? 'Portal reached!' : ''
  };
}

export const initialState = level => ({
  worm: level.worm.map(p => [...p]),
  apples: level.apples.map(p => [...p]),
  keys: (level.keys || []).map(p => [...p]),
  doors: (level.doors || []).map(p => [...p]),
  movingBlocks: (level.movingBlocks || []).map(p => [...p]),
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

  for (const dir of directions) {
    const nextPos = [pos[0] + dir.delta[0], pos[1] + dir.delta[1]];

    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] >= size || nextPos[1] >= size) continue;
    if (walls.some(w => same(w, nextPos))) continue;
    if (doors.some(d => same(d, nextPos))) continue;
    if (movingBlocks.some(b => same(b, nextPos))) continue;
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
      if (isBlocked(next, level, dyn)) continue;
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