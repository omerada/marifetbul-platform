import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

console.log(
  '🔧 MSW Browser: Setting up worker with',
  handlers.length,
  'handlers'
);
console.log(
  '📋 MSW Browser: Handlers:',
  handlers.map((h) => h.info?.header || 'Unknown').slice(0, 10)
);

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);
