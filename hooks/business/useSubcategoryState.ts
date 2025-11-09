'use client';

/**
 * ================================================
 * SUBCATEGORY STATE HOOK
 * ================================================
 * Custom hook for managing subcategory page state
 * Reduces useState overuse with useReducer
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 2 - Story 2.4: State Management Refactor
 */

import { useReducer, useCallback, useEffect } from 'react';
import { logError } from '@/lib/shared/errors';

export interface Freelancer {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  hourlyRate: number;
  location: string;
  avatar: string;
  skills: string[];
  services: string[];
  description: string;
  available: boolean;
}

interface SubcategoryState {
  // Search & Filters
  searchTerm: string;
  selectedFilter: string;
  sortBy: string;
  selectedService: string | null;

  // Data
  freelancers: Freelancer[];
  loading: boolean;
  error: string | null;

  // Pagination
  page: number;
  totalPages: number;
}

type SubcategoryAction =
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SELECTED_FILTER'; payload: string }
  | { type: 'SET_SORT_BY'; payload: string }
  | { type: 'SET_SELECTED_SERVICE'; payload: string | null }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'FETCH_START' }
  | {
      type: 'FETCH_SUCCESS';
      payload: { freelancers: Freelancer[]; totalPages: number };
    }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'CLEAR_SERVICE_FILTER' }
  | { type: 'RESET_PAGINATION' };

const initialState: SubcategoryState = {
  searchTerm: '',
  selectedFilter: 'all',
  sortBy: 'rating',
  selectedService: null,
  freelancers: [],
  loading: true,
  error: null,
  page: 1,
  totalPages: 1,
};

function subcategoryReducer(
  state: SubcategoryState,
  action: SubcategoryAction
): SubcategoryState {
  switch (action.type) {
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload,
        page: 1, // Reset page when search changes
      };

    case 'SET_SELECTED_FILTER':
      return {
        ...state,
        selectedFilter: action.payload,
        page: 1, // Reset page when filter changes
      };

    case 'SET_SORT_BY':
      return {
        ...state,
        sortBy: action.payload,
        page: 1, // Reset page when sort changes
      };

    case 'SET_SELECTED_SERVICE':
      return {
        ...state,
        selectedService: action.payload,
        page: 1, // Reset page when service changes
      };

    case 'SET_PAGE':
      return {
        ...state,
        page: action.payload,
      };

    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        freelancers: action.payload.freelancers,
        totalPages: action.payload.totalPages,
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        freelancers: [],
      };

    case 'CLEAR_SERVICE_FILTER':
      return {
        ...state,
        selectedService: null,
        page: 1,
      };

    case 'RESET_PAGINATION':
      return {
        ...state,
        page: 1,
      };

    default:
      return state;
  }
}

interface UseSubcategoryStateOptions {
  categoryId: number;
  subcategoryId: number;
  initialService?: string | null;
}

export function useSubcategoryState(options: UseSubcategoryStateOptions) {
  const { categoryId, subcategoryId, initialService } = options;
  const [state, dispatch] = useReducer(subcategoryReducer, {
    ...initialState,
    selectedService: initialService || null,
  });

  // Actions
  const actions = {
    setSearchTerm: useCallback((term: string) => {
      dispatch({ type: 'SET_SEARCH_TERM', payload: term });
    }, []),

    setSelectedFilter: useCallback((filter: string) => {
      dispatch({ type: 'SET_SELECTED_FILTER', payload: filter });
    }, []),

    setSortBy: useCallback((sort: string) => {
      dispatch({ type: 'SET_SORT_BY', payload: sort });
    }, []),

    setSelectedService: useCallback((service: string | null) => {
      dispatch({ type: 'SET_SELECTED_SERVICE', payload: service });
    }, []),

    setPage: useCallback((page: number) => {
      dispatch({ type: 'SET_PAGE', payload: page });
    }, []),

    nextPage: useCallback(() => {
      dispatch({
        type: 'SET_PAGE',
        payload: Math.min(state.totalPages, state.page + 1),
      });
    }, [state.page, state.totalPages]),

    previousPage: useCallback(() => {
      dispatch({ type: 'SET_PAGE', payload: Math.max(1, state.page - 1) });
    }, [state.page]),

    clearServiceFilter: useCallback(() => {
      dispatch({ type: 'CLEAR_SERVICE_FILTER' });
    }, []),

    resetPagination: useCallback(() => {
      dispatch({ type: 'RESET_PAGINATION' });
    }, []),
  };

  // Fetch freelancers effect
  useEffect(() => {
    const fetchFreelancers = async () => {
      dispatch({ type: 'FETCH_START' });

      try {
        const params = new URLSearchParams({
          categoryId: categoryId.toString(),
          subcategoryId: subcategoryId.toString(),
          page: state.page.toString(),
          limit: '20',
          sortBy: state.sortBy,
        });

        if (state.searchTerm.trim()) {
          params.append('search', state.searchTerm);
        }

        if (state.selectedService) {
          params.append('service', state.selectedService);
        }

        if (state.selectedFilter === 'available') {
          params.append('available', 'true');
        } else if (state.selectedFilter === 'top-rated') {
          params.append('minRating', '4.8');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/marketplace/freelancers?${params}`,
          {
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Freelancer listesi yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            freelancers: data.data.items || [],
            totalPages: data.data.totalPages || 1,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Bir hata oluştu';

        logError(error, {
          action: 'fetchFreelancers',
          categoryId,
          subcategoryId,
          page: state.page,
        });

        dispatch({
          type: 'FETCH_ERROR',
          payload: errorMessage,
        });
      }
    };

    fetchFreelancers();
  }, [
    categoryId,
    subcategoryId,
    state.page,
    state.sortBy,
    state.searchTerm,
    state.selectedService,
    state.selectedFilter,
  ]);

  return {
    state,
    actions,
  };
}
