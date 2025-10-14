'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import {
  Shield,
  AlertTriangle,
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  FileText,
  Download,
  Ban,
  UserX,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModerationItem {
  id: string;
  type: 'user_report' | 'auto_flagged' | 'manual_review';
  contentType: 'job_post' | 'user_profile' | 'message' | 'package' | 'review';
  title: string;
  description: string;
  reportedBy?: {
    id: string;
    name: string;
    email: string;
  };
  reportedUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  reportReason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  content: {
    text?: string;
    images?: string[];
    metadata?: Record<string, string | number | boolean>;
  };
  autoFlags: {
    spam: boolean;
    inappropriate: boolean;
    fake: boolean;
    harassment: boolean;
    score: number;
  };
}

interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  autoFlagged: number;
  averageResponseTime: number;
  moderationAccuracy: number;
  trendsData: {
    date: string;
    reports: number;
    resolved: number;
  }[];
  categoryBreakdown: {
    category: string;
    count: number;
    percentage: number;
  }[];
}

export default function ModerationDashboard() {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ModerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');

  // Fetch moderation data
  useEffect(() => {
    fetchModerationData();
  }, []);

  // Filter items based on selected filters
  useEffect(() => {
    let filtered = moderationItems;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter((item) => item.type === selectedFilter);
    }

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter((item) => item.severity === selectedSeverity);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.reportedUser.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.reportReason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [
    moderationItems,
    selectedFilter,
    selectedSeverity,
    selectedStatus,
    searchQuery,
  ]);

  const fetchModerationData = async () => {
    try {
      setIsLoading(true);

      // Production note: Real API calls to backend moderation endpoints.
      // Endpoints: GET /api/v1/admin/moderation/stats and GET /api/v1/admin/moderation/items
      // If endpoints are not implemented yet, returns fallback mock data for UI development.

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock stats data - Backend will provide real data via ModerationController
      const mockStats: ModerationStats = {
        totalReports: 1247,
        pendingReports: 89,
        resolvedToday: 34,
        autoFlagged: 156,
        averageResponseTime: 2.4,
        moderationAccuracy: 94.2,
        trendsData: [
          { date: '2025-09-07', reports: 45, resolved: 38 },
          { date: '2025-09-08', reports: 52, resolved: 47 },
          { date: '2025-09-09', reports: 38, resolved: 41 },
          { date: '2025-09-10', reports: 61, resolved: 55 },
          { date: '2025-09-11', reports: 44, resolved: 39 },
          { date: '2025-09-12', reports: 57, resolved: 52 },
          { date: '2025-09-13', reports: 34, resolved: 34 },
        ],
        categoryBreakdown: [
          { category: 'Spam', count: 45, percentage: 35.2 },
          { category: 'Uygunsuz İçerik', count: 32, percentage: 25.0 },
          { category: 'Sahte Profil', count: 28, percentage: 21.9 },
          { category: 'Taciz', count: 18, percentage: 14.1 },
          { category: 'Diğer', count: 5, percentage: 3.8 },
        ],
      };

      // Production note: Mock items for UI development. Backend endpoint: GET /api/v1/admin/moderation/items
      const mockItems: ModerationItem[] = [
        {
          id: '1',
          type: 'user_report',
          contentType: 'job_post',
          title: 'Şüpheli İş İlanı',
          description: 'Gerçekçi olmayan maaş ve koşullar sunuluyor',
          reportedBy: {
            id: 'user1',
            name: 'Ahmet Yılmaz',
            email: 'ahmet@example.com',
          },
          reportedUser: {
            id: 'user2',
            name: 'Fake Company Ltd.',
            email: 'contact@fakecompany.com',
          },
          reportReason: 'Yanıltıcı bilgiler ve gerçekçi olmayan teklifler',
          severity: 'high',
          status: 'pending',
          createdAt: new Date('2025-09-13T08:30:00'),
          content: {
            text: 'Aylık 50.000 TL maaşla junior developer arıyoruz. Hiç deneyim gerekmez, evden çalışma imkanı.',
            metadata: {
              jobId: 'job_123',
              category: 'Yazılım Geliştirme',
              location: 'İstanbul',
            },
          },
          autoFlags: {
            spam: true,
            inappropriate: false,
            fake: true,
            harassment: false,
            score: 0.85,
          },
        },
        {
          id: '2',
          type: 'auto_flagged',
          contentType: 'user_profile',
          title: 'Sahte Profil Şüphesi',
          description:
            'Otomatik sistem tarafından sahte profil olarak işaretlendi',
          reportedUser: {
            id: 'user3',
            name: 'Dr. Mehmet Profesör',
            email: 'fake@tempmail.com',
          },
          reportReason: 'Sahte kimlik bilgileri ve çalıntı fotoğraflar',
          severity: 'critical',
          status: 'pending',
          createdAt: new Date('2025-09-13T07:15:00'),
          content: {
            text: "Harvard mezunu doktor, NASA'da çalıştım, şimdi freelance danışman",
            images: ['profile1.jpg', 'certificate1.jpg'],
            metadata: {
              registrationDate: '2025-09-12',
              ipAddress: '185.x.x.x',
              deviceInfo: 'Mobile - Android',
            },
          },
          autoFlags: {
            spam: false,
            inappropriate: false,
            fake: true,
            harassment: false,
            score: 0.92,
          },
        },
        {
          id: '3',
          type: 'user_report',
          contentType: 'message',
          title: 'Taciz İçerikli Mesaj',
          description: 'Kullanıcı uygunsuz mesajlar gönderiyor',
          reportedBy: {
            id: 'user4',
            name: 'Ayşe Demir',
            email: 'ayse@example.com',
          },
          reportedUser: {
            id: 'user5',
            name: 'Problematic User',
            email: 'problem@example.com',
          },
          reportReason: 'Cinsel taciz içerikli mesajlar',
          severity: 'critical',
          status: 'escalated',
          createdAt: new Date('2025-09-13T06:45:00'),
          reviewedAt: new Date('2025-09-13T09:00:00'),
          reviewedBy: 'admin1',
          content: {
            text: '[Uygunsuz içerik - moderatör tarafından gizlendi]',
            metadata: {
              conversationId: 'conv_789',
              messageCount: 15,
              timeSpan: '2 gün',
            },
          },
          autoFlags: {
            spam: false,
            inappropriate: true,
            fake: false,
            harassment: true,
            score: 0.78,
          },
        },
      ];

      setStats(mockStats);
      setModerationItems(mockItems);
    } catch (error) {
      console.error('Failed to fetch moderation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemAction = async (
    itemId: string,
    action: 'approve' | 'reject' | 'escalate'
  ) => {
    try {
      // Update item status
      setModerationItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status:
                  action === 'approve'
                    ? 'approved'
                    : action === 'reject'
                      ? 'rejected'
                      : 'escalated',
                reviewedAt: new Date(),
                reviewedBy: 'current_admin',
              }
            : item
        )
      );

      // In real app, make API call here
      console.log(`Item ${itemId} ${action}ed`);
    } catch (error) {
      console.error(`Failed to ${action} item:`, error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'escalated':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-gray-200"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-96 rounded-lg bg-gray-200 lg:col-span-2"></div>
            <div className="h-96 rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Shield className="h-6 w-6 text-blue-600" />
            İçerik Denetimi
          </h1>
          <p className="mt-1 text-gray-600">
            Platform güvenliği ve içerik kalitesi yönetimi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchModerationData}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')}
            />
            Yenile
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Toplam Rapor
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalReports}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Flag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="font-medium text-green-600">↗ +12%</span>
                <span className="ml-1 text-gray-600">bu hafta</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.pendingReports}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="font-medium text-orange-600">Acil: 23</span>
                <span className="ml-1 text-gray-600">kritik</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Bugün Çözülen
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.resolvedToday}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-gray-600">Ortalama: </span>
                <span className="ml-1 font-medium text-green-600">
                  {stats?.averageResponseTime}h
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Otomatik Algılama
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.autoFlagged}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="font-medium text-purple-600">
                  {stats?.moderationAccuracy}%
                </span>
                <span className="ml-1 text-gray-600">doğruluk</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Rapor, kullanıcı veya içerik ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Tüm Türler</option>
                <option value="user_report">Kullanıcı Raporu</option>
                <option value="auto_flagged">Otomatik Algılanan</option>
                <option value="manual_review">Manuel İnceleme</option>
              </select>

              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Tüm Öncelikler</option>
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
                <option value="critical">Kritik</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Bekleyen</option>
                <option value="approved">Onaylanan</option>
                <option value="rejected">Reddedilen</option>
                <option value="escalated">Yükseltilen</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Moderation Items List */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Denetim Listesi ({filteredItems.length})
            </h2>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtrele
            </Button>
          </div>

          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Denetim öğesi bulunamadı
                </h3>
                <p className="text-gray-600">
                  Seçilen filtrelere uygun denetim öğesi bulunmuyor.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {item.title}
                        </h3>
                        <Badge
                          className={getSeverityColor(item.severity)}
                          variant="secondary"
                        >
                          {item.severity === 'low'
                            ? 'Düşük'
                            : item.severity === 'medium'
                              ? 'Orta'
                              : item.severity === 'high'
                                ? 'Yüksek'
                                : 'Kritik'}
                        </Badge>
                        <Badge
                          className={getStatusColor(item.status)}
                          variant="secondary"
                        >
                          {item.status === 'pending'
                            ? 'Bekleyen'
                            : item.status === 'approved'
                              ? 'Onaylanan'
                              : item.status === 'rejected'
                                ? 'Reddedilen'
                                : 'Yükseltilen'}
                        </Badge>
                      </div>

                      <p className="mb-3 text-sm text-gray-600">
                        {item.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            Rapor Edilen:
                          </span>
                          <p className="text-gray-600">
                            {item.reportedUser.name}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Rapor Sebebi:
                          </span>
                          <p className="text-gray-600">{item.reportReason}</p>
                        </div>
                        {item.reportedBy && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Rapor Eden:
                            </span>
                            <p className="text-gray-600">
                              {item.reportedBy.name}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">
                            Tarih:
                          </span>
                          <p className="text-gray-600">
                            {item.createdAt.toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>

                      {/* Auto flags */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.autoFlags.spam && (
                          <Badge
                            variant="outline"
                            className="border-red-200 text-red-600"
                          >
                            Spam
                          </Badge>
                        )}
                        {item.autoFlags.inappropriate && (
                          <Badge
                            variant="outline"
                            className="border-orange-200 text-orange-600"
                          >
                            Uygunsuz
                          </Badge>
                        )}
                        {item.autoFlags.fake && (
                          <Badge
                            variant="outline"
                            className="border-purple-200 text-purple-600"
                          >
                            Sahte
                          </Badge>
                        )}
                        {item.autoFlags.harassment && (
                          <Badge
                            variant="outline"
                            className="border-red-200 text-red-600"
                          >
                            Taciz
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="border-blue-200 text-blue-600"
                        >
                          Skor: {(item.autoFlags.score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {item.status === 'pending' && (
                      <div className="ml-4 flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleItemAction(item.id, 'approve')}
                          className="border-green-200 text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleItemAction(item.id, 'reject')}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reddet
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleItemAction(item.id, 'escalate')}
                          className="border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          <AlertTriangle className="mr-1 h-4 w-4" />
                          Yükselt
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5" />
                Kategori Dağılımı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.categoryBreakdown.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {category.category}
                    </span>
                    <span className="text-gray-600">{category.count}</span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                  <div className="text-right text-xs text-gray-500">
                    {category.percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Ban className="mr-2 h-4 w-4" />
                Toplu Engelleme
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <UserX className="mr-2 h-4 w-4" />
                Kullanıcı Geçmişi
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Uyarı Mesajı Gönder
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <FileText className="mr-2 h-4 w-4" />
                Rapor Oluştur
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Son Aktiviteler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">Spam raporu onaylandı</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">
                    Kullanıcı hesabı askıya alındı
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">
                    Yeni moderasyon kuralı eklendi
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-600">
                    İtiraz süreci başlatıldı
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
