import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function middleware(request: NextRequest) {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const rawHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS;

  // Só tenta logar se as variáveis existirem e não for um arquivo estático
  if (endpoint && rawHeaders && rawHeaders.includes('=')) {
    const [key, ...valueParts] = rawHeaders.split('=');
    const value = valueParts.join('=');

    // Executa o fetch sem "await" para não atrasar a resposta ao usuário
    fetch(`${endpoint}/v1/logs`, {
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
    }).catch(() => {}); // Ignora erros de rede silenciosamente
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|favicon.png|.*\\.png$|.*\\.jpg$).*)'],
};
