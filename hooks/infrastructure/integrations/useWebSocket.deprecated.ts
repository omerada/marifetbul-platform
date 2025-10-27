/**
 * ================================================
 * WEBSOCKET HOOK - DEPRECATED
 * ================================================
 *
 * @deprecated This implementation is deprecated and will be removed in v3.0.0
 *
 * Please use the unified WebSocket hook instead:
 * ```typescript
 * import { useWebSocket } from '@/hooks/infrastructure/websocket';
 * // or
 * import { useStompWebSocket } from '@/hooks/infrastructure/websocket';
 * ```
 *
 * This file is kept for backward compatibility only.
 * It re-exports the new hook to maintain existing code functionality.
 *
 * Migration Guide:
 * 1. Replace `useWebSocket` imports from 'hooks/infrastructure/integrations'
 *    with imports from 'hooks/infrastructure/websocket'
 * 2. The API is mostly compatible, but check for any breaking changes
 * 3. Remove any custom store integration code - it's now built-in
 *
 * @see hooks/infrastructure/websocket/useWebSocket.ts for the new implementation
 */

'use client';

import { useWebSocket as useWebSocketNew } from '../websocket/useWebSocket';

/**
 * @deprecated Use `import { useWebSocket } from '@/hooks/infrastructure/websocket'` instead
 */
export const useWebSocket = useWebSocketNew;

export default useWebSocket;
