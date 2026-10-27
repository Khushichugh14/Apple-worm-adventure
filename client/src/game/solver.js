import { same } from './engine.js';

const DIRECTIONS = [
  { name: 'up', delta: [0, -1] },
  { name: 'down', delta: [0, 1] },
  { name: 'left', delta: [-1, 0] },
  { name: 'right', delta: [1, 0] }
];

export function findNextHint(state, level) {
  if (!state || state.status !== 'playing' || !state.worm || !state.worm.length) {
    return null;
  }

  const head = state.worm[0];
  const targets = state.apples.length > 0 ? state.apples : [level.portal];
  const targetLabel = state.apples.length > 0 ? 'the next apple' : 'the portal';

  // BFS Queue: [x, y, pathOfCoords, firstDirection]
  const queue = [];
  const visited = new Set();
  const key = p => `${p[0]},${p[1]}`;

  visited.add(key(head));

  for (const dir of DIRECTIONS) {
    const nx = head[0] + dir.delta[0];
    const ny = head[1] + dir.delta[1];
    const nextPos = [nx, ny];

    // Bounds check
    if (nx < 0 || ny < 0 || nx >= level.size || ny >= level.size) continue;
    // Wall check
    if (level.walls.some(w => same(w, nextPos))) continue;
    // Body check (exclude tail because it will move forward unless head is eating)
    const body = state.apples.some(a => same(a, nextPos)) ? state.worm : state.worm.slice(0, -1);
    if (body.some(b => same(b, nextPos))) continue;

    visited.add(key(nextPos));
    queue.push({ pos: nextPos, path: [nextPos], firstDir: dir.name });
  }

  while (queue.length > 0) {
    const { pos, path, firstDir } = queue.shift();

    // Check if reached any target
    const reachedTarget = targets.find(t => same(t, pos));
    if (reachedTarget) {
      return {
        nextDirection: firstDir,
        target: reachedTarget,
        targetLabel,
        distance: path.length,
        path
      };
    }

    for (const dir of DIRECTIONS) {
      const nx = pos[0] + dir.delta[0];
      const ny = pos[1] + dir.delta[1];
      const nextPos = [nx, ny];

      if (nx < 0 || ny < 0 || nx >= level.size || ny >= level.size) continue;
      if (visited.has(key(nextPos))) continue;
      if (level.walls.some(w => same(w, nextPos))) continue;

      visited.add(key(nextPos));
      queue.push({
        pos: nextPos,
        path: [...path, nextPos],
        firstDir
      });
    }
  }

  return null;
}
