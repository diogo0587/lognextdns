import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route para receber histórico do Chrome
 * POST /api/chrome-history
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { history } = body;

    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json(
        { error: 'Invalid history data' },
        { status: 400 }
      );
    }

    const historyData = {
      timestamp: new Date().toISOString(),
      browser: 'Chrome',
      history_count: history.length,
      history_items: history.map((item: any) => ({
        url: item.url,
        title: item.title,
        lastVisitTime: item.lastVisitTime,
        visitCount: item.visitCount,
        typedCount: item.typedCount,
      })),
      clientIp: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
      environment: process.env.VERCEL_ENV,
      deployment: process.env.VERCEL_DEPLOYMENT_ID,
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
              { key: 'data.type', value: { stringValue: 'chrome_history' } },
            ],
          },
          scopeLogs: [{
            scope: { name: 'chrome-history-logger' },
            logRecords: [{
              timeUnixNano: Date.now() * 1000000,
              body: { stringValue: JSON.stringify(historyData) },
              severityNumber: 9,
              severityText: 'INFO',
              attributes: [
                { key: 'browser', value: { stringValue: 'Chrome' } },
                { key: 'history.count', value: { intValue: history.length } },
              ],
            }],
          }],
        }],
      }),
    });

    return NextResponse.json({
      success: true,
      message: `${history.length} itens de histórico enviados para Kubiks`,
      itemsLogged: history.length,
    });
  } catch (error) {
    console.error('Error processing Chrome history:', error);
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
 * GET /api/chrome-history - Info
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Chrome history logging endpoint is active',
    instructions: 'POST your Chrome history data to this endpoint',
  });
}
