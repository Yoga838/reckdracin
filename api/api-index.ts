import server from '../dist/server/server.js';

export default async function handler(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    
    // Get the matched path from Vercel rewrite
    const originalPath = request.headers.get('x-matched-path') || url.pathname;
    
    // Reconstruct full URL with proper protocol and host
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('x-forwarded-host') || url.host;
    
    const fullUrl = new URL(originalPath + url.search, `${proto}://${host}`);
    
    // Log request for monitoring
    console.log(`[SSR] ${request.method} ${fullUrl.pathname}${fullUrl.search}`);
    
    // Prepare request init with proper body handling
    const init: RequestInit = {
      method: request.method,
      headers: new Headers(request.headers),
    };

    // Only forward body for methods that support it
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
      init.body = request.body;
      // @ts-ignore - Required for streaming responses in Vercel
      init.duplex = 'half';
    }

    // Create new request with reconstructed URL
    const newRequest = new Request(fullUrl.toString(), init);
    
    // Call TanStack Start server entry
    const response = await server.fetch(newRequest, {}, {});
    
    // Clone headers and add security headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('X-Frame-Options', 'DENY');
    responseHeaders.set('X-XSS-Protection', '1; mode=block');
    
    // Return response with proper headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[SSR Handler Error]', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    // Return a user-friendly error page
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Server Error</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            
            .container {
              background: white;
              border-radius: 12px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              padding: 60px 40px;
              max-width: 600px;
              text-align: center;
            }
            
            h1 {
              font-size: 48px;
              font-weight: 700;
              color: #e53e3e;
              margin-bottom: 16px;
              line-height: 1.2;
            }
            
            .subtitle {
              font-size: 18px;
              color: #718096;
              margin-bottom: 24px;
              line-height: 1.6;
            }
            
            .description {
              font-size: 16px;
              color: #4a5568;
              margin-bottom: 32px;
              line-height: 1.8;
            }
            
            .actions {
              display: flex;
              gap: 12px;
              justify-content: center;
              flex-wrap: wrap;
              margin-bottom: 40px;
            }
            
            a {
              display: inline-block;
              padding: 12px 32px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              text-decoration: none;
              transition: all 0.3s ease;
            }
            
            .btn-primary {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            
            .btn-primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }
            
            .btn-secondary {
              background: #edf2f7;
              color: #2d3748;
            }
            
            .btn-secondary:hover {
              background: #e2e8f0;
            }
            
            .error-details {
              background: #f7fafc;
              border-left: 4px solid #e53e3e;
              padding: 16px;
              border-radius: 8px;
              text-align: left;
              font-size: 13px;
              color: #2d3748;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              overflow-x: auto;
              margin-top: 24px;
            }
            
            .error-details p {
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>500</h1>
            <div class="subtitle">Server Error</div>
            <div class="description">
              Oops! Terjadi kesalahan saat memproses request Anda.
              Tim kami sudah dicatat tentang masalah ini dan sedang menginvestigasi.
            </div>
            <div class="actions">
              <a href="/" class="btn-primary">← Kembali ke Beranda</a>
              <a href="/browse" class="btn-secondary">Jelajahi</a>
            </div>
            <div class="error-details">
              <p><strong>Error ID:</strong> ${new Date().getTime()}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    return new Response(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
}
