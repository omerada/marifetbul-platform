/**
 * ================================================
 * ORDER MILESTONES PAGE - SPRINT 1
 * ================================================
 * Clean, focused milestone management page
 *
 * Features:
 * - Display milestone list
 * - Milestone actions (start, deliver, accept, reject)
 * - Real-time WebSocket updates
 * - Type-safe implementation
 *
 * @sprint Sprint 1 - Milestone Frontend Integration
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import {
  MilestoneList,
  CreateMilestoneForm,
} from '@/components/domains/milestones';
import { useOrderMilestones } from '@/hooks/business/useMilestones';
import { useWebSocket } from '@/hooks/infrastructure/websocket';
import { authSelectors } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { orderApi } from '@/lib/api/orders';
import type { OrderResponse } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';
import Link from 'next/link';
import { toast } from 'sonner';

// ================================================
// COMPONENT
// ================================================

export default function OrderMilestonesPage() {
  const params = useParams();
  const orderId = params?.id as string;

  // Get current user from auth store
  const user = authSelectors.useUser();

  // Order state for role detection
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Determine user role from order
  const userRole: 'FREELANCER' | 'EMPLOYER' =
    order && user
      ? order.sellerId === user.id
        ? 'FREELANCER'
        : 'EMPLOYER'
      : 'FREELANCER';

  // Fetch milestones
  const { milestones, isLoading, error, refetch } = useOrderMilestones(orderId);

  // WebSocket for real-time updates (Sprint 1 - Story 1.8)
  const { isConnected: wsConnected, subscribe } = useWebSocket({
    autoConnect: true,
    enableStoreIntegration: true,
    onConnect: () => {
      logger.info('[OrderMilestonesPage] WebSocket connected');
    },
    onDisconnect: () => {
      logger.info('[OrderMilestonesPage] WebSocket disconnected');
    },
  });

  // Subscribe to milestone updates
  useEffect(() => {
    if (!wsConnected || !orderId) return;

    logger.info('[OrderMilestonesPage] Subscribing to milestone updates', {
      orderId,
    });

    // Subscribe to order-specific milestone updates
    const subscriptionId = subscribe(
      `/topic/orders/${orderId}/milestones`,
      (message: unknown) => {
        logger.info('[OrderMilestonesPage] Milestone update received', {
          message,
        });

        // Refetch milestones on any update
        refetch();

        // Show toast notification
        const payload = message as {
          type?: string;
          milestoneId?: string;
          status?: string;
        };

        if (payload.type === 'MILESTONE_CREATED') {
          toast.success('Yeni milestone eklendi');
        } else if (payload.type === 'MILESTONE_DELIVERED') {
          toast.info('Milestone teslim edildi');
        } else if (payload.type === 'MILESTONE_ACCEPTED') {
          toast.success('Milestone onaylandı');
        } else if (payload.type === 'MILESTONE_REVISION_REQUESTED') {
          toast.warning('Revizyon istendi');
        }
      }
    );

    return () => {
      logger.info('[OrderMilestonesPage] Unsubscribing from milestone updates');
      // Cleanup will be handled by useWebSocket hook
    };
  }, [wsConnected, orderId, subscribe, refetch]);

  // Load order details for role detection
  const loadOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setOrderLoading(true);
      setOrderError(null);

      const response = await orderApi.getOrder(orderId);
      const data = 'data' in response ? response.data : response;
      setOrder(data);

      logger.info('[OrderMilestonesPage] Order loaded', {
        orderId,
        sellerId: data.sellerId,
        buyerId: data.buyerId,
        userId: user?.id,
        role: data.sellerId === user?.id ? 'FREELANCER' : 'EMPLOYER',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load order';
      setOrderError(message);
      toast.error('Order Load Failed', { description: message });
      logger.error('[OrderMilestonesPage] Order load failed', err as Error);
    } finally {
      setOrderLoading(false);
    }
  }, [orderId, user?.id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Log for debugging
  React.useEffect(() => {
    if (orderId) {
      logger.info('[OrderMilestonesPage] Loading milestones', {
        orderId,
        userId: user?.id,
        userRole,
      });
    }
  }, [orderId, user?.id, userRole]);

  // ================================================
  // RENDER
  // ================================================

  // Loading state
  if (orderLoading || isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-4">
          <div className="bg-muted h-8 w-48 animate-pulse rounded" />
          <div className="bg-muted h-12 w-full animate-pulse rounded" />
          <div className="bg-muted h-64 w-full animate-pulse rounded" />
        </div>
      </div>
    );
  }

  // Error state
  if (orderError || error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {orderError || error?.message || 'Failed to load milestone data'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No order found
  if (!order) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Order not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/orders/${orderId}`}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center text-sm"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Order Detail
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Milestones - Order #{order.orderNumber}
            </h1>
            <p className="text-gray-600">
              Track and manage milestone-based progress for this order
            </p>
            <div className="mt-2 flex items-center gap-4">
              <p className="text-sm text-gray-500">
                Your role:{' '}
                {userRole === 'FREELANCER'
                  ? 'Freelancer (Seller)'
                  : 'Employer (Buyer)'}
              </p>
              {/* WebSocket Status Indicator */}
              <Badge
                variant={wsConnected ? 'success' : 'outline'}
                className="gap-1.5"
              >
                {wsConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    <span className="text-xs">Live Updates</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span className="text-xs">Offline</span>
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone List or Create Form */}
      {showCreateForm ? (
        <Card className="p-6">
          <CreateMilestoneForm
            orderId={orderId}
            orderTotal={order.totalAmount}
            currency={order.currency}
            onSuccess={(milestones) => {
              logger.info('[OrderMilestonesPage] Milestones created', {
                count: milestones.length,
              });
              setShowCreateForm(false);
              refetch();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <MilestoneList
            orderId={orderId}
            userRole={userRole}
            showCreateButton={
              userRole === 'FREELANCER' &&
              (!milestones || milestones.length === 0)
            }
            onCreateClick={() => {
              logger.info('[OrderMilestonesPage] Create milestone clicked');
              setShowCreateForm(true);
            }}
          />
        </Card>
      )}

      {/* Sprint 1 Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-6 border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-blue-900">
            Sprint 1 Debug Info
          </h3>
          <div className="space-y-1 text-xs text-blue-800">
            <div>Order ID: {orderId}</div>
            <div>User Role: {userRole}</div>
            <div>Milestones Count: {milestones?.length || 0}</div>
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            <div>Error: {error ? error.message : 'None'}</div>
          </div>
        </Card>
      )}
    </div>
  );
}
