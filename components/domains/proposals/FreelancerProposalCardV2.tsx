/**
 * FreelancerProposalCard Component
 * Displays freelancer's own proposal with job details and status
 */

'use client';

import { Card } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import {
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Award,
  Paperclip,
} from 'lucide-react';
import type { ProposalResponse } from '@/types/backend-aligned';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface FreelancerProposalCardV2Props {
  proposal: ProposalResponse;
  onView?: (proposalId: string) => void;
  onEdit?: (proposalId: string) => void;
  onWithdraw?: (proposalId: string) => void;
  onViewJob?: (jobId: string) => void;
}

export function FreelancerProposalCardV2({
  proposal,
  onView,
  onEdit,
  onWithdraw,
  onViewJob,
}: FreelancerProposalCardV2Props) {
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

  const canEdit = proposal.status === 'PENDING';
  const canWithdraw =
    proposal.status === 'PENDING' || proposal.status === 'SHORTLISTED';
  const isViewed = proposal.isViewed;

  return (
    <Card className="p-6 transition-shadow hover:shadow-md">
      {/* Header - Job Info */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gray-400" />
            <h3
              className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600"
              onClick={() => onViewJob?.(proposal.jobId)}
            >
              {proposal.jobTitle}
            </h3>
          </div>

          {/* Status and View Badge */}
          <div className="mt-2 flex items-center gap-2">
            <Badge className={getStatusColor(proposal.status)}>
              {getStatusLabel(proposal.status)}
            </Badge>
            {isViewed && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-xs"
              >
                <Eye className="h-3 w-3" />
                Görüntülendi
              </Badge>
            )}
            {proposal.status === 'SHORTLISTED' && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-blue-50 text-xs text-blue-700"
              >
                <Award className="h-3 w-3" />
                Ön Seçimde
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-xs text-gray-500">Teklif Tutarı</div>
            <div className="font-semibold text-gray-900">
              {formatBudget(proposal.proposedBudget)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-xs text-gray-500">Teslimat</div>
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

        {proposal.viewedAt && (
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Görüntüleme</div>
              <div className="font-semibold text-gray-900">
                {formatDistanceToNow(new Date(proposal.viewedAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cover Letter Preview */}
      <div className="mb-4">
        <div className="line-clamp-2 text-sm text-gray-600">
          {proposal.coverLetter}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
        {proposal.milestones && proposal.milestones.length > 0 && (
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span>{proposal.milestones.length} kilometre taşı</span>
          </div>
        )}
        {proposal.attachments && proposal.attachments.length > 0 && (
          <div className="flex items-center gap-1">
            <Paperclip className="h-4 w-4" />
            <span>{proposal.attachments.length} dosya</span>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {proposal.status === 'REJECTED' && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <div>
              <div className="font-medium">Teklif Reddedildi</div>
              {proposal.respondedAt && (
                <div className="mt-1 text-xs text-red-600">
                  {formatDistanceToNow(new Date(proposal.respondedAt), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {proposal.status === 'ACCEPTED' && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <div>
              <div className="font-medium">Teklif Kabul Edildi! 🎉</div>
              <div className="mt-1 text-xs text-green-600">
                İşveren teklifinizi kabul etti. İş detayları için görüntüleyin.
              </div>
            </div>
          </div>
        </div>
      )}

      {proposal.status === 'SHORTLISTED' && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <Award className="mt-0.5 h-4 w-4" />
            <div>
              <div className="font-medium">Ön Seçildiniz!</div>
              <div className="mt-1 text-xs text-blue-600">
                İşveren teklifinizi beğendi ve ön seçime aldı.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
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

        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewJob?.(proposal.jobId)}
          className="flex items-center gap-1"
        >
          <Briefcase className="h-4 w-4" />
          İşi Görüntüle
        </Button>

        {canEdit && onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(proposal.id)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Düzenle
          </Button>
        )}

        {canWithdraw && onWithdraw && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWithdraw(proposal.id)}
            className="flex items-center gap-1 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Geri Çek
          </Button>
        )}
      </div>
    </Card>
  );
}
