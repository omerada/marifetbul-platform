'use client';

/**
 * ================================================
 * JOB BULK ACTIONS COMPONENT
 * ================================================
 * Bulk operations for multiple jobs
 *
 * Features:
 * - Multi-select jobs
 * - Bulk status change
 * - Bulk delete
 * - Bulk export
 * - Select all/none
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 * Sprint 1: Analytics & Polish - Task 4
 */

import React, { useState } from 'react';
import {
  Trash2,
  Archive,
  CheckSquare,
  Square,
  MoreHorizontal,
  Eye,
  EyeOff,
  Download,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { JobStatus } from '@/types/backend-aligned';

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: 'status' | 'delete' | 'export' | 'archive';
  statusValue?: JobStatus;
  variant?: 'default' | 'destructive';
}

export interface JobBulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onBulkAction: (action: BulkAction) => void;
  isProcessing?: boolean;
  className?: string;
}

const bulkActions: BulkAction[] = [
  {
    id: 'open',
    label: 'Açık Yap',
    icon: Eye,
    action: 'status',
    statusValue: 'OPEN',
  },
  {
    id: 'close',
    label: 'Kapat',
    icon: EyeOff,
    action: 'status',
    statusValue: 'CLOSED',
  },
  {
    id: 'archive',
    label: 'Arşivle',
    icon: Archive,
    action: 'archive',
  },
  {
    id: 'export',
    label: 'Dışa Aktar',
    icon: Download,
    action: 'export',
  },
  {
    id: 'delete',
    label: 'Sil',
    icon: Trash2,
    action: 'delete',
    variant: 'destructive',
  },
];

/**
 * Job Bulk Actions Component
 *
 * Provides bulk operations toolbar for job management
 */
export function JobBulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onSelectNone,
  onBulkAction,
  isProcessing = false,
  className = '',
}: JobBulkActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  const allSelected = selectedCount === totalCount;

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border bg-blue-50 p-4 shadow-sm',
        className
      )}
    >
      {/* Selection Info */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={allSelected ? onSelectNone : onSelectAll}
          className="flex items-center gap-2"
        >
          {allSelected ? (
            <CheckSquare className="h-4 w-4 text-blue-600" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          {allSelected ? 'Tümünü Kaldır' : 'Tümünü Seç'}
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-blue-600">
            {selectedCount} seçili
          </Badge>
          <span className="text-sm text-gray-600">/ {totalCount} toplam</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onBulkAction({
              id: 'export',
              label: 'Dışa Aktar',
              icon: Download,
              action: 'export',
            })
          }
          disabled={isProcessing}
        >
          <Download className="mr-2 h-4 w-4" />
          Dışa Aktar
        </Button>

        {/* More Actions Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            disabled={isProcessing}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="ml-2">Diğer İşlemler</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>

          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 z-20 mt-2 w-48 rounded-lg border bg-white shadow-lg">
                {bulkActions.map((action, index) => {
                  const Icon = action.icon;
                  const isDestructive = action.variant === 'destructive';

                  return (
                    <React.Fragment key={action.id}>
                      {index === bulkActions.length - 1 && (
                        <div className="my-1 h-px bg-gray-200" />
                      )}
                      <button
                        onClick={() => {
                          onBulkAction(action);
                          setIsOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100',
                          isDestructive && 'text-red-600 hover:bg-red-50'
                        )}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {action.label}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Job Selection Checkbox Component
 */
export interface JobSelectionCheckboxProps {
  jobId: string;
  isSelected: boolean;
  onToggle: (jobId: string) => void;
  className?: string;
}

export function JobSelectionCheckbox({
  jobId,
  isSelected,
  onToggle,
  className = '',
}: JobSelectionCheckboxProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle(jobId);
      }}
      className={cn(
        'rounded border-2 p-1 transition-all hover:bg-gray-100',
        isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300',
        className
      )}
      aria-label={isSelected ? 'Seçimi kaldır' : 'Seç'}
    >
      {isSelected ? (
        <CheckSquare className="h-4 w-4 text-blue-600" />
      ) : (
        <Square className="h-4 w-4 text-gray-400" />
      )}
    </button>
  );
}

/**
 * Bulk Action Confirmation Modal Props
 */
export interface BulkActionConfirmation {
  action: BulkAction;
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function useBulkActionConfirmation() {
  const [confirmation, setConfirmation] =
    useState<BulkActionConfirmation | null>(null);

  const requestConfirmation = (
    action: BulkAction,
    count: number,
    onConfirm: () => void
  ) => {
    setConfirmation({
      action,
      count,
      onConfirm: () => {
        onConfirm();
        setConfirmation(null);
      },
      onCancel: () => setConfirmation(null),
    });
  };

  const clearConfirmation = () => setConfirmation(null);

  return {
    confirmation,
    requestConfirmation,
    clearConfirmation,
  };
}
