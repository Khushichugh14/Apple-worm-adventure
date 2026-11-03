import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_unit_tests_123456';

const { default: app } = await import('../src/index.js');

let server;
let baseUrl;

before(async () => {
  await new Promise(resolve => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
});

test('GET /api/health returns 200 and ok: true', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.service, 'apple-worm-adventure-api');
});

test('GET /api/player/leaderboard returns leaderboard list and player ranks', async () => {
  const res = await fetch(`${baseUrl}/api/player/leaderboard`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.leaderboard), 'Leaderboard should be an array');
  assert.ok(data.leaderboard.length > 0, 'Leaderboard should have entries');
  assert.ok(data.leaderboard[0].name, 'Leaderboard entries should include names');
  assert.ok(typeof data.leaderboard[0].totalStars === 'number', 'Entries should include totalStars');
});

test('GET /api/economy/config returns economy rules and ad configuration', async () => {
  const res = await fetch(`${baseUrl}/api/economy/config`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.currencyName);
  assert.ok(typeof data.maxRewardedAdsPerDay === 'number');
});

test('POST /api/auth/register validates required fields and password length', async () => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'notanemail', password: '123' })
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.error, /Enter a name, valid email/i);
});

test('POST /api/player/wallet/spend rejects unauthenticated requests', async () => {
  const res = await fetch(`${baseUrl}/api/player/wallet/spend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 30, item: 'APPLE_BOOST' })
  });
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.match(data.error, /Authentication required/i);
});

test('POST /api/player/progress rejects unauthenticated requests', async () => {
  const res = await fetch(`${baseUrl}/api/player/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ levelId: 1, score: 50, moves: 12, stars: 3 })
  });
  assert.equal(res.status, 401);
});
