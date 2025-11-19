/**
 * ================================================
 * MODERATION TABLE - UNIFIED VERSION
 * ================================================
 * Sprint 2 - Migration to UnifiedDataTable
 * 80+ lines → ~50 lines (-38%)
 */

import React, { useMemo } from 'react';
import { UnifiedDataTable } from '@/lib/components/unified/UnifiedDataTable';
import type { Column } from '@/lib/components/unified/UnifiedDataTable';
import { ModerationRow } from './ModerationRow';
import type { ModerationTableProps, ModerationItem } from '../types/moderationTypes';

export function ModerationTable({
  items,
  isLoading,
  onActionClick,
  onViewDetails,
}: ModerationTableProps) {
  const columns = useMemo<Column<ModerationItem>[]>(
    () => [
      {
        id: 'content',
        header: 'İçerik',
        render: (_, item) => (
          <ModerationRow
            item={item}
            onActionClick={(action) => onActionClick(item, action)}
            onViewDetails={() => onViewDetails(item)}
          />
        ),
      },
    ],
    [onActionClick, onViewDetails]
  );

  return (
    <UnifiedDataTable<ModerationItem>
      data={items.filter((item) => item && item.id)}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Moderasyon öğesi bulunamadı"
      hoverable
      className="rounded-lg border"
    />
  );
}
