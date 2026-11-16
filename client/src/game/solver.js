import { step, same } from './engine.js';

const DIRECTIONS = ['up', 'down', 'left', 'right'];

function stateKey(state) {
  const w = state.worm.map(p => `${p[0]},${p[1]}`).join('|');
  const a = [...state.apples].map(p => `${p[0]},${p[1]}`).sort().join(';');
  const k = [...(state.keys || [])].map(p => `${p[0]},${p[1]}`).sort().join(';');
  const d = (state.doors || []).length;
  const g = (state.grass || []).length;
  const t = (state.treasure || []).length;
  const sb = (state.stoneBlocks || []).map(s => `${s.pos[0]},${s.pos[1]}:${s.hits}`).sort().join(';');
  const c = (state.crates || []).length;
  const b = (state.movingBlocks || []).length;
  return `${w}#${a}#${k}#${d}#${g}#${t}#${sb}#${c}#${b}`;
}

export function findNextHint(state, level, maxExplored = 12000) {
  if (!state || state.status !== 'playing' || !state.worm || !state.worm.length) return null;

  const targets = state.apples.length > 0 ? state.apples : [level.portal];
  const targetLabel = state.apples.length > 0 ? 'the next apple' : 'the portal';

  const startKey = stateKey(state);
  const visited = new Set([startKey]);
  const queue = [];

  for (const dir of DIRECTIONS) {
    const next = step(state, dir, level);
    if (next === state) continue;
    const k = stateKey(next);
    if (visited.has(k)) continue;
    visited.add(k);
    const path = [next.worm[0]];
    if (next.status === 'completed') {
      return { nextDirection: dir, target: level.portal, targetLabel: 'the portal', distance: 1, path };
    }
    if (next.status === 'playing') {
      queue.push({ state: next, firstDir: dir, path, moves: 1 });
    }
  }

  let qi = 0;
  while (qi < queue.length && visited.size < maxExplored) {
    const cur = queue[qi++];
    if (cur.moves > level.moveLimit) continue;

    // Early win: if all apples eaten and head adjacent to portal in path sense? completion only when stepping on portal.
    // Check if current head is on any target for display? targets are apples/portal; stepping on apple consumes it, stepping on portal completes.
    // So we rely on step results.
    for (const dir of DIRECTIONS) {
      const next = step(cur.state, dir, level);
      if (next === cur.state) continue;
      const nk = stateKey(next);
      if (visited.has(nk)) continue;
      visited.add(nk);

      const npath = [...cur.path, next.worm[0]];
      if (next.status === 'completed') {
        return { nextDirection: cur.firstDir, target: level.portal, targetLabel: 'the portal', distance: cur.moves + 1, path: npath };
      }
      if (next.status === 'failed') continue;

      // If we just ate an apple or reached interesting state, can report target as that apple position.
      const ateApple = next.apples.length < cur.state.apples.length;
      if (ateApple) {
        const eaten = cur.state.apples.find(a => !next.apples.some(b => same(a, b))) || next.worm[0];
        return { nextDirection: cur.firstDir, target: eaten, targetLabel: 'the next apple', distance: cur.moves + 1, path: npath };
      }
      queue.push({ state: next, firstDir: cur.firstDir, path: npath, moves: cur.moves + 1 });
    }
  }

  // Fallback: nearest reachable apple/portal by simple BFS ignoring body dynamics? keep null to avoid wrong hint.
  return null;
}
