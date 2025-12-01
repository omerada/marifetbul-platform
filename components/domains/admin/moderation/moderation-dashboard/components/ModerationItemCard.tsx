/**
 * ModerationItemCard Component
 *
 * Individual moderation item card with action buttons
 */

import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  getSeverityColor,
  getStatusColor,
  getSeverityLabel,
  getStatusLabel,
} from '../utils/moderationHelpers';
import { formatDate } from '@/lib/shared/formatters';
import type { ModerationItemCardProps } from '../types/moderationDashboardTypes';

export function ModerationItemCard({
  item,
  onAction,
}: ModerationItemCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title and Badges */}
            <div className="mb-2 flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <Badge
                className={getSeverityColor(item.severity)}
                variant="secondary"
              >
                {getSeverityLabel(item.severity)}
              </Badge>
              <Badge
                className={getStatusColor(item.status)}
                variant="secondary"
              >
                {getStatusLabel(item.status)}
              </Badge>
            </div>

            {/* Description */}
            <p className="mb-3 text-sm text-gray-600">{item.description}</p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Rapor Edilen:</span>
                <p className="text-gray-600">{item.reportedUser.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Rapor Sebebi:</span>
                <p className="text-gray-600">{item.reportReason}</p>
              </div>
              {item.reportedBy && (
                <div>
                  <span className="font-medium text-gray-700">Rapor Eden:</span>
                  <p className="text-gray-600">{item.reportedBy.name}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Tarih:</span>
                <p className="text-gray-600">{formatDate(item.createdAt)}</p>
              </div>
            </div>

            {/* Auto Flags */}
            <div className="mt-3 flex flex-wrap gap-2">
              {item.autoFlags.spam && (
                <Badge
                  variant="outline"
                  className="border-red-200 text-red-600"
                >
                  Spam
                </Badge>
              )}
              {item.autoFlags.inappropriate && (
                <Badge
                  variant="outline"
                  className="border-orange-200 text-orange-600"
                >
                  Uygunsuz
                </Badge>
              )}
              {item.autoFlags.fake && (
                <Badge
                  variant="outline"
                  className="border-purple-200 text-purple-600"
                >
                  Sahte
                </Badge>
              )}
              {item.autoFlags.harassment && (
                <Badge
                  variant="outline"
                  className="border-red-200 text-red-600"
                >
                  Taciz
                </Badge>
              )}
              <Badge
                variant="outline"
                className="border-blue-200 text-blue-600"
              >
                Skor: {(item.autoFlags.score * 100).toFixed(0)}%
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          {item.status === 'pending' && (
            <div className="ml-4 flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction(item.id, 'approve')}
                className="border-green-200 text-green-600 hover:bg-green-50"
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Onayla
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction(item.id, 'reject')}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="mr-1 h-4 w-4" />
                Reddet
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction(item.id, 'escalate')}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <AlertTriangle className="mr-1 h-4 w-4" />
                Yükselt
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
