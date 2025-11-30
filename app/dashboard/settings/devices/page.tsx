/**
 * ================================================
 * DEVICE MANAGEMENT PAGE
 * ================================================
 * Manage push notification devices
 *
 * Features:
 * - View all registered devices
 * - Remove individual devices
 * - Remove all devices
 * - See current device indicator
 * - Device type icons
 * - Last used timestamps
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Push Notification Sprint
 */

'use client';

import React, { useState } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui';
import {
  ArrowLeft,
  Smartphone,
  Trash2,
  RefreshCw,
  Monitor,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useDeviceManagement } from '@/hooks';
import {
  formatDeviceName,
  formatLastUsed,
  getDeviceTypeLabel,
  type DeviceTokenResponse,
} from '@/lib/api/device-tokens';

// ============================================================================
// COMPONENTS
// ============================================================================

interface DeviceCardProps {
  device: DeviceTokenResponse;
  isCurrentDevice: boolean;
  onRemove: (token: string) => Promise<void>;
}

function DeviceCard({ device, isCurrentDevice, onRemove }: DeviceCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    if (isCurrentDevice) {
      const confirmed = window.confirm(
        'Bu cihazı kaldırırsanız artık bu tarayıcıda bildirim alamazsınız. Devam etmek istiyor musunuz?'
      );
      if (!confirmed) return;
    }

    setIsRemoving(true);
    await onRemove(device.token);
    setIsRemoving(false);
  };

  // Device type icon
  const getDeviceIcon = () => {
    switch (device.deviceType) {
      case 'WEB':
        return <Monitor className="h-8 w-8 text-blue-600" />;
      case 'ANDROID':
        return <Smartphone className="h-8 w-8 text-green-600" />;
      case 'IOS':
        return <Smartphone className="h-8 w-8 text-gray-700" />;
      default:
        return <Smartphone className="h-8 w-8 text-gray-600" />;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        {/* Device Info */}
        <div className="flex flex-1 items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">{getDeviceIcon()}</div>

          {/* Details */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">
                {formatDeviceName(device)}
              </h4>
              {isCurrentDevice && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Mevcut Cihaz
                </span>
              )}
            </div>

            <div className="space-y-0.5 text-sm text-gray-600">
              <p>
                <span className="font-medium">Tür:</span>{' '}
                {getDeviceTypeLabel(device.deviceType)}
              </p>
              <p>
                <span className="font-medium">Kayıt:</span>{' '}
                {new Date(device.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p>
                <span className="font-medium">Son Kullanım:</span>{' '}
                {formatLastUsed(device.lastUsedAt)}
              </p>
            </div>

            {!device.isActive && (
              <span className="inline-flex items-center text-xs text-orange-600">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Devre dışı
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            {isRemoving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Kaldırılıyor...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Kaldır
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function DeviceManagementPage() {
  const {
    devices,
    isLoading,
    isRefreshing,
    error,
    deviceCount,
    refreshDevices,
    removeDevice,
    removeAllDevices,
    isCurrentDevice,
  } = useDeviceManagement();

  const [isRemovingAll, setIsRemovingAll] = useState(false);

  const handleRemoveAll = async () => {
    const confirmed = window.confirm(
      `${deviceCount} cihazı kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );

    if (!confirmed) return;

    setIsRemovingAll(true);
    await removeAllDevices();
    setIsRemovingAll(false);
  };

  const handleRemoveDevice = async (token: string) => {
    await removeDevice(token);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
        </div>
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Cihazlar yükleniyor...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
        </div>
        <Card className="border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-600" />
          <h3 className="mb-2 text-lg font-semibold text-red-900">
            Cihazlar Yüklenemedi
          </h3>
          <p className="mb-4 text-sm text-red-700">{error.message}</p>
          <Button onClick={() => refreshDevices()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Cihaz Yönetimi
              </h1>
            </div>
            <p className="mt-1 text-gray-600">
              Push bildirim alan cihazlarınızı yönetin
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDevices}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
          {deviceCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveAll}
              disabled={isRemovingAll}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isRemovingAll ? 'Kaldırılıyor...' : 'Tümünü Kaldır'}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl">
        {/* Device Count Card */}
        <Card className="mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Kayıtlı Cihazlar
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {deviceCount === 0
                  ? 'Henüz kayıtlı cihaz bulunmuyor'
                  : `${deviceCount} cihaz kayıtlı`}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-4">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Devices List */}
        {devices.length === 0 ? (
          <Card className="p-12 text-center">
            <Smartphone className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Kayıtlı Cihaz Yok
            </h3>
            <p className="text-sm text-gray-600">
              Push bildirimler için henüz bir cihaz kaydedilmemiş.
              <br />
              Bildirim ayarlarından push bildirimleri etkinleştirebilirsiniz.
            </p>
            <Link
              href="/dashboard/settings/notifications"
              className="mt-4 inline-block"
            >
              <Button>Bildirim Ayarları</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                isCurrentDevice={isCurrentDevice(device.token)}
                onRemove={handleRemoveDevice}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
