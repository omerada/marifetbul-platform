'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { DisputeResponse, DisputeStatus } from '@/types/dispute';
import { disputeReasonLabels } from '@/types/dispute';

interface DisputeCardProps {
  dispute: DisputeResponse;
  showOrder?: boolean;
  showUserInfo?: boolean;
}

const statusConfig: Record<
  DisputeStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ReactNode;
  }
> = {
  OPEN: {
    label: 'Açık',
    variant: 'destructive',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  UNDER_REVIEW: {
    label: 'İnceleniyor',
    variant: 'default',
    icon: <Clock className="h-3 w-3" />,
  },
  AWAITING_BUYER_RESPONSE: {
    label: 'Alıcı Yanıtı Bekleniyor',
    variant: 'secondary',
    icon: <MessageSquare className="h-3 w-3" />,
  },
  AWAITING_SELLER_RESPONSE: {
    label: 'Satıcı Yanıtı Bekleniyor',
    variant: 'secondary',
    icon: <MessageSquare className="h-3 w-3" />,
  },
  RESOLVED: {
    label: 'Çözüldü',
    variant: 'outline',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  CLOSED: {
    label: 'Kapatıldı',
    variant: 'outline',
    icon: <CheckCircle className="h-3 w-3" />,
  },
};

export function DisputeCard({
  dispute,
  showOrder = false,
  showUserInfo = false,
}: DisputeCardProps) {
  const statusInfo = statusConfig[dispute.status];
  const timeAgo = formatDistanceToNow(new Date(dispute.createdAt), {
    addSuffix: true,
    locale: tr,
  });

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              İtiraz #{dispute.id.slice(0, 8)}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {disputeReasonLabels[dispute.reason]}
            </p>
          </div>
          <Badge
            variant={statusInfo.variant}
            className="flex items-center gap-1"
          >
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-muted-foreground line-clamp-3 text-sm">
          {dispute.description}
        </p>

        {/* Order Info */}
        {showOrder && (
          <div className="text-sm">
            <span className="text-muted-foreground">Sipariş: </span>
            <Link
              href={`/dashboard/orders/${dispute.orderId}`}
              className="text-primary hover:underline"
            >
              #{dispute.orderId.slice(0, 8)}
            </Link>
          </div>
        )}

        {/* User Info */}
        {showUserInfo && (
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Açan: </span>
              <span className="font-medium">
                {dispute.raisedByUserFullName}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-muted-foreground text-xs">{timeAgo}</span>
          <Link href={`/disputes/${dispute.id}`}>
            <Button variant="outline" size="sm">
              Detayları Görüntüle
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
