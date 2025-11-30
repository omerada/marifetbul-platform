'use client';

/**
 * ================================================
 * REPORT CARD COMPONENT
 * ================================================
 * Individual report display card for moderation queue
 *
 * Sprint 1 - Story 3, Task 3.1
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { Card } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Flag, Eye, User } from 'lucide-react';
import type { Report } from '@/lib/api/moderator';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface ReportCardProps {
  report: Report;
  onViewDetails: () => void;
  onAssignToSelf: () => void;
}

export function ReportCard({
  report,
  onViewDetails,
  onAssignToSelf,
}: ReportCardProps) {
  const getStatusBadge = () => {
    switch (report.status) {
      case 'PENDING':
        return <Badge variant="warning">Beklemede</Badge>;
      case 'INVESTIGATING':
        return <Badge variant="secondary">İnceleniyor</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">Çözümlendi</Badge>;
      case 'DISMISSED':
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return <Badge variant="secondary">{report.status}</Badge>;
    }
  };

  const getPriorityBadge = () => {
    switch (report.priority) {
      case 'HIGH':
        return <Badge variant="destructive">Yüksek</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Orta</Badge>;
      case 'LOW':
        return <Badge variant="outline">Düşük</Badge>;
      default:
        return <Badge variant="secondary">{report.priority}</Badge>;
    }
  };

  return (
    <Card className="hover:bg-muted/50 p-4 transition-colors">
      <div className="flex gap-4">
        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Flag className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">{report.type}</span>
                {getPriorityBadge()}
                {getStatusBadge()}
              </div>
              <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{report.reporter.username}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(report.createdAt), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Target Info */}
          <div className="text-sm">
            <span className="text-muted-foreground">Hedef: </span>
            <span className="font-medium">
              {report.contentType} #{report.contentId}
            </span>
          </div>

          {/* Description */}
          <p className="line-clamp-2 text-sm">{report.description}</p>

          {/* Actions */}
          <div className="flex gap-2">
            <UnifiedButton
              onClick={onViewDetails}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Eye className="h-4 w-4" />
              Detayları Görüntüle
            </UnifiedButton>
            <UnifiedButton
              onClick={onAssignToSelf}
              variant="secondary"
              size="sm"
            >
              Üzerime Al
            </UnifiedButton>
          </div>
        </div>
      </div>
    </Card>
  );
}
