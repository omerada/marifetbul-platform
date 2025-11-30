'use client';

/**
 * ================================================
 * ORDER PROGRESS TRACKER COMPONENT
 * ================================================
 * Comprehensive order tracking dashboard with timeline, milestones, delivery, payment
 *
 * Sprint 2 - Task 2.2: Order Tracking Dashboard
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 *
 * Features:
 * ✅ Order status timeline with visual progress
 * ✅ Milestone tracking integration
 * ✅ Delivery status display
 * ✅ Payment tracking
 * ✅ Real-time updates support
 * ✅ Responsive design
 * ✅ Role-based views (buyer/seller)
 */

import React from 'react';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  CheckCircle2,
  Loader,
  Package,
  CreditCard,
  FileText,
  Calendar,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderResponse, OrderStatus } from '@/types/backend-aligned';
import type { OrderMilestone } from '@/types/business/features/milestone';
import { MilestoneProgressTracker } from './MilestoneProgressTracker';

// ================================================
// TYPES
// ================================================

export interface OrderProgressTrackerProps {
  /** Order data */
  order: OrderResponse;
  /** Optional milestones (if order has milestone-based payment) */
  milestones?: OrderMilestone[];
  /** User role */
  userRole: 'buyer' | 'seller';
  /** Show detailed view */
  detailed?: boolean;
  /** Callback for refresh */
  onRefresh?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
}

interface TimelineStep {
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
  timestamp?: string;
}

// ================================================
// ORDER STATUS METADATA
// ================================================

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }
> = {
  PENDING_PAYMENT: {
    label: 'Ödeme Bekleniyor',
    icon: <CreditCard className="h-5 w-5" />,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
  },
  PAID: {
    label: 'Ödeme Tamamlandı',
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  IN_PROGRESS: {
    label: 'Devam Ediyor',
    icon: <Loader className="h-5 w-5 animate-spin" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  IN_REVIEW: {
    label: 'İnceleniyor',
    icon: <FileText className="h-5 w-5" />,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  DELIVERED: {
    label: 'Teslim Edildi',
    icon: <Package className="h-5 w-5" />,
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
  },
  COMPLETED: {
    label: 'Tamamlandı',
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  CANCELED: {
    label: 'İptal Edildi',
    icon: <AlertCircle className="h-5 w-5" />,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
  },
  REFUNDED: {
    label: 'İade Edildi',
    icon: <RefreshCw className="h-5 w-5" />,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
  },
  DISPUTED: {
    label: 'Anlaşmazlık',
    icon: <AlertCircle className="h-5 w-5" />,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
  },
};

// ================================================
// HELPER FUNCTIONS
// ================================================

const getOrderTimeline = (order: OrderResponse): TimelineStep[] => {
  const currentStatus = order.status;

  const statusOrder: OrderStatus[] = [
    'PENDING_PAYMENT',
    'PAID',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DELIVERED',
    'COMPLETED',
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);

  return statusOrder.map((status, index) => {
    const config = ORDER_STATUS_CONFIG[status];

    return {
      status,
      label: config.label,
      icon: config.icon,
      completed: index < currentIndex,
      active: index === currentIndex,
      timestamp: undefined, // Events not available in OrderResponse
    };
  });
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const calculateProgress = (order: OrderResponse): number => {
  const statusProgress: Record<OrderStatus, number> = {
    PENDING_PAYMENT: 0,
    PAID: 20,
    IN_PROGRESS: 40,
    IN_REVIEW: 60,
    DELIVERED: 80,
    COMPLETED: 100,
    CANCELED: 0,
    REFUNDED: 0,
    DISPUTED: 0,
  };

  return statusProgress[order.status] || 0;
};

// ================================================
// COMPONENT
// ================================================

export function OrderProgressTracker({
  order,
  milestones = [],
  userRole,
  detailed = false,
  onRefresh,
  isLoading = false,
  className,
}: OrderProgressTrackerProps) {
  const timeline = getOrderTimeline(order);
  const progress = calculateProgress(order);
  const currentConfig = ORDER_STATUS_CONFIG[order.status];
  const hasMilestones = milestones && milestones.length > 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Current Status Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-lg',
                currentConfig.bgColor,
                currentConfig.color
              )}
            >
              {currentConfig.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentConfig.label}
                </h3>
                <Badge variant="outline" className="text-xs">
                  #{order.orderNumber || order.id.slice(0, 8)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Sipariş durumu: {progress}% tamamlandı
              </p>
              {order.deadline && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Teslim Tarihi: {formatDate(order.deadline)}</span>
                </div>
              )}
            </div>
          </div>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn('h-4 w-4', isLoading && 'animate-spin')}
              />
              <span className="ml-2">Yenile</span>
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Timeline */}
      {detailed && (
        <Card className="p-6">
          <h4 className="mb-4 text-base font-semibold text-gray-900">
            Sipariş Aşamaları
          </h4>
          <div className="space-y-4">
            {timeline.map((step, index) => (
              <div
                key={step.status}
                className={cn(
                  'flex items-start gap-4 pb-4',
                  index !== timeline.length - 1 && 'border-b border-gray-100'
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                    step.completed
                      ? 'bg-green-100 text-green-700'
                      : step.active
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-400'
                  )}
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        'font-medium',
                        step.active
                          ? 'text-gray-900'
                          : step.completed
                            ? 'text-gray-700'
                            : 'text-gray-500'
                      )}
                    >
                      {step.label}
                    </p>
                    {step.timestamp && (
                      <span className="text-xs text-gray-500">
                        {formatDate(step.timestamp)}
                      </span>
                    )}
                  </div>
                  {step.active && (
                    <p className="mt-1 text-sm text-gray-600">
                      {userRole === 'buyer'
                        ? 'Freelancer çalışmaya devam ediyor'
                        : 'Siparişi tamamlamak için çalışın'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payment Information */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-gray-900">
              Ödeme Bilgileri
            </h4>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Toplam Tutar</p>
                <p className="mt-1 font-semibold text-gray-900">
                  ₺{order.totalAmount?.toLocaleString('tr-TR') || '0'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Ödeme Durumu</p>
                <Badge
                  variant={order.status === 'PAID' ? 'success' : 'warning'}
                  className="mt-1"
                >
                  {order.status === 'PAID' ? 'Ödendi' : 'Beklemede'}
                </Badge>
              </div>
              {userRole === 'seller' && order.netAmount && (
                <div>
                  <p className="text-gray-600">Net Kazanç</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    ₺{order.netAmount.toLocaleString('tr-TR')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Ödeme Yöntemi</p>
                <p className="mt-1 text-gray-900">Güvenli Ödeme</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Milestones (if exists) */}
      {hasMilestones && (
        <MilestoneProgressTracker
          milestones={milestones}
          detailed={detailed}
          userRole={userRole}
        />
      )}

      {/* Delivery Information (if delivered) */}
      {(order.status === 'DELIVERED' ||
        order.status === 'IN_REVIEW' ||
        order.status === 'COMPLETED') && (
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <Package className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-gray-900">
                Teslimat Bilgileri
              </h4>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Teslim Durumu</span>
                  <Badge
                    variant={
                      order.status === 'COMPLETED' ? 'success' : 'default'
                    }
                  >
                    {order.status === 'COMPLETED'
                      ? 'Kabul Edildi'
                      : 'İnceleniyor'}
                  </Badge>
                </div>
                {order.deliveredAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Teslim Tarihi</span>
                    <span className="text-gray-900">
                      {formatDate(order.deliveredAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default OrderProgressTracker;
