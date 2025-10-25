'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import {
  Star,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import type { Proposal } from '@/types/core/jobs';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { MessageButton } from '@/components/domains/messaging';

interface FreelancerPreviewCardProps {
  freelancer: Proposal['freelancer'];
  freelancerId: string;
  proposal?: Proposal; // Optional for MessageButton context
  jobTitle?: string;
  className?: string;
  variant?: 'compact' | 'detailed';
}

export const FreelancerPreviewCard = memo<FreelancerPreviewCardProps>(
  function FreelancerPreviewCard({
    freelancer,
    freelancerId,
    proposal,
    jobTitle,
    className = '',
    variant = 'detailed',
  }) {
    const formatRate = (rate?: number) => {
      if (!rate) return 'Belirtilmemiş';
      return `₺${rate.toLocaleString('tr-TR')}/saat`;
    };

    const calculateSuccessRate = () => {
      // This would ideally come from backend
      // For now, we calculate based on rating
      if (!freelancer.rating) return 0;
      return Math.round((freelancer.rating / 5) * 100);
    };

    const fullName =
      `${freelancer.firstName || ''} ${freelancer.lastName || ''}`.trim() ||
      'İsimsiz Freelancer';
    const initials = `${freelancer.firstName?.charAt(0) || '?'}${freelancer.lastName?.charAt(0) || ''}`;

    if (variant === 'compact') {
      return (
        <div className={`flex items-center space-x-3 ${className}`}>
          <Avatar src={freelancer.avatar} alt={fullName} className="h-10 w-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-semibold text-gray-900">{fullName}</h4>
            <div className="flex items-center text-sm text-gray-600">
              <Star className="mr-1 h-3 w-3 fill-current text-yellow-400" />
              <span className="font-medium">
                {freelancer.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="mx-1">•</span>
              <span>{freelancer.reviewCount || 0} değerlendirme</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`rounded-lg border bg-gradient-to-br from-white to-gray-50 p-6 ${className}`}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar
              src={freelancer.avatar}
              alt={fullName}
              className="h-16 w-16 ring-2 ring-blue-100"
            >
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{fullName}</h3>
              <div className="mt-1 flex items-center text-sm text-gray-600">
                <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
                <span className="font-semibold text-gray-900">
                  {freelancer.rating?.toFixed(1) || '0.0'}
                </span>
                <span className="mx-1.5">•</span>
                <span>{freelancer.reviewCount || 0} değerlendirme</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-white">
            Freelancer
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-blue-50 p-3 text-center">
            <div className="mb-1 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mb-0.5 text-xs text-gray-600">Tamamlanan İş</div>
            <div className="text-lg font-bold text-blue-600">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(freelancer as any).completedProjects || 0}
            </div>
          </div>
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <div className="mb-1 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div className="mb-0.5 text-xs text-gray-600">Başarı Oranı</div>
            <div className="text-lg font-bold text-green-600">
              {calculateSuccessRate()}%
            </div>
          </div>
          <div className="rounded-lg bg-purple-50 p-3 text-center">
            <div className="mb-1 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mb-0.5 text-xs text-gray-600">Saatlik Ücret</div>
            <div className="truncate text-sm font-bold text-purple-600">
              {freelancer.hourlyRate ? `₺${freelancer.hourlyRate}` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Skills */}
        {freelancer.skills && freelancer.skills.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-semibold text-gray-900">
              Yetenekler
            </h4>
            <div className="flex flex-wrap gap-2">
              {freelancer.skills.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {freelancer.skills.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{freelancer.skills.length - 6} daha
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Hourly Rate (if available) */}
        {freelancer.hourlyRate && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="mb-1 text-xs font-medium text-amber-800">
              Saatlik Ücret
            </div>
            <div className="text-lg font-bold text-amber-900">
              {formatRate(freelancer.hourlyRate)}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 border-t pt-4">
          <Link
            href={`/profile/${freelancerId}`}
            className="flex-1"
            target="_blank"
          >
            <Button variant="outline" className="w-full" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Profili Görüntüle
            </Button>
          </Link>
          {proposal && (
            <MessageButton
              recipientId={freelancerId}
              recipientName={fullName}
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
              variant="primary"
              size="sm"
              className="flex-1"
            >
              Mesaj Gönder
            </MessageButton>
          )}
        </div>
      </div>
    );
  }
);

FreelancerPreviewCard.displayName = 'FreelancerPreviewCard';
