'use client';

/**
 * ================================================
 * PROPOSAL LIST COMPONENT
 * ================================================
 * Displays list of proposals for a job with employer actions
 *
 * Features:
 * - Accept/Reject/Shortlist actions
 * - Freelancer profile preview
 * - Proposal details (budget, delivery time, cover letter)
 * - Loading and empty states
 * - Integration with useProposals hook
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Job System
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  Check,
  X,
  Star,
  Clock,
  DollarSign,
  User,
  Briefcase,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { useProposals } from '@/hooks/business/proposals/useProposals';
import type { ProposalResponse } from '@/types/backend-aligned';
import { getProposalsByJob } from '@/lib/api/proposals';
import logger from '@/lib/infrastructure/monitoring/logger';
import { formatCurrency } from '@/lib/shared/formatters';
import { toast } from 'sonner';

// ================================================
// TYPES
// ================================================

interface ProposalListProps {
  jobId: string;
  canManage?: boolean; // If true, show accept/reject buttons
}

// ================================================
// COMPONENT
// ================================================

export function ProposalList({ jobId, canManage = false }: ProposalListProps) {
  // State
  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Hooks
  const {
    isAccepting,
    isRejecting,
    acceptProposal,
    rejectProposal,
    shortlistProposal,
  } = useProposals();

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  // ==================== HANDLERS ====================

  const loadProposals = async () => {
    try {
      setIsLoading(true);
      logger.info('Loading proposals for job', { jobId });

      const response = await getProposalsByJob(jobId, {
        page: 0,
        size: 50,
      });

      setProposals(response.content);
      logger.info('Proposals loaded', { count: response.content.length });
    } catch (error) {
      logger.error('Failed to load proposals', error as Error);
      toast.error('Teklifler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (proposalId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(proposalId)) {
        newSet.delete(proposalId);
      } else {
        newSet.add(proposalId);
      }
      return newSet;
    });
  };

  const handleAccept = async (proposalId: string) => {
    if (!confirm('Bu teklifi kabul etmek istediğinizden emin misiniz?')) return;

    const result = await acceptProposal(proposalId);
    if (result) {
      loadProposals();
    }
  };

  const handleReject = async (proposalId: string) => {
    const reason = prompt('Reddetme sebebinizi yazın (opsiyonel):');

    const result = await rejectProposal(proposalId, {
      reason: reason || undefined,
    });

    if (result) {
      loadProposals();
    }
  };

  const handleShortlist = async (proposalId: string) => {
    const result = await shortlistProposal(proposalId);
    if (result) {
      loadProposals();
    }
  };

  // ==================== HELPERS ====================

  const getStatusBadge = (status: ProposalResponse['status']) => {
    const variants = {
      PENDING: 'secondary' as const,
      ACCEPTED: 'success' as const,
      REJECTED: 'destructive' as const,
      WITHDRAWN: 'outline' as const,
      SHORTLISTED: 'default' as const,
    };

    const labels = {
      PENDING: 'Beklemede',
      ACCEPTED: 'Kabul Edildi',
      REJECTED: 'Reddedildi',
      WITHDRAWN: 'Geri Çekildi',
      SHORTLISTED: 'Kısa Listede',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  // ==================== RENDER ====================

  // Loading State
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-600">Teklifler yükleniyor...</p>
        </div>
      </Card>
    );
  }

  // Empty State
  if (proposals.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <Briefcase className="h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Henüz teklif yok
          </h3>
          <p className="text-sm text-gray-600">
            Bu iş için henüz kimse teklif vermedi.
          </p>
        </div>
      </Card>
    );
  }

  // Proposals List
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Teklifler ({proposals.length})
        </h3>
      </div>

      {/* Proposals */}
      {proposals.map((proposal) => {
        const isExpanded = expandedIds.has(proposal.id);
        const canTakeAction = canManage && proposal.status === 'PENDING';

        return (
          <Card key={proposal.id} className="p-6">
            {/* Proposal Header */}
            <div className="flex items-start justify-between">
              {/* Freelancer Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={
                      proposal.freelancerAvatar || '/images/default-avatar.png'
                    }
                    alt={proposal.freelancerName}
                  />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {proposal.freelancerName || 'İsimsiz'}
                    </h4>
                    {getStatusBadge(proposal.status)}
                  </div>

                  {/* Rating */}
                  {proposal.freelancerRating && (
                    <div className="mt-1 flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {proposal.freelancerRating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(proposal.proposedBudget)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{proposal.deliveryDays} gün</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {canTakeAction && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShortlist(proposal.id)}
                    disabled={isAccepting || isRejecting}
                  >
                    Kısa Liste
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleReject(proposal.id)}
                    disabled={isAccepting || isRejecting}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Reddet
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(proposal.id)}
                    disabled={isAccepting || isRejecting}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Kabul Et
                  </Button>
                </div>
              )}
            </div>

            {/* Cover Letter Preview */}
            {proposal.coverLetter && (
              <div className="mt-4">
                <p className="line-clamp-2 text-sm text-gray-700">
                  {proposal.coverLetter}
                </p>
              </div>
            )}

            {/* Expand Button */}
            <button
              onClick={() => toggleExpanded(proposal.id)}
              className="text-primary mt-3 flex items-center gap-1 text-sm font-medium hover:underline"
            >
              {isExpanded ? (
                <>
                  Daha Az Göster
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Detayları Gör
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="mt-4 space-y-4 border-t pt-4">
                {/* Full Cover Letter */}
                {proposal.coverLetter && (
                  <div>
                    <h5 className="mb-2 text-sm font-semibold text-gray-900">
                      Açıklama
                    </h5>
                    <p className="text-sm whitespace-pre-wrap text-gray-700">
                      {proposal.coverLetter}
                    </p>
                  </div>
                )}

                {/* Milestones */}
                {proposal.milestones && proposal.milestones.length > 0 && (
                  <div>
                    <h5 className="mb-2 text-sm font-semibold text-gray-900">
                      Kilometre Taşları
                    </h5>
                    <div className="space-y-2">
                      {proposal.milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {milestone.title}
                            </p>
                            {milestone.description && (
                              <p className="text-sm text-gray-600">
                                {milestone.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(milestone.amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {milestone.dueDate}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {proposal.attachments && proposal.attachments.length > 0 && (
                  <div>
                    <h5 className="mb-2 text-sm font-semibold text-gray-900">
                      Ekler ({proposal.attachments.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {proposal.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline"
                        >
                          Dosya {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Button */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to messages or open chat
                      toast.info('Mesajlaşma özelliği yakında...');
                    }}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Mesaj Gönder
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}

      {/* Info Message */}
      {canManage && (
        <Card className="border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="text-sm text-blue-900">
              <p className="mb-1 font-semibold">İpucu</p>
              <p>
                Bir teklifi kabul ettiğinizde otomatik olarak sipariş
                oluşturulur ve diğer teklifler reddedilir.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ================================================
// EXPORT
// ================================================

export default ProposalList;
