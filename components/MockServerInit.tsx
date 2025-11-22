"use client";
import { useEffect } from 'react';

export function MockServerInit() {
  useEffect(() => {
    // Dev-only optional MSW setup
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'development') return;
    if (process.env.NEXT_PUBLIC_ENABLE_MSW !== 'true') return;
    (async () => {
      try {
        const { worker } = await import('../mocks/browser');
        if ('serviceWorker' in navigator) {
          await worker.start({ onUnhandledRequest: 'bypass' });
        }
      } catch (err) {
        console.warn('[MockServerInit] MSW failed to start', err);
      }
    })();
  }, []);
  return null;
}
