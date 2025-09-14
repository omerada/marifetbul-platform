'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  User,
  Ban,
  RefreshCw,
  Filter,
  Search,
  MoreHorizontal,
  FileText,
  Calendar,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';

interface UserReport {
  id: string;
  reportedBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  reportedUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    userType: 'freelancer' | 'employer';
  };
  reportedContent?: {
    id: string;
    type: 'job' | 'package' | 'message' | 'profile' | 'review';
    title: string;
    excerpt: string;
  };
  category:
    | 'spam'
    | 'inappropriate'
    | 'harassment'
    | 'fraud'
    | 'fake_profile'
    | 'other';
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: {
    id: string;
    name: string;
  };
  resolution?: {
    action:
      | 'no_action'
      | 'warning'
      | 'content_removal'
      | 'account_restriction'
      | 'account_suspension'
      | 'account_ban';
    reason: string;
    notes: string;
    resolvedBy: string;
    resolvedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  evidence: {
    screenshots?: string[];
    messages?: string[];
    other?: string[];
  };
}

interface ReportStats {
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  averageResolutionTime: number;
  categoryBreakdown: Record<string, number>;
  severityBreakdown: Record<string, number>;
}

const UserReportManagement: React.FC = () => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reportsRes, statsRes] = await Promise.all([
          fetch('/api/admin/reports'),
          fetch('/api/admin/reports/stats'),
        ]);

        const [reportsData, statsData] = await Promise.all([
          reportsRes.json(),
          statsRes.json(),
        ]);

        setReports(reportsData.data || []);
        setStats(statsData.data || null);
      } catch (error) {
        console.error('Failed to fetch reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateReportStatus = async (
    reportId: string,
    status: UserReport['status']
  ) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setReports((prev) =>
          prev.map((report) =>
            report.id === reportId
              ? { ...report, status, updatedAt: new Date().toISOString() }
              : report
          )
        );
      }
    } catch (error) {
      console.error('Failed to update report status:', error);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update UI to reflect user blocking
        console.log('User blocked successfully');
      }
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.reportedUser.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.reportedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || report.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' || report.category === categoryFilter;
    const matchesPriority =
      priorityFilter === 'all' || report.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'investigating':
        return 'bg-blue-500';
      case 'resolved':
        return 'bg-green-500';
      case 'dismissed':
        return 'bg-gray-500';
      case 'escalated':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spam':
        return <MessageSquare className="h-4 w-4" />;
      case 'inappropriate':
        return <AlertTriangle className="h-4 w-4" />;
      case 'harassment':
        return <Shield className="h-4 w-4" />;
      case 'fraud':
        return <AlertTriangle className="h-4 w-4" />;
      case 'fake_profile':
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'investigating':
        return <Search className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4" />;
      case 'escalated':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
        <span>Rapor verileri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Kullanıcı Rapor Yönetimi
          </h1>
          <p className="text-gray-600">
            Kullanıcı şikayetleri ve raporlarını yönetin
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Rapor</p>
                  <p className="text-2xl font-bold">
                    {stats.totalReports.toLocaleString()}
                  </p>
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
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pendingReports.toLocaleString()}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bugün Çözülen</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.resolvedToday.toLocaleString()}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ort. Çözüm Süresi</p>
                  <p className="text-2xl font-bold">
                    {stats.averageResolutionTime}h
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-64 flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Kullanıcı adı, e-posta veya rapor nedeni ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="investigating">İnceleniyor</SelectItem>
                <SelectItem value="resolved">Çözüldü</SelectItem>
                <SelectItem value="dismissed">Reddedildi</SelectItem>
                <SelectItem value="escalated">Yönlendirildi</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="inappropriate">Uygunsuz İçerik</SelectItem>
                <SelectItem value="harassment">Taciz</SelectItem>
                <SelectItem value="fraud">Dolandırıcılık</SelectItem>
                <SelectItem value="fake_profile">Sahte Profil</SelectItem>
                <SelectItem value="other">Diğer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Öncelik" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Öncelikler</SelectItem>
                <SelectItem value="critical">Kritik</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filtrele
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Rapor Listesi ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="space-y-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      {getCategoryIcon(report.category)}
                      <h3 className="font-medium text-gray-900">
                        Rapor #{report.id.slice(-6)}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(report.status)} text-white`}
                      >
                        {getStatusIcon(report.status)}
                        <span className="ml-1">{report.status}</span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${getPriorityColor(report.priority)} text-white`}
                      >
                        {report.priority}
                      </Badge>
                    </div>

                    <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-600">Şikayet Eden:</p>
                        <p className="font-medium">{report.reportedBy.name}</p>
                        <p className="text-sm text-gray-500">
                          {report.reportedBy.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Şikayet Edilen:</p>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {report.reportedUser.name}
                          </p>
                          <Badge variant="secondary">
                            {report.reportedUser.userType}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {report.reportedUser.email}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Kategori:</p>
                      <p className="font-medium">{report.category}</p>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Rapor Nedeni:</p>
                      <p className="text-sm">{report.reason}</p>
                    </div>

                    {report.description && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Açıklama:</p>
                        <p className="text-sm text-gray-700">
                          {report.description}
                        </p>
                      </div>
                    )}

                    {report.reportedContent && (
                      <div className="mb-3 rounded bg-gray-50 p-3">
                        <p className="text-sm text-gray-600">İlgili İçerik:</p>
                        <p className="text-sm font-medium">
                          {report.reportedContent.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {report.reportedContent.excerpt}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        Oluşturulma:{' '}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        Güncelleme:{' '}
                        {new Date(report.updatedAt).toLocaleDateString()}
                      </span>
                      {report.assignedTo && (
                        <span>Atanan: {report.assignedTo.name}</span>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => console.log('View details:', report.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Detayları Görüntüle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />

                      {report.status === 'pending' && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateReportStatus(report.id, 'investigating')
                          }
                        >
                          <Search className="mr-2 h-4 w-4" />
                          İncelemeye Al
                        </DropdownMenuItem>
                      )}

                      {['pending', 'investigating'].includes(report.status) && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateReportStatus(report.id, 'resolved')
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Çözüldü Olarak İşaretle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateReportStatus(report.id, 'dismissed')
                            }
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reddet
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateReportStatus(report.id, 'escalated')
                            }
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Yöneticiye Yönlendir
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleBlockUser(report.reportedUser.id)}
                        className="text-red-600"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Kullanıcıyı Engelle
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>Filtrelerinize uygun rapor bulunamadı.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserReportManagement;
