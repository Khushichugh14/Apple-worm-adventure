import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, step, same } from './engine.js';

const mockLevel = {
  size: 6,
  moveLimit: 10,
  worm: [[2, 2], [1, 2]],
  apples: [[3, 2]],
  walls: [[0, 0], [4, 2]],
  portal: [5, 5]
};

test('initialState initializes worm, apples, moves, and playing status', () => {
  const state = initialState(mockLevel);
  assert.equal(state.status, 'playing');
  assert.equal(state.moves, 0);
  assert.equal(state.score, 0);
  assert.deepEqual(state.worm, [[2, 2], [1, 2]]);
  assert.deepEqual(state.apples, [[3, 2]]);
});

test('step moves worm forward in valid direction', () => {
  const state = initialState(mockLevel);
  const next = step(state, 'down', mockLevel);
  assert.equal(next.status, 'playing');
  assert.equal(next.moves, 1);
  assert.deepEqual(next.worm, [[2, 3], [2, 2]]);
});

test('step handles eating apple: grows worm and increases score', () => {
  const state = initialState(mockLevel);
  const next = step(state, 'right', mockLevel); // Moves head to [3, 2] where apple is
  assert.equal(next.status, 'playing');
  assert.equal(next.apples.length, 0);
  assert.equal(next.worm.length, 3); // Grew from 2 to 3 segments
  assert.deepEqual(next.worm[0], [3, 2]);
  assert.equal(next.score, 10);
});

test('step detects wall collision', () => {
  const state = {
    worm: [[3, 2], [2, 2]],
    apples: [],
    moves: 1,
    score: 10,
    status: 'playing',
    reason: ''
  };
  const next = step(state, 'right', mockLevel); // Moves to [4, 2] which is a wall
  assert.equal(next.status, 'failed');
  assert.match(next.reason, /wall/i);
});

test('step detects garden boundary collision', () => {
  const edgeLevel = {
    size: 4,
    moveLimit: 10,
    worm: [[0, 1]],
    apples: [],
    walls: [],
    portal: [3, 3]
  };
  const state = initialState(edgeLevel);
  const next = step(state, 'left', edgeLevel); // Moves to [-1, 1]
  assert.equal(next.status, 'failed');
  assert.match(next.reason, /garden/i);
});

test('step detects body collision', () => {
  const selfLevel = {
    size: 6,
    moveLimit: 20,
    worm: [[2, 2], [3, 2], [3, 3], [2, 3], [1, 3]],
    apples: [],
    walls: [],
    portal: [5, 5]
  };
  const state = initialState(selfLevel);
  // Head is at [2, 2]. Body segment at [2, 3] is not the tail (tail is at [1, 3]). Moving down tries to hit [2, 3]
  const next = step(state, 'down', selfLevel);
  assert.equal(next.status, 'failed');
  assert.match(next.reason, /tail/i);
});

test('step fails if move limit exceeded', () => {
  const limitedLevel = {
    size: 6,
    moveLimit: 1,
    worm: [[2, 2], [1, 2]],
    apples: [],
    walls: [],
    portal: [5, 5]
  };
  const state = initialState(limitedLevel);
  const move1 = step(state, 'down', limitedLevel);
  assert.equal(move1.status, 'playing');
  const move2 = step(move1, 'down', limitedLevel);
  assert.equal(move2.status, 'failed');
  assert.match(move2.reason, /No moves left/i);
});

test('step completes level when portal reached and all apples are collected', () => {
  const winLevel = {
    size: 6,
    moveLimit: 10,
    worm: [[4, 5], [3, 5]],
    apples: [], // All apples collected
    walls: [],
    portal: [5, 5]
  };
  const state = initialState(winLevel);
  const next = step(state, 'right', winLevel); // Moves to portal [5, 5]
  assert.equal(next.status, 'completed');
  assert.match(next.reason, /Portal reached/i);
});

test('findNextHint calculates shortest path and direction to next apple', async () => {
  const { findNextHint } = await import('./solver.js');
  const level = {
    size: 6,
    worm: [[1, 1], [0, 1]],
    apples: [[1, 3]],
    walls: [[2, 1]],
    portal: [5, 5]
  };
  const state = initialState(level);
  const hint = findNextHint(state, level);
  assert.ok(hint);
  assert.equal(hint.nextDirection, 'down');
  assert.equal(hint.distance, 2);
  assert.deepEqual(hint.target, [1, 3]);
});
