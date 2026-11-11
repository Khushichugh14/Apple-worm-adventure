export const same = (a, b) => a[0] === b[0] && a[1] === b[1];

export function step(state, direction, level) {
  if (state.status !== 'playing') return state;

  const delta = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0]
  }[direction];

  if (!delta) return state;

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

  // Wall check
  const wall = level.walls.some(w => same(w, head));
  if (wall) {
    return {
      ...state,
      status: 'failed',
      moves: state.moves + 1,
      reason: 'A stone wall blocks your path.'
    };
  }

  // Eating check
  const eating = state.apples.some(a => same(a, head));

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

  // Remove eaten apple
  const newApples = eating
    ? state.apples.filter(a => !same(a, head))
    : state.apples;

  const newMoves = state.moves + 1;

  // Move limit check
  if (newMoves > level.moveLimit) {
    return {
      ...state,
      status: 'failed',
      worm: newWorm,
      apples: newApples,
      moves: newMoves,
      reason: 'Move limit exceeded. Try a more efficient path!'
    };
  }

  // Portal check
  const portalReady = newApples.length === 0 && same(head, level.portal);

  return {
    ...state,
    worm: newWorm,
    apples: newApples,
    moves: newMoves,
    score: state.score + (eating ? 10 : 0),
    status: portalReady ? 'completed' : 'playing',
    reason: eating ? 'Apple collected!' : portalReady ? 'Portal reached!' : ''
  };
}

export const initialState = level => ({
  worm: level.worm.map(p => [...p]),
  apples: level.apples.map(p => [...p]),
  moves: 0,
  score: 0,
  status: 'playing',
  reason: ''
});

// Helper for getting valid moves from a position
export function getValidMoves(pos, worm, apples, walls, size, moveLimit, currentMoves) {
  const moves = [];
  const directions = [
    { name: 'up', delta: [0, -1] },
    { name: 'down', delta: [0, 1] },
    { name: 'left', delta: [-1, 0] },
    { name: 'right', delta: [1, 0] }
  ];

  for (const dir of directions) {
    const nextPos = [pos[0] + dir.delta[0], pos[1] + dir.delta[1]];

    // Bounds
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] >= size || nextPos[1] >= size) continue;

    // Walls
    if (walls.some(w => same(w, nextPos))) continue;

    // Body (exclude tail)
    const eating = apples.some(a => same(a, nextPos));
    const body = eating ? worm : worm.slice(0, -1);
    if (body.some(b => same(b, nextPos))) continue;

    moves.push({ direction: dir.name, position: nextPos, eating });
  }

  return moves;
}

// Check if a state is winnable (has path to all apples then portal)
export function isWinnable(state, level) {
  // Simple check: can reach at least one apple or portal
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

  const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

  while (queue.length > 0) {
    const current = queue.shift();

    if (same(current, goal)) return true;

    for (const [dx, dy] of directions) {
      const next = [current[0] + dx, current[1] + dy];

      if (next[0] < 0 || next[1] < 0 || next[0] >= level.size || next[1] >= level.size) continue;
      if (visited.has(key(next))) continue;
      if (level.walls.some(w => same(w, next))) continue;

      const eating = state.apples.some(a => same(a, next));
      const body = eating ? state.worm : state.worm.slice(0, -1);
      if (body.some(b => same(b, next))) continue;

      visited.add(key(next));
      queue.push(next);
    }
  }

  return false;
}