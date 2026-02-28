'use client';

import { useEffect } from 'react';

export default function ClientTracker() {
  useEffect(() => {
    // Importar função de tracking
    const initTracking = async () => {
      // Tracking de navegação
      const navigationData = {
        type: 'page_load',
        timestamp: new Date().toISOString(),
        currentUrl: window.location.href,
        previousUrl: document.referrer || 'direct',
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        deviceMemory: (navigator as any).deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
      };

      // Enviar para Kubiks
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(navigationData),
      }).catch(console.error);

      // Rastrear cliques
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'click',
            element: target.tagName,
            class: target.className,
            id: target.id,
            text: target.textContent?.substring(0, 100),
            url: window.location.href,
            timestamp: new Date().toISOString(),
          }),
        }).catch(console.error);
      });

      // Rastrear scroll (com debounce)
      let scrollTimeout: NodeJS.Timeout;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'scroll',
              scrollY: window.scrollY,
              scrollX: window.scrollX,
              url: window.location.href,
              timestamp: new Date().toISOString(),
            }),
          }).catch(console.error);
        }, 1000);
      });

      // Rastrear mudanças de URL (Single Page Applications)
      let lastUrl = window.location.href;
      setInterval(() => {
        if (window.location.href !== lastUrl) {
          lastUrl = window.location.href;
          fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'navigation',
              url: window.location.href,
              referrer: document.referrer,
              timestamp: new Date().toISOString(),
            }),
          }).catch(console.error);
        }
      }, 1000);

      // Rastrear erros
      window.addEventListener('error', (event) => {
        fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'error',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            url: window.location.href,
            timestamp: new Date().toISOString(),
          }),
        }).catch(console.error);
      });

      // Rastrear promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'unhandled_rejection',
            reason: event.reason?.toString(),
            url: window.location.href,
            timestamp: new Date().toISOString(),
          }),
        }).catch(console.error);
      });

      // Rastrear performance
      if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
          const timing = window.performance.timing;
          const loadTime = timing.loadEventEnd - timing.navigationStart;
          
          fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'performance',
              loadTime,
              domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
              url: window.location.href,
              timestamp: new Date().toISOString(),
            }),
          }).catch(console.error);
        });
      }

      console.log('✅ Kubiks tracking initialized');
    };

    initTracking();
  }, []);

  return null; // Este é um componente apenas para efeitos colaterais
}
