/**
 * OrderNotificationProvider
 * -------------------------
 * Global provider that activates useOrderNotifications for all authenticated users.
 * Should be mounted once in the app layout.
 */

'use client';

import { useOrderNotifications } from '@/hooks/business/useOrderNotifications';

export function OrderNotificationProvider() {
  // This hook does all the work: subscribes to WebSocket, shows toasts & desktop notifications
  useOrderNotifications({ enableDesktop: true, enableToasts: true });

  // No UI rendered
  return null;
}
