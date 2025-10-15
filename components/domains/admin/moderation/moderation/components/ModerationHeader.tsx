/**
 * ModerationHeader Component
 *
 * Header section with title, description, and refresh button
 */

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import type { ModerationHeaderProps } from '../types/moderationTypes';

export function ModerationHeader({
  onRefresh,
  isLoading,
}: ModerationHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moderasyon</h1>
        <p className="mt-1 text-sm text-gray-500">
          İçerik moderasyonu ve kullanıcı raporları
        </p>
      </div>
      <div className="mt-4 flex space-x-3 sm:mt-0">
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          variant="primary"
          size="sm"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Yenile
        </Button>
      </div>
    </div>
  );
}
