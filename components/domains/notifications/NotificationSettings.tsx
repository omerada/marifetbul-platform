'use client';

import React, { useState, useEffect } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import logger from '@/lib/infrastructure/monitoring/logger';
import { NotificationSettings } from '@/types';

interface NotificationSettingsProps {
  onSave?: (settings: NotificationSettings) => void;
  initialSettings?: NotificationSettings;
}

const defaultSettings: NotificationSettings = {
  push: true,
  email: true,
  sms: false,
  inApp: true,
  marketing: false,
  updates: true,
  reminders: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  browser: {
    enabled: true,
    proposals: 'true',
    messages: 'true',
    payments: 'true',
    orders: 'true',
    system: 'false',
  },
};

export function NotificationSettingsPanel({
  onSave,
  initialSettings,
}: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>(
    initialSettings || defaultSettings
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleToggle = (
    channel: 'browser' | 'email' | 'sms',
    type: string,
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [channel]: {
        ...(prev[channel] as Record<string, unknown>),
        [type]: value,
      },
    }));
  };

  const handleQuietHoursToggle = (enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled,
      },
    }));
  };

  const handleTimeChange = (field: 'start' | 'end', value: string) => {
    setSettings((prev) => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setIsSaved(false);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onSave) {
        onSave(settings);
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      logger.error(
        'Ayarlar kaydedilemedi:', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationToggle = ({
    label,
    checked,
    onChange,
    disabled = false,
  }: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <div className="flex items-center justify-between py-2">
      <span
        className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}
      >
        {label}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked && !disabled
            ? 'bg-blue-600'
            : disabled
              ? 'cursor-not-allowed bg-gray-200'
              : 'bg-gray-200'
        } `}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'} `}
        />
      </button>
    </div>
  );

  const ChannelSection = ({
    title,
    channel,
    channelSettings,
    mainEnabled,
  }: {
    title: string;
    channel: 'browser' | 'email' | 'sms';
    channelSettings: Record<string, boolean | string>;
    mainEnabled: boolean;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <NotificationToggle
          label=""
          checked={mainEnabled}
          onChange={(enabled) => handleToggle(channel, 'enabled', enabled)}
        />
      </div>

      <div className={`space-y-2 ${!mainEnabled ? 'opacity-50' : ''}`}>
        <NotificationToggle
          label="Teklifler ve ba�vurular"
          checked={Boolean(channelSettings.proposals)}
          onChange={(checked) => handleToggle(channel, 'proposals', checked)}
          disabled={!mainEnabled}
        />
        <NotificationToggle
          label="Mesajlar"
          checked={Boolean(channelSettings.messages)}
          onChange={(checked) => handleToggle(channel, 'messages', checked)}
          disabled={!mainEnabled}
        />
        <NotificationToggle
          label="�demeler"
          checked={Boolean(channelSettings.payments)}
          onChange={(checked) => handleToggle(channel, 'payments', checked)}
          disabled={!mainEnabled}
        />
        <NotificationToggle
          label="Sipari� g�ncellemeleri"
          checked={Boolean(channelSettings.orders)}
          onChange={(checked) => handleToggle(channel, 'orders', checked)}
          disabled={!mainEnabled}
        />
        <NotificationToggle
          label="Sistem duyurular�"
          checked={Boolean(channelSettings.system)}
          onChange={(checked) => handleToggle(channel, 'system', checked)}
          disabled={!mainEnabled}
        />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Bildirim Ayarlar�
        </h2>
        <p className="text-gray-600">
          Hangi bildirimleri almak istedi�inizi ve nas�l bilgilendirilmek
          istedi�inizi se�in.
        </p>
      </div>

      <div className="space-y-6">
        {/* Browser Notifications */}
        <Card className="p-6">
          <ChannelSection
            title="?? Taray�c� Bildirimleri"
            channel="browser"
            channelSettings={settings.browser}
            mainEnabled={settings.browser.enabled}
          />
        </Card>

        {/* Email Notifications */}
        <Card className="p-6">
          <ChannelSection
            title="?? E-posta Bildirimleri"
            channel="email"
            channelSettings={{ enabled: settings.email }}
            mainEnabled={settings.email}
          />
        </Card>

        {/* SMS Notifications */}
        <Card className="p-6">
          <ChannelSection
            title="?? SMS Bildirimleri"
            channel="sms"
            channelSettings={{ enabled: settings.sms }}
            mainEnabled={settings.sms}
          />
        </Card>

        {/* Quiet Hours */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-medium text-gray-900">?? Sessiz Saatler</h4>
              <NotificationToggle
                label=""
                checked={settings.quietHours.enabled}
                onChange={handleQuietHoursToggle}
              />
            </div>

            {settings.quietHours.enabled && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Bu saatler aras�nda bildirimler sessize al�n�r.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Ba�lang��
                    </label>
                    <Input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) =>
                        handleTimeChange('start', e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Biti�
                    </label>
                    <Input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) => handleTimeChange('end', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isSaved && (
              <div className="flex items-center text-green-600">
                <svg
                  className="mr-1 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">Ayarlar kaydedildi</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2"
          >
            {isLoading ? 'Kaydediliyor...' : 'Ayarlar� Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  );
}
