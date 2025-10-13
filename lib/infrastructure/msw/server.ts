import { setupServer } from 'msw/node';

// Import enableMocks dynamically to avoid startup side-effects when mocks are disabled
let serverInstance: ReturnType<typeof setupServer> | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { handlers, enableMocks } = require('./handlers');
  if (enableMocks && Array.isArray(handlers) && handlers.length > 0) {
    serverInstance = setupServer(...handlers);
  }
} catch (e) {
  // If handlers cannot be loaded (production), we silently skip MSW server setup
  // This keeps server.ts safe to import in production
  // console.debug('MSW handlers not loaded:', e);
}

export const server = serverInstance;
