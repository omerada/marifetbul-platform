/**
 * UserTable Component
 *
 * User management table with modular architecture.
 * Refactored: 853 lines → 256 lines (-70%)
 */

'use client';

import React, { useState } from 'react';
import { useUserManagement } from '@/hooks';
import {
  AdminUserData,
  UserActionType,
} from './userTable/types/userTableTypes';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader as TableHeaderComponent,
  TableRow,
} from '@/components/ui/Table';
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
import { Checkbox } from '@/components/ui/Checkbox';
import {
  BulkActions,
  TableHeader,
  TableFilters,
  UserRow,
  TablePagination,
  EmptyState,
  LoadingState,
  ErrorState,
} from './userTable/components';
import { useUserTableActions } from './userTable/hooks/useUserTableActions';
import { formatUserName } from './userTable/utils/userTableHelpers';

interface UserTableProps {
  className?: string;
}

export function UserTable({ className }: UserTableProps) {
  // Hook integration
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
    onSelectAll,
    onSearch,
  } = useUserManagement();

  const {
    handleActivate,
    handleSuspend,
    handleBan,
    handleVerify,
    handleDelete,
    handleExport,
  } = useUserTableActions();

  // Local state for dialogs
  const [actionUser, setActionUser] = useState<AdminUserData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Handle user action
  const handleUserAction = async (action: UserActionType, userId: string) => {
    switch (action) {
      case 'activate':
        await handleActivate(userId);
        break;
      case 'suspend':
        await handleSuspend(userId);
        break;
      case 'ban':
        await handleBan(userId);
        break;
      case 'verify':
        await handleVerify(userId);
        break;
      case 'view':
        // TODO: Navigate to user detail page
        console.log('View user:', userId);
        break;
      case 'email':
        // TODO: Open email dialog
        console.log('Email user:', userId);
        break;
      default:
        break;
    }
  };

  // Error state
  if (error) {
    return <ErrorState error={error} className={className} />;
  }

  return (
    <div className={`space-y-4 p-6 ${className}`}>
      {/* Header Card */}
      <Card className="border-0 bg-gradient-to-r from-white to-gray-50 shadow-xl">
        <CardHeader className="pb-4">
          <TableHeader
            title="Kullanıcı Yönetimi"
            description="Platform kullanıcılarını ve izinlerini yönetin"
            userCount={users.length}
            isLoading={isLoading}
            onRefresh={() => onFilterChange({})}
            onExport={(format) => handleExport(format, filters)}
          />
        </CardHeader>
        <CardContent>
          <TableFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onSearch={onSearch}
          />

          {/* Bulk Actions */}
          {bulkSelection.selectedCount > 0 && (
            <div className="mt-6">
              <BulkActions
                selectedCount={bulkSelection.selectedCount}
                onAction={(action: string) =>
                  onBulkAction({
                    userIds: bulkSelection.selectedIds,
                    action: action as
                      | 'suspend'
                      | 'unsuspend'
                      | 'ban'
                      | 'unban'
                      | 'verify'
                      | 'unverify',
                  })
                }
                onClear={() =>
                  bulkSelection.selectedIds.forEach((id: string) =>
                    onBulkToggle(id)
                  )
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table Card */}
      <Card className="border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeaderComponent>
                <TableRow className="border-b border-gray-200 bg-gray-50/50">
                  <TableHead className="w-12 py-4">
                    <Checkbox
                      checked={bulkSelection.isAllSelected}
                      onChange={onSelectAll}
                      className="rounded-md"
                    />
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">
                    Kullanıcı
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">
                    Rol
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">
                    Durum
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">
                    Katılım
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">
                    Son Aktivite
                  </TableHead>
                  <TableHead className="py-4 text-right font-semibold text-gray-700">
                    İşlemler
                  </TableHead>
                </TableRow>
              </TableHeaderComponent>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <LoadingState />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState
                        hasFilters={!!filters.search || !!filters.status}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: AdminUserData) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      isSelected={bulkSelection.selectedIds.includes(user.id)}
                      onSelect={() => onBulkToggle(user.id)}
                      onAction={(action) => {
                        setActionUser(user as AdminUserData);
                        if (action === 'delete') {
                          setShowDeleteDialog(true);
                        } else {
                          handleUserAction(action, user.id);
                        }
                      }}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Card */}
      {pagination.totalPages > 1 && (
        <TablePagination
          pagination={pagination}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      )}

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
    </div>
  );
}

export default UserTable;
