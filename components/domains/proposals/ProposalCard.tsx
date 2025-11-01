/**
 * ProposalCard Component
 * Displays a proposal with freelancer details and actions
 */

'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar';
import {
  Star,
  Clock,
  DollarSign,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Paperclip,
  Award,
} from 'lucide-react';
import type { ProposalResponse } from '@/types/backend-aligned';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface ProposalCardProps {
  proposal: ProposalResponse;
  onView?: (proposalId: string) => void;
  onAccept?: (proposalId: string) => void;
  onReject?: (proposalId: string) => void;
  onShortlist?: (proposalId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function ProposalCard({
  proposal,
  onView,
  onAccept,
  onReject,
  onShortlist,
  showActions = true,
  compact = false,
}: ProposalCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'SHORTLISTED':
        return 'bg-blue-100 text-blue-700';
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Beklemede';
      case 'SHORTLISTED':
        return 'Ön Seçildi';
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

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const canAccept =
    proposal.status === 'PENDING' || proposal.status === 'SHORTLISTED';
  const canReject =
    proposal.status === 'PENDING' || proposal.status === 'SHORTLISTED';
  const canShortlist = proposal.status === 'PENDING';

  return (
    <Card
      className={`p-6 transition-shadow hover:shadow-md ${compact ? 'p-4' : ''}`}
    >
      {/* Header - Freelancer Info */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar
            src={proposal.freelancerAvatar}
            alt={proposal.freelancerName}
            size="lg"
          >
            {!proposal.freelancerAvatar && (
              <div className="flex h-full w-full items-center justify-center bg-blue-600 font-semibold text-white">
                {proposal.freelancerName.charAt(0).toUpperCase()}
              </div>
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {proposal.freelancerName}
              </h3>
              {!proposal.isViewed && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-xs text-blue-700"
                >
                  Yeni
                </Badge>
              )}
            </div>

            {/* Rating */}
            {proposal.freelancerRating && (
              <div className="mt-1 flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900">
                  {proposal.freelancerRating.toFixed(1)}
                </span>
                <span className="text-gray-500">/5.0</span>
              </div>
            )}

            {/* Skills */}
            {proposal.freelancerSkills &&
              proposal.freelancerSkills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {proposal.freelancerSkills.slice(0, 3).map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {proposal.freelancerSkills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{proposal.freelancerSkills.length - 3}
                    </Badge>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Status Badge */}
        <Badge className={getStatusColor(proposal.status)}>
          {getStatusLabel(proposal.status)}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-xs text-gray-500">Teklif</div>
            <div className="font-semibold text-gray-900">
              {formatBudget(proposal.proposedBudget)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-xs text-gray-500">Süre</div>
            <div className="font-semibold text-gray-900">
              {proposal.deliveryDays} gün
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-xs text-gray-500">Gönderildi</div>
            <div className="font-semibold text-gray-900">
              {formatDistanceToNow(new Date(proposal.createdAt), {
                addSuffix: true,
                locale: tr,
              })}
            </div>
          </div>
        </div>

        {proposal.milestones && proposal.milestones.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Kilometre Taşları</div>
              <div className="font-semibold text-gray-900">
                {proposal.milestones.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cover Letter */}
      {!compact && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <FileText className="h-4 w-4" />
            Kapak Mektubu
          </div>
          <p className="line-clamp-3 text-sm text-gray-600">
            {proposal.coverLetter}
          </p>
        </div>
      )}

      {/* Attachments */}
      {proposal.attachments && proposal.attachments.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Paperclip className="h-4 w-4" />
            <span>{proposal.attachments.length} dosya eklendi</span>
          </div>
        </div>
      )}

      {/* Questions */}
      {proposal.questions && proposal.questions.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FileText className="h-4 w-4" />
            Cevaplanmış Sorular: {proposal.questions.length}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(proposal.id)}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            Detayları Gör
          </Button>

          {canShortlist && onShortlist && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShortlist(proposal.id)}
              className="flex items-center gap-1"
            >
              <Award className="h-4 w-4" />
              Ön Seçime Al
            </Button>
          )}

          {canAccept && onAccept && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAccept(proposal.id)}
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Kabul Et
            </Button>
          )}

          {canReject && onReject && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(proposal.id)}
              className="flex items-center gap-1 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4" />
              Reddet
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
