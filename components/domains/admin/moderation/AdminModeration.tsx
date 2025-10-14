'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import {
  MoreHorizontal,
  Search,
  Filter,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  Flag,
  MessageSquare,
  User,
  Briefcase,
  Star,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/shared/utils/logger';

interface ModerationFilters {
  status: string[];
  priority: string[];
  type: string[];
  search: string;
}

interface ModerationItem {
  id: string;
  type: 'review' | 'job' | 'package' | 'message' | 'profile';
  contentId: string;
  content: {
    title: string;
    description: string;
    rating?: number;
    userContent: {
      userId: string;
      userName: string;
      userType: 'freelancer' | 'employer';
      submittedAt: string;
    };
  };
  reportedBy: string;
  reporterInfo: {
    id: string;
    firstName: string;
    lastName: string;
    userType: 'freelancer' | 'employer';
  };
  reason: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  automatedFlags: Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    confidence: number;
    details: string;
    flaggedAt: string;
  }>;
  reviewHistory: Array<{
    id: string;
    moderatorId: string;
    moderatorName: string;
    action: string;
    notes?: string;
    timestamp: string;
  }>;
  moderatorNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface ModerationStats {
  totalItems: number;
  pendingItems: number;
  approvedItems: number;
  rejectedItems: number;
  averageReviewTime: number;
  automatedFlagAccuracy: number;
  topModerationReasons: Array<{
    reason: string;
    count: number;
  }>;
}

export function AdminModeration() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ModerationFilters>({
    status: [],
    priority: [],
    type: [],
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'escalate' | null
  >(null);
  const [actionNotes, setActionNotes] = useState('');

  const fetchModerationQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      // Add filters to params
      filters.status.forEach((status) => params.append('status[]', status));
      filters.priority.forEach((priority) =>
        params.append('priority[]', priority)
      );
      filters.type.forEach((type) => params.append('type[]', type));

      if (filters.search) {
        params.append('search', filters.search);
      }

      // Production note: Auth token retrieved from cookie (auth_token).
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      const response = await fetch(`/api/v1/admin/moderation/queue?${params}`, {
        headers: {
          ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Moderasyon kuyruğu alınamadı');
      }

      const data = await response.json();
      setItems(data.data.items);
      setPagination((prev) => ({
        ...prev,
        total: data.data.pagination.total,
        totalPages: data.data.pagination.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchModerationStats = useCallback(async () => {
    try {
      // Production note: Auth token retrieved from cookie (auth_token).
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      const response = await fetch('/api/v1/admin/moderation/stats', {
        headers: {
          ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      logger.error('Moderasyon istatistikleri alınamadı:', err);
    }
  }, []);

  useEffect(() => {
    fetchModerationQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchModerationStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (
    key: keyof ModerationFilters,
    value: string | string[]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAction = async () => {
    if (!selectedItem || !actionType) return;

    try {
      const response = await fetch(
        `/api/v1/admin/moderation/${selectedItem.id}/action`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: actionType,
            notes: actionNotes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('İşlem gerçekleştirilemedi');
      }

      // Refresh the list
      await fetchModerationQueue();
      await fetchModerationStats();

      // Close dialog
      setShowActionDialog(false);
      setSelectedItem(null);
      setActionType(null);
      setActionNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <Star className="h-4 w-4" />;
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'package':
        return <MessageSquare className="h-4 w-4" />;
      case 'profile':
        return <User className="h-4 w-4" />;
      default:
        return <Flag className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Moderasyon</h1>
          <Button onClick={fetchModerationQueue} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Yeniden Dene
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center text-red-800">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderasyon</h1>
          <p className="mt-1 text-sm text-gray-500">
            İçerik moderasyonu ve kullanıcı raporları
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <Button
            onClick={fetchModerationQueue}
            disabled={isLoading}
            variant="primary"
            size="sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">
                    Bekleyen
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats.pendingItems}
                  </p>
                </div>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Onaylandı
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.approvedItems}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Reddedildi</p>
                  <p className="text-2xl font-bold text-red-900">
                    {stats.rejectedItems}
                  </p>
                </div>
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Ort. İnceleme
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {Math.round(stats.averageReviewTime / 60)}dk
                  </p>
                </div>
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="İçerik ara..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Durum{' '}
                  {filters.status.length > 0 && `(${filters.status.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => handleFilterChange('status', [])}
                >
                  Tümü
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange('status', ['pending'])}
                >
                  Bekleyen
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange('status', ['approved'])}
                >
                  Onaylandı
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange('status', ['rejected'])}
                >
                  Reddedildi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Öncelik{' '}
                  {filters.priority.length > 0 &&
                    `(${filters.priority.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => handleFilterChange('priority', [])}
                >
                  Tümü
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange('priority', ['critical'])}
                >
                  Kritik
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange('priority', ['high'])}
                >
                  Yüksek
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange('priority', ['medium'])}
                >
                  Orta
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange('priority', ['low'])}
                >
                  Düşük
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İçerik</TableHead>
                  <TableHead>Rapor Eden</TableHead>
                  <TableHead>Sebep</TableHead>
                  <TableHead>Öncelik</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Yükleniyor...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-gray-500"
                    >
                      Moderasyon öğesi bulunamadı
                    </TableCell>
                  </TableRow>
                ) : Array.isArray(items) && items.length > 0 ? (
                  items
                    .map((item) => {
                      if (!item || !item.id) {
                        return null;
                      }
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {getTypeIcon(item.type || 'review')}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium text-gray-900">
                                  {item.content?.title || 'Başlık bulunamadı'}
                                </div>
                                <div className="truncate text-sm text-gray-500">
                                  {item.content?.description
                                    ? `${item.content.description.substring(0, 100)}...`
                                    : 'Açıklama bulunamadı'}
                                </div>
                                <div className="mt-1 flex items-center space-x-2">
                                  <Badge variant="secondary" size="sm">
                                    {item.type || 'unknown'}
                                  </Badge>
                                  {Array.isArray(item.automatedFlags) &&
                                    item.automatedFlags.length > 0 && (
                                      <Badge variant="warning" size="sm">
                                        {item.automatedFlags.length} flag
                                      </Badge>
                                    )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item?.reporterInfo?.firstName || 'Bilinmeyen'}{' '}
                                {item?.reporterInfo?.lastName || ''}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item?.reporterInfo?.userType || 'Bilinmeyen'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-900">
                              {item?.reason
                                ? item.reason.replace('_', ' ')
                                : 'Bilinmeyen sebep'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getPriorityColor(
                                item?.priority || 'low'
                              )}
                            >
                              {item?.priority === 'critical'
                                ? 'Kritik'
                                : item?.priority === 'high'
                                  ? 'Yüksek'
                                  : item?.priority === 'medium'
                                    ? 'Orta'
                                    : 'Düşük'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(
                                item?.status || 'pending'
                              )}
                            >
                              {item?.status === 'pending'
                                ? 'Bekleyen'
                                : item?.status === 'approved'
                                  ? 'Onaylandı'
                                  : item?.status === 'rejected'
                                    ? 'Reddedildi'
                                    : 'Escalated'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {item?.createdAt
                                ? new Date(item.createdAt).toLocaleDateString(
                                    'tr-TR'
                                  )
                                : 'Bilinmeyen tarih'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedItem(item);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Detayları Gör
                                </DropdownMenuItem>
                                {item?.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setActionType('approve');
                                        setShowActionDialog(true);
                                      }}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Onayla
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setActionType('reject');
                                        setShowActionDialog(true);
                                      }}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reddet
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setActionType('escalate');
                                        setShowActionDialog(true);
                                      }}
                                    >
                                      <AlertTriangle className="mr-2 h-4 w-4" />
                                      Escalate Et
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                    .filter(Boolean)
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      <div className="text-gray-500">
                        <AlertCircle className="mx-auto mb-2 h-8 w-8" />
                        <p>Henüz hiç moderasyon öğesi yok</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Toplam {pagination.total} öğe
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1 || isLoading}
                >
                  Önceki
                </Button>
                <span className="text-sm">
                  Sayfa {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={
                    pagination.page === pagination.totalPages || isLoading
                  }
                >
                  Sonraki
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve'
                ? 'İçeriği Onayla'
                : actionType === 'reject'
                  ? 'İçeriği Reddet'
                  : 'İçeriği Escalate Et'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <label className="text-sm font-medium text-gray-700">
              Notlar (Opsiyonel)
            </label>
            <textarea
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              rows={3}
              placeholder="İşlem için not ekleyin..."
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              {actionType === 'approve'
                ? 'Onayla'
                : actionType === 'reject'
                  ? 'Reddet'
                  : 'Escalate Et'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminModeration;
