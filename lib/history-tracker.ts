/**
 * History Tracker - Captura dados de navegação sem extensão
 * Usa APIs públicas do navegador para coletar dados de forma segura
 */

export interface HistoryItem {
  url: string;
  title: string;
  visitTime: string;
  domain: string;
  protocol: string;
}

export interface NavigationData {
  timestamp: string;
  currentUrl: string;
  previousUrl: string;
  referrer: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  maxTouchPoints?: number;
}

/**
 * Rastrear navegação atual
 */
export function trackCurrentNavigation(): NavigationData {
  return {
    timestamp: new Date().toISOString(),
    currentUrl: window.location.href,
    previousUrl: document.referrer || 'direct',
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    deviceMemory: (navigator as any).deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
  };
}

/**
 * Enviar dados para Kubiks
 */
export async function sendToKubiks(data: any, endpoint: string = '/api/logs') {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`Failed to send data to Kubiks: ${response.statusText}`);
    }

    return response.ok;
  } catch (error) {
    console.error('Error sending data to Kubiks:', error);
    return false;
  }
}

/**
 * Rastrear cliques na página
 */
export function trackPageInteractions() {
  // Rastrear cliques
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    sendToKubiks({
      type: 'click',
      element: target.tagName,
      class: target.className,
      id: target.id,
      text: target.textContent?.substring(0, 100),
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  });

  // Rastrear scroll
  let scrollTimeout: NodeJS.Timeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      sendToKubiks({
        type: 'scroll',
        scrollY: window.scrollY,
        scrollX: window.scrollX,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    }, 1000); // Enviar a cada 1 segundo de scroll
  });

  // Rastrear mudanças de URL (SPA)
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      sendToKubiks({
        type: 'navigation',
        ...trackCurrentNavigation(),
      });
    }
  }, 1000);
}

/**
 * Rastrear performance da página
 */
export function trackPagePerformance() {
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;

    sendToKubiks({
      type: 'performance',
      loadTime: loadTime,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: (performance as any).getEntriesByName('first-paint')[0]?.startTime,
      firstContentfulPaint: (performance as any).getEntriesByName('first-contentful-paint')[0]?.startTime,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Rastrear erros da página
 */
export function trackErrors() {
  // Erros não capturados
  window.addEventListener('error', (event) => {
    sendToKubiks({
      type: 'error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  });

  // Promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    sendToKubiks({
      type: 'unhandled_rejection',
      reason: event.reason?.toString(),
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  });
}

/**
 * Inicializar tracking completo
 */
export function initializeTracking() {
  // Enviar navegação inicial
  sendToKubiks({
    type: 'page_load',
    ...trackCurrentNavigation(),
  });

  // Rastrear interações
  trackPageInteractions();

  // Rastrear performance
  window.addEventListener('load', trackPagePerformance);

  // Rastrear erros
  trackErrors();

  console.log('✅ Kubiks tracking initialized');
}
