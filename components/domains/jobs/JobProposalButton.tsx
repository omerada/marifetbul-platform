'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useProposalEligibility } from '@/hooks/business/useProposalEligibility';
import logger from '@/lib/infrastructure/monitoring/logger';

interface JobProposalButtonProps {
  jobId: string;
  className?: string;
}

/**
 * Job Proposal Button Component
 *
 * Shows different states based on user eligibility:
 * - Can propose: "Submit Proposal" button
 * - Already proposed: "View Your Proposal" button
 * - Cannot propose: Disabled button with reason
 * - Loading: Loading spinner
 *
 * @param jobId - Job UUID
 * @param className - Additional CSS classes
 */
export function JobProposalButton({
  jobId,
  className = '',
}: JobProposalButtonProps) {
  const router = useRouter();
  const { eligibility, isLoading, error } = useProposalEligibility({
    jobId,
    enabled: true,
  });

  const handleClick = () => {
    if (!eligibility) return;

    if (eligibility.hasExistingProposal && eligibility.existingProposalId) {
      // Navigate to freelancer proposals page
      router.push(
        `/dashboard/freelancer/proposals?proposalId=${eligibility.existingProposalId}`
      );
      logger.debug(
        '[JobProposalButton] Navigating to existing proposal:',
        eligibility.existingProposalId
      );
    } else if (eligibility.canPropose) {
      // Navigate to proposal submission page
      router.push(`/marketplace/jobs/${jobId}/proposal`);
      logger.debug(
        '[JobProposalButton] Navigating to proposal submission page'
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Button disabled className={className} variant="primary">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Kontrol ediliyor...
      </Button>
    );
  }

  // Error state
  if (error) {
    return (
      <Button disabled className={className} variant="outline">
        <AlertCircle className="mr-2 h-4 w-4" />
        Hata
      </Button>
    );
  }

  // No eligibility data
  if (!eligibility) {
    return null;
  }

  // Already proposed - show "View Your Proposal" button
  if (eligibility.hasExistingProposal) {
    return (
      <Button onClick={handleClick} className={className} variant="outline">
        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
        Teklifinizi Görüntüle
      </Button>
    );
  }

  // Can propose - show "Submit Proposal" button
  if (eligibility.canPropose) {
    return (
      <Button onClick={handleClick} className={className} variant="primary">
        <Send className="mr-2 h-4 w-4" />
        Teklif Gönder
      </Button>
    );
  }

  // Cannot propose - show disabled button with reason
  return (
    <Button
      disabled
      className={className}
      variant="outline"
      title={eligibility.reason || 'Teklif gönderemezsiniz'}
    >
      <AlertCircle className="mr-2 h-4 w-4" />
      {eligibility.reason || 'Teklif Gönderilemez'}
    </Button>
  );
}
