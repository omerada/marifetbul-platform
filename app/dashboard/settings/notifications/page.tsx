'use client';

import React, { useState, useEffect } from 'react';
import { NotificationSettingsPanel } from '@/components/domains/notifications';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Bell } from 'lucide-react';
import Link from 'next/link';
import { NotificationSettings } from '@/types';

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notification preferences from backend
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(
          `${API_BASE_URL}/api/v1/notifications/preferences`,
          {
            credentials: 'include', // Include httpOnly cookies
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch notification preferences');
        }

        const data = await response.json();

        // Transform backend response to frontend format
        const transformedSettings: NotificationSettings = {
          push: data.push || false,
          email: data.email || false,
          sms: data.sms || false,
          inApp: data.inApp || true,
          marketing: data.marketing || false,
          updates: data.updates || true,
          reminders: data.reminders || true,
          quietHours: {
            enabled: data.quietHours?.enabled || false,
            start: data.quietHours?.start || '22:00',
            end: data.quietHours?.end || '08:00',
          },
          browser: {
            enabled: data.browser?.enabled || true,
            proposals: data.browser?.proposals || 'true',
            messages: data.browser?.messages || 'true',
            payments: data.browser?.payments || 'true',
            orders: data.browser?.orders || 'true',
            system: data.browser?.system || 'false',
          },
        };

        setSettings(transformedSettings);
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
        setError('Bildirim tercihleri yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleSave = async (newSettings: NotificationSettings) => {
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(
        `${API_BASE_URL}/api/v1/notifications/preferences`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSettings),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }

      setSettings(newSettings);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      throw err;
    }
  };

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
          <p className="text-gray-600">Yükleniyor...</p>
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
          <p className="text-red-600">{error}</p>
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
              <Bell className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Bildirim Tercihleri
              </h1>
            </div>
            <p className="mt-1 text-gray-600">
              E-posta, push ve SMS bildirim ayarlarınızı yönetin
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings Panel */}
      <NotificationSettingsPanel
        initialSettings={settings}
        onSave={handleSave}
      />
    </div>
  );
}
