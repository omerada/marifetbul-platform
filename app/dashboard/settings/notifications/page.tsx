'use client';

import React from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  ArrowLeft,
  Bell,
  Mail,
  Smartphone,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useNotificationPreferences } from '@/hooks';

export default function NotificationSettingsPage() {
  const {
    preferences,
    isLoading,
    error,
    isUpdating,
    togglePreference,
    updateSinglePreference,
    enableAllEmailNotifications,
    disableAllEmailNotifications,
    enableAllPushNotifications,
    disableAllPushNotifications,
    resetToDefaults,
  } = useNotificationPreferences();

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
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-6">
                <div className="space-y-4">
                  <div className="bg-muted h-6 w-48 animate-pulse rounded" />
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="bg-muted h-5 w-5 animate-pulse rounded" />
                        <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

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
        <Card className="p-8 text-center">
          <p className="mb-2 text-red-600">Bildirim tercihleri yüklenemedi</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </Card>
      </div>
    );
  }

  if (!preferences) {
    return null;
  }

  const NotificationToggle = ({
    label,
    description,
    checked,
    onChange,
    disabled = false,
  }: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
  }) => (
    <div className="flex items-start justify-between py-3">
      <div className="flex-1">
        <div
          className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}
        >
          {label}
        </div>
        {description && (
          <div className="mt-0.5 text-xs text-gray-500">{description}</div>
        )}
      </div>
      <button
        type="button"
        disabled={disabled || isUpdating}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
          checked && !disabled
            ? 'bg-blue-600'
            : disabled || isUpdating
              ? 'cursor-not-allowed bg-gray-200'
              : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );

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
              <Bell className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Bildirim Tercihleri
              </h1>
            </div>
            <p className="mt-1 text-gray-600">
              E-posta ve push bildirim ayarlarınızı yönetin
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Email Notifications */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                E-posta Bildirimleri
              </h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={enableAllEmailNotifications}
                disabled={isUpdating}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Tümünü Aç
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disableAllEmailNotifications}
                disabled={isUpdating}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Tümünü Kapat
              </Button>
            </div>
          </div>

          <div className="space-y-1 divide-y divide-gray-100">
            <NotificationToggle
              label="Mesaj Bildirimleri"
              description="Yeni mesaj aldığınızda e-posta alın"
              checked={preferences.messageEmail}
              onChange={() => togglePreference('messageEmail')}
            />
            <NotificationToggle
              label="İş İlanları"
              description="Size uygun yeni iş ilanları için e-posta alın"
              checked={preferences.jobEmail}
              onChange={() => togglePreference('jobEmail')}
            />
            <NotificationToggle
              label="Teklif Bildirimleri"
              description="İş teklifleriniz için e-posta alın"
              checked={preferences.proposalEmail}
              onChange={() => togglePreference('proposalEmail')}
            />
            <NotificationToggle
              label="Sipariş Bildirimleri"
              description="Sipariş güncellemeleri için e-posta alın"
              checked={preferences.orderEmail}
              onChange={() => togglePreference('orderEmail')}
            />
            <NotificationToggle
              label="Ödeme Bildirimleri"
              description="Ödeme alındığında e-posta alın"
              checked={preferences.paymentEmail}
              onChange={() => togglePreference('paymentEmail')}
            />
            <NotificationToggle
              label="Değerlendirme Bildirimleri"
              description="Yeni değerlendirme aldığınızda e-posta alın"
              checked={preferences.reviewEmail}
              onChange={() => togglePreference('reviewEmail')}
            />
            <NotificationToggle
              label="Takip Bildirimleri"
              description="Sizi takip eden biri olduğunda e-posta alın"
              checked={preferences.followEmail}
              onChange={() => togglePreference('followEmail')}
            />
            <NotificationToggle
              label="Sistem Bildirimleri"
              description="Önemli sistem duyuruları için e-posta alın"
              checked={preferences.systemEmail}
              onChange={() => togglePreference('systemEmail')}
            />
          </div>
        </Card>

        {/* Push Notifications */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Push Bildirimleri
              </h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={enableAllPushNotifications}
                disabled={isUpdating}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Tümünü Aç
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disableAllPushNotifications}
                disabled={isUpdating}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Tümünü Kapat
              </Button>
            </div>
          </div>

          <div className="space-y-1 divide-y divide-gray-100">
            <NotificationToggle
              label="Mesaj Bildirimleri"
              description="Yeni mesaj aldığınızda anında bildirim alın"
              checked={preferences.messagePush}
              onChange={() => togglePreference('messagePush')}
            />
            <NotificationToggle
              label="İş İlanları"
              description="Size uygun yeni iş ilanları için bildirim alın"
              checked={preferences.jobPush}
              onChange={() => togglePreference('jobPush')}
            />
            <NotificationToggle
              label="Teklif Bildirimleri"
              description="İş teklifleriniz için bildirim alın"
              checked={preferences.proposalPush}
              onChange={() => togglePreference('proposalPush')}
            />
            <NotificationToggle
              label="Sipariş Bildirimleri"
              description="Sipariş güncellemeleri için bildirim alın"
              checked={preferences.orderPush}
              onChange={() => togglePreference('orderPush')}
            />
            <NotificationToggle
              label="Ödeme Bildirimleri"
              description="Ödeme alındığında bildirim alın"
              checked={preferences.paymentPush}
              onChange={() => togglePreference('paymentPush')}
            />
            <NotificationToggle
              label="Değerlendirme Bildirimleri"
              description="Yeni değerlendirme aldığınızda bildirim alın"
              checked={preferences.reviewPush}
              onChange={() => togglePreference('reviewPush')}
            />
            <NotificationToggle
              label="Takip Bildirimleri"
              description="Sizi takip eden biri olduğunda bildirim alın"
              checked={preferences.followPush}
              onChange={() => togglePreference('followPush')}
            />
            <NotificationToggle
              label="Sistem Bildirimleri"
              description="Önemli sistem duyuruları için bildirim alın"
              checked={preferences.systemPush}
              onChange={() => togglePreference('systemPush')}
            />
          </div>
        </Card>

        {/* Do Not Disturb */}
        <Card className="p-6">
          <div className="mb-4 border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  🌙 Rahatsız Etmeyin Modu
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Belirtilen saatler arasında bildirim almayın
                </p>
              </div>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => togglePreference('doNotDisturb')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.doNotDisturb && !isUpdating
                    ? 'bg-blue-600'
                    : isUpdating
                      ? 'cursor-not-allowed bg-gray-200'
                      : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${preferences.doNotDisturb ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>

          {preferences.doNotDisturb && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Bu saatler arasında e-posta ve push bildirimleri sessize alınır.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Başlangıç Saati
                  </label>
                  <Input
                    type="time"
                    value={preferences.dndStartTime || '22:00'}
                    onChange={(e) =>
                      updateSinglePreference('dndStartTime', e.target.value)
                    }
                    disabled={isUpdating}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Bitiş Saati
                  </label>
                  <Input
                    type="time"
                    value={preferences.dndEndTime || '08:00'}
                    onChange={(e) =>
                      updateSinglePreference('dndEndTime', e.target.value)
                    }
                    disabled={isUpdating}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Reset to Defaults */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={isUpdating}
          >
            Varsayılana Sıfırla
          </Button>
        </div>
      </div>
    </div>
  );
}
