/**
 * ProposalListItem Component
 * Simple proposal display for employer proposal management
 */

'use client';

import { Card, Badge, Button } from '@/components/ui';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import {
  Star,
  Clock,
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { ProposalResponse } from '@/types/backend-aligned';
import { formatCurrency } from '@/lib/shared/formatters';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Image from 'next/image';

interface ProposalListItemProps {
  proposal: ProposalResponse;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function ProposalListItem({
  proposal,
  onAccept,
  onReject,
  showActions = true,
  isLoading = false,
  className = '',
}: ProposalListItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
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

  return (
    <Card className={`p-6 transition-shadow hover:shadow-md ${className}`}>
      <div className="flex items-start justify-between">
        {/* Freelancer Info */}
        <div className="flex flex-1 items-start gap-4">
          <Avatar className="h-12 w-12">
            {proposal.freelancerAvatar && (
              <Image
                src={proposal.freelancerAvatar}
                alt={proposal.freelancerName}
                width={48}
                height={48}
              />
            )}
            <AvatarFallback>
              {proposal.freelancerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {proposal.freelancerName}
              </h3>
              {proposal.freelancerRating && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{proposal.freelancerRating.toFixed(1)}</span>
                </div>
              )}
              <Badge className={getStatusColor(proposal.status)}>
                {getStatusText(proposal.status)}
              </Badge>
            </div>

            {/* Skills */}
            {proposal.freelancerSkills &&
              proposal.freelancerSkills.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {proposal.freelancerSkills.slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}

            {/* Cover Letter */}
            <p className="mb-4 line-clamp-3 text-gray-700">
              {proposal.coverLetter}
            </p>

            {/* Proposal Details Grid */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Teklif</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(proposal.proposedBudget)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Süre</p>
                  <p className="font-semibold text-gray-900">
                    {proposal.deliveryDays} gün
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Gönderilme</p>
                  <p className="font-semibold text-gray-900">
                    {formatDistanceToNow(new Date(proposal.createdAt), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {proposal.attachments && proposal.attachments.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Ekler ({proposal.attachments.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {proposal.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
                    >
                      <FileText className="h-3 w-3" />
                      Ek {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && proposal.status === 'PENDING' && onAccept && onReject && (
        <div className="mt-4 flex gap-2 border-t pt-4">
          <Button onClick={onAccept} disabled={isLoading} className="flex-1">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Kabul Et
          </Button>
          <Button
            variant="outline"
            onClick={onReject}
            disabled={isLoading}
            className="flex-1"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reddet
          </Button>
        </div>
      )}
    </Card>
  );
}
