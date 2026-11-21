import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createHash, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILE = path.resolve(ROOT, '..', '..', '..', '.env');

if (process.env.ENV_FILE !== 'none' && fs.existsSync(ENV_FILE)) {
  process.loadEnvFile(ENV_FILE);
}

const PORT = Number(process.env.PORT) || 4173;
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const TYPES = new Set(['All', 'Positive', 'Negative', 'Boundary', 'Edge', 'Functional', 'UI / Validation']);
const CASE_TYPES = new Set(['Positive', 'Negative', 'Boundary', 'Edge', 'Functional', 'UI / Validation']);
const PRIORITIES = new Set(['All', 'High', 'Medium', 'Low']);
const CASE_PRIORITIES = new Set(['High', 'Medium', 'Low']);
const FILES = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
};

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20000) throw Object.assign(new Error('Request is too large.'), { status: 413 });
  }
  try {
    return JSON.parse(raw || '{}');
  } catch {
    throw Object.assign(new Error('Request must contain valid JSON.'), { status: 400 });
  }
}

function requestConfig(input) {
  const supplied = input && typeof input === 'object' && input.config && typeof input.config === 'object'
    ? input.config
    : {};
  const value = (name) => {
    const candidate = supplied[name];
    if (Object.hasOwn(supplied, name)) {
      if (typeof candidate !== 'string' || candidate.length > 4096) {
        throw Object.assign(new Error(`${name} must be a string no longer than 4,096 characters.`), { status: 400 });
      }
      if (candidate.trim()) return candidate.trim();
    }
    return process.env[name] || '';
  };
  return {
    GROQ_API_KEY: value('GROQ_API_KEY'),
    JIRA_BASE_URL: value('JIRA_BASE_URL'),
    JIRA_EMAIL: value('JIRA_EMAIL'),
    JIRA_TOKEN: value('JIRA_TOKEN'),
  };
}

function jiraConfig(config = process.env) {
  const configuredUrl = (config.JIRA_BASE_URL || '').trim();
  const email = config.JIRA_EMAIL || '';
  const token = config.JIRA_TOKEN || '';
  if (!configuredUrl || !email || !token) throw Object.assign(new Error('Configure JIRA_BASE_URL, JIRA_EMAIL, and JIRA_TOKEN in Settings or the server environment.'), { status: 400 });
  let url;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw Object.assign(new Error('Set JIRA_BASE_URL to your Atlassian site URL.'), { status: 400 });
  }
  if (url.protocol !== 'https:' || url.port || !/^[a-z0-9-]+\.atlassian\.net$/i.test(url.hostname)) {
    throw Object.assign(new Error('JIRA_BASE_URL must be an Atlassian Cloud URL.'), { status: 400 });
  }
  return { baseUrl: url.origin, email, token };
}

export function extractJiraTicketKey(value, configuredBaseUrl = process.env.JIRA_BASE_URL) {
  if (/^[A-Z][A-Z0-9]+-\d+$/i.test(value)) return value.toUpperCase();
  if (/^\d+$/.test(value)) return value;
  if (!/^https?:\/\//i.test(value)) return null;

  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const ticketPath = url.pathname.match(/^\/browse\/([A-Z][A-Z0-9]+-\d+)\/?$/i);
  if (!ticketPath) return null;
  let configuredUrl;
  try {
    configuredUrl = new URL(configuredBaseUrl);
  } catch {
    throw Object.assign(new Error('Configure JIRA_BASE_URL before using a Jira issue URL.'), { status: 400 });
  }
  if (url.protocol !== 'https:' || url.host.toLowerCase() !== configuredUrl.host.toLowerCase()) {
    throw Object.assign(new Error('This Jira link does not match the configured Jira site. Use a link from the connected Jira site.'), { status: 400 });
  }
  return ticketPath[1].toUpperCase();
}

function adfToText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(adfToText).join('');
  const children = (node.content || []).map(adfToText).join('');
  if (node.type === 'text') return node.text || '';
  if (node.type === 'hardBreak') return '\n';
  if (node.type === 'paragraph' || node.type === 'heading') return `${children}\n`;
  if (node.type === 'listItem') return `- ${children.trim()}\n`;
  return children;
}

function jiraFieldText(value) {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(jiraFieldText).filter(Boolean).join('\n');
  if (value && typeof value === 'object') {
    if (value.type === 'doc') return adfToText(value).trim();
    return value.value || value.name || '';
  }
  return '';
}

async function externalFetch(url, options, service) {
  try {
    return await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
  } catch (error) {
    const message = error?.name === 'TimeoutError' ? `${service} request timed out.` : `Could not reach ${service}.`;
    throw Object.assign(new Error(message), { status: 502 });
  }
}

async function fetchJiraRequirements(rawKey, config) {
  const key = rawKey.toUpperCase();
  const { baseUrl, email, token } = jiraConfig(config);
  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const response = await externalFetch(
    `${baseUrl}/rest/api/3/issue/${encodeURIComponent(key)}?expand=names`,
    { headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' } },
    'Jira',
  );
  if (!response.ok) {
    const status = response.status === 401 || response.status === 403 ? response.status : response.status === 404 ? 404 : 502;
    const message = status === 401
      ? 'Jira authentication failed. Check the configured email and token.'
      : status === 403
        ? `Jira denied access to ${key}.`
        : status === 404
          ? `Jira ticket ${key} was not found or is not accessible.`
          : `Jira returned HTTP ${response.status} while reading ${key}.`;
    throw Object.assign(new Error(message), { status });
  }
  const issue = await response.json();
  const fields = issue.fields || {};
  const acceptanceCriteria = Object.keys(issue.names || {})
    .filter((id) => /acceptance criteria/i.test(issue.names[id] || ''))
    .map((id) => jiraFieldText(fields[id]))
    .filter(Boolean)
    .join('\n');
  const summary = jiraFieldText(fields.summary);
  const description = jiraFieldText(fields.description);
  if (!summary && !description && !acceptanceCriteria) {
    throw Object.assign(new Error(`Jira ticket ${key} has no readable summary, description, or acceptance criteria.`), { status: 422 });
  }
  const requirements = [
    `Ticket: ${key}`,
    summary && `Summary: ${summary}`,
    description && `Description:\n${description}`,
    acceptanceCriteria && `Acceptance Criteria:\n${acceptanceCriteria}`,
  ].filter(Boolean).join('\n\n');
  return {
    key,
    summary,
    requirements,
    url: `${baseUrl}/browse/${encodeURIComponent(key)}`,
  };
}

async function groqFetch(pathname, options = {}, config = process.env) {
  const key = config.GROQ_API_KEY;
  if (!key) throw Object.assign(new Error('Configure GROQ_API_KEY in Settings or the server environment.'), { status: 400 });
  const response = await externalFetch(`https://api.groq.com/openai/v1${pathname}`, {
    ...options,
    headers: { Authorization: `Bearer ${key}`, ...(options.headers || {}) },
  }, 'Groq');
  if (!response.ok) {
    const status = response.status === 401 || response.status === 403 ? 401 : response.status === 429 ? 429 : 502;
    throw Object.assign(new Error(status === 401 ? 'Groq rejected the configured API key.' : status === 429 ? 'Groq rate limit reached. Try again shortly.' : `Groq returned HTTP ${response.status}.`), { status });
  }
  return response;
}

export function validateCases(payload, requirements, maxCount, requestedType, requestedPriority) {
  if (!payload || !Array.isArray(payload.testCases) || payload.testCases.length === 0) {
    throw Object.assign(new Error('The AI response did not contain any test cases. Please try again.'), { status: 502 });
  }
  return payload.testCases.slice(0, maxCount).map((item, index) => {
    const text = (value) => typeof value === 'string' ? value.trim() : '';
    const steps = Array.isArray(item.steps) ? item.steps.map(text).filter(Boolean) : [];
    const testCase = {
      id: `TC_${String(index + 1).padStart(3, '0')}`,
      requirementReference: text(item.requirementReference) || 'Not specified',
      summary: text(item.summary),
      preconditions: text(item.preconditions),
      testData: text(item.testData),
      steps,
      expectedResult: text(item.expectedResult),
      priority: text(item.priority),
      testType: text(item.testType),
      status: 'Not Run',
    };
    if (!testCase.summary || steps.length === 0 || !testCase.expectedResult) {
      throw Object.assign(new Error('The AI response contained an incomplete test case. Please try again.'), { status: 502 });
    }
    if (!requirements.includes(testCase.requirementReference)) {
      throw Object.assign(new Error('The AI returned a test case without an exact matching requirement reference. Please try again.'), { status: 502 });
    }
    if (!CASE_TYPES.has(testCase.testType) || (requestedType !== 'All' && testCase.testType !== requestedType)) {
      throw Object.assign(new Error('The AI returned an invalid or unrequested test type. Please try again.'), { status: 502 });
    }
    if (requestedPriority === 'All' && !CASE_PRIORITIES.has(testCase.priority)) {
      throw Object.assign(new Error('The AI returned an invalid priority. Please try again.'), { status: 502 });
    }
    if (requestedPriority !== 'All') testCase.priority = requestedPriority;
    return testCase;
  });
}

function isAuthorized(header, credentials) {
  const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(header || '');
  if (!match) return false;
  const supplied = Buffer.from(match[1], 'base64').toString('utf8');
  const suppliedHash = createHash('sha256').update(supplied).digest();
  const expectedHash = createHash('sha256')
    .update(`${credentials.username}:${credentials.password}`)
    .digest();
  return timingSafeEqual(suppliedHash, expectedHash);
}

function parseModelResponse(content) {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    throw Object.assign(new Error('The AI returned an unreadable response. Please try again.'), { status: 502 });
  }
}

async function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/status') {
    const config = requestConfig();
    sendJson(res, 200, {
      groqConfigured: Boolean(config.GROQ_API_KEY),
      jiraConfigured: Boolean(config.JIRA_BASE_URL && config.JIRA_EMAIL && config.JIRA_TOKEN),
      model: MODEL,
    });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const input = await readJson(req);
  const config = requestConfig(input);

  if (url.pathname === '/api/groq/test') {
    const response = await groqFetch('/models', {}, config);
    const data = await response.json();
    const available = (data.data || []).some((model) => model.id === MODEL);
    if (!available) throw Object.assign(new Error(`Groq is connected, but model ${MODEL} is unavailable for this API key.`), { status: 400 });
    sendJson(res, 200, { message: `Groq connected · ${MODEL}` });
    return;
  }

  if (url.pathname === '/api/jira/test') {
    const { baseUrl, email, token } = jiraConfig(config);
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    const response = await externalFetch(`${baseUrl}/rest/api/3/myself`, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
    }, 'Jira');
    if (!response.ok) {
      const status = response.status === 401 || response.status === 403 ? response.status : 502;
      throw Object.assign(new Error(status === 401 ? 'Jira authentication failed. Check the configured email and token.' : status === 403 ? 'Jira denied access to this account.' : `Jira returned HTTP ${response.status}.`), { status });
    }
    const user = await response.json();
    sendJson(res, 200, { message: `Jira connected · ${user.displayName || 'account verified'}` });
    return;
  }

  if (url.pathname === '/api/generate') {
    const submitted = typeof input.requirements === 'string' ? input.requirements.trim() : '';
    const count = Number(input.count);
    const type = TYPES.has(input.testType) ? input.testType : null;
    const priority = PRIORITIES.has(input.priority) ? input.priority : null;
    if (!submitted || submitted.length > 5000) {
      throw Object.assign(new Error('Enter requirements (up to 5,000 characters).'), { status: 400 });
    }
    if (!Number.isInteger(count) || count < 1 || count > 12 || !type || !priority) {
      throw Object.assign(new Error('Choose a valid test type, priority, and case count.'), { status: 400 });
    }
    const ticketKey = extractJiraTicketKey(submitted, config.JIRA_BASE_URL);
    const source = ticketKey ? await fetchJiraRequirements(ticketKey, config) : null;
    const requirements = source ? source.requirements : submitted;
    const messages = [
      {
        role: 'system',
        content: `You are a senior QA test designer. Use only facts in the supplied requirement. Never invent business rules, UI, APIs, test data, preconditions, or behavior. Generate only scenarios directly supported by the requirement; the requested count is a maximum, not a quota. Return fewer cases rather than adding unsupported scenarios. Do not split broad phrases (for example, "invalid credentials") into specific subtypes unless those subtypes are named in the requirement. Use an exact requirement ID or verbatim excerpt for requirementReference; never paraphrase it. Use placeholders instead of fabricated concrete test data. If a necessary detail is missing, put exactly "Insufficient information to determine." in the relevant field and explain it under ambiguities. Any inference must be labeled exactly "Inference (low confidence)". Avoid duplicates. Use only these specific test types: Positive, Negative, Boundary, Edge, Functional, UI / Validation. When type is "All", classify the actual scenario (for example, a valid flow is Positive and an explicitly rejected flow is Negative); never output "All". When priority is "All", base it only on stated business impact; if impact is missing, use Medium and mention the gap under ambiguities. Return only a JSON object with this shape: {"testCases":[{"requirementReference":"...","summary":"...","preconditions":"...","testData":"...","steps":["..."],"expectedResult":"...","priority":"High|Medium|Low","testType":"..."}],"ambiguities":["..."],"coverageSummary":"..."}.`,
      },
      {
        role: 'user',
        content: JSON.stringify({ requirements, requestedCount: count, testType: type, priority }),
      },
    ];
    const response = await groqFetch('/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, temperature: 0, seed: 42, response_format: { type: 'json_object' }, messages }),
    }, config);
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw Object.assign(new Error('Groq returned an empty response.'), { status: 502 });
    const parsed = parseModelResponse(content);
    sendJson(res, 200, {
      testCases: validateCases(parsed, requirements, count, type, priority),
      ambiguities: Array.isArray(parsed.ambiguities) ? parsed.ambiguities.filter((item) => typeof item === 'string') : [],
      coverageSummary: typeof parsed.coverageSummary === 'string' ? parsed.coverageSummary : '',
      source: source ? { key: source.key, summary: source.summary, url: source.url } : null,
    });
    return;
  }

  if (url.pathname === '/api/jira/create') {
    const { baseUrl, email, token } = jiraConfig(config);
    const projectKey = typeof input.projectKey === 'string' ? input.projectKey.trim().toUpperCase() : '';
    const cases = Array.isArray(input.testCases) ? input.testCases.slice(0, 12) : [];
    if (!/^[A-Z][A-Z0-9_]{1,9}$/.test(projectKey) || cases.length === 0) {
      throw Object.assign(new Error('Enter a valid Jira project key and select generated test cases.'), { status: 400 });
    }
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    const created = [];
    for (const item of cases) {
      const summary = typeof item.summary === 'string' ? item.summary.trim().slice(0, 250) : '';
      if (!summary) continue;
      const description = [
        `Test case: ${item.id || ''}`,
        `Type: ${item.testType || ''} · Priority: ${item.priority || ''}`,
        `Preconditions: ${item.preconditions || ''}`,
        `Test data: ${item.testData || ''}`,
        `Steps: ${(Array.isArray(item.steps) ? item.steps : []).join('\n')}`,
        `Expected result: ${item.expectedResult || ''}`,
        `Requirement reference: ${item.requirementReference || 'Not specified'}`,
      ].join('\n\n');
      const response = await externalFetch(`${baseUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            project: { key: projectKey },
            summary: `[${item.id || 'Test Case'}] ${summary}`.slice(0, 255),
            issuetype: { name: 'Task' },
            description: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: description }] }] },
          },
        }),
      }, 'Jira');
      if (!response.ok) {
        const status = response.status === 401 || response.status === 403 ? response.status : 502;
        throw Object.assign(new Error(status === 401 ? 'Jira authentication failed.' : status === 403 ? 'Jira denied issue creation.' : `Jira issue creation failed (HTTP ${response.status}); ${created.length} issue(s) were created before the failure.`), { status });
      }
      const issue = await response.json();
      created.push({ key: issue.key, url: `${baseUrl}/browse/${encodeURIComponent(issue.key)}` });
    }
    sendJson(res, 200, { created });
    return;
  }

  sendJson(res, 404, { error: 'Not found.' });
}

export function createServer({
  username = process.env.APP_USERNAME || '',
  password = process.env.APP_PASSWORD || '',
  requireAuth = process.env.NODE_ENV === 'production',
} = {}) {
  if (Boolean(username) !== Boolean(password)) {
    throw new Error('Both APP_USERNAME and APP_PASSWORD must be configured together.');
  }
  if (username.includes(':')) {
    throw new Error('APP_USERNAME cannot contain a colon.');
  }
  if (password && password.length < 16) {
    throw new Error('APP_PASSWORD must contain at least 16 characters.');
  }
  const credentials = username ? { username, password } : null;
  if (requireAuth && !credentials) {
    throw new Error('APP_USERNAME and APP_PASSWORD are required when NODE_ENV is production.');
  }

  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end('ok');
        return;
      }
      if (credentials && !isAuthorized(req.headers.authorization, credentials)) {
        res.writeHead(401, {
          'WWW-Authenticate': 'Basic realm="Test Case Generator", charset="UTF-8"',
          'Cache-Control': 'no-store',
        });
        res.end('Authentication required.');
        return;
      }
      if (url.pathname.startsWith('/api/')) {
        await handleApi(req, res, url);
        return;
      }
      if (req.method !== 'GET' || !FILES[url.pathname]) {
        res.writeHead(404);
        res.end('Not found.');
        return;
      }
      const [filename, contentType] = FILES[url.pathname];
      res.writeHead(200, {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(path.join(ROOT, filename)).pipe(res);
    } catch (error) {
      if (res.headersSent) {
        res.destroy(error);
        return;
      }
      sendJson(res, error.status || 500, { error: error.message || 'An unexpected server error occurred.' });
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
  createServer().listen(PORT, host, () => {
    console.log(`Test Case Generator running at http://localhost:${PORT}`);
  });
}
