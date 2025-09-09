import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

// Start the worker during development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  worker
    .start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    })
    .catch(console.error);
}
