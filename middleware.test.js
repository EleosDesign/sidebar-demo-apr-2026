import assert from 'node:assert/strict';
import test from 'node:test';

import middleware from './middleware.js';

test('requires the configured Basic Auth credentials', () => {
  delete process.env.BASIC_AUTH_USER;
  delete process.env.BASIC_AUTH_PASS;

  const unconfigured = middleware(new Request('https://example.com'));
  assert.equal(unconfigured.status, 401);

  process.env.BASIC_AUTH_USER = 'demo';
  process.env.BASIC_AUTH_PASS = 'secret:with-colon';

  const unauthorized = middleware(new Request('https://example.com'));
  assert.equal(unauthorized.status, 401);
  assert.match(unauthorized.headers.get('www-authenticate'), /^Basic /);

  const authorized = middleware(
    new Request('https://example.com/assets/app.js', {
      headers: { Authorization: `Basic ${btoa('demo:secret:with-colon')}` },
    }),
  );
  assert.equal(authorized.headers.get('x-middleware-next'), '1');
});
