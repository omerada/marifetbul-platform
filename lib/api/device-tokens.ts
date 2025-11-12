/**
 * ================================================
 * DEVICE TOKENS API CLIENT
 * ================================================
 * Manages push notification device registrations
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Push Notification Sprint
 */

import { apiClient } from '@/lib/infrastructure/api/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type DeviceType = 'WEB' | 'ANDROID' | 'IOS';

export interface DeviceTokenRequest {
  token: string;
  deviceType: DeviceType;
  deviceName: string;
}

export interface DeviceTokenResponse {
  id: string;
  token: string;
  deviceType: DeviceType;
  deviceName: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Register a new device for push notifications
 */
export async function registerDevice(
  request: DeviceTokenRequest
): Promise<DeviceTokenResponse> {
  const response = await apiClient.post<DeviceTokenResponse>(
    '/device-tokens',
    request
  );
  return response;
}

/**
 * Get all registered devices for current user
 */
export async function getUserDevices(): Promise<DeviceTokenResponse[]> {
  const response = await apiClient.get<DeviceTokenResponse[]>('/device-tokens');
  return response;
}

/**
 * Unregister a specific device
 */
export async function unregisterDevice(token: string): Promise<void> {
  await apiClient.delete(`/device-tokens/${encodeURIComponent(token)}`);
}

/**
 * Unregister all devices for current user
 */
export async function unregisterAllDevices(): Promise<void> {
  await apiClient.delete('/device-tokens');
}

/**
 * Get count of active devices
 */
export async function getActiveDeviceCount(): Promise<number> {
  const response = await apiClient.get<number>('/device-tokens/count');
  return response;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format device name for display
 */
export function formatDeviceName(device: DeviceTokenResponse): string {
  return device.deviceName || `${device.deviceType} Device`;
}

/**
 * Get device icon based on type
 */
export function getDeviceIcon(deviceType: DeviceType): string {
  switch (deviceType) {
    case 'WEB':
      return '🌐';
    case 'ANDROID':
      return '🤖';
    case 'IOS':
      return '🍎';
    default:
      return '📱';
  }
}

/**
 * Format last used date
 */
export function formatLastUsed(lastUsedAt: string | null): string {
  if (!lastUsedAt) {
    return 'Hiç kullanılmadı';
  }

  const date = new Date(lastUsedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return 'Az önce';
  } else if (diffMins < 60) {
    return `${diffMins} dakika önce`;
  } else if (diffHours < 24) {
    return `${diffHours} saat önce`;
  } else if (diffDays < 7) {
    return `${diffDays} gün önce`;
  } else {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Get device type label in Turkish
 */
export function getDeviceTypeLabel(deviceType: DeviceType): string {
  switch (deviceType) {
    case 'WEB':
      return 'Web Tarayıcı';
    case 'ANDROID':
      return 'Android';
    case 'IOS':
      return 'iOS';
    default:
      return 'Bilinmeyen';
  }
}
