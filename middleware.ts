import { NextRequest, NextResponse, type NextFetchEvent } from 'next/server';

export const runtime = 'edge';

async function logToKubiks(data: any) {
  // 1. Verificação ultra-segura das envs
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const rawHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS;

  if (!endpoint || !rawHeaders || !rawHeaders.includes('=')) {
    console.warn('Kubiks: Configurações ausentes ou inválidas.');
    return;
  }

  try {
    const [key, ...valueParts] = rawHeaders.split('=');
    const value = valueParts.join('=');

    // 2. Timeout para não travar a execução
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

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
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

  } catch (error) {
    // Silencia o erro para não derrubar o middleware
    console.error('Kubiks silent error:', error);
  }
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

    const networkData = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      path: request.nextUrl.pathname,
      userAgent: request.headers.get('user-agent'),
      clientIp: clientIp,
    };

    // Usa waitUntil para rodar em background
    event.waitUntil(logToKubiks(networkData));

  } catch (e) {
    console.error('Middleware internal error:', e);
  }

  // SEMPRE retorna o next(), independente de erro no log
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Garante que não capture arquivos estáticos nem a própria API
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
};
