import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';

async function logToKubiks(data: any) {
  try {
    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://ingest.kubiks.app';
    const rawHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS || '';

    // Parsing robusto do header
    if (!rawHeaders.includes('=')) return;
    const [key, ...valueParts] = rawHeaders.split('=');
    const value = valueParts.join('=');

    await fetch(`${endpoint}/v1/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [key.trim()]: value.trim(),
      },
      body: JSON.stringify({
        resourceLogs: [{
          resource: {
            attributes: [{ key: 'service.name', value: { stringValue: 'lognextdns' } }],
          },
          scopeLogs: [{
            scope: { name: 'vercel-network-logger' },
            logRecords: [{
              timeUnixNano: Date.now() * 1000000,
              body: { stringValue: JSON.stringify(data) },
              severityNumber: 9,
              severityText: 'INFO',
              attributes: [
                { key: 'environment', value: { stringValue: process.env.VERCEL_ENV || 'production' } },
              ],
            }],
          }],
        }],
      }),
    });
  } catch (error) {
    console.error('Logging failed:', error);
  }
}

// Adicione o parâmetro 'event' aqui
export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

  const networkData = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    path: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent'),
    clientIp: clientIp,
  };

  // event.waitUntil mantém a função viva após o retorno da resposta
  event.waitUntil(logToKubiks(networkData));

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
