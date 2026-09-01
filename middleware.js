export default function middleware(request) {
  const authorization = request.headers.get('authorization');
  const username = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASS;

  if (authorization && username && password) {
    const [scheme, encoded] = authorization.split(' ', 2);

    try {
      const credentials = atob(encoded);
      const separator = credentials.indexOf(':');

      if (
        scheme.toLowerCase() === 'basic' &&
        separator !== -1 &&
        credentials.slice(0, separator) === username &&
        credentials.slice(separator + 1) === password
      ) {
        // This is the response produced by @vercel/functions next().
        return new Response(null, { headers: { 'x-middleware-next': '1' } });
      }
    } catch {
      // Malformed credentials are handled like any other failed login.
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'Cache-Control': 'no-store',
      'WWW-Authenticate': 'Basic realm="Eleos Demo", charset="UTF-8"',
    },
  });
}
