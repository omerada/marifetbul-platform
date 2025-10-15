/**
 * ModerationHeader Component
 *
 * Header section with title and action buttons
 */

import { Shield, RefreshCw, Download } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { cn } from '@/lib/utils';
import type { ModerationHeaderProps } from '../types/moderationDashboardTypes';

export function ModerationHeader({
  isLoading,
  onRefresh,
  onDownload,
}: ModerationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Shield className="h-6 w-6 text-blue-600" />
          İçerik Denetimi
        </h1>
        <p className="mt-1 text-gray-600">
          Platform güvenliği ve içerik kalitesi yönetimi
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')}
          />
          Yenile
        </Button>
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Rapor İndir
        </Button>
      </div>
    </div>
  );
}
