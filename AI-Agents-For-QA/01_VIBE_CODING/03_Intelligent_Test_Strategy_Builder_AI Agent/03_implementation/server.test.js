import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from './server.js';
import { authorizeRequest } from './proxy.js';

let server;
let origin;

before(async () => {
  server = createServer({ requireAuth: false });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('serves the app and rejects files outside the static allowlist', async () => {
  const page = await fetch(origin);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Build a clear test strategy/);
  assert.equal((await fetch(`${origin}/server.js`)).status, 404);
});

test('protects production requests and fails closed without configured credentials', async () => {
  assert.throws(() => createServer({ requireAuth: true }), /APP_USERNAME and APP_PASSWORD are required/);
  assert.throws(() => createServer({
    username: 'test-user',
    password: 'short',
    requireAuth: true,
  }), /at least 16 characters/);

  const protectedServer = createServer({
    username: 'test-user',
    password: 'a-long-test-password',
    requireAuth: true,
  });
  await new Promise((resolve) => protectedServer.listen(0, '127.0.0.1', resolve));
  const protectedOrigin = `http://127.0.0.1:${protectedServer.address().port}`;
  try {
    assert.equal((await fetch(protectedOrigin)).status, 401);
    assert.equal((await fetch(`${protectedOrigin}/api/status`)).status, 401);
    const authorization = `Basic ${Buffer.from('test-user:a-long-test-password').toString('base64')}`;
    const response = await fetch(`${protectedOrigin}/api/status`, { headers: { Authorization: authorization } });
    assert.equal(response.status, 200);
  } finally {
    await new Promise((resolve, reject) => protectedServer.close((error) => error ? reject(error) : resolve()));
  }
});

test('Vercel proxy requires configured, valid Basic authentication', async () => {
  const env = { APP_USERNAME: 'test-user', APP_PASSWORD: 'a-long-test-password' };
  const request = new Request('https://example.test/');
  assert.equal(authorizeRequest(request, {}).status, 503);
  assert.equal(authorizeRequest(request, env).status, 401);
  const authorization = `Basic ${Buffer.from('test-user:a-long-test-password').toString('base64')}`;
  assert.equal(authorizeRequest(new Request('https://example.test/', {
    headers: { Authorization: authorization },
  }), env), undefined);
});

test('reports configuration without returning credentials', async () => {
  const response = await fetch(`${origin}/api/status`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(typeof body.groqConfigured, 'boolean');
  assert.equal(typeof body.jiraConfigured, 'boolean');
  assert.equal('groqApiKey' in body, false);
  assert.equal('jiraToken' in body, false);
});

test('rejects missing project information before contacting Groq', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Unexpected external request.'); };
  try {
    const response = await originalFetch(`${origin}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName: '', projectContext: '' }),
    });
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /project name/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('generates a strategy through Groq without exposing secrets', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'test-key-not-real';
  let prompt = '';
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /api\.groq\.com\/openai\/v1\/chat\/completions$/);
    const body = JSON.parse(options.body);
    prompt = body.messages[0].content;
    return Response.json({ choices: [{ message: { content: '# Draft strategy\n\nReview required.' } }] });
  };
  try {
    const response = await originalFetch(`${origin}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName: 'Sample project',
        applicationUrl: 'https://example.test/login',
        projectContext: 'Users can sign in with approved credentials.',
      }),
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.match(body.strategy, /Draft strategy/);
    assert.match(prompt, /URL \(context only\)/);
    assert.match(prompt, /approved credentials/);
    assert.equal(JSON.stringify(body).includes('test-key-not-real'), false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalKey;
  }
});

test('rejects Jira creation with invalid input before contacting Jira', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Unexpected external request.'); };
  try {
    const response = await originalFetch(`${origin}/api/jira/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectKey: 'invalid key', tasks: [] }),
    });
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /project key/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
