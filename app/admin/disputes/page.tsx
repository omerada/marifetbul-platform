/**
 * Admin Disputes Page
 * Sprint 1: Order Dispute System
 *
 * Full dispute management interface for admins
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import { getAllDisputes, getDisputeStatistics } from '@/lib/api/disputes';
import { orderApi } from '@/lib/api/orders';
import type {
  DisputeResponse,
  DisputeStatistics,
  DisputeStatisticsExtended,
  DisputeFilters as DisputeFiltersType,
} from '@/types/dispute';
import DisputeResolutionModal from '@/components/domains/admin/disputes/DisputeResolutionModal';
import { AdminDisputeDetailModal } from '@/components/domains/admin/disputes/AdminDisputeDetailModal';
import { AdminDisputeQueue } from '@/components/domains/admin/disputes/AdminDisputeQueue';
import {
  DisputeStatistics as DisputeStatsComponent,
  DisputeFilters,
  DisputeAnalytics,
} from '@/components/domains/disputes';
import { useWebSocket } from '@/hooks';
import { Button } from '@/components/ui';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeResponse[]>([]);
  const [statistics, setStatistics] = useState<DisputeStatistics | null>(null);
  const [extendedStats, setExtendedStats] =
    useState<DisputeStatisticsExtended | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>(
    'overview'
  );
  const [selectedDispute, setSelectedDispute] =
    useState<DisputeResponse | null>(null);
  const [orderTotalAmount, setOrderTotalAmount] = useState<number>(0);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [currentPage, _setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<DisputeFiltersType>({});

  const socket = useWebSocket();
  const pageSize = 20;

  // Fetch disputes and statistics
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [disputesData, statsData] = await Promise.all([
        getAllDisputes({
          page: currentPage,
          size: pageSize,
          ...activeFilters,
        }),
        getDisputeStatistics(),
      ]);

      setDisputes(disputesData);
      setStatistics(statsData);

      // Mock extended statistics (TODO: Replace with real API)
      if (disputesData.length > 0) {
        const openCount = disputesData.filter(
          (d) => d.status === 'OPEN'
        ).length;
        const inProgressCount = disputesData.filter(
          (d) => d.status === 'IN_PROGRESS'
        ).length;
        const resolvedCount = disputesData.filter(
          (d) => d.status === 'RESOLVED'
        ).length;
        const rejectedCount = disputesData.filter(
          (d) => d.status === 'REJECTED'
        ).length;
        const closedCount = disputesData.filter(
          (d) => d.status === 'CLOSED'
        ).length;

        const reasonDist: Record<string, number> = {};
        disputesData.forEach((d) => {
          reasonDist[d.reason] = (reasonDist[d.reason] || 0) + 1;
        });

        setExtendedStats({
          openDisputesCount: statsData.openDisputesCount,
          averageResolutionTimeHours: statsData.averageResolutionTimeHours,
          totalDisputes: disputesData.length,
          openDisputes: openCount,
          inProgressDisputes: inProgressCount,
          resolvedDisputes: resolvedCount,
          rejectedDisputes: rejectedCount,
          closedDisputes: closedCount,
          resolutionRate:
            disputesData.length > 0
              ? (resolvedCount / disputesData.length) * 100
              : 0,
          favorBuyerCount: 0,
          favorSellerCount: 0,
          mutualAgreementCount: 0,
          reasonDistribution: reasonDist,
          topReasons: [],
          disputesOverTime: [],
        });
      }
    } catch (error) {
      logger.error('Failed to fetch admin disputes data', error, {
        component: 'AdminDisputesPage',
        action: 'fetchData',
        currentPage,
        filters: activeFilters,
      });
      toast.error('Veri Yüklenemedi', {
        description: 'İtirazlar yüklenirken bir hata oluştu.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, activeFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle dispute events from WebSocket
  const handleDisputeEvent = useCallback(
    (payload: {
      type: string;
      disputeId: string;
      orderId: string;
      orderNumber: string;
      reason?: string;
      reasonLabel?: string;
      raisedBy?: string;
      resolvedBy?: string;
      resolutionType?: string;
      status: string;
    }) => {
      if (payload.type === 'DISPUTE_CREATED') {
        toast.info('Yeni İtiraz', {
          description: `Sipariş #${payload.orderNumber} için yeni itiraz açıldı`,
          duration: 4000,
        });

        // Refresh data to show new dispute
        fetchData();
      } else if (payload.type === 'DISPUTE_RESOLVED') {
        toast.success('İtiraz Çözüldü', {
          description: `Sipariş #${payload.orderNumber} itirazı çözümlendi`,
          duration: 4000,
        });

        // Refresh data to update statistics and list
        fetchData();
      }
    },
    [fetchData]
  );

  // WebSocket subscription for real-time dispute updates
  useEffect(() => {
    if (!socket.isConnected) return;

    // Subscribe to admin dispute updates (broadcast channel)
    const subscriptionId = socket.subscribe(
      '/topic/admin/disputes',
      (message: unknown) => {
        try {
          if (!message || typeof message !== 'object' || !('body' in message)) {
            return;
          }

          const msgBody = (message as { body: string }).body;
          const payload = JSON.parse(msgBody);

          // Handle dispute events
          if (
            payload.type === 'DISPUTE_CREATED' ||
            payload.type === 'DISPUTE_RESOLVED'
          ) {
            handleDisputeEvent(payload);
          }
        } catch (err) {
          logger.error(
            'Failed to parse dispute WebSocket update',
            err instanceof Error ? err : new Error(String(err)),
            { component: 'AdminDisputesPage', action: 'handleWebSocketMessage' }
          );
        }
      }
    );

    return () => {
      socket.unsubscribe(subscriptionId);
    };
  }, [socket, handleDisputeEvent]);

  const handleViewDispute = (disputeId: string) => {
    const dispute = disputes.find((d) => d.id === disputeId);
    if (dispute) {
      setSelectedDispute(dispute);
      setIsDetailModalOpen(true);
    }
  };

  const handleResolveDispute = async (disputeId: string) => {
    const dispute = disputes.find((d) => d.id === disputeId);
    if (dispute) {
      setSelectedDispute(dispute);

      // Fetch order total amount
      try {
        const orderResponse = await orderApi.getOrderById(dispute.orderId);
        setOrderTotalAmount(orderResponse.data.totalAmount);
      } catch (error) {
        logger.error(
          'Failed to fetch order details for dispute resolution',
          error,
          {
            component: 'AdminDisputesPage',
            action: 'handleResolveDispute',
            disputeId,
            orderId: dispute.orderId,
          }
        );
        toast.error('Sipariş bilgileri yüklenemedi');
        setOrderTotalAmount(0);
      }

      setIsResolutionModalOpen(true);
    }
  };

  const handleResolutionSuccess = () => {
    toast.success('İşlem Başarılı', {
      description: 'İtiraz çözümlendi ve veriler güncellendi.',
    });
    fetchData(); // Refresh data
    setIsResolutionModalOpen(false);
    setSelectedDispute(null);
  };

  // Handle filter changes
  const handleFiltersChange = (filters: DisputeFiltersType) => {
    setActiveFilters(filters);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İtiraz Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Tüm itirazları görüntüleyin, yönetin ve çözümleyin
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'overview' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            Genel Bakış
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('analytics')}
          >
            Analitikler
          </Button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' ? (
        <>
          {/* Statistics Cards - Sprint 1 Day 1.2 */}
          <DisputeStatsComponent
            statistics={statistics}
            isLoading={isLoading}
            onRefresh={fetchData}
          />

          {/* Advanced Filters - Sprint 1 Day 1.3 */}
          <DisputeFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={activeFilters}
          />

          {/* Disputes Queue - Sprint 16 Story 3.3 */}
          <AdminDisputeQueue
            disputes={disputes}
            isLoading={isLoading}
            onRefresh={fetchData}
            onViewDetails={handleViewDispute}
            onResolveDispute={handleResolveDispute}
          />
        </>
      ) : (
        /* Analytics Dashboard - Sprint 1 Week 2 */
        <DisputeAnalytics statistics={extendedStats} onRefresh={fetchData} />
      )}

      {/* Detail Modal */}
      {selectedDispute && (
        <AdminDisputeDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedDispute(null);
          }}
          dispute={selectedDispute}
          onResolve={(dispute) => {
            setSelectedDispute(dispute);
            setIsDetailModalOpen(false);
            setIsResolutionModalOpen(true);
          }}
        />
      )}

      {/* Resolution Modal */}
      {selectedDispute && (
        <DisputeResolutionModal
          isOpen={isResolutionModalOpen}
          onClose={() => {
            setIsResolutionModalOpen(false);
            setSelectedDispute(null);
            setOrderTotalAmount(0);
          }}
          dispute={selectedDispute}
          orderTotalAmount={orderTotalAmount}
          onSuccess={handleResolutionSuccess}
        />
      )}
    </div>
  );
}
