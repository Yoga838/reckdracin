import server from '../dist/server/server.js';

export default async function handler(request: Request) {
  const url = new URL(request.url);
  
  // Reconstruct original path from x-matched-path header (Vercel rewrite source)
  const originalPath = request.headers.get('x-matched-path') || url.pathname;
  
  // Reconstruct host and protocol
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('x-forwarded-host') || url.host;
  
  const reconstructedUrl = new URL(originalPath + url.search, `${proto}://${host}`);

  // Construct request init options
  const init: RequestInit = {
    method: request.method,
    headers: request.headers,
  };

  // Only forward body if there is one and the method supports it
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
    init.body = request.body;
    // @ts-ignore
    init.duplex = 'half';
  }

  const reconstructedRequest = new Request(reconstructedUrl.toString(), init);

  return server.fetch(reconstructedRequest, {}, {});
}
