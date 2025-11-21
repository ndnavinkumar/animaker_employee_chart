"use client";
import { useEffect } from 'react';

export function MockServerInit() {
  useEffect(() => {
    // Ensure this runs only in the browser + dev.
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'development') return;
    if (process.env.NEXT_PUBLIC_ENABLE_MSW !== 'true') return; // opt-in only
    // Dynamically import to avoid evaluating msw in the server bundle.
    (async () => {
      try {
        const { worker } = await import('../mocks/browser');
        if ('serviceWorker' in navigator) {
          await worker.start({ onUnhandledRequest: 'bypass' });
        }
      } catch (err) {
        // Silently ignore if MSW fails; app still works with API route.
        console.warn('[MockServerInit] MSW failed to start', err);
      }
    })();
  }, []);
  return null;
}
