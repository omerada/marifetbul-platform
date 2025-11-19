/**
 * ================================================
 * ADMIN COMMISSIONS PAGE
 * ================================================
 * Main page for commission management
 *
 * Sprint: Admin Commission Management
 * Story: Admin Pages (1 SP)
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @since Sprint Day 2
 */

'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Settings, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CommissionSettingsForm } from '@/components/admin/CommissionSettingsForm';
import { CategoryCommissionsTable } from '@/components/admin/CategoryCommissionsTable';
import { useCommissionSettings } from '@/hooks';

type TabType = 'settings' | 'categories';

export default function AdminCommissionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const { settings, isLoading } = useCommissionSettings();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground mt-4">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Komisyon Ayarları Bulunamadı</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Komisyon ayarları yüklenemedi. Lütfen tekrar deneyin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Komisyon Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          Platform ve kategori bazında komisyon oranlarını yönetin
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            }`}
          >
            <Settings className="h-4 w-4" />
            Genel Ayarlar
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'categories'
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            }`}
          >
            <List className="h-4 w-4" />
            Kategori Komisyonları
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'settings' && (
          <CommissionSettingsForm settings={settings} />
        )}
        {activeTab === 'categories' && <CategoryCommissionsTable />}
      </div>
    </div>
  );
}
