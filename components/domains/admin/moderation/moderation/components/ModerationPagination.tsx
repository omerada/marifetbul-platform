/**
 * ModerationPagination Component
 *
 * Pagination controls for moderation queue
 */

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import type { ModerationPaginationProps } from '../types/moderationTypes';

export function ModerationPagination({
  pagination,
  onPageChange,
  isLoading,
}: ModerationPaginationProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
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
              onClick={() => onPageChange(pagination.page - 1)}
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
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || isLoading}
            >
              Sonraki
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
