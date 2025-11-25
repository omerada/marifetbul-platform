'use client';

/**
 * ================================================
 * PROPOSAL COMPARISON MODAL
 * ================================================
 * Side-by-side comparison of up to 3 proposals
 *
 * Features:
 * - Compare bid amounts, delivery times, experience
 * - Highlight best value
 * - Quick accept/reject actions
 * - Responsive table layout
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 * Sprint 1: Dashboard Integration - Task 3
 */

import React from 'react';
import {
  X,
  DollarSign,
  Clock,
  Star,
  Briefcase,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { formatCurrency } from '@/lib/shared/formatters';
import type { ProposalResponse } from '@/types/backend-aligned';
import { cn } from '@/lib/utils';

export interface ProposalComparisonModalProps {
  proposals: ProposalResponse[];
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (proposalId: string) => void;
  onReject?: (proposalId: string) => void;
  className?: string;
}

/**
 * Proposal Comparison Modal Component
 *
 * Compare multiple proposals side-by-side
 */
export function ProposalComparisonModal({
  proposals,
  isOpen,
  onClose,
  onAccept,
  onReject,
  className = '',
}: ProposalComparisonModalProps) {
  if (!isOpen) return null;

  // Find best values
  const lowestBid = Math.min(...proposals.map((p) => p.proposedBudget));
  const shortestDelivery = Math.min(...proposals.map((p) => p.deliveryDays));
  const highestRating = Math.max(
    ...proposals.map((p) => p.freelancerRating || 0)
  );

  const isBestBid = (amount: number) => amount === lowestBid;
  const isBestDelivery = (time: number) => time === shortestDelivery;
  const isBestRating = (rating: number) => rating === highestRating;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card
          className={cn(
            'max-h-[90vh] w-full max-w-6xl overflow-auto',
            className
          )}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Teklif Karşılaştırması
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {proposals.length} teklifi karşılaştırıyorsunuz
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Comparison Table */}
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="space-y-4 rounded-lg border bg-gray-50 p-4"
                >
                  {/* Freelancer Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {proposal.freelancerName?.split(' ')[0]?.charAt(0) ||
                          'F'}
                        {proposal.freelancerName?.split(' ')[1]?.charAt(0) ||
                          'L'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">
                        {proposal.freelancerName}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>
                          {proposal.freelancerRating?.toFixed(1) || 'N/A'}
                        </span>
                        {isBestRating(proposal.freelancerRating || 0) && (
                          <Badge variant="default" className="ml-1 text-xs">
                            <Award className="mr-1 h-3 w-3" />
                            En yüksek
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    {/* Bid Amount */}
                    <div className="flex items-start justify-between rounded-lg bg-white p-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-600">Teklif</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(proposal.proposedBudget)}
                          </p>
                        </div>
                      </div>
                      {isBestBid(proposal.proposedBudget) && (
                        <Badge variant="default" className="text-xs">
                          <Award className="mr-1 h-3 w-3" />
                          En düşük
                        </Badge>
                      )}
                    </div>

                    {/* Delivery Time */}
                    <div className="flex items-start justify-between rounded-lg bg-white p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Teslimat</p>
                          <p className="text-lg font-bold text-gray-900">
                            {proposal.deliveryDays} gün
                          </p>
                        </div>
                      </div>
                      {isBestDelivery(proposal.deliveryDays) && (
                        <Badge variant="default" className="text-xs">
                          <Award className="mr-1 h-3 w-3" />
                          En hızlı
                        </Badge>
                      )}
                    </div>

                    {/* Experience */}
                    <div className="rounded-lg bg-white p-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-xs text-gray-600">
                            Freelancer Puanı
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {proposal.freelancerRating?.toFixed(1) || 'N/A'} ⭐
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  <div className="rounded-lg bg-white p-3">
                    <p className="mb-1 text-xs font-medium text-gray-600">
                      Kapak Mektubu
                    </p>
                    <p className="line-clamp-3 text-sm text-gray-700">
                      {proposal.coverLetter}
                    </p>
                  </div>

                  {/* Actions */}
                  {proposal.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1"
                        onClick={() => onAccept?.(proposal.id)}
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Kabul Et
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReject?.(proposal.id)}
                      >
                        Reddet
                      </Button>
                    </div>
                  )}

                  {proposal.status !== 'PENDING' && (
                    <Badge
                      variant={
                        proposal.status === 'ACCEPTED'
                          ? 'success'
                          : 'destructive'
                      }
                      className="w-full justify-center"
                    >
                      {proposal.status === 'ACCEPTED'
                        ? 'Kabul Edildi'
                        : 'Reddedildi'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison Summary */}
            <div className="mt-6 rounded-lg border bg-blue-50 p-4">
              <h3 className="mb-3 font-semibold text-blue-900">
                Karşılaştırma Özeti
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-sm text-blue-700">En Düşük Teklif</p>
                  <p className="text-lg font-bold text-blue-900">
                    {formatCurrency(lowestBid)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">En Hızlı Teslimat</p>
                  <p className="text-lg font-bold text-blue-900">
                    {shortestDelivery} gün
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">En Yüksek Puan</p>
                  <p className="text-lg font-bold text-blue-900">
                    {highestRating.toFixed(1)} ⭐
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
