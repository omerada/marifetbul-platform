/**
 * ================================================
 * ORDER WORKFLOW STEPPER COMPONENT
 * ================================================
 * Visual representation of order status workflow
 *
 * Features:
 * - 9-step workflow for all order statuses
 * - Current status highlighting
 * - Completed steps indication
 * - Timestamp display for each step
 * - Responsive design
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 1: Order Detail Page
 */

'use client';

import React from 'react';
import {
  CreditCard,
  CheckCircle,
  PlayCircle,
  Package,
  ThumbsUp,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import type { OrderStatus } from '@/lib/api/validators/order';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface OrderWorkflowStep {
  status: OrderStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  timestamp?: string;
}

export interface OrderWorkflowStepperProps {
  currentStatus: OrderStatus;
  completedAt?: string | null;
  canceledAt?: string | null;
  createdAt: string;
  paidAt?: string | null;
  acceptedAt?: string | null;
  startedAt?: string | null;
  deliveredAt?: string | null;
  className?: string;
}

// ================================================
// WORKFLOW CONFIGURATION
// ================================================

const WORKFLOW_STEPS: Record<OrderStatus, OrderWorkflowStep> = {
  PENDING_PAYMENT: {
    status: 'PENDING_PAYMENT',
    label: 'Ödeme Bekleniyor',
    description: 'Sipariş oluşturuldu, ödeme bekleniyor',
    icon: <CreditCard className="h-5 w-5" />,
  },
  PAID: {
    status: 'PAID',
    label: 'Ödendi',
    description: 'Ödeme alındı, satıcı onayı bekleniyor',
    icon: <CheckCircle className="h-5 w-5" />,
  },
  IN_PROGRESS: {
    status: 'IN_PROGRESS',
    label: 'Devam Ediyor',
    description: 'Satıcı iş üzerinde çalışıyor',
    icon: <PlayCircle className="h-5 w-5" />,
  },
  DELIVERED: {
    status: 'DELIVERED',
    label: 'Teslim Edildi',
    description: 'İş teslim edildi, onay bekleniyor',
    icon: <Package className="h-5 w-5" />,
  },
  COMPLETED: {
    status: 'COMPLETED',
    label: 'Tamamlandı',
    description: 'Sipariş başarıyla tamamlandı',
    icon: <ThumbsUp className="h-5 w-5" />,
  },
  CANCELED: {
    status: 'CANCELED',
    label: 'İptal Edildi',
    description: 'Sipariş iptal edildi',
    icon: <XCircle className="h-5 w-5" />,
  },
  REFUNDED: {
    status: 'REFUNDED',
    label: 'İade Edildi',
    description: 'Ödeme iade edildi',
    icon: <RefreshCw className="h-5 w-5" />,
  },
  DISPUTED: {
    status: 'DISPUTED',
    label: 'İhtilaflı',
    description: 'Sipariş ihtilaf durumunda',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  IN_REVIEW: {
    status: 'IN_REVIEW',
    label: 'İnceleniyor',
    description: 'Sipariş admin incelemesinde',
    icon: <Clock className="h-5 w-5" />,
  },
};

// Standard workflow order (happy path)
const STANDARD_WORKFLOW_ORDER: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'IN_PROGRESS',
  'DELIVERED',
  'COMPLETED',
];

// ================================================
// HELPER FUNCTIONS
// ================================================

function getWorkflowSteps(currentStatus: OrderStatus): OrderStatus[] {
  // Handle terminal/special states
  if (currentStatus === 'CANCELED') {
    return ['PENDING_PAYMENT', 'PAID', 'CANCELED'];
  }
  if (currentStatus === 'REFUNDED') {
    return ['PENDING_PAYMENT', 'PAID', 'CANCELED', 'REFUNDED'];
  }
  if (currentStatus === 'DISPUTED') {
    return ['PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'DELIVERED', 'DISPUTED'];
  }
  if (currentStatus === 'IN_REVIEW') {
    return ['PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'IN_REVIEW'];
  }

  // Standard workflow
  const currentIndex = STANDARD_WORKFLOW_ORDER.indexOf(currentStatus);
  if (currentIndex === -1) {
    return STANDARD_WORKFLOW_ORDER;
  }

  return STANDARD_WORKFLOW_ORDER.slice(0, currentIndex + 1);
}

function getStepStatus(
  step: OrderStatus,
  currentStatus: OrderStatus
): 'completed' | 'current' | 'upcoming' {
  if (step === currentStatus) return 'current';

  const workflow = getWorkflowSteps(currentStatus);
  const stepIndex = workflow.indexOf(step);
  const currentIndex = workflow.indexOf(currentStatus);

  if (stepIndex !== -1 && currentIndex !== -1 && stepIndex < currentIndex) {
    return 'completed';
  }

  return 'upcoming';
}

function formatTimestamp(timestamp?: string | null): string {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ================================================
// COMPONENT
// ================================================

export function OrderWorkflowStepper({
  currentStatus,
  completedAt,
  canceledAt,
  createdAt,
  paidAt,
  acceptedAt,
  startedAt,
  deliveredAt,
  className,
}: OrderWorkflowStepperProps) {
  const workflowSteps = getWorkflowSteps(currentStatus);

  // Map timestamps to steps
  const stepTimestamps: Partial<Record<OrderStatus, string>> = {
    PENDING_PAYMENT: createdAt,
    PAID: paidAt || undefined,
    IN_PROGRESS: startedAt || acceptedAt || undefined,
    DELIVERED: deliveredAt || undefined,
    COMPLETED: completedAt || undefined,
    CANCELED: canceledAt || undefined,
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop: Horizontal Stepper */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 h-0.5 w-full bg-gray-200">
            <div
              className="h-full bg-purple-600 transition-all duration-500"
              style={{
                width: `${(workflowSteps.indexOf(currentStatus) / (workflowSteps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {workflowSteps.map((stepStatus) => {
              const step = WORKFLOW_STEPS[stepStatus];
              const status = getStepStatus(stepStatus, currentStatus);
              const timestamp = stepTimestamps[stepStatus];

              return (
                <div
                  key={stepStatus}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / workflowSteps.length}%` }}
                >
                  {/* Icon Circle */}
                  <div
                    className={cn(
                      'z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white transition-all duration-300',
                      status === 'completed' &&
                        'border-purple-600 bg-purple-600 text-white',
                      status === 'current' &&
                        'border-purple-600 bg-white text-purple-600 ring-4 ring-purple-100',
                      status === 'upcoming' &&
                        'border-gray-300 bg-gray-50 text-gray-400'
                    )}
                  >
                    {step.icon}
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <div
                      className={cn(
                        'text-sm font-medium',
                        status === 'current' && 'text-purple-600',
                        status === 'completed' && 'text-gray-900',
                        status === 'upcoming' && 'text-gray-400'
                      )}
                    >
                      {step.label}
                    </div>
                    {timestamp && (
                      <div className="mt-1 text-xs text-gray-500">
                        {formatTimestamp(timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: Vertical Stepper */}
      <div className="lg:hidden">
        <div className="space-y-4">
          {workflowSteps.map((stepStatus, index) => {
            const step = WORKFLOW_STEPS[stepStatus];
            const status = getStepStatus(stepStatus, currentStatus);
            const timestamp = stepTimestamps[stepStatus];
            const isLast = index === workflowSteps.length - 1;

            return (
              <div key={stepStatus} className="relative flex gap-4">
                {/* Connector Line */}
                {!isLast && (
                  <div className="absolute top-12 left-6 h-full w-0.5 -translate-x-1/2 bg-gray-200">
                    {status === 'completed' && (
                      <div className="h-full w-full bg-purple-600" />
                    )}
                  </div>
                )}

                {/* Icon Circle */}
                <div
                  className={cn(
                    'z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 bg-white transition-all duration-300',
                    status === 'completed' &&
                      'border-purple-600 bg-purple-600 text-white',
                    status === 'current' &&
                      'border-purple-600 bg-white text-purple-600 ring-4 ring-purple-100',
                    status === 'upcoming' &&
                      'border-gray-300 bg-gray-50 text-gray-400'
                  )}
                >
                  {step.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      status === 'current' && 'text-purple-600',
                      status === 'completed' && 'text-gray-900',
                      status === 'upcoming' && 'text-gray-400'
                    )}
                  >
                    {step.label}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {step.description}
                  </div>
                  {timestamp && (
                    <div className="mt-2 text-xs font-medium text-gray-500">
                      {formatTimestamp(timestamp)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OrderWorkflowStepper;
