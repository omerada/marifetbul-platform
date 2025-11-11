'use client';

import React, { useState, memo } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  MapPin,
  User,
  Star,
  Calendar,
  Users,
  Heart,
  Flag,
  CheckCircle,
  FileText,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { useJobDetail } from '@/hooks';
import { formatJobBudget, getBudgetType } from '@/lib/utils';
import { PaymentMode } from '@/types/business/features/order';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { SocialShare } from '@/components/shared/social/SocialShare';
import { JobProposalButton } from './JobProposalButton';
import { ProposalCard } from './ProposalCard';
import { AcceptProposalModal } from './AcceptProposalModal';
import { Loading, SimpleErrorDisplay } from '@/components/ui';
import logger from '@/lib/infrastructure/monitoring/logger';

interface JobDetailProps {
  jobId: string;
  className?: string;
}

export const JobDetail = memo<JobDetailProps>(function JobDetail({
  jobId,
  className,
}) {
  const {
    currentJob,
    proposals,
    isLoading,
    error,
    isJobOwner,
    refreshJobDetail,
    updateProposalStatus,
  } = useJobDetail(jobId);

  const [isSaved, setIsSaved] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<{
    id: string;
    proposedBudget: number;
    freelancerName: string;
    freelancerId: string;
  } | null>(null);

  if (isLoading) {
    return <Loading variant="skeleton" text="İş detayları yükleniyor..." />;
  }

  if (error || !currentJob) {
    return (
      <SimpleErrorDisplay
        error={error || 'İş ilanı bulunamadı'}
        onRetry={refreshJobDetail}
      />
    );
  }

  const formatBudget = (budget: typeof currentJob.budget) => {
    return formatJobBudget(budget);
  };

  const getExperienceLevelText = (level?: string) => {
    if (!level) return 'Belirtilmemiş';
    switch (level) {
      case 'beginner':
        return 'Başlangıç';
      case 'intermediate':
        return 'Orta';
      case 'expert':
        return 'Uzman';
      default:
        return level;
    }
  };

  const getUrgencyColor = (urgency: typeof currentJob.urgency) => {
    if (!urgency) return 'outline';
    switch (urgency) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleProposalAction = async (
    proposalId: string,
    action: 'accepted' | 'rejected'
  ) => {
    if (action === 'rejected') {
      try {
        await updateProposalStatus(proposalId, action);
      } catch (error) {
        logger.error(
          'Proposal action error:',
          error
        );
      }
    }
    // For 'accepted', we'll use the modal
  };

  const handleAcceptClick = (proposal: any) => {
    setSelectedProposal({
      id: proposal.id,
      proposedBudget: proposal.proposedBudget,
      freelancerName: `${proposal.freelancer?.firstName || ''} ${proposal.freelancer?.lastName || ''}`,
      freelancerId: proposal.freelancer?.id || '',
    });
    setAcceptModalOpen(true);
  };

  const handleAcceptProposal = async (paymentMode: PaymentMode) => {
    if (!selectedProposal) return;

    try {
      // Call the API with payment mode
      const response = await fetch(
        `/api/v1/proposals/${selectedProposal.id}/accept`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentMode,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        logger.info('Proposal accepted successfully with payment mode:', paymentMode);
        // Refresh job detail to get updated proposals
        await refreshJobDetail();
      } else {
        throw new Error(data.error || 'Teklif kabul edilemedi');
      }
    } catch (error) {
      logger.error(
        'Failed to accept proposal:',
        error
      );
      throw error;
    }
  };

  return (
    <div
      className={`mx-auto max-w-6xl space-y-4 p-4 sm:space-y-8 sm:p-6 ${className}`}
    >
      {/* Header Section */}
      <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-2 sm:space-y-0">
              <h1 className="text-xl font-bold break-words text-gray-900 sm:text-2xl lg:text-3xl">
                {currentJob.title}
              </h1>
              {currentJob.urgency && (
                <Badge
                  variant={getUrgencyColor(currentJob.urgency)}
                  className="self-start"
                >
                  {currentJob.urgency === 'high' && 'Acil'}
                  {currentJob.urgency === 'medium' && 'Orta'}
                  {currentJob.urgency === 'low' && 'Normal'}
                </Badge>
              )}
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:gap-4 sm:text-sm">
              <span className="flex items-center">
                <Calendar className="mr-1 h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {formatDistanceToNow(new Date(currentJob.createdAt), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </span>
              </span>
              <span className="flex items-center">
                <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                {currentJob.location}
              </span>
              <span className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                {currentJob.proposalsCount} teklif
              </span>
              {currentJob.expiresAt && (
                <span className="flex items-center text-red-600">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {formatDistanceToNow(new Date(currentJob.expiresAt), {
                    locale: tr,
                  })}{' '}
                  kaldı
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="mb-4 flex flex-wrap gap-2">
              {(currentJob.tags || []).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-3 text-right sm:mt-0 sm:ml-4">
            <div className="mb-1 text-lg font-bold text-green-600 sm:text-xl lg:text-2xl">
              {formatBudget(currentJob.budget)}
            </div>
            <div className="mb-2 text-xs text-gray-600 sm:text-sm">
              {getBudgetType(currentJob.budget) === 'fixed'
                ? 'Sabit fiyat'
                : 'Saatlik'}
            </div>
            <div className="text-xs font-medium text-gray-700 sm:text-sm">
              {getExperienceLevelText(currentJob.experienceLevel)} seviye
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
          {!isJobOwner && (
            <JobProposalButton
              jobId={jobId}
              className="px-4 text-sm sm:px-8 sm:text-base"
            />
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsSaved(!isSaved)}
            className="px-4 text-sm sm:px-8 sm:text-base"
          >
            <Heart
              className={`mr-2 h-4 w-4 ${isSaved ? 'fill-current text-red-500' : ''}`}
            />
            {isSaved ? 'Favorilerde' : 'Favorilere Ekle'}
          </Button>

          <SocialShare
            data={{
              url: typeof window !== 'undefined' ? window.location.href : '',
              title: currentJob?.title || 'İş İlanı',
              description:
                currentJob?.description || "MarifetBul'da iş fırsatı",
              image: currentJob?.employer?.avatar || '/images/og-default.jpg',
            }}
          />

          <Button variant="outline" size="lg">
            <Flag className="mr-2 h-4 w-4" />
            Şikayet Et
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-3">
        {/* Left Column - Job Details */}
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {/* Description */}
          <Card className="p-4 sm:p-6">
            <CardHeader>
              <CardTitle>İş Açıklaması</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {currentJob.description}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Gereksinimler</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(currentJob.requirements || []).map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Gerekli Beceriler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentJob.skills && currentJob.skills.length > 0 ? (
                  currentJob.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500">Beceri belirtilmemiş</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {currentJob.attachments && currentJob.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ekler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentJob.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center rounded-lg border p-3"
                    >
                      <FileText className="mr-3 h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">{attachment.filename}</div>
                        <div className="text-sm text-gray-500">
                          {attachment.type}
                        </div>
                      </div>
                      <a href={attachment.url} download>
                        <Button variant="outline" size="sm">
                          İndir
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Proposals Section (for employer) */}
          {isJobOwner && proposals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gelen Teklifler ({proposals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      onAccept={() => handleAcceptClick(proposal)}
                      onReject={() =>
                        handleProposalAction(proposal.id, 'rejected')
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Employer Info & Similar Jobs */}
        <div className="space-y-6">
          {/* Employer Card */}
          <Card>
            <CardHeader>
              <CardTitle>İşveren Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center">
                <Avatar
                  src={currentJob.employer.avatar || '/avatars/default.jpg'}
                  alt={`${currentJob.employer.firstName} ${currentJob.employer.lastName}`}
                  className="mr-4 h-12 w-12"
                >
                  <AvatarFallback>
                    {currentJob.employer.firstName?.charAt(0) ||
                      currentJob.employer.lastName?.charAt(0) ||
                      'E'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {currentJob.employer.firstName}{' '}
                    {currentJob.employer.lastName}
                  </h3>
                  {currentJob.employer.companyName && (
                    <p className="text-sm text-gray-600">
                      {currentJob.employer.companyName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Değerlendirme:</span>
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 text-yellow-400" />
                    <span>{currentJob.employer.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Toplam İş:</span>
                  <span>{currentJob.employer.totalJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span>Konum:</span>
                  <span>{currentJob.employer.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Üyelik:</span>
                  <span>
                    {formatDistanceToNow(
                      new Date(currentJob.employer.createdAt || Date.now()),
                      {
                        locale: tr,
                      }
                    )}
                  </span>
                </div>
              </div>

              <Link href={`/profile/${currentJob.employer.id}`}>
                <Button className="w-full" variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Profili Görüntüle
                </Button>
              </Link>

              <Button className="mt-2 w-full" variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Mesaj Gönder
              </Button>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Proje Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Kategori:</span>
                  <span>{currentJob.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Alt Kategori:</span>
                  <span>{currentJob.subcategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Süre:</span>
                  <span>{currentJob.timeline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Çalışma Türü:</span>
                  <span>{currentJob.isRemote ? 'Uzaktan' : 'Yerinde'}</span>
                </div>
                {currentJob.deadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Son Tarih:</span>
                    <span>
                      {new Date(currentJob.deadline).toLocaleDateString(
                        'tr-TR'
                      )}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Similar Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Benzer İş İlanları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Benzer iş ilanları yükleniyor...
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accept Proposal Modal */}
      {selectedProposal && (
        <AcceptProposalModal
          isOpen={acceptModalOpen}
          onClose={() => {
            setAcceptModalOpen(false);
            setSelectedProposal(null);
          }}
          onAccept={handleAcceptProposal}
          proposal={selectedProposal}
          sellerHasIban={true} // TODO: Fetch from seller profile
        />
      )}
    </div>
  );
});

JobDetail.displayName = 'JobDetail';
