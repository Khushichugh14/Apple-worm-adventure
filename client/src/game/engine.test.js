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

test('step detects garden boundary collision on all sides', () => {
  const edgeLevel = {
    size: 4,
    moveLimit: 10,
    worm: [[0, 0], [0, 1]],
    apples: [],
    walls: [],
    portal: [3, 3]
  };

  // Top boundary
  const stateTop = initialState(edgeLevel);
  const failTop = step(stateTop, 'up', edgeLevel);
  assert.equal(failTop.status, 'failed');
  assert.match(failTop.reason, /garden/i);

  // Left boundary
  const failLeft = step(stateTop, 'left', edgeLevel);
  assert.equal(failLeft.status, 'failed');
  assert.match(failLeft.reason, /garden/i);

  // Right boundary
  const rightLevel = { ...edgeLevel, worm: [[3, 0], [2, 0]] };
  const failRight = step(initialState(rightLevel), 'right', rightLevel);
  assert.equal(failRight.status, 'failed');
  assert.match(failRight.reason, /garden/i);

  // Bottom boundary
  const bottomLevel = { ...edgeLevel, worm: [[0, 3], [0, 2]] };
  const failBottom = step(initialState(bottomLevel), 'down', bottomLevel);
  assert.equal(failBottom.status, 'failed');
  assert.match(failBottom.reason, /garden/i);
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
  // Head is at [2, 2]. Body segment at [2, 3] is not the tail. Moving down tries to hit [2, 3]
  const next = step(state, 'down', selfLevel);
  assert.equal(next.status, 'failed');
  assert.match(next.reason, /tail/i);
});

test('worm can safely step into its own tail position when not eating', () => {
  // Loop configuration: worm forms a U-turn where moving forward enters the tile vacated by the tail
  const loopLevel = {
    size: 5,
    moveLimit: 10,
    worm: [[2, 2], [2, 3], [1, 3], [1, 2]],
    apples: [],
    walls: [],
    portal: [4, 4]
  };
  const state = initialState(loopLevel);
  // Head is at [2, 2]. Moving left aims for [1, 2], which is the current tail position.
  // Because no apple is eaten, tail vacates [1, 2] simultaneously!
  const next = step(state, 'left', loopLevel);
  assert.equal(next.status, 'playing');
  assert.deepEqual(next.worm[0], [1, 2]);
  assert.deepEqual(next.worm[next.worm.length - 1], [1, 3]);
});

test('worm cannot step into tail position if simultaneously eating an apple (tail does not vacate)', () => {
  const loopLevelWithApple = {
    size: 5,
    moveLimit: 10,
    worm: [[2, 2], [2, 3], [1, 3], [1, 2]],
    apples: [[1, 2]], // Apple placed on tail position
    walls: [],
    portal: [4, 4]
  };
  const state = initialState(loopLevelWithApple);
  const next = step(state, 'left', loopLevelWithApple);
  assert.equal(next.status, 'failed');
  assert.match(next.reason, /tail/i);
});

test('entering portal with apples remaining does not complete the level', () => {
  const lockedPortalLevel = {
    size: 6,
    moveLimit: 10,
    worm: [[4, 5], [3, 5]],
    apples: [[1, 1]], // 1 apple remaining!
    walls: [],
    portal: [5, 5]
  };
  const state = initialState(lockedPortalLevel);
  const next = step(state, 'right', lockedPortalLevel); // Moves onto portal [5, 5]
  assert.equal(next.status, 'playing'); // Still playing because apples remaining > 0!
  assert.notEqual(next.status, 'completed');
});

test('invalid direction input returns unchanged state', () => {
  const state = initialState(mockLevel);
  const next = step(state, 'diagonal_up_left', mockLevel);
  assert.equal(next, state);
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
