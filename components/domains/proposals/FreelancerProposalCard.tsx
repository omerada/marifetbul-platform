'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  ExternalLink,
  DollarSign,
  Clock,
  Calendar,
  AlertCircle,
  Ban,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Proposal } from '@/hooks/business/useFreelancerProposals';

interface FreelancerProposalCardProps {
  proposal: Proposal;
  onWithdraw?: (proposalId: string) => void;
  onEdit?: (proposalId: string) => void;
  className?: string;
}

/**
 * Freelancer Proposal Card Component
 *
 * Shows proposal details from freelancer's perspective:
 * - Job title and employer info
 * - Proposal status and timeline
 * - Bid amount and delivery time
 * - Actions (View Job, Withdraw for pending)
 *
 * @param proposal - Proposal data
 * @param onWithdraw - Withdraw callback
 * @param onEdit - Edit callback (future feature)
 * @param className - Additional CSS classes
 */
export function FreelancerProposalCard({
  proposal,
  onWithdraw,
  className = '',
}: FreelancerProposalCardProps) {
  const isPending = proposal.status === 'PENDING';
  const isAccepted = proposal.status === 'ACCEPTED';
  const isViewed = proposal.isViewed;

  const handleWithdraw = () => {
    if (onWithdraw && isPending) {
      onWithdraw(proposal.id);
    }
  };

  return (
    <Card className={`p-4 transition-shadow hover:shadow-md ${className}`}>
      {/* Header: Job Title & Status */}
      <div className="mb-4 flex items-start justify-between">
        <div className="mr-4 min-w-0 flex-1">
          <Link href={`/marketplace/jobs/${proposal.job.id}`} className="group">
            <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
              {proposal.job.title}
            </h3>
          </Link>

          {/* Employer Info */}
          <div className="mt-2 flex items-center">
            <Avatar
              src={proposal.job.employer.avatar}
              alt={`${proposal.job.employer.firstName} ${proposal.job.employer.lastName}`}
              className="mr-2 h-6 w-6"
            >
              <AvatarFallback className="text-xs">
                {proposal.job.employer.firstName?.charAt(0) || 'E'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">
              {proposal.job.employer.firstName} {proposal.job.employer.lastName}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={proposal.status} type="PROPOSAL" />
          {isPending && !isViewed && (
            <span className="flex items-center text-xs text-amber-600">
              <AlertCircle className="mr-1 h-3 w-3" />
              Görülmedi
            </span>
          )}
          {isPending && isViewed && (
            <span className="text-xs text-green-600">✓ Görüldü</span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {/* Bid Amount */}
        <div className="rounded-lg bg-green-50 p-3">
          <div className="mb-1 flex items-center text-xs text-green-700">
            <DollarSign className="mr-1 h-3 w-3" />
            Teklifiniz
          </div>
          <div className="text-base font-bold text-green-900">
            ₺{proposal.bidAmount.toLocaleString('tr-TR')}
          </div>
        </div>

        {/* Delivery Time */}
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="mb-1 flex items-center text-xs text-blue-700">
            <Clock className="mr-1 h-3 w-3" />
            Süre
          </div>
          <div className="text-base font-bold text-blue-900">
            {proposal.deliveryTime} gün
          </div>
        </div>

        {/* Submitted */}
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="mb-1 flex items-center text-xs text-gray-700">
            <Calendar className="mr-1 h-3 w-3" />
            Gönderildi
          </div>
          <div className="text-xs font-semibold text-gray-900">
            {formatDistanceToNow(new Date(proposal.submittedAt), {
              addSuffix: true,
              locale: tr,
            })}
          </div>
        </div>
      </div>

      {/* Cover Letter Preview */}
      <div className="mb-4">
        <p className="line-clamp-2 text-sm text-gray-700">
          {proposal.coverLetter}
        </p>
      </div>

      {/* Response Info */}
      {proposal.respondedAt && (
        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <div className="flex items-center text-xs text-gray-600">
            <Calendar className="mr-1 h-3 w-3" />
            Yanıtlandı:{' '}
            {formatDistanceToNow(new Date(proposal.respondedAt), {
              addSuffix: true,
              locale: tr,
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <Link href={`/marketplace/jobs/${proposal.job.id}`}>
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            İlanı Görüntüle
          </Button>
        </Link>

        {isPending && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWithdraw}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Ban className="mr-2 h-4 w-4" />
            Geri Çek
          </Button>
        )}

        {isAccepted && (
          <Link href={`/dashboard/freelancer/jobs/${proposal.job.id}`}>
            <Button size="sm">İşe Git</Button>
          </Link>
        )}
      </div>

      {/* Job Budget (if available) */}
      {proposal.job.budget && (
        <div className="mt-3 border-t pt-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>İş Bütçesi:</span>
            <span className="font-medium">
              ₺{proposal.job.budget.min?.toLocaleString('tr-TR')}
              {proposal.job.budget.max &&
                proposal.job.budget.max !== proposal.job.budget.min &&
                ` - ₺${proposal.job.budget.max?.toLocaleString('tr-TR')}`}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
