'use client';

/**
 * ================================================
 * REVIEW DASHBOARD STATE HOOK
 * ================================================
 * Custom hook for managing review dashboard state
 * Optimizes local state management for review filtering and pagination
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 2.4.3b: Dashboard Reviews Refactor
 */

import { useReducer } from 'react';
import type { Review } from '@/types/business/review';

// ================================================
// TYPES
// ================================================

export interface ReviewDashboardStateData {
  currentPage: number;
  sortBy: string;
  sortDirection: 'ASC' | 'DESC';
  minRating: number | undefined;
  verifiedOnly: boolean;
  showResponseDialog: boolean;
  selectedReview: Review | null;
}

export type ReviewDashboardAction =
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_SORT_BY'; payload: string }
  | { type: 'SET_SORT_DIRECTION'; payload: 'ASC' | 'DESC' }
  | { type: 'SET_MIN_RATING'; payload: number | undefined }
  | { type: 'SET_VERIFIED_ONLY'; payload: boolean }
  | { type: 'SET_SHOW_RESPONSE_DIALOG'; payload: boolean }
  | { type: 'SET_SELECTED_REVIEW'; payload: Review | null }
  | { type: 'OPEN_RESPONSE_DIALOG'; payload: Review }
  | { type: 'CLOSE_RESPONSE_DIALOG' }
  | { type: 'RESET_FILTERS' };

export interface ReviewDashboardStateActions {
  setCurrentPage: (page: number) => void;
  setSortBy: (sort: string) => void;
  setSortDirection: (direction: 'ASC' | 'DESC') => void;
  setMinRating: (rating: number | undefined) => void;
  setVerifiedOnly: (verified: boolean) => void;
  openResponseDialog: (review: Review) => void;
  closeResponseDialog: () => void;
  resetFilters: () => void;
}

// ================================================
// REDUCER
// ================================================

const initialState: ReviewDashboardStateData = {
  currentPage: 1,
  sortBy: 'CREATED_AT',
  sortDirection: 'DESC',
  minRating: undefined,
  verifiedOnly: false,
  showResponseDialog: false,
  selectedReview: null,
};

function reviewDashboardReducer(
  state: ReviewDashboardStateData,
  action: ReviewDashboardAction
): ReviewDashboardStateData {
  switch (action.type) {
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };

    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload, currentPage: 1 };

    case 'SET_SORT_DIRECTION':
      return { ...state, sortDirection: action.payload, currentPage: 1 };

    case 'SET_MIN_RATING':
      return { ...state, minRating: action.payload, currentPage: 1 };

    case 'SET_VERIFIED_ONLY':
      return { ...state, verifiedOnly: action.payload, currentPage: 1 };

    case 'SET_SHOW_RESPONSE_DIALOG':
      return { ...state, showResponseDialog: action.payload };

    case 'SET_SELECTED_REVIEW':
      return { ...state, selectedReview: action.payload };

    case 'OPEN_RESPONSE_DIALOG':
      return {
        ...state,
        selectedReview: action.payload,
        showResponseDialog: true,
      };

    case 'CLOSE_RESPONSE_DIALOG':
      return {
        ...state,
        showResponseDialog: false,
        selectedReview: null,
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        currentPage: 1,
        sortBy: 'CREATED_AT',
        sortDirection: 'DESC',
        minRating: undefined,
        verifiedOnly: false,
      };

    default:
      return state;
  }
}

// ================================================
// HOOK
// ================================================

export function useReviewDashboardState(): {
  state: ReviewDashboardStateData;
  actions: ReviewDashboardStateActions;
} {
  const [state, dispatch] = useReducer(reviewDashboardReducer, initialState);

  const actions: ReviewDashboardStateActions = {
    setCurrentPage: (page: number) => {
      dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
    },

    setSortBy: (sort: string) => {
      dispatch({ type: 'SET_SORT_BY', payload: sort });
    },

    setSortDirection: (direction: 'ASC' | 'DESC') => {
      dispatch({ type: 'SET_SORT_DIRECTION', payload: direction });
    },

    setMinRating: (rating: number | undefined) => {
      dispatch({ type: 'SET_MIN_RATING', payload: rating });
    },

    setVerifiedOnly: (verified: boolean) => {
      dispatch({ type: 'SET_VERIFIED_ONLY', payload: verified });
    },

    openResponseDialog: (review: Review) => {
      dispatch({ type: 'OPEN_RESPONSE_DIALOG', payload: review });
    },

    closeResponseDialog: () => {
      dispatch({ type: 'CLOSE_RESPONSE_DIALOG' });
    },

    resetFilters: () => {
      dispatch({ type: 'RESET_FILTERS' });
    },
  };

  return { state, actions };
}
