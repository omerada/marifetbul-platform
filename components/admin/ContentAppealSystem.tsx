'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  Search,
  Eye,
  UserCheck,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Calendar,
  User,
  BarChart3,
} from 'lucide-react';

// Types
interface ContentAppeal {
  id: string;
  appealNumber: string;
  userId: string;
  userInfo: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    userType: 'freelancer' | 'employer';
  };
  moderationItemId: string;
  originalContent: {
    id: string;
    type: 'job' | 'service' | 'review' | 'message' | 'profile';
    title: string;
    description: string;
    moderatedAt: string;
    moderationReason: string;
    moderatorId: string;
    moderatorName: string;
    action: 'removed' | 'hidden' | 'flagged' | 'suspended';
  };
  appealReason:
    | 'incorrect_decision'
    | 'content_misunderstood'
    | 'policy_misapplied'
    | 'technical_error'
    | 'other';
  appealDescription: string;
  supportingEvidence?: {
    id: string;
    type: 'document' | 'image' | 'link' | 'text';
    url?: string;
    content?: string;
    uploadedAt: string;
  }[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  reviewHistory: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    action: 'assigned' | 'reviewed' | 'escalated' | 'resolved';
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    timestamp: string;
  }[];
  resolution?: {
    decision: 'upheld' | 'overturned' | 'partially_upheld';
    reason: string;
    action:
      | 'restore_content'
      | 'maintain_action'
      | 'modify_action'
      | 'escalate_further';
    reviewerId: string;
    reviewerName: string;
    resolvedAt: string;
    compensationOffered?: boolean;
    compensationDetails?: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags: string[];
  internalNotes: {
    id: string;
    authorId: string;
    authorName: string;
    note: string;
    isConfidential: boolean;
    createdAt: string;
  }[];
}

interface AppealStats {
  totalAppeals: number;
  pendingAppeals: number;
  underReview: number;
  resolvedToday: number;
  averageResolutionTime: number; // hours
  appealsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  appealsByReason: Array<{
    reason: string;
    count: number;
    successRate: number;
  }>;
  resolutionTrends: Array<{
    date: string;
    approved: number;
    rejected: number;
    escalated: number;
  }>;
  reviewerPerformance: Array<{
    reviewerId: string;
    reviewerName: string;
    reviewedAppeals: number;
    averageTime: number;
    successRate: number;
  }>;
}

export default function ContentAppealSystem() {
  const [appeals, setAppeals] = useState<ContentAppeal[]>([]);
  const [stats, setStats] = useState<AppealStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [selectedAppeal, setSelectedAppeal] = useState<ContentAppeal | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch appeals data
  const fetchAppeals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (reasonFilter !== 'all') params.append('reason', reasonFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/content-appeals?${params}`);
      const data = await response.json();
      setAppeals(data.appeals || []);
    } catch (error) {
      console.error('Error fetching appeals:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, reasonFilter, searchTerm]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/content-appeals/stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchAppeals();
    fetchStats();
  }, [fetchAppeals]);

  const handleAppealAction = async (
    appealId: string,
    action: string,
    notes?: string
  ) => {
    try {
      const response = await fetch(`/api/content-appeals/${appealId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });

      if (response.ok) {
        fetchAppeals();
        fetchStats();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error processing appeal action:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'escalated':
        return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'escalated':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'incorrect_decision':
        return 'Yanlış Karar';
      case 'content_misunderstood':
        return 'İçerik Yanlış Anlaşıldı';
      case 'policy_misapplied':
        return 'Politika Yanlış Uygulandı';
      case 'technical_error':
        return 'Teknik Hata';
      case 'other':
        return 'Diğer';
      default:
        return reason;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">İtirazlar yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            İçerik İtiraz Sistemi
          </h1>
          <p className="text-gray-600">
            Kullanıcı itirazlarını yönetin ve moderasyon kararlarını gözden
            geçirin
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchAppeals()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Rapor Al
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam İtiraz</p>
                  <p className="text-2xl font-bold">{stats.totalAppeals}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bekleyen</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.pendingAppeals}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">İnceleniyor</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.underReview}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bugün Çözülen</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.resolvedToday}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Arama
              </label>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  type="text"
                  placeholder="İtiraz no, kullanıcı adı..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Durum
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Tümü</option>
                <option value="pending">Bekleyen</option>
                <option value="under_review">İnceleniyor</option>
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
                <option value="escalated">Yükseldi</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Öncelik
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Tümü</option>
                <option value="urgent">Acil</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                İtiraz Nedeni
              </label>
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Tümü</option>
                <option value="incorrect_decision">Yanlış Karar</option>
                <option value="content_misunderstood">
                  İçerik Yanlış Anlaşıldı
                </option>
                <option value="policy_misapplied">
                  Politika Yanlış Uygulandı
                </option>
                <option value="technical_error">Teknik Hata</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setReasonFilter('all');
                }}
                variant="outline"
                className="flex w-full items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="appeals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appeals" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            İtirazlar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analitik
          </TabsTrigger>
          <TabsTrigger value="reviewers" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            İnceleyici Performansı
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appeals" className="space-y-4">
          {/* Appeals List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>İtiraz Listesi ({appeals.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appeals.length === 0 ? (
                  <div className="py-8 text-center">
                    <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p className="text-gray-500">
                      Filtrelerinizle eşleşen itiraz bulunamadı
                    </p>
                  </div>
                ) : (
                  appeals.map((appeal) => (
                    <div
                      key={appeal.id}
                      className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
                      onClick={() => {
                        setSelectedAppeal(appeal);
                        setShowDetailModal(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <span className="font-semibold text-blue-600">
                              #{appeal.appealNumber}
                            </span>
                            <Badge
                              className={`border ${getStatusColor(appeal.status)} flex items-center gap-1`}
                            >
                              {getStatusIcon(appeal.status)}
                              {appeal.status}
                            </Badge>
                            <Badge
                              className={`border ${getPriorityColor(appeal.priority)}`}
                            >
                              {appeal.priority}
                            </Badge>
                          </div>

                          <h3 className="mb-1 font-medium text-gray-900">
                            {appeal.originalContent.title}
                          </h3>

                          <p className="mb-2 text-sm text-gray-600">
                            <strong>İtiraz Nedeni:</strong>{' '}
                            {getReasonText(appeal.appealReason)}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {appeal.userInfo.firstName}{' '}
                              {appeal.userInfo.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(appeal.createdAt)}
                            </span>
                            {appeal.assignedTo && (
                              <span className="flex items-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                {appeal.assignedTo.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="ml-4 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppeal(appeal);
                              setShowDetailModal(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Durum Dağılımı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.appealsByStatus.map((statusData) => (
                      <div
                        key={statusData.status}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(statusData.status)}
                          <span className="capitalize">
                            {statusData.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {statusData.count}
                          </span>
                          <span className="text-sm font-medium">
                            {statusData.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Appeal Reasons */}
              <Card>
                <CardHeader>
                  <CardTitle>İtiraz Nedenleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.appealsByReason.map((reasonData) => (
                      <div key={reasonData.reason} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {getReasonText(reasonData.reason)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {reasonData.count}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              {reasonData.successRate.toFixed(1)}% başarı
                            </span>
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{
                              width: `${(reasonData.count / stats.totalAppeals) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resolution Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Çözüm Trendleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.resolutionTrends.map((trend) => (
                      <div
                        key={trend.date}
                        className="grid grid-cols-4 gap-2 text-sm"
                      >
                        <span className="font-medium">{trend.date}</span>
                        <span className="text-green-600">
                          ✓ {trend.approved}
                        </span>
                        <span className="text-red-600">✗ {trend.rejected}</span>
                        <span className="text-purple-600">
                          ↗ {trend.escalated}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Average Resolution Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Ortalama Çözüm Süresi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-blue-600">
                      {stats.averageResolutionTime.toFixed(1)}
                    </div>
                    <div className="text-gray-600">saat</div>
                    <div className="mt-4 text-sm text-gray-500">
                      Son 30 günün ortalaması
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviewers" className="space-y-4">
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>İnceleyici Performansı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="p-3 text-left">İnceleyici</th>
                        <th className="p-3 text-left">İncelenen</th>
                        <th className="p-3 text-left">Ortalama Süre</th>
                        <th className="p-3 text-left">Başarı Oranı</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.reviewerPerformance.map((reviewer) => (
                        <tr
                          key={reviewer.reviewerId}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3 font-medium">
                            {reviewer.reviewerName}
                          </td>
                          <td className="p-3">{reviewer.reviewedAppeals}</td>
                          <td className="p-3">
                            {reviewer.averageTime.toFixed(1)} saat
                          </td>
                          <td className="p-3">
                            <span
                              className={`font-medium ${
                                reviewer.successRate >= 90
                                  ? 'text-green-600'
                                  : reviewer.successRate >= 75
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                            >
                              {reviewer.successRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Appeal Detail Modal */}
      {showDetailModal && selectedAppeal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white">
            <div className="border-b p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  İtiraz Detayı - #{selectedAppeal.appealNumber}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Appeal Info */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold">İtiraz Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Durum:</strong>
                      <Badge
                        className={`ml-2 border ${getStatusColor(selectedAppeal.status)}`}
                      >
                        {selectedAppeal.status}
                      </Badge>
                    </div>
                    <div>
                      <strong>Öncelik:</strong>
                      <Badge
                        className={`ml-2 border ${getPriorityColor(selectedAppeal.priority)}`}
                      >
                        {selectedAppeal.priority}
                      </Badge>
                    </div>
                    <div>
                      <strong>Neden:</strong>{' '}
                      {getReasonText(selectedAppeal.appealReason)}
                    </div>
                    <div>
                      <strong>Oluşturulma:</strong>{' '}
                      {formatDate(selectedAppeal.createdAt)}
                    </div>
                    {selectedAppeal.assignedTo && (
                      <div>
                        <strong>Atanan:</strong>{' '}
                        {selectedAppeal.assignedTo.name}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Kullanıcı Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Ad Soyad:</strong>{' '}
                      {selectedAppeal.userInfo.firstName}{' '}
                      {selectedAppeal.userInfo.lastName}
                    </div>
                    <div>
                      <strong>E-posta:</strong> {selectedAppeal.userInfo.email}
                    </div>
                    <div>
                      <strong>Tip:</strong> {selectedAppeal.userInfo.userType}
                    </div>
                  </div>
                </div>
              </div>

              {/* Original Content */}
              <div>
                <h3 className="mb-2 font-semibold">Orjinal İçerik</h3>
                <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                  <div>
                    <strong>Başlık:</strong>{' '}
                    {selectedAppeal.originalContent.title}
                  </div>
                  <div>
                    <strong>Açıklama:</strong>{' '}
                    {selectedAppeal.originalContent.description}
                  </div>
                  <div>
                    <strong>Moderasyon Nedeni:</strong>{' '}
                    {selectedAppeal.originalContent.moderationReason}
                  </div>
                  <div>
                    <strong>Moderatör:</strong>{' '}
                    {selectedAppeal.originalContent.moderatorName}
                  </div>
                  <div>
                    <strong>Aksiyon:</strong>{' '}
                    {selectedAppeal.originalContent.action}
                  </div>
                </div>
              </div>

              {/* Appeal Description */}
              <div>
                <h3 className="mb-2 font-semibold">İtiraz Açıklaması</h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  {selectedAppeal.appealDescription}
                </div>
              </div>

              {/* Actions */}
              {selectedAppeal.status === 'pending' ||
              selectedAppeal.status === 'under_review' ? (
                <div className="flex gap-3 border-t pt-4">
                  <Button
                    onClick={() =>
                      handleAppealAction(selectedAppeal.id, 'approve')
                    }
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Onayla
                  </Button>
                  <Button
                    onClick={() =>
                      handleAppealAction(selectedAppeal.id, 'reject')
                    }
                    variant="danger"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reddet
                  </Button>
                  <Button
                    onClick={() =>
                      handleAppealAction(selectedAppeal.id, 'escalate')
                    }
                    variant="outline"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Yükselt
                  </Button>
                </div>
              ) : (
                <div className="border-t pt-4">
                  <p className="text-gray-600">
                    Bu itiraz zaten işlenmiş durumda.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
