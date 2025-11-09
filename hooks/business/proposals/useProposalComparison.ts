/**
 * ================================================
 * USE PROPOSAL COMPARISON HOOK
 * ================================================
 * Manage proposal comparison state and actions
 *
 * Features:
 * - Multi-select proposals (2-3 max)
 * - Comparison validation
 * - Selection state management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created 2025-11-09 - Sprint: Dashboard Route Consolidation
 */

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseProposalComparisonReturn {
  selectedProposals: string[];
  isComparing: boolean;
  toggleSelect: (proposalId: string) => void;
  startComparison: () => boolean;
  clearSelection: () => void;
  canCompare: boolean;
}

export function useProposalComparison(): UseProposalComparisonReturn {
  const [selectedProposals, setSelectedProposals] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const toggleSelect = useCallback((proposalId: string) => {
    setSelectedProposals((prev) =>
      prev.includes(proposalId)
        ? prev.filter((id) => id !== proposalId)
        : [...prev, proposalId]
    );
  }, []);

  const startComparison = useCallback(() => {
    if (selectedProposals.length < 2) {
      toast.error('En az 2 teklif seçmelisiniz');
      return false;
    }
    if (selectedProposals.length > 3) {
      toast.error('En fazla 3 teklif karşılaştırabilirsiniz');
      return false;
    }
    setIsComparing(true);
    toast.info('Karşılaştırma özelliği yakında eklenecek');
    return true;
  }, [selectedProposals]);

  const clearSelection = useCallback(() => {
    setSelectedProposals([]);
    setIsComparing(false);
  }, []);

  const canCompare =
    selectedProposals.length >= 2 && selectedProposals.length <= 3;

  return {
    selectedProposals,
    isComparing,
    toggleSelect,
    startComparison,
    clearSelection,
    canCompare,
  };
}
