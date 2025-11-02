/**
 * Admin Disputes Page
 * Sprint 1: Order Dispute System
 *
 * Full dispute management interface for admins
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getAllDisputes, getDisputeStatistics } from '@/lib/api/disputes';
import { orderApi } from '@/lib/api/orders';
import type {
  DisputeResponse,
  DisputeStatistics,
  DisputeFilters as DisputeFiltersType,
} from '@/types/dispute';
import DisputeResolutionModal from '@/components/admin/disputes/DisputeResolutionModal';
import { AdminDisputeDetailModal } from '@/components/admin/disputes/AdminDisputeDetailModal';
import { AdminDisputeQueue } from '@/components/admin/disputes/AdminDisputeQueue';
import {
  DisputeStatistics as DisputeStatsComponent,
  DisputeFilters,
} from '@/components/domains/disputes';
import { useWebSocket } from '@/hooks';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeResponse[]>([]);
  const [statistics, setStatistics] = useState<DisputeStatistics | null>(null);
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
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
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
          console.error('Failed to parse dispute update:', err);
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
        console.error('Failed to fetch order:', error);
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
      <div>
        <h1 className="text-3xl font-bold">İtiraz Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          Tüm itirazları görüntüleyin, yönetin ve çözümleyin
        </p>
      </div>

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
