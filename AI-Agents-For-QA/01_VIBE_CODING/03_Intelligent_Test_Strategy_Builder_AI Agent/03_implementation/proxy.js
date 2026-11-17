import { createHash, timingSafeEqual } from 'node:crypto';

function digest(value) {
  return createHash('sha256').update(value).digest();
}

export function authorizeRequest(request, env = process.env) {
  const username = env.APP_USERNAME || '';
  const password = env.APP_PASSWORD || '';
  if (!username || password.length < 16 || username.includes(':')) {
    return new Response('App access is not configured correctly.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(request.headers.get('authorization') || '');
  if (match) {
    const supplied = Buffer.from(match[1], 'base64').toString('utf8');
    const expectedHash = digest(`${username}:${password}`);
    const suppliedHash = digest(supplied);
    if (timingSafeEqual(suppliedHash, expectedHash)) return undefined;
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Test Strategy Builder", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  });
}

export default function proxy(request) {
  return authorizeRequest(request);
}
