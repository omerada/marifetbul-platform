'use client';

/**
 * ================================================
 * USER TABLE - UNIFIED DATA TABLE VERSION
 * ================================================
 * Sprint 2 - Story 2.1: First Migration
 *
 * Migrated from 256 lines to ~100 lines using UnifiedDataTable.
 * All features preserved: filters, bulk actions, selection, pagination, export.
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @since 2025-11-19
 */

import React, { useState, useMemo } from 'react';
import { UnifiedDataTable } from '@/lib/components/unified/UnifiedDataTable';
import type {
  Column,
  BulkAction,
  RowAction,
} from '@/lib/components/unified/UnifiedDataTable';
import { useUserManagement } from '@/hooks';
import { Card, CardContent, CardHeader } from '@/components/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/uiDialog';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { SimpleErrorDisplay } from '@/components/ui/SimpleErrorDisplay';
import { useUserTableActions } from './userTable/hooks/useUserTableActions';
import { formatUserName } from './userTable/utils/userTableHelpers';
import { UserActivityTimeline } from './UserActivityTimeline';
import { UserExportButton } from './UserExportButton';
import { TableFilters } from './userTable/components';
import type {
  AdminUserData,
  UserStatus,
} from './userTable/types/userTableTypes';
import {
  UserIcon,
  MailIcon,
  CheckCircleIcon,
  BanIcon,
  PlayIcon,
  ActivityIcon,
  TrashIcon,
} from 'lucide-react';

interface UserTableProps {
  className?: string;
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

function StatusBadge({ status }: { status: UserStatus }) {
  const variants: Record<UserStatus, { color: string; label: string }> = {
    active: { color: 'bg-green-100 text-green-800', label: 'Aktif' },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Pasif' },
    suspended: {
      color: 'bg-yellow-100 text-yellow-800',
      label: 'Askıya Alındı',
    },
    banned: { color: 'bg-red-100 text-red-800', label: 'Yasaklandı' },
    pending_verification: {
      color: 'bg-blue-100 text-blue-800',
      label: 'Doğrulama Bekliyor',
    },
  };

  const variant = variants[status] || variants.inactive;

  return (
    <Badge className={`${variant.color} px-2 py-1 text-xs font-medium`}>
      {variant.label}
    </Badge>
  );
}

// ============================================================================
// ROLE BADGE COMPONENT
// ============================================================================

function RoleBadge({ role }: { role: string }) {
  const variants: Record<string, { color: string; label: string }> = {
    admin: { color: 'bg-purple-100 text-purple-800', label: 'Yönetici' },
    moderator: { color: 'bg-indigo-100 text-indigo-800', label: 'Moderatör' },
    employer: { color: 'bg-blue-100 text-blue-800', label: 'İş Veren' },
    freelancer: { color: 'bg-teal-100 text-teal-800', label: 'Freelancer' },
  };

  const variant = variants[role] || {
    color: 'bg-gray-100 text-gray-800',
    label: role,
  };

  return (
    <Badge className={`${variant.color} px-2 py-1 text-xs font-medium`}>
      {variant.label}
    </Badge>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UserTable({ className }: UserTableProps) {
  // Hooks
  const {
    users,
    isLoading,
    error,
    filters,
    pagination,
    bulkSelection,
    onFilterChange,
    onPageChange,
    onBulkAction,
    onBulkToggle,
    onSearch,
  } = useUserManagement();

  const { handleActivate, handleSuspend, handleVerify, handleDelete } =
    useUserTableActions();

  // Local state
  const [actionUser, setActionUser] = useState<AdminUserData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActivityTimeline, setShowActivityTimeline] = useState(false);
  const [selectedUserForActivity, setSelectedUserForActivity] =
    useState<AdminUserData | null>(null);

  // ============================================================================
  // COLUMN DEFINITIONS
  // ============================================================================

  const columns = useMemo<Column<AdminUserData>[]>(
    () => [
      {
        id: 'user',
        header: 'Kullanıcı',
        render: (_, row) => (
          <div className="flex items-center gap-3">
            <Avatar
              src={row.avatarUrl || undefined}
              alt={formatUserName(row)}
              size="sm"
            />
            <div>
              <div className="font-medium text-gray-900">
                {formatUserName(row)}
              </div>
              <div className="text-sm text-gray-500">{row.email}</div>
            </div>
          </div>
        ),
        sortable: true,
        sortFn: (a, b) =>
          formatUserName(a).localeCompare(formatUserName(b), 'tr'),
      },
      {
        id: 'userType',
        header: 'Rol',
        accessor: 'userType',
        render: (value) => <RoleBadge role={value as string} />,
        sortable: true,
      },
      {
        id: 'accountStatus',
        header: 'Durum',
        accessor: 'accountStatus',
        render: (value) => <StatusBadge status={value as UserStatus} />,
        sortable: true,
      },
      {
        id: 'createdAt',
        header: 'Katılım',
        accessor: 'createdAt',
        formatter: 'date',
        sortable: true,
      },
      {
        id: 'lastActiveAt',
        header: 'Son Aktivite',
        accessor: 'lastActiveAt',
        formatter: 'date',
        sortable: true,
      },
    ],
    []
  );

  // ============================================================================
  // ROW ACTIONS
  // ============================================================================

  const rowActions = useMemo<RowAction<AdminUserData>[]>(
    () => [
      {
        id: 'view',
        label: 'Görüntüle',
        icon: UserIcon,
        onClick: (user) => {
          window.location.href = `/admin/users/${user.id}/edit`;
        },
      },
      {
        id: 'activity',
        label: 'Aktivite',
        icon: ActivityIcon,
        onClick: (user) => {
          setSelectedUserForActivity(user);
          setShowActivityTimeline(true);
        },
      },
      {
        id: 'email',
        label: 'E-posta Gönder',
        icon: MailIcon,
        onClick: (_user) => {
          // Future: Show email modal
        },
      },
      {
        id: 'activate',
        label: 'Aktifleştir',
        icon: PlayIcon,
        onClick: (user) => handleActivate(user.id),
        show: (user: AdminUserData) => user.accountStatus !== 'active',
      },
      {
        id: 'suspend',
        label: 'Askıya Al',
        icon: BanIcon,
        onClick: (user) => handleSuspend(user.id),
        show: (user: AdminUserData) => user.accountStatus === 'active',
      },
      {
        id: 'verify',
        label: 'Doğrula',
        icon: CheckCircleIcon,
        onClick: (user) => handleVerify(user.id),
        show: (user: AdminUserData) => user.verificationStatus === 'pending',
      },
      {
        id: 'delete',
        label: 'Sil',
        icon: TrashIcon,
        variant: 'danger',
        onClick: (user) => {
          setActionUser(user);
          setShowDeleteDialog(true);
        },
      },
    ],
    [handleActivate, handleSuspend, handleVerify]
  );

  // ============================================================================
  // BULK ACTIONS
  // ============================================================================

  const bulkActions = useMemo<BulkAction[]>(
    () => [
      {
        id: 'verify',
        label: 'Doğrula',
        icon: CheckCircleIcon,
        onClick: (selectedIds) =>
          onBulkAction({
            userIds: selectedIds,
            action: 'verify',
          }),
      },
      {
        id: 'suspend',
        label: 'Askıya Al',
        icon: BanIcon,
        variant: 'warning',
        onClick: (selectedIds) =>
          onBulkAction({
            userIds: selectedIds,
            action: 'suspend',
          }),
      },
      {
        id: 'ban',
        label: 'Yasakla',
        icon: BanIcon,
        variant: 'danger',
        onClick: (selectedIds) =>
          onBulkAction({
            userIds: selectedIds,
            action: 'ban',
          }),
      },
    ],
    [onBulkAction]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (error) {
    return <SimpleErrorDisplay error={error} className={className} />;
  }

  const selectedUsersForExport = users.filter((u) =>
    bulkSelection.selectedIds.includes(u.id)
  ) as AdminUserData[];

  return (
    <div className={`space-y-4 p-6 ${className}`}>
      {/* Header Card */}
      <Card className="border-0 bg-gradient-to-r from-white to-gray-50 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Kullanıcı Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Platform kullanıcılarını ve izinlerini yönetin
              </p>
            </div>
            <UserExportButton
              users={users as AdminUserData[]}
              selectedUsers={selectedUsersForExport}
              filters={filters as Record<string, unknown>}
              className="self-end lg:self-center"
            />
          </div>
        </CardHeader>
        <CardContent>
          <TableFilters
            filters={filters as Parameters<typeof TableFilters>[0]['filters']}
            onFilterChange={
              onFilterChange as Parameters<
                typeof TableFilters
              >[0]['onFilterChange']
            }
            onSearch={onSearch}
          />
        </CardContent>
      </Card>

      {/* Unified Data Table */}
      <Card className="border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl">
        <CardContent className="p-0">
          <UnifiedDataTable<AdminUserData>
            data={users}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Kullanıcı bulunamadı"
            selection={{
              enabled: true,
              rowIdAccessor: 'id',
              selectedIds: bulkSelection.selectedIds,
              onSelectionChange: (ids) => {
                // Update selection in store
                ids.forEach((id) => {
                  if (!bulkSelection.selectedIds.includes(id)) {
                    onBulkToggle(id);
                  }
                });
                bulkSelection.selectedIds.forEach((id) => {
                  if (!ids.includes(id)) {
                    onBulkToggle(id);
                  }
                });
              },
            }}
            pagination={{
              enabled: true,
              currentPage: pagination.currentPage,
              pageSize: pagination.pageSize,
              totalItems: pagination.total,
              onPageChange,
            }}
            bulkActions={bulkActions}
            rowActions={rowActions}
            className="min-h-[400px]"
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Bu kullanıcıyı kalıcı olarak silecek
              {actionUser && ` "${formatUserName(actionUser)}"`} ve tüm
              verilerini sistemden kaldıracaktır.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (actionUser) handleDelete(actionUser.id);
                setShowDeleteDialog(false);
                setActionUser(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activity Timeline Modal */}
      {selectedUserForActivity && (
        <UserActivityTimeline
          userId={selectedUserForActivity.id}
          userName={formatUserName(selectedUserForActivity)}
          open={showActivityTimeline}
          onClose={() => {
            setShowActivityTimeline(false);
            setSelectedUserForActivity(null);
          }}
        />
      )}
    </div>
  );
}

export default UserTable;
