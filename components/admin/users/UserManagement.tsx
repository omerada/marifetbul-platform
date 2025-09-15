'use client';

import { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import {
  Users,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Calendar,
  MapPin,
  Shield,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useUserManagement } from '@/hooks';
import type { AdminUserData, BulkUserActionRequest } from '@/types';

// User status badge component
function UserStatusBadge({ status }: { status: string }) {
  const variants = {
    active: { variant: 'success' as const, icon: CheckCircle, text: 'Aktif' },
    suspended: {
      variant: 'warning' as const,
      icon: AlertTriangle,
      text: 'Askıya Alındı',
    },
    banned: {
      variant: 'destructive' as const,
      icon: XCircle,
      text: 'Yasaklandı',
    },
    pending_verification: {
      variant: 'secondary' as const,
      icon: Clock,
      text: 'Onay Bekliyor',
    },
  };

  const config = variants[status as keyof typeof variants] || variants.active;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
}

// Verification status badge component
function VerificationBadge({ status }: { status: string }) {
  const variants = {
    verified: {
      variant: 'success' as const,
      icon: UserCheck,
      text: 'Doğrulandı',
    },
    pending: { variant: 'warning' as const, icon: Clock, text: 'Beklemede' },
    rejected: {
      variant: 'destructive' as const,
      icon: UserX,
      text: 'Reddedildi',
    },
    unverified: {
      variant: 'secondary' as const,
      icon: Shield,
      text: 'Doğrulanmadı',
    },
  };

  const config =
    variants[status as keyof typeof variants] || variants.unverified;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
}

// User detail modal component
function UserDetailModal({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUserData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kullanıcı Tipi:</span>
                <Badge variant="outline">
                  {user.userType === 'freelancer' ? 'Freelancer' : 'İşveren'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hesap Durumu:</span>
                <UserStatusBadge status={user.accountStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Doğrulama Durumu:</span>
                <VerificationBadge status={user.verificationStatus} />
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{user.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  Kayıt:{' '}
                  {user.joinDate
                    ? new Date(user.joinDate).toLocaleDateString('tr-TR')
                    : 'Belirtilmemiş'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">İstatistikler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Toplam Sipariş:</span>
                <span className="font-medium">{user.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Başarı Oranı:</span>
                <span className="font-medium">%{user.successRate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">İhtilaf Sayısı:</span>
                <span className="font-medium">{user.disputeCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Risk Skoru:</span>
                <Badge
                  variant={
                    (user.riskScore ?? 0) > 70
                      ? 'destructive'
                      : (user.riskScore ?? 0) > 30
                        ? 'warning'
                        : 'success'
                  }
                >
                  {user.riskScore ?? 0}
                </Badge>
              </div>
              {user.userType === 'freelancer' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Toplam Kazanç:</span>
                  <span className="font-medium">
                    ₺{user.totalEarnings?.toLocaleString('tr-TR')}
                  </span>
                </div>
              )}
              {user.userType === 'employer' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Toplam Harcama:</span>
                  <span className="font-medium">
                    ₺{user.totalSpent?.toLocaleString('tr-TR')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Doğrulama Rozeti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user.verificationBadges?.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded bg-gray-50 p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm capitalize">{badge}</span>
                    </div>
                    <VerificationBadge status="verified" />
                  </div>
                )) || (
                  <div className="text-sm text-gray-500">
                    Doğrulama rozeti bulunamadı
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Son Aktivite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  Son Giriş:{' '}
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString('tr-TR')
                    : 'Belirtilmemiş'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  Son Aktivite:{' '}
                  {user.lastActiveAt
                    ? new Date(user.lastActiveAt).toLocaleDateString('tr-TR')
                    : 'Belirtilmemiş'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Giriş Sayısı:</span>
                <span className="font-medium">{user.loginCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uyarı Sayısı:</span>
                <span className="font-medium">{user.warningCount ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    userType: 'all',
    accountStatus: 'all',
    verificationStatus: 'all',
  });

  // Use the actual hook
  const {
    users,
    isLoading,
    error,
    statistics,
    pagination,
    bulkSelection,
    onFilterChange,
    onPageChange,
    onSearch,
    onBulkAction,
    onBulkToggle,
    onSelectAll,
  } = useUserManagement();

  // Map local filters to hook filters
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    onFilterChange({
      [key]: value === 'all' ? undefined : value,
    });
  };

  // Search handler
  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleUserClick = (user: AdminUserData) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleBulkActionClick = (actionType: string) => {
    if (bulkSelection.hasSelection) {
      const bulkAction: BulkUserActionRequest = {
        userIds: bulkSelection.selectedIds,
        action: actionType as
          | 'suspend'
          | 'unsuspend'
          | 'ban'
          | 'unban'
          | 'verify'
          | 'unverify',
        reason: `Bulk ${actionType} action`,
      };
      onBulkAction(bulkAction);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Kullanıcı Yönetimi
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform kullanıcılarını görüntüleyin ve yönetin
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Kullanıcı Ekle
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Toplam Kullanıcı
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.total.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="ml-1 text-sm font-medium text-green-600">
                +12.3%
              </span>
              <span className="ml-1 text-sm text-gray-500">bu ay</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Aktif Kullanıcı
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.active.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="ml-1 text-sm font-medium text-green-600">
                +8.1%
              </span>
              <span className="ml-1 text-sm text-gray-500">bu ay</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Freelancer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.freelancers.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="ml-1 text-sm font-medium text-green-600">
                +15.2%
              </span>
              <span className="ml-1 text-sm text-gray-500">bu ay</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">İşveren</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.employers.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="ml-1 text-sm font-medium text-red-600">
                -2.1%
              </span>
              <span className="ml-1 text-sm text-gray-500">bu ay</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Kullanıcı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.userType}
                onValueChange={(value) => handleFilterChange('userType', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Kullanıcı Tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="employer">İşveren</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.accountStatus}
                onValueChange={(value) =>
                  handleFilterChange('accountStatus', value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Hesap Durumu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="suspended">Askıya Alındı</SelectItem>
                  <SelectItem value="banned">Yasaklandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Daha Fazla Filtre
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {/* Bulk Actions */}
            {bulkSelection.hasSelection && (
              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    {bulkSelection.selectedCount} kullanıcı seçildi
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkActionClick('unsuspend')}
                    >
                      Aktifleştir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkActionClick('suspend')}
                    >
                      Askıya Al
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkActionClick('ban')}
                    >
                      Yasakla
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar ({users.length.toLocaleString()})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Kullanıcılar yükleniyor...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
                <p className="mt-2 text-sm text-red-600">{error}</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <Users className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Kullanıcı bulunamadı
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={bulkSelection.isAllSelected}
                      onChange={onSelectAll}
                    />
                  </TableHead>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Doğrulama</TableHead>
                  <TableHead>Son Aktivite</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: AdminUserData) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleUserClick(user)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={bulkSelection.selectedIds.includes(user.id)}
                        onChange={() => onBulkToggle(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                          <Users className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.userType === 'freelancer'
                          ? 'Freelancer'
                          : 'İşveren'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <UserStatusBadge status={user.accountStatus} />
                    </TableCell>
                    <TableCell>
                      <VerificationBadge status={user.verificationStatus} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {user.lastActiveAt
                          ? new Date(user.lastActiveAt).toLocaleDateString(
                              'tr-TR'
                            )
                          : 'Belirtilmemiş'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          (user.riskScore ?? 0) > 70
                            ? 'destructive'
                            : (user.riskScore ?? 0) > 30
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {user.riskScore}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleUserClick(user)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Ban className="mr-2 h-4 w-4" />
                            Askıya Al
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {users.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-sm text-gray-700">
            Gösterilen: {(pagination.currentPage - 1) * 20 + 1}-
            {Math.min(pagination.currentPage * 20, pagination.total)} /{' '}
            {pagination.total} kullanıcı
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              Önceki
            </Button>
            <span className="text-sm">
              Sayfa {pagination.currentPage} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          open={showUserDetail}
          onOpenChange={setShowUserDetail}
        />
      )}
    </div>
  );
}

export default UserManagement;
