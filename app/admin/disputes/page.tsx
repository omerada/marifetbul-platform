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
import type { DisputeResponse, DisputeStatistics } from '@/types/dispute';
import DisputeList from '@/components/admin/disputes/DisputeList';
import DisputeResolutionModal from '@/components/admin/disputes/DisputeResolutionModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useWebSocket } from '@/hooks';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeResponse[]>([]);
  const [statistics, setStatistics] = useState<DisputeStatistics | null>(null);
  const [selectedDispute, setSelectedDispute] =
    useState<DisputeResponse | null>(null);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const socket = useWebSocket();
  const pageSize = 20;

  // Fetch disputes and statistics
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [disputesData, statsData] = await Promise.all([
        getAllDisputes({ page: currentPage, size: pageSize }),
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
  }, [currentPage]);

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
      // TODO: Open dispute detail modal or navigate to detail page
      toast.info('Geliştirme Aşamasında', {
        description: 'İtiraz detay sayfası yakında eklenecek.',
      });
    }
  };

  const handleResolveDispute = (disputeId: string) => {
    const dispute = disputes.find((d) => d.id === disputeId);
    if (dispute) {
      setSelectedDispute(dispute);
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

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">İtiraz Yönetimi</h1>
        <p className="text-muted-foreground mt-2">
          Tüm itirazları görüntüleyin, yönetin ve çözümleyin
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Açık İtirazlar
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.openDisputesCount}
              </div>
              <p className="text-muted-foreground text-xs">
                Çözüm bekleyen itirazlar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ortalama Çözüm Süresi
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.averageResolutionTimeHours > 0
                  ? `${Math.round(statistics.averageResolutionTimeHours)} saat`
                  : 'Veri yok'}
              </div>
              <p className="text-muted-foreground text-xs">
                İtiraz çözüm süresi ortalaması
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam İtiraz
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{disputes.length}</div>
              <p className="text-muted-foreground text-xs">
                Sistemdeki toplam itiraz sayısı
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Disputes List */}
      <DisputeList
        disputes={disputes}
        totalCount={disputes.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onViewDispute={handleViewDispute}
        onResolveDispute={handleResolveDispute}
        isLoading={isLoading}
      />

      {/* Resolution Modal */}
      {selectedDispute && (
        <DisputeResolutionModal
          isOpen={isResolutionModalOpen}
          onClose={() => {
            setIsResolutionModalOpen(false);
            setSelectedDispute(null);
          }}
          dispute={selectedDispute}
          orderTotalAmount={0} // TODO: Fetch order total from order API
          onSuccess={handleResolutionSuccess}
        />
      )}
    </div>
  );
}
