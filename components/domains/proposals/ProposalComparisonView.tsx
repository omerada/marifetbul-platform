'use client';

import React, { memo } from 'react';
import {
  X,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  Star,
} from 'lucide-react';
import type { ProposalResponse as Proposal } from '@/types/backend-aligned';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';

type ProposalWithViewStatus = Proposal & { isViewed?: boolean };

interface ProposalComparisonViewProps {
  proposals: ProposalWithViewStatus[];
  onClose: () => void;
  onSelect: (proposalId: string) => void;
  className?: string;
}

export const ProposalComparisonView = memo<ProposalComparisonViewProps>(
  function ProposalComparisonView({
    proposals,
    onClose,
    onSelect,
    className = '',
  }) {
    if (proposals.length === 0) {
      return null;
    }

    // Find min/max values for highlighting
    const budgets = proposals.map((p) => p.proposedBudget);
    const minBudget = Math.min(...budgets);
    const maxBudget = Math.max(...budgets);

    const ratings = proposals.map((p) => p.freelancerRating || 0);
    const maxRating = Math.max(...ratings);

    const getComparisonIndicator = (
      value: number,
      min: number,
      max: number,
      lowerIsBetter = true
    ) => {
      if (value === min && lowerIsBetter) {
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      }
      if (value === max && !lowerIsBetter) {
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      }
      return <Minus className="h-4 w-4 text-gray-400" />;
    };

    const formatBudget = (amount?: number) => {
      if (!amount) return 'N/A';
      return `₺${amount.toLocaleString('tr-TR')}`;
    };

    return (
      <div
        className={`bg-opacity-50 fixed inset-0 z-50 overflow-y-auto bg-black ${className}`}
      >
        <div className="flex min-h-full items-start justify-center p-4 pt-16">
          <div className="relative w-full max-w-6xl rounded-lg bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Teklif Karşılaştırma
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {proposals.length} teklifi yan yana karşılaştırın
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 transition-colors hover:text-gray-600"
                aria-label="Kapat"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase">
                        Özellik
                      </th>
                      {proposals.map((proposal, index) => (
                        <th
                          key={proposal.id}
                          className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase"
                        >
                          Teklif {index + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {/* Freelancer Info */}
                    <tr className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                        Freelancer
                      </td>
                      {proposals.map((proposal) => (
                        <td
                          key={proposal.id}
                          className="px-6 py-4 whitespace-nowrap"
                        >
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
                              <div className="text-sm font-medium text-gray-900">
                                {proposal.freelancerName}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {proposal.freelancerId.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Rating */}
                    <tr className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                        Değerlendirme
                      </td>
                      {proposals.map((proposal) => (
                        <td
                          key={proposal.id}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
                              <span
                                className={`text-sm font-semibold ${
                                  proposal.freelancerRating === maxRating
                                    ? 'text-green-600'
                                    : 'text-gray-900'
                                }`}
                              >
                                {proposal.freelancerRating?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                            {getComparisonIndicator(
                              proposal.freelancerRating || 0,
                              0,
                              maxRating,
                              false
                            )}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            Değerlendirme
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Budget */}
                    <tr className="bg-green-50/30 hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                        Teklif Tutarı
                      </td>
                      {proposals.map((proposal) => (
                        <td
                          key={proposal.id}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-lg font-bold ${
                                proposal.proposedBudget === minBudget
                                  ? 'text-green-600'
                                  : 'text-gray-900'
                              }`}
                            >
                              {formatBudget(proposal.proposedBudget)}
                            </span>
                            {getComparisonIndicator(
                              proposal.proposedBudget,
                              minBudget,
                              maxBudget,
                              true
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Timeline */}
                    <tr className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                        Teslim Süresi
                      </td>
                      {proposals.map((proposal) => (
                        <td
                          key={proposal.id}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <span className="text-sm text-gray-900">
                            {proposal.proposedTimeline}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Completed Jobs */}
                    <tr className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                        Tamamlanan İş
                      </td>
                      {proposals.map((proposal) => (
                        <td
                          key={proposal.id}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <span className="text-sm text-gray-500">-</span>
                        </td>
                      ))}
                    </tr>

                    {/* Skills */}
                    <tr className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 text-sm font-medium text-gray-900">
                        Yetenekler
                      </td>
                      {proposals.map((proposal) => (
                        <td key={proposal.id} className="px-6 py-4">
                          <div className="flex max-w-xs flex-wrap gap-1">
                            {proposal.freelancerSkills &&
                            proposal.freelancerSkills.length > 0 ? (
                              <>
                                {proposal.freelancerSkills
                                  .slice(0, 4)
                                  .map((skill, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                {proposal.freelancerSkills.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{proposal.freelancerSkills.length - 4}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">
                                Yetenek belirtilmemiş
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Cover Letter Preview */}
                    <tr className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 text-sm font-medium text-gray-900">
                        Kapak Mektubu
                      </td>
                      {proposals.map((proposal) => (
                        <td key={proposal.id} className="px-6 py-4">
                          <p className="line-clamp-3 max-w-xs text-sm text-gray-700">
                            {proposal.coverLetter}
                          </p>
                        </td>
                      ))}
                    </tr>

                    {/* Milestones */}
                    <tr className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                        Kilometre Taşı
                      </td>
                      {proposals.map((proposal) => (
                        <td
                          key={proposal.id}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <span className="text-sm text-gray-900">
                            {proposal.milestones?.length || 0} adet
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Attachments */}
                    <tr className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                        Ekler
                      </td>
                      {proposals.map((proposal) => (
                        <td
                          key={proposal.id}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <span className="text-sm text-gray-900">
                            {proposal.attachments?.length || 0} dosya
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t bg-gray-50 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  <span>En iyi değerler yeşil ile işaretlenmiştir</span>
                </div>
                <div className="flex space-x-3">
                  {proposals.map((proposal, index) => (
                    <Button
                      key={proposal.id}
                      onClick={() => onSelect(proposal.id)}
                      variant="primary"
                      size="sm"
                    >
                      Teklif {index + 1}&apos;i Seç
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ProposalComparisonView.displayName = 'ProposalComparisonView';
