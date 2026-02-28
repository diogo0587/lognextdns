// Configuração
const KUBIKS_ENDPOINT = 'https://ingest.kubiks.app/v1/logs';
const KUBIKS_API_KEY = 'kubiks_545f2470512922b06f79f650ed21ae0918136732e540b108a36f88e813b3ec61';
const HISTORY_SYNC_INTERVAL = 3600000; // 1 hora
const RECENT_HISTORY_DAYS = 7;

// Função para enviar histórico para Kubiks
async function sendHistoryToKubiks(history) {
  if (!history || history.length === 0) {
    console.log('No history to send');
    return;
  }

  try {
    const response = await fetch(KUBIKS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-kubiks-key': KUBIKS_API_KEY,
      },
      body: JSON.stringify({
        resourceLogs: [{
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: 'chrome-extension' } },
              { key: 'data.type', value: { stringValue: 'chrome_history' } },
            ],
          },
          scopeLogs: [{
            scope: { name: 'chrome-history-logger' },
            logRecords: [{
              timeUnixNano: Date.now() * 1000000,
              body: { 
                stringValue: JSON.stringify({
                  timestamp: new Date().toISOString(),
                  browser: 'Chrome',
                  history_count: history.length,
                  history_items: history,
                })
              },
              severityNumber: 9,
              severityText: 'INFO',
              attributes: [
                { key: 'browser', value: { stringValue: 'Chrome' } },
                { key: 'history.count', value: { intValue: history.length } },
                { key: 'source', value: { stringValue: 'chrome-extension' } },
              ],
            }],
          }],
        }],
      }),
    });

    if (response.ok) {
      console.log(`✅ Enviados ${history.length} itens de histórico para Kubiks`);
    } else {
      console.error('Error sending history:', response.statusText);
    }
  } catch (error) {
    console.error('Failed to send history to Kubiks:', error);
  }
}

// Função para capturar histórico recente
async function captureRecentHistory() {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const startTime = Date.now() - (RECENT_HISTORY_DAYS * millisecondsPerDay);

  try {
    const history = await chrome.history.search({
      text: '',
      startTime: startTime,
      maxResults: 1000,
    });

    // Filtrar duplicatas e formatar
    const uniqueHistory = Array.from(
      new Map(history.map(item => [item.url, item])).values()
    );

    const formattedHistory = uniqueHistory.map(item => ({
      url: item.url,
      title: item.title || 'Sem título',
      lastVisitTime: new Date(item.lastVisitTime).toISOString(),
      visitCount: item.visitCount || 1,
    }));

    console.log(`📊 Capturados ${formattedHistory.length} itens únicos do histórico`);
    await sendHistoryToKubiks(formattedHistory);
  } catch (error) {
    console.error('Error capturing history:', error);
  }
}

// Sincronizar histórico ao iniciar
captureRecentHistory();

// Sincronizar periodicamente
setInterval(captureRecentHistory, HISTORY_SYNC_INTERVAL);

// Sincronizar quando nova aba é visitada
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Capturar histórico a cada 10 minutos de navegação ativa
    setTimeout(captureRecentHistory, 600000);
  }
});

// Responder a mensagens do popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'syncHistory') {
    captureRecentHistory().then(() => {
      sendResponse({ success: true, message: 'Histórico sincronizado' });
    });
    return true; // Indica que sendResponse será chamado de forma assíncrona
  }

  if (request.action === 'getStatus') {
    sendResponse({ 
      status: 'active',
      lastSync: new Date().toISOString(),
      syncInterval: HISTORY_SYNC_INTERVAL,
    });
  }
});
