'use client';

import React, { useState } from 'react';
import { useUserManagement } from '@/hooks';
import { AdminUserData } from '@/types';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
import { Checkbox } from '@/components/ui/Checkbox';
import {
  MoreHorizontal,
  Search,
  Filter,
  UserCheck,
  UserX,
  Mail,
  Shield,
  Ban,
  Eye,
  Trash2,
  Download,
  RefreshCw,
  X,
  Users,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Modern BulkActions component
function BulkActions({
  selectedCount,
  onAction,
  onClear,
}: {
  selectedCount: number;
  onAction: (action: string) => void;
  onClear: () => void;
}) {
  return (
    <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col items-start justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 shadow-md">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Badge className="border-blue-200 bg-blue-100 px-3 py-1 font-semibold text-blue-800">
                  {selectedCount} selected
                </Badge>
                <span className="text-sm font-medium text-blue-900">
                  Bulk actions available
                </span>
              </div>
              <p className="mt-1 text-xs text-blue-700">
                Choose an action to apply to all selected users
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('activate')}
              className="border-green-300 text-green-700 hover:border-green-400 hover:bg-green-50"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('suspend')}
              className="border-orange-300 text-orange-700 hover:border-orange-400 hover:bg-orange-50"
            >
              <UserX className="mr-2 h-4 w-4" />
              Suspend
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface UserTableProps {
  className?: string;
}

export function UserTable({ className }: UserTableProps) {
  const {
    users,
    isLoading,
    error,
    filters,
    pagination,
    bulkSelection,
    onFilterChange,
    onPageChange,
    onUserAction,
    onBulkAction,
    onBulkToggle,
    onSelectAll,
    onSearch,
  } = useUserManagement();

  const [actionUser, setActionUser] = useState<AdminUserData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleUserAction = async (action: string) => {
    if (!actionUser) return;

    try {
      switch (action) {
        case 'activate':
          await onUserAction(actionUser.id, {
            userId: actionUser.id,
            action: 'unsuspend',
          });
          break;
        case 'suspend':
          await onUserAction(actionUser.id, {
            userId: actionUser.id,
            action: 'suspend',
          });
          break;
        case 'ban':
          await onUserAction(actionUser.id, {
            userId: actionUser.id,
            action: 'ban',
          });
          break;
        case 'delete':
          // Delete API endpoint'ini çağır
          try {
            const response = await fetch(
              `/api/v1/admin/users/${actionUser.id}`,
              {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            if (!response.ok) {
              throw new Error('Delete operation failed');
            }

            const result = await response.json();

            if (result.success) {
              // Successfully deleted, refresh the user list
              window.location.reload();
            } else {
              console.error('Delete failed:', result.message);
            }
          } catch (error) {
            console.error('Error deleting user:', error);
          }
          setShowDeleteDialog(false);
          break;
        case 'verify':
          await onUserAction(actionUser.id, {
            userId: actionUser.id,
            action: 'verify',
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error performing user action:', error);
    } finally {
      setActionUser(null);
    }
  };

  const handleSelectUser = (userId: string) => {
    onBulkToggle(userId);
  };

  const handleSelectAll = () => {
    onSelectAll();
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      case 'employer':
        return 'bg-indigo-100 text-indigo-800';
      case 'freelancer':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading users:{' '}
            {typeof error === 'string' ? error : 'Unknown error'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Modern Header with Search and Filters */}
      <Card className="border-0 bg-gradient-to-r from-white to-gray-50 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  User Management
                </CardTitle>
                <p className="mt-1 text-gray-600">
                  Manage platform users and their permissions
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                <span>{users.length} users loaded</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        '/api/v1/admin/users/export',
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            format: 'csv',
                            filters: filters,
                          }),
                        }
                      );

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.data.downloadUrl) {
                          // In a real app, this would trigger download
                          window.open(result.data.downloadUrl, '_blank');
                        }
                      }
                    } catch (error) {
                      console.error('Export failed:', error);
                    }
                  }}
                  disabled={isLoading}
                  className="border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFilterChange({})}
                  disabled={isLoading}
                  className="border-gray-300 hover:border-green-300 hover:bg-green-50"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search users by name, email, or ID..."
                value={filters.search || ''}
                onChange={(e) => onSearch(e.target.value)}
                className="h-12 border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 w-full justify-between border-gray-300 hover:border-blue-300"
                >
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span>Status: {filters.status || 'All'}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  onClick={() => onFilterChange({ status: undefined })}
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                    <span>All Statuses</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ status: ['active'] })}
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <span>Active</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onFilterChange({ status: ['pending_verification'] })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                    <span>Pending Verification</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ status: ['suspended'] })}
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                    <span>Suspended</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ status: ['banned'] })}
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-red-400"></div>
                    <span>Banned</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Role Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 w-full justify-between border-gray-300 hover:border-purple-300"
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Role: {filters.userType || 'All'}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  onClick={() => onFilterChange({ userType: undefined })}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>All Roles</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ userType: 'employer' })}
                >
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-indigo-600" />
                    <span>Employer</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ userType: 'freelancer' })}
                >
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span>Freelancer</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
                  bulkSelection.selectedIds.forEach((id) => onBulkToggle(id))
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modern Users Table */}
      <Card className="border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50/50">
                  <TableHead className="w-12 py-4">
                    <Checkbox
                      checked={bulkSelection.isAllSelected}
                      onChange={() => handleSelectAll()}
                      className="rounded-md"
                    />
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">
                    User
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">
                    Role
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">
                    Joined
                  </TableHead>
                  <TableHead className="py-4 font-semibold text-gray-700">
                    Last Active
                  </TableHead>
                  <TableHead className="py-4 text-right font-semibold text-gray-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-medium text-gray-900">
                            Loading users...
                          </p>
                          <p className="text-sm text-gray-500">
                            Please wait while we fetch the data
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-medium text-gray-900">
                            No users found
                          </p>
                          <p className="text-sm text-gray-500">
                            Try adjusting your search or filter criteria
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user.id}
                      className={cn(
                        'border-b border-gray-100 transition-colors duration-200 hover:bg-gray-50/50',
                        bulkSelection.selectedIds.includes(user.id) &&
                          'bg-blue-50/50'
                      )}
                    >
                      <TableCell className="py-4">
                        <Checkbox
                          checked={bulkSelection.selectedIds.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded-md"
                        />
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                              {(user.firstName || user.name || 'U')
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            {user.verificationStatus === 'verified' && (
                              <div className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-green-500">
                                <UserCheck className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {user.firstName || user.name}{' '}
                                {user.lastName || ''}
                              </p>
                            </div>
                            <p className="truncate text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          className={`${getRoleColor(user.userType)} px-3 py-1 font-medium`}
                        >
                          {user.userType}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              user.accountStatus === 'active'
                                ? 'animate-pulse bg-green-400'
                                : user.accountStatus === 'suspended'
                                  ? 'bg-orange-400'
                                  : user.accountStatus === 'banned'
                                    ? 'bg-red-400'
                                    : 'bg-gray-400'
                            }`}
                          ></div>
                          <Badge
                            className={`${getStatusColor(user.accountStatus)} px-3 py-1 font-medium`}
                          >
                            {user.accountStatus}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-gray-900">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                'tr-TR'
                              )
                            : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-gray-600">
                          {user.lastActiveAt
                            ? new Date(user.lastActiveAt).toLocaleDateString(
                                'tr-TR'
                              )
                            : 'Never'}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 rounded-full p-0 hover:bg-gray-100"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem
                              onClick={() => {
                                setActionUser(user as AdminUserData);
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setActionUser(user as AdminUserData);
                              }}
                              className="cursor-pointer"
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            {user.accountStatus === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setActionUser(user as AdminUserData);
                                  handleUserAction('suspend');
                                }}
                                className="cursor-pointer text-orange-600 focus:text-orange-700"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setActionUser(user as AdminUserData);
                                  handleUserAction('activate');
                                }}
                                className="cursor-pointer text-green-600 focus:text-green-700"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {user.verificationStatus !== 'verified' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setActionUser(user as AdminUserData);
                                  handleUserAction('verify');
                                }}
                                className="cursor-pointer text-blue-600 focus:text-blue-700"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Verify
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setActionUser(user as AdminUserData);
                                handleUserAction('ban');
                              }}
                              className="cursor-pointer text-red-600 focus:text-red-700"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setActionUser(user as AdminUserData);
                                setShowDeleteDialog(true);
                              }}
                              className="cursor-pointer text-red-600 focus:text-red-700"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modern Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="border-0 bg-gradient-to-r from-white to-gray-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-medium text-gray-900">
                  {users.length}
                </span>{' '}
                of{' '}
                <span className="font-medium text-gray-900">
                  {pagination.total}
                </span>{' '}
                users
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1 || isLoading}
                  className="border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                >
                  <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
                  Previous
                </Button>

                <div className="flex items-center space-x-2">
                  {/* Page numbers */}
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const page = Math.max(1, pagination.currentPage - 2) + i;
                      if (page > pagination.totalPages) return null;

                      return (
                        <Button
                          key={page}
                          variant={
                            page === pagination.currentPage
                              ? 'primary'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => onPageChange(page)}
                          disabled={isLoading}
                          className={
                            page === pagination.currentPage
                              ? 'border-blue-600 bg-blue-600 hover:bg-blue-700'
                              : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                          }
                        >
                          {page}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={
                    pagination.currentPage === pagination.totalPages ||
                    isLoading
                  }
                  className="border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user
              {actionUser?.firstName &&
                ` "${actionUser.firstName} ${actionUser.lastName}"`}{' '}
              and remove all their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleUserAction('delete')}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default UserTable;
