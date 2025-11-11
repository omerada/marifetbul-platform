/**
 * ================================================
 * PROPOSAL DETAIL PAGE
 * ================================================
 * Comprehensive proposal detail view for both freelancers and employers
 *
 * Features:
 * - Complete proposal information display
 * - Job details and context
 * - Freelancer profile (for employers)
 * - Status timeline and history
 * - Actions based on user role and proposal status
 * - Messages and attachments
 * - Milestones breakdown
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Freelancer Dashboard
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  DollarSign,
  Clock,
  User,
  Star,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Calendar,
  MessageCircle,
  Download,
  ExternalLink,
} from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { useProposals } from '@/hooks/business/proposals';
import { authSelectors } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { getProposalById } from '@/lib/api/proposals';
import type { ProposalResponse } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;
  const user = authSelectors.useUser();

  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    withdrawProposal,
    deleteProposal,
    acceptProposal,
    rejectProposal,
    shortlistProposal,
    isWithdrawing,
    isDeleting,
    isAccepting,
    isRejecting,
  } = useProposals();

  // Load proposal details
  useEffect(() => {
    const loadProposal = async () => {
      try {
        setIsLoading(true);
        setError(null);
        logger.info('[ProposalDetailPage] Loading proposal', { proposalId });

        const data = await getProposalById(proposalId);

        // Type assertion - API returns validated proposal
        setProposal(data as unknown as ProposalResponse);

        logger.info('[ProposalDetailPage] Proposal loaded successfully');
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Teklif yüklenemedi';
        setError(errorMsg);
        logger.error(
          '[ProposalDetailPage] Failed to load proposal',
          err as Error
        );
        toast.error('Teklif yüklenemedi', { description: errorMsg });
      } finally {
        setIsLoading(false);
      }
    };

    if (proposalId) {
      loadProposal();
    }
  }, [proposalId]);

  // Determine user role
  const isFreelancer = user?.id === proposal?.freelancerId;
  const canEdit = isFreelancer && proposal?.status === 'PENDING';
  const canWithdraw =
    isFreelancer && ['PENDING', 'SHORTLISTED'].includes(proposal?.status || '');
  const canDelete = isFreelancer && proposal?.status === 'WITHDRAWN';
  const canManage =
    !isFreelancer &&
    ['PENDING', 'SHORTLISTED'].includes(proposal?.status || '');

  // Action Handlers
  const handleEdit = () => {
    router.push(`/dashboard/proposals/${proposalId}/edit`);
  };

  const handleWithdraw = async () => {
    if (!confirm('Bu teklifi geri çekmek istediğinizden emin misiniz?')) return;

    const success = await withdrawProposal(proposalId);
    if (success) {
      // Reload proposal to show updated status
      window.location.reload();
    }
  };

  const handleDelete = async () => {
    if (
      !confirm('Bu teklifi kalıcı olarak silmek istediğinizden emin misiniz?')
    )
      return;

    const success = await deleteProposal(proposalId);
    if (success) {
      router.push('/dashboard/my-proposals');
    }
  };

  const handleAccept = async () => {
    if (!confirm('Bu teklifi kabul etmek istediğinizden emin misiniz?')) return;

    const result = await acceptProposal(proposalId);
    if (result) {
      window.location.reload();
    }
  };

  const handleReject = async () => {
    const reason = prompt('Reddetme sebebini belirtin (opsiyonel):');

    const result = await rejectProposal(proposalId, {
      reason: reason || undefined,
    });

    if (result) {
      window.location.reload();
    }
  };

  const handleShortlist = async () => {
    const result = await shortlistProposal(proposalId);
    if (result) {
      window.location.reload();
    }
  };

  const handleViewJob = () => {
    if (proposal?.jobId) {
      router.push(`/marketplace/jobs/${proposal.jobId}`);
    }
  };

  const handleContactFreelancer = () => {
    // Navigate to messages with freelancer
    if (proposal?.freelancerId) {
      router.push(`/messages?userId=${proposal.freelancerId}`);
    }
  };

  // Status Badge Color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SHORTLISTED':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-sm text-gray-600">Teklif yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !proposal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            {error || 'Teklif bulunamadı'}
          </h2>
          <p className="mb-4 text-gray-600">
            Teklif yüklenirken bir hata oluştu veya teklif bulunamadı.
          </p>
          <Button onClick={() => router.push('/dashboard/my-proposals')}>
            Tekliflerime Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>

        {/* Header with Status and Actions */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Teklif Detayları
            </h1>
            <Badge className={getStatusColor(proposal.status)}>
              {getStatusLabel(proposal.status)}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Freelancer Actions */}
            {isFreelancer && (
              <>
                {canEdit && (
                  <Button onClick={handleEdit} variant="primary">
                    <Edit className="mr-2 h-4 w-4" />
                    Düzenle
                  </Button>
                )}
                {canWithdraw && (
                  <Button
                    onClick={handleWithdraw}
                    variant="outline"
                    disabled={isWithdrawing}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Geri Çek
                  </Button>
                )}
                {canDelete && (
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </Button>
                )}
              </>
            )}

            {/* Employer Actions */}
            {canManage && (
              <>
                <Button
                  onClick={handleAccept}
                  variant="primary"
                  disabled={isAccepting}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Kabul Et
                </Button>
                {proposal.status === 'PENDING' && (
                  <Button onClick={handleShortlist} variant="secondary">
                    <Star className="mr-2 h-4 w-4" />
                    Ön Seçime Al
                  </Button>
                )}
                <Button
                  onClick={handleReject}
                  variant="outline"
                  disabled={isRejecting}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reddet
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content - Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Job Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>İş Bilgileri</span>
                  <Button variant="ghost" size="sm" onClick={handleViewJob}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    İlanı Görüntüle
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {proposal.jobTitle}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {formatDistanceToNow(new Date(proposal.createdAt), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Proposal Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Teklif Detayları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Budget and Timeline */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="mb-1 flex items-center text-gray-600">
                      <DollarSign className="mr-2 h-5 w-5" />
                      <span className="text-sm">Teklif Tutarı</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {proposal.proposedBudget.toLocaleString('tr-TR')} TL
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="mb-1 flex items-center text-gray-600">
                      <Clock className="mr-2 h-5 w-5" />
                      <span className="text-sm">Teslimat Süresi</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {proposal.deliveryDays} gün
                    </p>
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">
                    Kapak Mektubu
                  </h4>
                  <div className="rounded-lg bg-gray-50 p-4 whitespace-pre-wrap text-gray-700">
                    {proposal.coverLetter}
                  </div>
                </div>

                {/* Milestones */}
                {proposal.milestones && proposal.milestones.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-semibold text-gray-900">
                      Kilometre Taşları
                    </h4>
                    <div className="space-y-3">
                      {proposal.milestones.map((milestone, index) => (
                        <div key={index} className="rounded-lg border p-4">
                          <div className="mb-2 flex items-start justify-between">
                            <h5 className="font-medium text-gray-900">
                              {milestone.title}
                            </h5>
                            <span className="text-sm font-semibold text-green-600">
                              {milestone.amount.toLocaleString('tr-TR')} TL
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {milestone.description}
                          </p>
                          <p className="mt-2 text-xs text-gray-500">
                            Teslim: {milestone.dueDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {proposal.attachments && proposal.attachments.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-semibold text-gray-900">Ekler</h4>
                    <div className="space-y-2">
                      {proposal.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center">
                            <FileText className="mr-3 h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {attachment}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Freelancer Profile Card (for employers) */}
            {!isFreelancer && (
              <Card>
                <CardHeader>
                  <CardTitle>Freelancer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center gap-3">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>
                        {proposal.freelancerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {proposal.freelancerName}
                      </h4>
                      {proposal.freelancerRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {proposal.freelancerRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {proposal.freelancerSkills &&
                    proposal.freelancerSkills.length > 0 && (
                      <div className="mb-4">
                        <h5 className="mb-2 text-sm font-semibold text-gray-700">
                          Beceriler
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {proposal.freelancerSkills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  <Button
                    onClick={handleContactFreelancer}
                    variant="outline"
                    className="w-full"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Mesaj Gönder
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Timeline Card */}
            <Card>
              <CardHeader>
                <CardTitle>Zaman Çizelgesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Teklif Gönderildi
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(proposal.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </p>
                    </div>
                  </div>

                  {proposal.viewedAt && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Görüntülendi
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDistanceToNow(new Date(proposal.viewedAt), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {proposal.respondedAt && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Yanıtlandı</p>
                        <p className="text-sm text-gray-600">
                          {formatDistanceToNow(new Date(proposal.respondedAt), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>İstatistikler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Durum:</span>
                  <span className="font-medium text-gray-900">
                    {getStatusLabel(proposal.status)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Görüntülenme:</span>
                  <span className="font-medium text-gray-900">
                    {proposal.isViewed ? 'Evet' : 'Hayır'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Oluşturulma:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(proposal.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Son Güncelleme:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(proposal.updatedAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
