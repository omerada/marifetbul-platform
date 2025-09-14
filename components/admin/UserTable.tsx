'use client';

import React, { useState } from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { AdminUserData } from '@/types';
import { Button } from '@/components/ui/Button';
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
} from 'lucide-react';

// Temporary BulkActions component
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
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="px-3 py-1">
              {selectedCount} selected
            </Badge>
            <span className="text-sm text-gray-600">
              Bulk actions for selected users:
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('activate')}
              className="text-green-600 hover:text-green-700"
            >
              <UserCheck className="mr-1 h-4 w-4" />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('suspend')}
              className="text-yellow-600 hover:text-yellow-700"
            >
              <UserX className="mr-1 h-4 w-4" />
              Suspend
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
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

  const getStatusColor = (status: string) => {
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
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>User Management</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/v1/admin/users/export', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        format: 'csv',
                        filters: filters,
                      }),
                    });

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
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterChange({})}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search users by name, email..."
                value={filters.search || ''}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Status: {filters.status || 'All'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ status: undefined })}
                >
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ status: ['active'] })}
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onFilterChange({ status: ['pending_verification'] })
                  }
                >
                  Pending Verification
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ status: ['suspended'] })}
                >
                  Suspended
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ status: ['banned'] })}
                >
                  Banned
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Role Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Shield className="mr-2 h-4 w-4" />
                  Role: {filters.userType || 'All'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ userType: undefined })}
                >
                  All Roles
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ userType: 'employer' })}
                >
                  Employer
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ userType: 'freelancer' })}
                >
                  Freelancer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bulk Actions */}
          {bulkSelection.selectedCount > 0 && (
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
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={bulkSelection.isAllSelected}
                      onChange={() => handleSelectAll()}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-gray-500"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={bulkSelection.selectedIds.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                            {(user.firstName || user.name || 'U')
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1 font-medium">
                              <span>
                                {user.firstName || user.name}{' '}
                                {user.lastName || ''}
                              </span>
                              {user.verificationStatus === 'verified' && (
                                <UserCheck className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.userType)}>
                          {user.userType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.accountStatus)}>
                          {user.accountStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        {user.lastActiveAt
                          ? new Date(user.lastActiveAt).toLocaleDateString(
                              'tr-TR'
                            )
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setActionUser(user);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setActionUser(user);
                              }}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            {user.accountStatus === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setActionUser(user);
                                  handleUserAction('suspend');
                                }}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setActionUser(user);
                                  handleUserAction('activate');
                                }}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {user.verificationStatus !== 'verified' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setActionUser(user);
                                  handleUserAction('verify');
                                }}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Verify
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setActionUser(user);
                                handleUserAction('ban');
                              }}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setActionUser(user);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600"
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {users.length} of {pagination.total} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={
                    pagination.currentPage === pagination.totalPages ||
                    isLoading
                  }
                >
                  Next
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
