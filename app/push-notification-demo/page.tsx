'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NotificationSettingsPanel } from '@/components/features/NotificationSettings';
import { NotificationModal } from '@/components/features/NotificationModal';
import { PushNotificationToggle } from '@/components/features/PushNotificationToggle';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushNotificationDemo() {
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const userId = 'demo-user-1';

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    settings,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    sendTestNotification,
  } = usePushNotifications(userId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            📲 Push Notification Demo
          </h1>
          <p className="mx-auto max-w-2xl text-gray-600">
            Bu demo sayfasında push notification sisteminin tüm özelliklerini
            test edebilirsiniz. Tarayıcı bildirimleri, ayarlar ve bildirim
            merkezi ile etkileşim kurun.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Push Notification Toggle */}
          <div className="space-y-6">
            <PushNotificationToggle
              userId={userId}
              onSubscriptionChange={(subscribed) => {
                console.log('Subscription changed:', subscribed);
              }}
            />

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                🎯 Hızlı İşlemler
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={() => setShowNotificationCenter(true)}
                  className="relative w-full"
                >
                  Bildirim Merkezi
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="w-full"
                >
                  Bildirim Ayarları
                </Button>

                <Button
                  onClick={sendTestNotification}
                  variant="secondary"
                  className="w-full"
                >
                  Test Bildirimi Gönder
                </Button>

                <Button
                  onClick={() => loadNotifications()}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? 'Yükleniyor...' : 'Bildirimleri Yenile'}
                </Button>
              </div>
            </Card>

            {/* Statistics */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                📊 İstatistikler
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {notifications.length}
                  </div>
                  <div className="text-sm text-blue-600">Toplam Bildirim</div>
                </div>
                <div className="rounded-lg bg-orange-50 p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {unreadCount}
                  </div>
                  <div className="text-sm text-orange-600">Okunmamış</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Notifications Preview */}
          <div>
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  🔔 Son Bildirimler
                </h3>
                {notifications.length > 0 && (
                  <Button onClick={markAllAsRead} size="sm" variant="outline">
                    Tümünü Okundu İşaretle
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <svg
                    className="mx-auto mb-4 h-12 w-12 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5-5-5h5v-6a4 4 0 00-8 0v6h5l-5 5-5-5h5v-6a8 8 0 0116 0v6z"
                    />
                  </svg>
                  <p>Henüz bildirim yok</p>
                  <p className="mt-1 text-sm">
                    Test bildirimi göndererek başlayın
                  </p>
                </div>
              ) : (
                <div className="max-h-80 space-y-3 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                        !notification.isRead
                          ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      } `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4
                              className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}
                            >
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleString(
                              'tr-TR'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {notifications.length > 5 && (
                    <div className="border-t pt-3">
                      <Button
                        onClick={() => setShowNotificationCenter(true)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Tümünü Görüntüle ({notifications.length - 5} daha)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Browser Support Info */}
        <Card className="mt-6 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            ℹ️ Tarayıcı Desteği ve Kullanım
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium text-gray-900">
                Desteklenen Özellikler:
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Service Worker tabanlı push notifications</li>
                <li>✅ Bildirim izni yönetimi</li>
                <li>✅ Özelleştirilebilir bildirim ayarları</li>
                <li>✅ Gerçek zamanlı bildirim merkezi</li>
                <li>✅ Sessiz saatler desteği</li>
                <li>✅ Test bildirimi gönderme</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-gray-900">
                Desteklenen Tarayıcılar:
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Chrome 50+</li>
                <li>✅ Firefox 44+</li>
                <li>✅ Safari 16+ (macOS 13+)</li>
                <li>✅ Edge 17+</li>
                <li>⚠️ iOS Safari (sınırlı destek)</li>
                <li>❌ Internet Explorer</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Notification Center Modal */}
        <NotificationModal
          isOpen={showNotificationCenter}
          onClose={() => setShowNotificationCenter(false)}
          userId={userId}
        />

        {/* Settings Modal */}
        {showSettings && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold">Bildirim Ayarları</h2>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
              <NotificationSettingsPanel
                initialSettings={settings || undefined}
                onSave={(newSettings) => {
                  console.log('Settings saved:', newSettings);
                  setShowSettings(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
