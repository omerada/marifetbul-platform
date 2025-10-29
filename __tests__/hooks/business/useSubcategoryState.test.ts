/**
 * ================================================
 * SUBCATEGORY STATE HOOK TESTS
 * ================================================
 * Tests for useSubcategoryState custom hook
 *
 * @module __tests__/hooks/business/useSubcategoryState.test
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSubcategoryState } from '../../../hooks/business/useSubcategoryState';

// Mock fetch
global.fetch = jest.fn();

describe('useSubcategoryState', () => {
  const mockFreelancers = [
    {
      id: '1',
      name: 'John Doe',
      title: 'Web Developer',
      rating: 4.8,
      reviewCount: 50,
      completedJobs: 100,
      hourlyRate: 500,
      location: 'Istanbul',
      avatar: 'avatar.jpg',
      skills: ['React', 'TypeScript'],
      services: ['Web Development', 'Mobile Apps'],
      description: 'Experienced developer',
      available: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          items: mockFreelancers,
          totalPages: 5,
        },
      }),
    });
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      expect(result.current.state.searchTerm).toBe('');
      expect(result.current.state.selectedFilter).toBe('all');
      expect(result.current.state.sortBy).toBe('rating');
      expect(result.current.state.selectedService).toBeNull();
      expect(result.current.state.page).toBe(1);
      expect(result.current.state.loading).toBe(true);
      expect(result.current.state.freelancers).toEqual([]);
    });

    it('should initialize with initial service', () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
          initialService: 'Web Development',
        })
      );

      expect(result.current.state.selectedService).toBe('Web Development');
    });
  });

  describe('Actions', () => {
    it('should update search term', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      act(() => {
        result.current.actions.setSearchTerm('React');
      });

      expect(result.current.state.searchTerm).toBe('React');
      expect(result.current.state.page).toBe(1); // Should reset page
    });

    it('should update selected filter', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      act(() => {
        result.current.actions.setSelectedFilter('available');
      });

      expect(result.current.state.selectedFilter).toBe('available');
      expect(result.current.state.page).toBe(1); // Should reset page
    });

    it('should update sort by', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      act(() => {
        result.current.actions.setSortBy('price-low');
      });

      expect(result.current.state.sortBy).toBe('price-low');
      expect(result.current.state.page).toBe(1); // Should reset page
    });

    it('should update selected service', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      act(() => {
        result.current.actions.setSelectedService('Mobile Apps');
      });

      expect(result.current.state.selectedService).toBe('Mobile Apps');
      expect(result.current.state.page).toBe(1); // Should reset page
    });

    it('should clear service filter', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
          initialService: 'Web Development',
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      act(() => {
        result.current.actions.clearServiceFilter();
      });

      expect(result.current.state.selectedService).toBeNull();
      expect(result.current.state.page).toBe(1);
    });

    it('should handle page navigation', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      act(() => {
        result.current.actions.setPage(3);
      });

      expect(result.current.state.page).toBe(3);
    });

    it('should handle next page', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      // Set total pages to allow next page
      expect(result.current.state.totalPages).toBe(5);

      act(() => {
        result.current.actions.nextPage();
      });

      expect(result.current.state.page).toBe(2);
    });

    it('should handle previous page', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      // Go to page 3 first
      act(() => {
        result.current.actions.setPage(3);
      });

      act(() => {
        result.current.actions.previousPage();
      });

      expect(result.current.state.page).toBe(2);
    });

    it('should not go below page 1', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      act(() => {
        result.current.actions.previousPage();
      });

      expect(result.current.state.page).toBe(1);
    });
  });

  describe('Data Fetching', () => {
    it('should fetch freelancers on mount', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      expect(result.current.state.freelancers).toEqual(mockFreelancers);
      expect(result.current.state.totalPages).toBe(5);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should include search term in fetch params', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      act(() => {
        result.current.actions.setSearchTerm('React');
      });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      const lastCall = (global.fetch as jest.Mock).mock.calls.slice(-1)[0][0];
      expect(lastCall).toContain('search=React');
    });

    it('should include filter in fetch params', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      act(() => {
        result.current.actions.setSelectedFilter('available');
      });

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      const lastCall = (global.fetch as jest.Mock).mock.calls.slice(-1)[0][0];
      expect(lastCall).toContain('available=true');
    });

    it('should handle fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      expect(result.current.state.error).toBe('Network error');
      expect(result.current.state.freelancers).toEqual([]);
    });

    it('should handle non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      expect(result.current.state.error).toBeDefined();
      expect(result.current.state.freelancers).toEqual([]);
    });
  });

  describe('State Coordination', () => {
    it('should reset page when search changes', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      // Set page to 3
      act(() => {
        result.current.actions.setPage(3);
      });

      expect(result.current.state.page).toBe(3);

      // Change search term
      act(() => {
        result.current.actions.setSearchTerm('TypeScript');
      });

      // Page should reset to 1
      expect(result.current.state.page).toBe(1);
    });

    it('should reset page when filter changes', async () => {
      const { result } = renderHook(() =>
        useSubcategoryState({
          categoryId: 1,
          subcategoryId: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.state.loading).toBe(false);
      });

      act(() => {
        result.current.actions.setPage(3);
      });

      act(() => {
        result.current.actions.setSelectedFilter('top-rated');
      });

      expect(result.current.state.page).toBe(1);
    });
  });
});
