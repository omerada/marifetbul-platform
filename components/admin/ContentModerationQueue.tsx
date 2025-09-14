'use client';

import React, { useState } from 'react';
import { useContentModeration } from '@/hooks/useContentModeration';
import { ModerationItem } from '@/types';
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
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Flag,
  Shield,
  Clock,
  User,
  MessageSquare,
  FileText,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react';

interface ContentModerationQueueProps {
  className?: string;
}

export function ContentModerationQueue({
  className,
}: ContentModerationQueueProps) {
  const {
    items,
    isLoading,
    error,
    filters,
    pagination,
    onFilterChange,
    onPageChange,
    onModerationAction,
    onSearch,
  } = useContentModeration();

  const [actionItem, setActionItem] = useState<ModerationItem | null>(null);
  const [actionType, setActionType] = useState<string>('');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [moderationReason, setModerationReason] = useState('');

  const handleModerationAction = async (action: string) => {
    if (!actionItem) return;

    try {
      await onModerationAction(actionItem.id, {
        itemId: actionItem.id,
        action: action as
          | 'approve'
          | 'reject'
          | 'escalate'
          | 'dismiss'
          | 'request_changes',
        reason: moderationReason,
        notes: `Action: ${action}`,
      });
      setShowActionDialog(false);
      setModerationReason('');
    } catch (error) {
      console.error('Error performing moderation action:', error);
    } finally {
      setActionItem(null);
      setActionType('');
    }
  };

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map((item) => item.id));
    } else {
      setSelectedItems([]);
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
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'job_post':
        return <FileText className="h-4 w-4" />;
      case 'service_listing':
        return <Shield className="h-4 w-4" />;
      case 'review':
        return <MessageSquare className="h-4 w-4" />;
      case 'user_profile':
        return <User className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading moderation queue:{' '}
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
            <span>Content Moderation Queue</span>
            <div className="flex items-center space-x-2">
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
                placeholder="Search content, users, reasons..."
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
                  onClick={() => onFilterChange({ status: 'pending' })}
                >
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ status: 'approved' })}
                >
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ status: 'rejected' })}
                >
                  Rejected
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ status: 'escalated' })}
                >
                  Escalated
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Priority: {filters.priority || 'All'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ priority: undefined })}
                >
                  All Priorities
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ priority: 'high' })}
                >
                  High
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ priority: 'medium' })}
                >
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ priority: 'low' })}
                >
                  Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Content Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <FileText className="mr-2 h-4 w-4" />
                  Type: {filters.type?.[0] || 'All'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ type: undefined })}
                >
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ type: 'job' })}
                >
                  Job Posts
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ type: 'service' })}
                >
                  Service Listings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ type: 'review' })}
                >
                  Reviews
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ type: 'profile' })}
                >
                  User Profiles
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFilterChange({ type: 'message' })}
                >
                  Messages
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bulk Actions - Simplified */}
          {selectedItems.length > 0 && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="px-3 py-1">
                      {selectedItems.length} selected
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Manual bulk actions available in full implementation
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedItems([])}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Moderation Queue Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedItems.length === items.length &&
                        items.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading moderation items...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-gray-500"
                    >
                      No moderation items found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) =>
                            handleSelectItem(item.id, e.target.checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <div className="mb-1 text-sm font-medium">
                            {String(
                              (item.content as Record<string, unknown>)
                                ?.title || 'Untitled Content'
                            )}
                          </div>
                          <div className="line-clamp-2 text-xs text-gray-500">
                            {String(
                              (item.content as Record<string, unknown>)?.text ||
                                (item.content as Record<string, unknown>)
                                  ?.description ||
                                'No content preview'
                            )}
                          </div>
                          {item.reason && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              <Flag className="mr-1 h-3 w-3" />
                              {item.reason}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getContentTypeIcon(item.type)}
                          <span className="text-sm">
                            {item.type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {item.reportedBy || 'System'}
                          </div>
                          <div className="text-gray-500">
                            {item.reporterInfo?.firstName || 'Auto-detected'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString(
                                  'tr-TR'
                                )
                              : 'Tarih belirtilmemiş'}
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Clock className="mr-1 h-3 w-3" />
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleTimeString(
                                  'tr-TR',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )
                              : 'Saat belirtilmemiş'}
                          </div>
                        </div>
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
                                setActionItem(item);
                                setActionType('view');
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {item.status === 'pending' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setActionItem(item);
                                    setActionType('approve');
                                    setShowActionDialog(true);
                                  }}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setActionItem(item);
                                    setActionType('reject');
                                    setShowActionDialog(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setActionItem(item);
                                    setActionType('escalate');
                                    setShowActionDialog(true);
                                  }}
                                  className="text-purple-600"
                                >
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  Escalate
                                </DropdownMenuItem>
                              </>
                            )}
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
      {pagination && pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {items.length} of {pagination.total} items
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || isLoading}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={
                    pagination.page === pagination.totalPages || isLoading
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Confirmation Dialog */}
      <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm{' '}
              {actionType?.charAt(0).toUpperCase() + actionType?.slice(1)}{' '}
              Action
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType} this content?
              <div className="mt-3">
                <Input
                  placeholder="Reason for this action (optional)"
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setModerationReason('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleModerationAction(actionType)}
              className={
                actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-purple-600 hover:bg-purple-700'
              }
            >
              {actionType?.charAt(0).toUpperCase() + actionType?.slice(1)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ContentModerationQueue;
