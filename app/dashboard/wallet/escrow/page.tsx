/**
 * ================================================
 * ESCROW MANAGEMENT PAGE
 * ================================================
 * Complete escrow management dashboard
 *
 * Features:
 * - EscrowList with filtering and sorting
 * - EscrowDetailsModal for full details
 * - ReleaseEscrowFlow for payment release
 * - DisputeEscrowModal for dispute initiation
 * - Real-time updates integration
 *
 * Sprint 1 - Epic 1.2 - Days 4-5
 * Test Page: /dashboard/wallet/escrow
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  EscrowList,
  EscrowDetailsModal,
  ReleaseEscrowFlow,
  DisputeEscrowModal,
  type EscrowItem,
} from '@/components/domains/wallet';
import { useWalletData } from '@/hooks/business/wallet';
import { Card } from '@/components/ui/Card';
import { releaseEscrowPayment } from '@/lib/api/payment';
import { raiseDispute } from '@/lib/api/disputes';
import type { Transaction } from '@/types/business/features/wallet';
import { DisputeReason } from '@/types/dispute';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EscrowManagementPage() {
  // Fetch wallet data
  const { transactions, isLoading, error, refresh } = useWalletData();

  // Modal states
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);

  // Handlers
  const handleItemClick = (escrow: EscrowItem) => {
    setSelectedEscrow(escrow);
    setIsDetailsOpen(true);
  };

  const handleReleaseRequest = (escrow: EscrowItem) => {
    setSelectedEscrow(escrow);
    setIsReleaseOpen(true);
  };

  const handleDisputeRequest = (escrow: EscrowItem) => {
    setSelectedEscrow(escrow);
    setIsDisputeOpen(true);
  };

  const handleReleaseConfirm = async (escrowId: string, _notes?: string) => {
    try {
      // Call backend API to release escrow
      await releaseEscrowPayment(escrowId);

      // Show success toast
      toast.success('Ödeme Serbest Bırakıldı', {
        description: 'Ödeme satıcıya başarıyla aktarıldı.',
      });

      // Refresh data
      await refresh();

      // Close modal
      setIsReleaseOpen(false);
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Failed to release escrow:', error);

      toast.error('Ödeme Serbest Bırakılamadı', {
        description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      });
    }
  };

  const handleDisputeSubmit = async (
    escrowId: string,
    reason: DisputeReason,
    description: string
  ) => {
    try {
      // Call backend API to create dispute
      await raiseDispute({
        orderId: escrowId,
        reason: reason,
        description: description,
        evidenceUrls: [],
      });

      // Show success toast
      toast.success('İhtilaf Başlatıldı', {
        description: 'Moderatör ekibimiz en kısa sürede inceleyecektir.',
      });

      // Refresh data
      await refresh();

      // Close modals
      setIsDisputeOpen(false);
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Failed to create dispute:', error);

      toast.error('İhtilaf Başlatılamadı', {
        description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 py-8">
        <div className="space-y-2">
          <div className="bg-muted h-8 w-64 animate-pulse rounded" />
          <div className="bg-muted h-4 w-96 animate-pulse rounded" />
        </div>
        <Card>
          <div className="space-y-4 p-6">
            <div className="bg-muted h-32 w-full animate-pulse rounded" />
            <div className="bg-muted h-32 w-full animate-pulse rounded" />
            <div className="bg-muted h-32 w-full animate-pulse rounded" />
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <div className="text-center text-red-600">
            <h3 className="mb-2 font-semibold">Hata Oluştu</h3>
            <p className="text-sm">{error?.message || 'Veriler yüklenemedi'}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold">Emanet Yönetimi</h1>
        <p className="text-muted-foreground">
          Güvenli ödemelerinizi yönetin, serbest bırakın veya itiraz edin.
        </p>
      </div>

      {/* Escrow List */}
      <EscrowList
        transactions={transactions as Transaction[]}
        isLoading={isLoading}
        onItemClick={handleItemClick}
        onReleaseRequest={handleReleaseRequest}
        onDisputeRequest={handleDisputeRequest}
      />

      {/* Escrow Details Modal */}
      <EscrowDetailsModal
        escrow={selectedEscrow}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedEscrow(null);
        }}
        onRelease={handleReleaseRequest}
        onDispute={handleDisputeRequest}
      />

      {/* Release Escrow Flow */}
      <ReleaseEscrowFlow
        escrow={selectedEscrow}
        isOpen={isReleaseOpen}
        onClose={() => {
          setIsReleaseOpen(false);
        }}
        onConfirm={handleReleaseConfirm}
      />

      {/* Dispute Escrow Modal */}
      <DisputeEscrowModal
        escrow={selectedEscrow}
        isOpen={isDisputeOpen}
        onClose={() => {
          setIsDisputeOpen(false);
        }}
        onSubmit={handleDisputeSubmit}
      />
    </div>
  );
}
