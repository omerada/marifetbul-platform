'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Settings,
  Bell,
  Lock,
  CreditCard,
  Mail,
  Shield,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="mt-1 text-gray-600">
          Dashboard ve hesap ayarlarınızı yönetin
        </p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Bildirim Tercihleri
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                E-posta ve push bildirim ayarlarınızı yönetin
              </p>
              <Link href="/dashboard/settings/notifications">
                <Button variant="outline" size="sm" className="mt-4">
                  Düzenle
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="rounded-lg bg-green-100 p-3">
              <Lock className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Güvenlik</h3>
              <p className="mt-1 text-sm text-gray-600">
                Şifre ve iki faktörlü doğrulama ayarları
              </p>
              <Link href="/dashboard/settings/security">
                <Button variant="outline" size="sm" className="mt-4">
                  Düzenle
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="rounded-lg bg-purple-100 p-3">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Ödeme Yöntemleri
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Kayıtlı kart ve banka hesaplarınızı yönetin
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Düzenle
              </Button>
            </div>
          </div>
        </Card>

        {/* Email Settings */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="rounded-lg bg-orange-100 p-3">
              <Mail className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                E-posta Ayarları
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                E-posta adresinizi ve tercihlerinizi değiştirin
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Düzenle
              </Button>
            </div>
          </div>
        </Card>

        {/* Message Templates */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="rounded-lg bg-indigo-100 p-3">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Mesaj Şablonları
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Sık kullandığınız mesajlar için özel şablonlar oluşturun
              </p>
              <Link href="/dashboard/settings/templates">
                <Button variant="outline" size="sm" className="mt-4">
                  Yönet
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="rounded-lg bg-red-100 p-3">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Gizlilik</h3>
              <p className="mt-1 text-sm text-gray-600">
                Veri paylaşımı ve gizlilik tercihleriniz
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Düzenle
              </Button>
            </div>
          </div>
        </Card>

        {/* General Settings */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="rounded-lg bg-gray-100 p-3">
              <Settings className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Genel Ayarlar
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Dil, zaman dilimi ve diğer tercihler
              </p>
              <Link href="/dashboard/settings/general">
                <Button variant="outline" size="sm" className="mt-4">
                  Düzenle
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
