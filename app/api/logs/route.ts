import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route para receber e processar logs de rede
 * POST /api/logs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const logData = {
      timestamp: new Date().toISOString(),
      ...body,
      clientIp: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
      method: request.method,
      url: request.url,
      environment: process.env.VERCEL_ENV,
      deployment: process.env.VERCEL_DEPLOYMENT_ID,
      project: process.env.VERCEL_PROJECT_ID,
    };

    // Enviar para Kubiks
    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://ingest.kubiks.app';
    const headers = process.env.OTEL_EXPORTER_OTLP_HEADERS || 'x-kubiks-key=';
    const [key, value] = headers.split('=');

    await fetch(`${endpoint}/v1/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [key]: value,
      },
      body: JSON.stringify({
        resourceLogs: [{
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: 'lognextdns' } },
            ],
          },
          scopeLogs: [{
            scope: { name: 'vercel-api-logger' },
            logRecords: [{
              timeUnixNano: Date.now() * 1000000,
              body: { stringValue: JSON.stringify(logData) },
              severityNumber: 9,
              severityText: 'INFO',
            }],
          }],
        }],
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Log enviado para Kubiks',
      logged: logData,
    });
  } catch (error) {
    console.error('Error processing log:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/logs - Health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Network logging endpoint is active',
    environment: process.env.VERCEL_ENV,
    deployment: process.env.VERCEL_DEPLOYMENT_ID,
  });
}
