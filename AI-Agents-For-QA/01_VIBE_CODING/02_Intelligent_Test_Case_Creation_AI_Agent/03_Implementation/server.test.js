import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer, extractJiraTicketKey, validateCases } from './server.js';

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

test('serves the app and rejects paths outside its asset list', async () => {
  const page = await fetch(origin);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Turn requirements into test cases/);
  assert.equal((await fetch(`${origin}/server.js`)).status, 404);
  assert.equal((await fetch(`${origin}/../package.json`)).status, 404);
});

test('requires authentication for the app and API while keeping the health check public', async () => {
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
    const page = await fetch(protectedOrigin);
    assert.equal(page.status, 401);
    assert.match(page.headers.get('www-authenticate'), /^Basic /);
    assert.equal((await fetch(`${protectedOrigin}/api/status`)).status, 401);
    assert.equal((await fetch(`${protectedOrigin}/health`)).status, 200);

    const authorization = `Basic ${Buffer.from('test-user:a-long-test-password').toString('base64')}`;
    const authenticatedPage = await fetch(protectedOrigin, { headers: { Authorization: authorization } });
    assert.equal(authenticatedPage.status, 200);
  } finally {
    await new Promise((resolve, reject) => protectedServer.close((error) => error ? reject(error) : resolve()));
  }
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

test('rejects empty or oversized generation requests before contacting Groq', async () => {
  for (const requirements of ['', 'x'.repeat(5001)]) {
    const response = await fetch(`${origin}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirements, count: 5, testType: 'All', priority: 'All' }),
    });
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /requirements/i);
  }
});

test('rejects invalid generation options before contacting Groq', async () => {
  const response = await fetch(`${origin}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirements: 'A feature.', count: 50, testType: 'Unknown', priority: 'All' }),
  });
  assert.equal(response.status, 400);
});

test('caps case count, forces a selected priority, and requires grounded references', () => {
  const requirement = 'Registered users can sign in with valid credentials.';
  const cases = [
    { requirementReference: requirement, summary: 'Valid sign in', steps: ['Submit credentials'], expectedResult: 'Sign in succeeds', priority: 'High', testType: 'Positive' },
    { requirementReference: requirement, summary: 'Second case', steps: ['Try again'], expectedResult: 'Sign in succeeds', priority: 'Low', testType: 'Positive' },
  ];
  const result = validateCases({ testCases: cases }, requirement, 1, 'All', 'Medium');
  assert.equal(result.length, 1);
  assert.equal(result[0].priority, 'Medium');
  assert.throws(() => validateCases({
    testCases: [{ ...cases[0], requirementReference: 'A paraphrase.' }],
  }, requirement, 1, 'All', 'All'), /exact matching requirement reference/);
  assert.throws(() => validateCases({
    testCases: [{ ...cases[0], testType: 'All' }],
  }, requirement, 1, 'All', 'All'), /invalid or unrequested test type/);
});

test('extracts Jira keys from keys and same-site issue URLs', () => {
  assert.equal(extractJiraTicketKey('qa-123'), 'QA-123');
  assert.equal(extractJiraTicketKey('123'), '123');
  assert.equal(extractJiraTicketKey('https://example.atlassian.net/browse/qa-123?focusedCommentId=1', 'https://example.atlassian.net'), 'QA-123');
  assert.equal(extractJiraTicketKey('Please test login'), null);
  assert.throws(() => extractJiraTicketKey('https://other.atlassian.net/browse/QA-123', 'https://example.atlassian.net'), /does not match the configured Jira site/);
});

test('resolves a Jira ticket key into requirement text before calling Groq', async () => {
  const originalFetch = globalThis.fetch;
  let promptContent = '';
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('/rest/api/3/issue/QA-123')) {
      assert.equal(options.headers.Authorization, `Basic ${Buffer.from('qa@example.test:fake-jira-token').toString('base64')}`);
      return Response.json({
        key: 'QA-123',
        names: { customfield_1: 'Acceptance Criteria' },
        fields: {
          summary: 'Sign in',
          description: {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Registered users can sign in.' }] }],
          },
          customfield_1: 'Invalid credentials show a message.',
        },
      });
    }
    if (String(url).includes('api.groq.com')) {
      assert.equal(options.headers.Authorization, 'Bearer fake-groq-key');
      const request = JSON.parse(options.body);
      promptContent = request.messages[1].content;
      return Response.json({
        choices: [{
          message: {
            content: JSON.stringify({
              testCases: [{
                requirementReference: 'Registered users can sign in.',
                summary: 'Verify a registered user can sign in',
                preconditions: 'A registered user is available.',
                testData: '<registered_user_credentials>',
                steps: ['Submit registered user credentials.'],
                expectedResult: 'The user signs in.',
                priority: 'Medium',
                testType: 'Positive',
              }],
              ambiguities: [],
              coverageSummary: 'One case generated.',
            }),
          },
        }],
      });
    }
    throw new Error('Unexpected network request.');
  };
  try {
    const response = await originalFetch(`${origin}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirements: 'https://example.atlassian.net/browse/qa-123',
        count: 1,
        testType: 'All',
        priority: 'All',
        config: {
          GROQ_API_KEY: 'fake-groq-key',
          JIRA_BASE_URL: 'https://example.atlassian.net',
          JIRA_EMAIL: 'qa@example.test',
          JIRA_TOKEN: 'fake-jira-token',
        },
      }),
    });
    const body = await response.json();
    assert.equal(response.status, 200, body.error);
    assert.equal(body.source.key, 'QA-123');
    assert.match(promptContent, /Summary: Sign in/);
    assert.match(promptContent, /Acceptance Criteria:/);
    assert.match(promptContent, /Invalid credentials show a message\./);
    assert.equal(body.testCases.length, 1);
    assert.doesNotMatch(JSON.stringify(body), /fake-groq-key|fake-jira-token/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
