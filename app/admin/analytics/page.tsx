/**
 * ================================================
 * ADMIN ANALYTICS OVERVIEW PAGE
 * ================================================
 * Main analytics dashboard with quick navigation cards
 *
 * Route: /admin/analytics
 * Access: Admin only
 *
 * Features:
 * - Quick access cards to all analytics sections
 * - Summary statistics
 * - Visual navigation
 * - Recent activity highlights
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 4 - Task 4.3
 */

'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  FileBarChart,
  Activity,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

/**
 * Analytics section card data
 */
const ANALYTICS_SECTIONS = [
  {
    title: 'Advanced Analytics Dashboard',
    description:
      'Interactive charts for revenue, conversions, and user behavior analytics',
    href: '/admin/analytics/advanced',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    features: [
      'Real-time revenue charts',
      'Conversion funnel analysis',
      'User activity tracking',
      'CSV/PDF export',
    ],
  },
  {
    title: 'Gelir Analitikleri',
    description:
      'Dönemsel gelir raporları, ödeme metodu dağılımı ve işlem metrikleri',
    href: '/admin/analytics/revenue',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    features: [
      'Brüt ve net gelir',
      'Platform komisyonu',
      'Ödeme metodu dağılımı',
      'İşlem metrikleri',
    ],
  },
  {
    title: 'Platform İstatistikleri',
    description: 'Cüzdan metrikleri, ödeme istatistikleri ve işlem analitiği',
    href: '/admin/analytics/platform',
    icon: Activity,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    features: [
      'Cüzdan metrikleri',
      'Ödeme durumları',
      'İşlem hacmi',
      'Batch istatistikleri',
    ],
  },
  {
    title: 'Karşılaştırma & Tahmin',
    description: 'Dönemsel karşılaştırma, gelir tahminleri ve trend analizi',
    href: '/admin/analytics/forecast',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    features: [
      'Gün/Hafta/Ay karşılaştırma',
      'Gelir tahminleri',
      'Güven aralıkları',
      'Trend analizi',
    ],
  },
  {
    title: 'İade Analitikleri',
    description:
      'İade talepleri istatistikleri, onay oranları ve işlem süreleri',
    href: '/admin/analytics/refunds',
    icon: Receipt,
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    features: [
      'İade durumu dağılımı',
      'Onay ve başarı oranları',
      'İşlem süreleri',
      'Tutar analizleri',
    ],
  },
  {
    title: 'Özel Raporlar',
    description: 'Özelleştirilmiş rapor oluşturma ve çoklu format dışa aktarma',
    href: '/admin/analytics/reports',
    icon: FileBarChart,
    color: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    features: [
      'Özel metrik seçimi',
      'Tarih aralığı filtreleme',
      'CSV/JSON/PDF export',
      'Gruplama seçenekleri',
    ],
  },
];

/**
 * Admin Analytics Overview Page
 */
export default function AdminAnalyticsOverviewPage() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-3">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Analitik Paneli</h1>
          <p className="text-muted-foreground mt-1">
            Platform metriklerine hızlı erişim ve raporlama
          </p>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              Aktif Analitik Modülleri
            </p>
            <p className="text-3xl font-bold text-blue-600">5</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Kapsamlı raporlama
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm">Toplam Metrik</p>
            <p className="text-3xl font-bold text-green-600">50+</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Detaylı veri noktaları
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              Export Formatları
            </p>
            <p className="text-3xl font-bold text-purple-600">3</p>
            <p className="text-muted-foreground mt-1 text-xs">CSV, JSON, PDF</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              Veri Güncelleme
            </p>
            <p className="text-3xl font-bold text-orange-600">Real-time</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Canlı veri akışı
            </p>
          </div>
        </div>
      </Card>

      {/* Analytics Sections Grid */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Analitik Modülleri</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ANALYTICS_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href} className="group">
                <Card className="hover:border-primary h-full border-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  {/* Icon Header */}
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`rounded-lg bg-gradient-to-br p-3 ${section.color}`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="group-hover:text-primary text-lg font-semibold transition-colors">
                        {section.title}
                      </h3>
                    </div>
                    <ArrowRight className="group-hover:text-primary h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1" />
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4 text-sm">
                    {section.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2">
                    {section.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${section.bgColor}`}
                        />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Bottom Badge */}
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-medium ${section.textColor}`}
                      >
                        Detayları Görüntüle
                      </span>
                      <div
                        className={`h-2 w-2 rounded-full ${section.bgColor}`}
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 p-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Activity className="h-5 w-5 text-blue-600" />
          Hızlı İpuçları
        </h3>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-2">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-gray-700">
              Gelir raporlarında dönem seçerek detaylı karşılaştırma
              yapabilirsiniz
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-green-500" />
            <p className="text-gray-700">
              Platform istatistikleri otomatik olarak 60 saniyede bir
              güncellenir
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-purple-500" />
            <p className="text-gray-700">
              Özel raporlar ile istediğiniz metrikleri seçip dışa
              aktarabilirsiniz
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
