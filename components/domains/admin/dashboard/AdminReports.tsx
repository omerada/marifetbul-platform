'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  BarChart,
  TrendingUp,
  Download,
  Calendar,
  Users,
  DollarSign,
  Briefcase,
  Eye,
  Filter,
  RefreshCw,
  FileText,
  PieChart,
  LineChart,
  Activity,
} from 'lucide-react';

export function AdminReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportCategories = [
    { id: 'all', name: 'Tüm Raporlar', icon: FileText },
    { id: 'users', name: 'Kullanıcı Raporları', icon: Users },
    { id: 'jobs', name: 'İş İlanı Raporları', icon: Briefcase },
    { id: 'financial', name: 'Mali Raporlar', icon: DollarSign },
    { id: 'activity', name: 'Aktivite Raporları', icon: Activity },
  ];

  const predefinedReports = [
    {
      id: 'user-growth',
      title: 'Kullanıcı Büyüme Raporu',
      description: 'Kullanıcı registrasyonları ve aktivite trendleri',
      category: 'users',
      lastGenerated: '2 saat önce',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      id: 'revenue-analysis',
      title: 'Gelir Analizi',
      description: 'Aylık gelir trendleri ve ödeme analizi',
      category: 'financial',
      lastGenerated: '1 gün önce',
      icon: DollarSign,
      color: 'green',
    },
    {
      id: 'job-performance',
      title: 'İş İlanı Performansı',
      description: 'İş ilanlarının görüntülenme ve başvuru oranları',
      category: 'jobs',
      lastGenerated: '3 saat önce',
      icon: Briefcase,
      color: 'orange',
    },
    {
      id: 'platform-activity',
      title: 'Platform Aktivitesi',
      description: 'Genel platform kullanımı ve etkileşim metrikleri',
      category: 'activity',
      lastGenerated: '5 saat önce',
      icon: Activity,
      color: 'purple',
    },
  ];

  const quickStats = [
    {
      name: 'Toplam Rapor',
      value: '247',
      change: '+12 bu ay',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      name: 'Otomatik Raporlar',
      value: '23',
      change: '5 aktif',
      icon: RefreshCw,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      name: 'İndirilenler',
      value: '1,234',
      change: '+89 bu hafta',
      icon: Download,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      name: 'Zamanlanmış',
      value: '15',
      change: '3 beklemede',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
  ];

  const generateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const filteredReports =
    selectedCategory === 'all'
      ? predefinedReports
      : predefinedReports.filter(
          (report) => report.category === selectedCategory
        );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform performansı ve istatistik raporları
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrele
          </Button>
          <Button variant="primary" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Özel Rapor
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className={`border ${stat.borderColor} ${stat.bgColor} transition-all hover:shadow-md`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`rounded-full p-3 ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Categories */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Report Categories */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rapor Kategorileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {reportCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      selectedCategory === category.id
                        ? 'bg-primary-50 text-primary-700 border-primary-200 border'
                        : 'border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Time Period */}
        <Card className="sm:w-64">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Zaman Aralığı</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="7d">Son 7 Gün</option>
              <option value="30d">Son 30 Gün</option>
              <option value="90d">Son 3 Ay</option>
              <option value="1y">Son 1 Yıl</option>
            </select>
          </CardContent>
        </Card>
      </div>

      {/* Predefined Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Hazır Raporlar</span>
            <Badge variant="outline" className="text-gray-600">
              {filteredReports.length} rapor
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredReports.map((report) => {
              const Icon = report.icon;
              const colorConfig = {
                blue: { text: 'text-blue-600', bg: 'bg-blue-50' },
                green: { text: 'text-green-600', bg: 'bg-green-50' },
                orange: { text: 'text-orange-600', bg: 'bg-orange-50' },
                purple: { text: 'text-purple-600', bg: 'bg-purple-50' },
              };
              const colors =
                colorConfig[report.color as keyof typeof colorConfig];

              return (
                <div
                  key={report.id}
                  className="rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`rounded-lg p-2 ${colors.bg}`}>
                        <Icon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {report.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {report.description}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          Son güncelleme: {report.lastGenerated}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateReport()}
                        disabled={isGenerating}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Görüntüle
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generateReport()}
                        disabled={isGenerating}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        İndir
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5" />
              <span>Rapor Kullanım İstatistikleri</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
              <div className="text-center">
                <PieChart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Rapor kullanım grafiği burada gösterilecek
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Chart.js entegrasyonu gerekli
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5" />
              <span>Rapor Oluşturma Trendi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
              <div className="text-center">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Trend grafiği burada gösterilecek
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Chart.js entegrasyonu gerekli
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminReports;
