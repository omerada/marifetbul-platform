'use client';

import React, { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Star,
  CheckCircle,
  X,
  Clock,
  DollarSign,
  FileText,
} from 'lucide-react';
import type { ProposalResponse } from '@/types/backend-aligned';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { MessageButton } from '@/components/domains/messaging';
import { formatCurrency } from '@/lib/shared/formatters';

interface ProposalCardProps {
  proposal: ProposalResponse;
  jobTitle?: string;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const ProposalCard = memo<ProposalCardProps>(function ProposalCard({
  proposal,
  jobTitle,
  onAccept,
  onReject,
  showActions = true,
  isLoading = false,
  className,
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'secondary';
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'destructive';
      case 'WITHDRAWN':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Beklemede';
      case 'ACCEPTED':
        return 'Kabul Edildi';
      case 'REJECTED':
        return 'Reddedildi';
      case 'WITHDRAWN':
        return 'Geri Çekildi';
      default:
        return status;
    }
  };

  const formatBudget = (amount?: number) => {
    if (!amount) return 'Belirtilmemiş';
    return `₺${amount.toLocaleString('tr-TR')}`;
  };

  return (
    <div className={`rounded-lg border bg-white p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center">
          <Avatar
            src={proposal.freelancerAvatar}
            alt={proposal.freelancerName}
            className="mr-3 h-10 w-10"
          >
            <AvatarFallback>
              {proposal.freelancerName?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-gray-900">
              {proposal.freelancerName || 'İsimsiz'}
            </h4>
            <div className="flex items-center text-sm text-gray-600">
              <Star className="mr-1 h-4 w-4 text-yellow-400" />
              <span>{proposal.freelancerRating || 0}</span>
              <span className="mx-1">•</span>
              <span>0 değerlendirme</span>
            </div>
          </div>
        </div>
        <Badge variant={getStatusColor(proposal.status)}>
          {getStatusText(proposal.status)}
        </Badge>
      </div>

      {/* Budget & Timeline */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-sm text-gray-600">Teklif</div>
          <div className="text-lg font-semibold text-green-600">
            {formatBudget(proposal.proposedBudget)}
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-sm text-gray-600">Süre</div>
          <div className="font-semibold">{proposal.proposedTimeline}</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-sm text-gray-600">Gönderilme</div>
          <div className="text-sm font-semibold">
            {formatDistanceToNow(new Date(proposal.createdAt), {
              addSuffix: true,
              locale: tr,
            })}
          </div>
        </div>
      </div>

      {/* Cover Letter */}
      <div className="mb-4">
        <h5 className="mb-2 font-medium text-gray-900">Kapak Mektubu</h5>
        <p className="text-sm leading-relaxed text-gray-700">
          {proposal.coverLetter}
        </p>
      </div>

      {/* Attachments */}
      {proposal.attachments && proposal.attachments.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-2 font-medium text-gray-900">Ekler</h5>
          <div className="flex flex-wrap gap-2">
            {proposal.attachments.map((attachment, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => window.open(attachment, '_blank')}
              >
                Ek {index + 1}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {proposal.status === 'PENDING' && (
        <div className="flex items-center justify-between border-t pt-4">
          <MessageButton
            recipientId={proposal.freelancerId}
            recipientName={proposal.freelancerName || 'İsimsiz'}
            context={{
              type: 'PROPOSAL',
              id: proposal.id,
              title: jobTitle || `Teklif #${proposal.id.slice(0, 8)}`,
              additionalData: {
                jobId: proposal.jobId,
                proposedBudget: proposal.proposedBudget,
                proposedTimeline: proposal.proposedTimeline,
                status: proposal.status,
              },
            }}
            variant="outline"
            size="sm"
          >
            Mesaj Gönder
          </MessageButton>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onReject}>
              <X className="mr-2 h-4 w-4" />
              Reddet
            </Button>
            <Button onClick={onAccept}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Kabul Et
            </Button>
          </div>
        </div>
      )}

      {proposal.status === 'ACCEPTED' && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center text-green-600">
            <CheckCircle className="mr-2 h-4 w-4" />
            <span className="font-medium">Bu teklif kabul edildi</span>
          </div>
          <MessageButton
            recipientId={proposal.freelancerId}
            recipientName={proposal.freelancerName || 'İsimsiz'}
            context={{
              type: 'PROPOSAL',
              id: proposal.id,
              title: jobTitle || `Teklif #${proposal.id.slice(0, 8)}`,
              additionalData: {
                jobId: proposal.jobId,
                proposedBudget: proposal.proposedBudget,
                proposedTimeline: proposal.proposedTimeline,
                status: proposal.status,
              },
            }}
            variant="outline"
            size="sm"
          >
            Mesaj Gönder
          </MessageButton>
        </div>
      )}

      {proposal.status === 'REJECTED' && (
        <div className="flex items-center border-t pt-4 text-red-600">
          <X className="mr-2 h-4 w-4" />
          <span className="font-medium">Bu teklif reddedildi</span>
        </div>
      )}
    </div>
  );
});

ProposalCard.displayName = 'ProposalCard';
