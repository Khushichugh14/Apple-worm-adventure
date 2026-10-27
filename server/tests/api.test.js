import test from 'node:test';
import assert from 'node:assert/strict';

test('GET /api/health returns 200 and ok: true', async () => {
  // We can test the Express app directly using a mock request or fetch if running,
  // or using the running server at port 5000:
  const res = await fetch('http://localhost:5000/api/health');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.service, 'apple-worm-adventure-api');
});

test('POST /api/auth/register validates required fields and password length', async () => {
  const res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'notanemail', password: '123' })
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.error, /Enter a name, valid email/i);
});

test('POST /api/auth/login rejects incorrect credentials', async () => {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent_player_12345@test.com', password: 'wrongpassword' })
  });
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.match(data.error, /incorrect/i);
});
