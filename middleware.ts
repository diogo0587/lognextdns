import { NextRequest, NextResponse } from 'next/server';

// Função para enviar logs para Kubiks
async function logToKubiks(data: any) {
  try {
    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://ingest.kubiks.app';
    const headersEnv = process.env.OTEL_EXPORTER_OTLP_HEADERS || '';
    
    // Parse headers safely
    const headersParsed: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (headersEnv) {
      const [key, value] = headersEnv.split('=');
      if (key && value) {
        headersParsed[key] = value;
      }
    }
    
    await fetch(`${endpoint}/v1/logs`, {
      method: 'POST',
      headers: headersParsed,
      body: JSON.stringify({
        resourceLogs: [{
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: 'lognextdns' } },
            ],
          },
          scopeLogs: [{
            scope: { name: 'vercel-network-logger' },
            logRecords: [{
              timeUnixNano: Date.now() * 1000000,
              body: { stringValue: JSON.stringify(data) },
              severityNumber: 9, // INFO
              severityText: 'INFO',
              attributes: [
                { key: 'environment', value: { stringValue: process.env.VERCEL_ENV || 'unknown' } },
                { key: 'deployment', value: { stringValue: process.env.VERCEL_DEPLOYMENT_ID || 'unknown' } },
              ],
            }],
          }],
        }],
      }),
    }).catch((err) => {
      console.error('Failed to log to Kubiks:', err);
    });
  } catch (error) {
    console.error('Error in logToKubiks:', error);
  }
}

export async function middleware(request: NextRequest) {
  // Capturar informações do request
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  const networkData = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    path: request.nextUrl.pathname,
    host: request.headers.get('host'),
    userAgent: request.headers.get('user-agent'),
    clientIp: clientIp,
    referer: request.headers.get('referer') || 'direct',
    contentType: request.headers.get('content-type'),
    contentLength: request.headers.get('content-length'),
    acceptEncoding: request.headers.get('accept-encoding'),
    acceptLanguage: request.headers.get('accept-language'),
  };

  // Enviar log para Kubiks de forma assíncrona
  logToKubiks(networkData);

  // Continuar com o request normal
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
