/**
 * ModerationRow Component
 *
 * Single row in moderation table with actions
 */

import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { TableRow, TableCell } from '@/components/ui/table';
import {
  getStatusColor,
  getPriorityColor,
  getTypeIconComponent,
  formatDate,
  formatStatusLabel,
  formatPriorityLabel,
  getReporterFullName,
  formatReason,
  truncateText,
  hasAutomatedFlags,
  getAutomatedFlagsCount,
} from '../utils/moderationHelpers';
import type { ModerationRowProps } from '../types/moderationTypes';

export function ModerationRow({
  item,
  onActionClick,
  onViewDetails,
}: ModerationRowProps) {
  const TypeIcon = getTypeIconComponent(item.type || 'review');

  return (
    <TableRow>
      {/* Content */}
      <TableCell>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <TypeIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-gray-900">
              {item.content?.title || 'Başlık bulunamadı'}
            </div>
            <div className="truncate text-sm text-gray-500">
              {truncateText(item.content?.description || 'Açıklama bulunamadı')}
            </div>
            <div className="mt-1 flex items-center space-x-2">
              <Badge variant="secondary" size="sm">
                {item.type || 'unknown'}
              </Badge>
              {hasAutomatedFlags(item) && (
                <Badge variant="warning" size="sm">
                  {getAutomatedFlagsCount(item)} flag
                </Badge>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Reporter */}
      <TableCell>
        <div>
          <div className="text-sm font-medium text-gray-900">
            {getReporterFullName(item.reporterInfo)}
          </div>
          <div className="text-sm text-gray-500">
            {item?.reporterInfo?.userType || 'Bilinmeyen'}
          </div>
        </div>
      </TableCell>

      {/* Reason */}
      <TableCell>
        <span className="text-sm text-gray-900">
          {formatReason(item.reason)}
        </span>
      </TableCell>

      {/* Priority */}
      <TableCell>
        <Badge className={getPriorityColor(item?.priority || 'low')}>
          {formatPriorityLabel(item?.priority || 'low')}
        </Badge>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge className={getStatusColor(item?.status || 'pending')}>
          {formatStatusLabel(item?.status || 'pending')}
        </Badge>
      </TableCell>

      {/* Date */}
      <TableCell>
        <span className="text-sm text-gray-500">
          {formatDate(item.createdAt)}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewDetails}>
              <Eye className="mr-2 h-4 w-4" />
              Detayları Gör
            </DropdownMenuItem>
            {item?.status === 'pending' && (
              <>
                <DropdownMenuItem onClick={() => onActionClick('approve')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Onayla
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onActionClick('reject')}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reddet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onActionClick('escalate')}>
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
}
