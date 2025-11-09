'use client';

/**
 * ================================================
 * UNIFIED MODERATOR DASHBOARD WIDGET
 * ================================================
 * Main dashboard combining all Sprint 3 moderation features
 *
 * Sprint: Sprint 3 - Day 4 (Final Integration)
 * Features: Combines all moderation tools and analytics
 *
 * @version 2.0.0 - Updated to use UnifiedCommentQueue
 * @author MarifetBul Development Team
 * @created November 2, 2025
 * @updated November 8, 2025 - Removed deprecated CommentModerationQueue
 */

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { LayoutDashboard, Filter, Flag, Shield, BarChart3 } from 'lucide-react';
import { UnifiedCommentQueue } from '@/components/domains/moderation/shared';
import { AdvancedFilterPanel } from './AdvancedFilterPanel';
import { FlagStatisticsPanel } from './FlagStatisticsPanel';
import { AutoModerationRulesPanel } from './AutoModerationRulesPanel';
import { ModeratorAnalyticsDashboard } from './ModeratorAnalyticsDashboard';

export interface ModeratorDashboardProps {
  className?: string;
  defaultTab?: 'queue' | 'filters' | 'flags' | 'rules' | 'analytics';
}

export function ModeratorDashboard({
  className = '',
  defaultTab = 'queue',
}: ModeratorDashboardProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Moderasyon Kontrol Paneli
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Blog yorumları moderasyonu, analitik ve raporlama
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof defaultTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Moderasyon Kuyruğu</span>
            <span className="sm:hidden">Kuyruk</span>
          </TabsTrigger>

          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Gelişmiş Filtreler</span>
            <span className="sm:hidden">Filtreler</span>
          </TabsTrigger>

          <TabsTrigger value="flags" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            <span className="hidden sm:inline">Bayrak İstatistikleri</span>
            <span className="sm:hidden">Bayraklar</span>
          </TabsTrigger>

          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Oto-Moderasyon</span>
            <span className="sm:hidden">Kurallar</span>
          </TabsTrigger>

          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analitik & SLA</span>
            <span className="sm:hidden">Analitik</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}

        {/* Moderation Queue */}
        <TabsContent value="queue" className="mt-6">
          <div className="space-y-4">
            <div className="rounded-lg border bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <LayoutDashboard className="mt-0.5 h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">
                    Moderasyon Kuyruğu
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Bekleyen yorumları inceleyin, onaylayın veya reddedin. Toplu
                    işlemler için yorumları seçin.
                  </p>
                </div>
              </div>
            </div>

            <UnifiedCommentQueue
              role="moderator"
              initialStatus="PENDING"
              showStats={true}
              enableBulkActions={true}
              viewMode="compact"
            />
          </div>
        </TabsContent>

        {/* Advanced Filters */}
        <TabsContent value="filters" className="mt-6">
          <div className="space-y-4">
            <div className="rounded-lg border bg-purple-50 p-4">
              <div className="flex items-start gap-3">
                <Filter className="mt-0.5 h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900">
                    Gelişmiş Filtreleme
                  </h3>
                  <p className="mt-1 text-sm text-purple-700">
                    Yorumları detaylı kriterlere göre filtreleyin. Sık
                    kullanılan filtreleri kaydedin ve hızlıca uygulayın.
                  </p>
                </div>
              </div>
            </div>

            <AdvancedFilterPanel
              filters={{}}
              onFilterChange={() => {
                // Filter logic will be handled by CommentModerationQueue
              }}
              onClearFilters={() => {
                // Clear filters
              }}
            />
          </div>
        </TabsContent>

        {/* Flag Statistics */}
        <TabsContent value="flags" className="mt-6">
          <div className="space-y-4">
            <div className="rounded-lg border bg-orange-50 p-4">
              <div className="flex items-start gap-3">
                <Flag className="mt-0.5 h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-900">
                    Bayrak İstatistikleri
                  </h3>
                  <p className="mt-1 text-sm text-orange-700">
                    Kullanıcılar tarafından bildirilen yorumları inceleyin.
                    Trend analizi yapın ve sorunlu içerikleri tespit edin.
                  </p>
                </div>
              </div>
            </div>

            <FlagStatisticsPanel />
          </div>
        </TabsContent>

        {/* Auto-Moderation Rules */}
        <TabsContent value="rules" className="mt-6">
          <div className="space-y-4">
            <div className="rounded-lg border bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">
                    Otomatik Moderasyon Kuralları
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    Otomatik moderasyon kuralları oluşturun ve yönetin. Anahtar
                    kelimeler, patternler ve spam skorları ile içerikleri
                    filtreyin.
                  </p>
                </div>
              </div>
            </div>

            <AutoModerationRulesPanel />
          </div>
        </TabsContent>

        {/* Analytics & SLA */}
        <TabsContent value="analytics" className="mt-6">
          <div className="space-y-4">
            <div className="rounded-lg border bg-indigo-50 p-4">
              <div className="flex items-start gap-3">
                <BarChart3 className="mt-0.5 h-5 w-5 text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-indigo-900">
                    Analitik & Performans
                  </h3>
                  <p className="mt-1 text-sm text-indigo-700">
                    Moderasyon performansını takip edin. SLA metriklerini görün,
                    iş yükü dağılımını analiz edin ve rapor oluşturun.
                  </p>
                </div>
              </div>
            </div>

            <ModeratorAnalyticsDashboard />
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats Footer */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <div className="grid grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {/* Will be populated from API */}
              --
            </div>
            <div className="text-xs text-gray-600">Bekleyen</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">--</div>
            <div className="text-xs text-gray-600">Onaylanan</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">--</div>
            <div className="text-xs text-gray-600">Reddedilen</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">--</div>
            <div className="text-xs text-gray-600">Bayraklı</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">--</div>
            <div className="text-xs text-gray-600">Aktif Kural</div>
          </div>
        </div>
      </div>
    </div>
  );
}
