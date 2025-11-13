'use client';

import React, { useState, useEffect } from 'react';
import { useOrderStore } from '@/lib/core/store/orders';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  MessageCircle,
  FileText,
  Upload,
  Download,
  Star,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  Package,
  X,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
} from 'lucide-react';
import {
  Button,
  Textarea,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import type {
  Order,
  OrderTimeline as OrderTimelineType,
  OrderMilestone,
  OrderProgress,
} from '@/types';

interface OrderTimelineProps {
  order: Order;
  className?: string;
  showHeader?: boolean;
  compact?: boolean;
}

interface TimelineItemProps {
  item: OrderTimelineType;
  isFirst: boolean;
  isLast: boolean;
  compact?: boolean;
  onAction?: (action: string, data?: Record<string, unknown>) => void;
}

interface MilestoneCardProps {
  milestone: OrderMilestone;
  order: Order;
  onUpdate?: (
    milestoneId: string,
    data: { status?: string; feedback?: string }
  ) => void;
}

interface ProgressBarProps {
  progress: OrderProgress;
  className?: string;
}

// Progress Bar Component
const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className }) => {
  const getProgressColor = (status: string | undefined) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'delayed':
        return 'bg-orange-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getProgressText = (status: string | undefined) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'delayed':
        return 'Gecikmiş';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Beklemede';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">İlerleme Durumu</span>
        <span className="text-sm text-gray-600">
          {progress.percentage}% • {getProgressText(progress.status)}
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            getProgressColor(progress.status)
          )}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {progress.estimatedCompletion && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            Tahmini Tamamlanma:{' '}
            {format(new Date(progress.estimatedCompletion), 'dd MMMM yyyy', {
              locale: tr,
            })}
          </span>
        </div>
      )}
    </div>
  );
};

// Milestone Card Component
const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  order,
  onUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const { user } = useAuthStore();

  const getStatusIcon = (status: OrderMilestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-gray-400" />;
      case 'requires_approval':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: OrderMilestone['status']) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800',
      requires_approval: 'bg-orange-100 text-orange-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600',
      delayed: 'bg-yellow-100 text-yellow-800',
    };

    const labels = {
      completed: 'Tamamlandı',
      in_progress: 'Devam Ediyor',
      pending: 'Beklemede',
      requires_approval: 'Onay Bekliyor',
      rejected: 'Reddedildi',
      cancelled: 'İptal Edildi',
      delayed: 'Gecikmiş',
    };

    return (
      <span
        className={cn(
          'rounded-full px-2 py-1 text-xs font-medium',
          variants[status]
        )}
      >
        {labels[status]}
      </span>
    );
  };

  const canApprove =
    user?.id === order.buyerId && milestone.status === 'requires_approval';
  const canReject =
    user?.id === order.buyerId && milestone.status === 'requires_approval';

  const handleApprove = () => {
    onUpdate?.(milestone.id, { status: 'completed', feedback });
    setShowFeedback(false);
    setFeedback('');
  };

  const handleReject = () => {
    onUpdate?.(milestone.id, { status: 'rejected', feedback });
    setShowFeedback(false);
    setFeedback('');
  };

  return (
    <div className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-start gap-3">
          {getStatusIcon(milestone.status)}
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="font-medium">{milestone.title}</h4>
              {getStatusBadge(milestone.status)}
            </div>

            {milestone.description && (
              <p className="mb-2 text-sm text-gray-600">
                {milestone.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              {milestone.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(milestone.dueDate), 'dd MMM yyyy', {
                      locale: tr,
                    })}
                  </span>
                </div>
              )}

              {milestone.amount && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>₺{milestone.amount.toLocaleString('tr-TR')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {milestone.deliverables && milestone.deliverables.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canApprove && (
                <DropdownMenuItem onClick={() => setShowFeedback(true)}>
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Onayla
                </DropdownMenuItem>
              )}
              {canReject && (
                <DropdownMenuItem onClick={() => setShowFeedback(true)}>
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Reddet
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <MessageCircle className="mr-2 h-4 w-4" />
                Mesaj Gönder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Deliverables */}
      {isExpanded &&
        milestone.deliverables &&
        milestone.deliverables.length > 0 && (
          <div className="space-y-2 border-t pt-2">
            <h5 className="text-sm font-medium">Teslim Edilenler</h5>
            <div className="space-y-2">
              {milestone.deliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  className="flex items-center gap-2 rounded bg-gray-50 p-2"
                >
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="flex-1 text-sm">{deliverable.name}</span>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Feedback Section */}
      {showFeedback && (
        <div className="space-y-3 border-t pt-3">
          <h5 className="text-sm font-medium">Geri Bildirim</h5>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Geri bildiriminizi yazın..."
            className="min-h-[60px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFeedback(false)}
            >
              İptal
            </Button>
            <Button size="sm" variant="destructive" onClick={handleReject}>
              Reddet
            </Button>
            <Button size="sm" onClick={handleApprove}>
              Onayla
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Timeline Item Component
const TimelineItem: React.FC<TimelineItemProps> = ({ item }) => {
  const getEventIcon = (eventType: OrderTimelineType['eventType']) => {
    switch (eventType) {
      case 'order_created':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'payment_received':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'work_started':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'milestone_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delivery_submitted':
        return <Upload className="h-4 w-4 text-blue-500" />;
      case 'revision_requested':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'order_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'review_submitted':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'dispute_created':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'message_sent':
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEventTitle = (eventType: OrderTimelineType['eventType']) => {
    switch (eventType) {
      case 'order_created':
        return 'Sipariş Oluşturuldu';
      case 'payment_received':
        return 'Ödeme Alındı';
      case 'work_started':
        return 'Çalışma Başladı';
      case 'milestone_completed':
        return 'Kilometre Taşı Tamamlandı';
      case 'delivery_submitted':
        return 'Teslimat Gönderildi';
      case 'revision_requested':
        return 'Revizyon İstendi';
      case 'order_completed':
        return 'Sipariş Tamamlandı';
      case 'review_submitted':
        return 'İnceleme Gönderildi';
      case 'dispute_created':
        return 'Anlaşmazlık Oluşturuldu';
      case 'message_sent':
        return 'Mesaj Gönderildi';
      default:
        return 'Bilinmeyen Olay';
    }
  };

  return (
    <div className="flex gap-4">
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
          {getEventIcon(item.eventType)}
        </div>
        <div className="mt-2 h-8 w-0.5 bg-gray-200" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="mb-1 flex items-center justify-between">
          <h4 className="text-sm font-medium">
            {getEventTitle(item.eventType)}
          </h4>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(item.timestamp), {
              addSuffix: true,
              locale: tr,
            })}
          </span>
        </div>

        {item.description && (
          <p className="mb-2 text-sm text-gray-600">{item.description}</p>
        )}

        {item.actor && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <User className="h-3 w-3" />
            <span>
              {typeof item.actor === 'object' && 'name' in item.actor
                ? item.actor.name
                : typeof item.actor === 'string'
                  ? item.actor
                  : 'Unknown'}
            </span>
          </div>
        )}

        {/* Additional Data */}
        {item.metadata && (
          <div className="mt-2">
            {(item.metadata as Record<string, unknown>)?.amount ? (
              <div className="text-sm font-medium text-green-600">
                ₺
                {Number(
                  (item.metadata as Record<string, unknown>).amount
                ).toLocaleString('tr-TR')}
              </div>
            ) : null}

            {/* Files temporarily disabled due to type complexity */}
            {/* {Array.isArray((item.metadata as Record<string, unknown>)?.files) && (
              <div className="mt-2 flex gap-2">
                Files attached
              </div>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Order Timeline Component
export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  order,
  className,
  showHeader = true,
  compact = false,
}) => {
  const {
    loadOrderTimeline,
    updateOrderMilestone,
    timeline,
    isLoadingTimeline,
  } = useOrderStore();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuthStore();

  // Load timeline when order changes
  useEffect(() => {
    if (order.id) {
      loadOrderTimeline(order.id);
    }
  }, [order.id, loadOrderTimeline]);

  const handleMilestoneUpdate = async (
    milestoneId: string,
    data: { status?: string; feedback?: string }
  ) => {
    await updateOrderMilestone(milestoneId, data);
  };

  const orderTimeline: OrderTimelineType[] = timeline;

  if (isLoadingTimeline && orderTimeline.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        {showHeader && (
          <div className="animate-pulse">
            <div className="mb-2 h-6 w-1/4 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        )}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex animate-pulse gap-4">
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-gray-200"></div>
                <div className="h-3 w-2/3 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {showHeader && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Sipariş Takibi</h3>
            <p className="text-sm text-gray-600">
              Sipariş #{order.id} • {order.title}
            </p>
          </div>

          {/* Progress Bar */}
          {order.progress && (
            <ProgressBar
              progress={{
                ...order.progress,
                milestones: [], // Temporary fix for milestones requirement
              }}
            />
          )}
        </div>
      )}

      {/* Milestones */}
      {order.milestones && order.milestones.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Kilometre Taşları</h4>
          <div className="space-y-3">
            {order.milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone as OrderMilestone}
                order={order}
                onUpdate={handleMilestoneUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        <h4 className="font-medium">Aktivite Geçmişi</h4>

        {orderTimeline.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <Clock className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p>Henüz aktivite yok</p>
          </div>
        ) : (
          <div className="space-y-0">
            {orderTimeline.map((item: OrderTimelineType, index: number) => (
              <TimelineItem
                key={item.id}
                item={item}
                isFirst={index === 0}
                isLast={index === orderTimeline.length - 1}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTimeline;
