import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';

export const runtime = 'edge';

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const rawHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS;

  if (endpoint && rawHeaders?.includes('=')) {
    const [key, ...valueParts] = rawHeaders.split('=');
    const value = valueParts.join('=');

    const logPromise = fetch(`${endpoint}/v1/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [key.trim()]: value.trim(),
      },
      body: JSON.stringify({
        resourceLogs: [{
          resource: { attributes: [{ key: 'service.name', value: { stringValue: 'lognextdns' } }] },
          scopeLogs: [{
            logRecords: [{
              timeUnixNano: Date.now() * 1000000,
              body: { stringValue: `Request: ${request.method} ${request.nextUrl.pathname}` },
              attributes: [
                { key: 'user_agent', value: { stringValue: request.headers.get('user-agent') || 'unknown' } },
                { key: 'client_ip', value: { stringValue: request.headers.get('x-forwarded-for') || 'unknown' } }
              ]
            }]
          }]
        }]
      }),
    }).catch(() => {});

    // ESSENCIAL: Mantém a execução viva no Edge sem travar a resposta
    event.waitUntil(logPromise);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|favicon.png|.*\\.png$|.*\\.jpg$).*)'],
};
