'use client';

import React, { memo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  Download,
  Eye,
  AlertCircle,
} from 'lucide-react';
import type { Proposal } from '@/types/core/jobs';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { FreelancerPreviewCard } from './FreelancerPreviewCard';

// Helper to get Turkish labels for proposal statuses
function getProposalStatusLabel(status: string): string {
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
      return 'Bilinmiyor';
  }
}

type ProposalWithViewStatus = Proposal & { isViewed?: boolean };

interface ProposalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalWithViewStatus;
  jobTitle?: string;
  onAccept?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}

export const ProposalDetailModal = memo<ProposalDetailModalProps>(
  function ProposalDetailModal({
    isOpen,
    onClose,
    proposal,
    jobTitle,
    onAccept,
    onReject,
    isLoading = false,
  }) {
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);

    const formatBudget = (amount?: number) => {
      if (!amount) return 'Belirtilmemiş';
      return `₺${amount.toLocaleString('tr-TR')}`;
    };

    const formatDate = (date: string) => {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: tr,
      });
    };

    const handleAccept = () => {
      if (onAccept) {
        onAccept();
        setShowAcceptConfirm(false);
        onClose();
      }
    };

    const handleReject = () => {
      if (onReject) {
        onReject();
        setShowRejectConfirm(false);
        onClose();
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="bg-opacity-50 fixed inset-0 bg-black transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
            {/* Header */}
            <div className="border-b bg-gray-50 px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="mb-2 text-xl font-bold text-gray-900">
                    Teklif Detayları
                  </h2>
                  {jobTitle && (
                    <p className="truncate text-sm text-gray-600">
                      İş İlanı: <span className="font-medium">{jobTitle}</span>
                    </p>
                  )}
                </div>
                <div className="ml-4 flex items-center space-x-3">
                  <Badge
                    variant={
                      proposal.status === 'accepted'
                        ? 'success'
                        : proposal.status === 'rejected'
                          ? 'destructive'
                          : proposal.status === 'pending'
                            ? 'warning'
                            : 'secondary'
                    }
                  >
                    {getProposalStatusLabel(
                      proposal.status.toUpperCase() as
                        | 'PENDING'
                        | 'ACCEPTED'
                        | 'REJECTED'
                        | 'WITHDRAWN'
                    )}
                  </Badge>
                  <button
                    onClick={onClose}
                    className="text-gray-400 transition-colors hover:text-gray-600"
                    aria-label="Kapat"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {/* Freelancer Info */}
              <section>
                <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                  Freelancer Bilgileri
                </h3>
                <FreelancerPreviewCard
                  freelancer={proposal.freelancer}
                  freelancerId={proposal.freelancerId}
                  proposal={proposal}
                  jobTitle={jobTitle}
                  variant="detailed"
                />
              </section>

              {/* Proposal Summary */}
              <section>
                <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                  Teklif Özeti
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border bg-gradient-to-br from-green-50 to-green-100 p-4">
                    <div className="mb-2 flex items-center">
                      <div className="mr-3 rounded-full bg-green-600 p-2">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-sm text-green-800">
                        Teklif Tutarı
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {formatBudget(proposal.proposedBudget)}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                    <div className="mb-2 flex items-center">
                      <div className="mr-3 rounded-full bg-blue-600 p-2">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-sm text-blue-800">Teslim Süresi</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {proposal.proposedTimeline}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                    <div className="mb-2 flex items-center">
                      <div className="mr-3 rounded-full bg-purple-600 p-2">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-sm text-purple-800">Gönderilme</div>
                    </div>
                    <div className="text-lg font-bold text-purple-900">
                      {formatDate(proposal.createdAt)}
                    </div>
                  </div>
                </div>
              </section>

              {/* Cover Letter */}
              <section>
                <h3 className="mb-3 flex items-center text-sm font-semibold tracking-wide text-gray-900 uppercase">
                  <FileText className="mr-2 h-4 w-4" />
                  Kapak Mektubu
                </h3>
                <div className="rounded-lg border bg-white p-6">
                  <p className="leading-relaxed whitespace-pre-wrap text-gray-800">
                    {proposal.coverLetter}
                  </p>
                </div>
              </section>

              {/* Milestones */}
              {proposal.milestones && proposal.milestones.length > 0 && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                    Kilometre Taşları
                  </h3>
                  <div className="space-y-3">
                    {proposal.milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900">
                            {index + 1}. {milestone.title}
                          </h4>
                          <Badge variant="secondary">
                            {formatBudget(milestone.amount)}
                          </Badge>
                        </div>
                        <p className="mb-2 text-sm text-gray-600">
                          {milestone.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="mr-1 h-3 w-3" />
                          Teslim:{' '}
                          {new Date(milestone.dueDate).toLocaleDateString(
                            'tr-TR'
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Questions & Answers */}
              {proposal.questions && proposal.questions.length > 0 && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                    Sorular & Cevaplar
                  </h3>
                  <div className="space-y-4">
                    {proposal.questions.map((qa, index) => (
                      <div
                        key={index}
                        className="rounded-lg border bg-white p-4"
                      >
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-blue-600 uppercase">
                            Soru {index + 1}
                          </span>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {qa.question}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-green-600 uppercase">
                            Cevap
                          </span>
                          <p className="mt-1 text-sm text-gray-700">
                            {qa.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Attachments */}
              {proposal.attachments && proposal.attachments.length > 0 && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                    Ekler ({proposal.attachments.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {proposal.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-lg border bg-white p-4 transition-all hover:border-blue-300 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="mr-3 rounded-lg bg-blue-100 p-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Ek {index + 1}
                            </div>
                            <div className="text-xs text-gray-500">
                              Dosyayı görüntüle
                            </div>
                          </div>
                        </div>
                        <Download className="h-4 w-4 text-gray-400 transition-colors group-hover:text-blue-600" />
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Activity Timeline */}
              <section>
                <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase">
                  Aktivite Zaman Çizelgesi
                </h3>
                <div className="space-y-3">
                  {/* Created */}
                  <div className="flex items-start">
                    <div className="mr-3 rounded-full bg-blue-100 p-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Teklif gönderildi
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(proposal.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Updated (if different from created) */}
                  {proposal.updatedAt !== proposal.createdAt && (
                    <div className="flex items-start">
                      <div className="mr-3 rounded-full bg-yellow-100 p-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Teklif güncellendi
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(proposal.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status Changes */}
                  {proposal.status === 'accepted' && (
                    <div className="flex items-start">
                      <div className="mr-3 rounded-full bg-green-100 p-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Teklif kabul edildi
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(proposal.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {proposal.status === 'rejected' && (
                    <div className="flex items-start">
                      <div className="mr-3 rounded-full bg-red-100 p-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Teklif reddedildi
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(proposal.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {proposal.status === 'withdrawn' && (
                    <div className="flex items-start">
                      <div className="mr-3 rounded-full bg-gray-100 p-2">
                        <AlertCircle className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Teklif geri çekildi
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(proposal.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Viewed Status */}
                  {proposal.isViewed !== undefined && (
                    <div className="flex items-start">
                      <div
                        className={`mr-3 rounded-full p-2 ${
                          proposal.isViewed ? 'bg-green-100' : 'bg-yellow-100'
                        }`}
                      >
                        <Eye
                          className={`h-4 w-4 ${
                            proposal.isViewed
                              ? 'text-green-600'
                              : 'text-yellow-600'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {proposal.isViewed
                            ? 'Teklif görüldü'
                            : 'Henüz görülmedi'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Footer Actions */}
            {proposal.status === 'pending' && (
              <div className="border-t bg-gray-50 px-6 py-4">
                {!showAcceptConfirm && !showRejectConfirm && (
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectConfirm(true)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reddet
                    </Button>
                    <Button
                      onClick={() => setShowAcceptConfirm(true)}
                      disabled={isLoading}
                      variant="primary"
                      className="flex-1"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Kabul Et
                    </Button>
                  </div>
                )}

                {showRejectConfirm && (
                  <div className="space-y-3">
                    <div className="flex items-start rounded-lg border border-red-200 bg-red-50 p-3">
                      <AlertCircle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-900">
                          Teklifi reddetmek istediğinize emin misiniz?
                        </p>
                        <p className="mt-1 text-xs text-red-700">
                          Bu işlem geri alınamaz.
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowRejectConfirm(false)}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        İptal
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Evet, Reddet
                      </Button>
                    </div>
                  </div>
                )}

                {showAcceptConfirm && (
                  <div className="space-y-3">
                    <div className="flex items-start rounded-lg border border-green-200 bg-green-50 p-3">
                      <CheckCircle2 className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          Teklifi kabul etmek istediğinize emin misiniz?
                        </p>
                        <p className="mt-1 text-xs text-green-700">
                          Freelancer ile iş başlayacak ve diğer teklifler
                          reddedilecek.
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowAcceptConfirm(false)}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        İptal
                      </Button>
                      <Button
                        variant="success"
                        onClick={handleAccept}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Evet, Kabul Et
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ProposalDetailModal.displayName = 'ProposalDetailModal';
