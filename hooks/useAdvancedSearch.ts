'use client';

import { useState, useEffect, useMemo } from 'react';
import { Job, ServicePackage } from '@/types';

export interface SearchFilters {
  query: string;
  category: string;
  location: string;
  minBudget: number;
  maxBudget: number;
  experienceLevel: string;
  skills: string[];
  deliveryTime: number;
  rating: number;
  sortBy:
    | 'newest'
    | 'oldest'
    | 'budget_low'
    | 'budget_high'
    | 'rating'
    | 'popular';
  dateRange: 'today' | 'week' | 'month' | 'all';
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'skill' | 'category' | 'location';
  count?: number;
}

interface UseAdvancedSearchProps {
  mode: 'jobs' | 'services';
  items: (Job | ServicePackage)[];
}

export function useAdvancedSearch({ mode, items }: UseAdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    location: '',
    minBudget: 0,
    maxBudget: 10000,
    experienceLevel: '',
    skills: [],
    deliveryTime: 0,
    rating: 0,
    sortBy: 'newest',
    dateRange: 'all',
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  // Generate search suggestions based on available data
  const generateSuggestions = useMemo(() => {
    if (!items.length) return [];

    const suggestions: SearchSuggestion[] = [];
    const categories = new Set<string>();
    const skills = new Set<string>();
    const locations = new Set<string>();

    items.forEach((item) => {
      // Categories
      if (item.category) {
        categories.add(item.category);
      }

      // Skills
      if ('skills' in item && item.skills) {
        item.skills.forEach((skill) => skills.add(skill));
      }

      // Locations
      if ('location' in item && item.location) {
        locations.add(item.location);
      } else if (
        'freelancer' in item &&
        item.freelancer &&
        'location' in item.freelancer &&
        item.freelancer.location
      ) {
        locations.add(item.freelancer.location);
      }
    });

    // Add category suggestions
    categories.forEach((category) => {
      const count = items.filter((item) => item.category === category).length;
      suggestions.push({
        id: `cat-${category}`,
        text: category,
        type: 'category',
        count,
      });
    });

    // Add skill suggestions
    skills.forEach((skill) => {
      const count = items.filter((item) =>
        'skills' in item && item.skills ? item.skills.includes(skill) : false
      ).length;
      suggestions.push({
        id: `skill-${skill}`,
        text: skill,
        type: 'skill',
        count,
      });
    });

    // Add location suggestions
    locations.forEach((location) => {
      const count = items.filter((item) => {
        if ('location' in item) return item.location === location;
        if (
          'freelancer' in item &&
          item.freelancer &&
          'location' in item.freelancer &&
          item.freelancer.location
        ) {
          return item.freelancer.location === location;
        }
        return false;
      }).length;
      suggestions.push({
        id: `loc-${location}`,
        text: location,
        type: 'location',
        count,
      });
    });

    return suggestions.sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [items]);

  // Filter and sort items based on current filters
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          ('skills' in item && item.skills
            ? item.skills.some((skill) => skill.toLowerCase().includes(query))
            : false)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((item) =>
        item.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter((item) => {
        if ('location' in item && item.location) {
          return item.location
            .toLowerCase()
            .includes(filters.location.toLowerCase());
        }
        if (
          'freelancer' in item &&
          item.freelancer &&
          'location' in item.freelancer &&
          item.freelancer.location
        ) {
          return item.freelancer.location
            .toLowerCase()
            .includes(filters.location.toLowerCase());
        }
        return false;
      });
    }

    // Budget filter
    if (mode === 'jobs') {
      filtered = filtered.filter((item) => {
        if ('budget' in item && item.budget) {
          const budget =
            item.budget.type === 'fixed'
              ? item.budget.amount
              : item.budget.amount;
          return budget >= filters.minBudget && budget <= filters.maxBudget;
        }
        return true;
      });
    } else {
      filtered = filtered.filter((item) => {
        if ('price' in item && item.price) {
          return (
            item.price >= filters.minBudget && item.price <= filters.maxBudget
          );
        }
        return true;
      });
    }

    // Experience level filter
    if (filters.experienceLevel && mode === 'jobs') {
      filtered = filtered.filter(
        (item) =>
          'experienceLevel' in item &&
          item.experienceLevel === filters.experienceLevel
      );
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter((item) =>
        'skills' in item && item.skills
          ? filters.skills.some((skill) =>
              item.skills!.some((itemSkill) =>
                itemSkill.toLowerCase().includes(skill.toLowerCase())
              )
            )
          : false
      );
    }

    // Delivery time filter (for services)
    if (filters.deliveryTime > 0 && mode === 'services') {
      filtered = filtered.filter(
        (item) =>
          'deliveryTime' in item && item.deliveryTime <= filters.deliveryTime
      );
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter((item) => {
        if ('rating' in item && item.rating) {
          return item.rating >= filters.rating;
        }
        if (
          'freelancer' in item &&
          item.freelancer &&
          'rating' in item.freelancer
        ) {
          return item.freelancer.rating >= filters.rating;
        }
        return false;
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.createdAt || item.updatedAt);
        return itemDate >= cutoffDate;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt || b.updatedAt).getTime() -
            new Date(a.createdAt || a.updatedAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt || a.updatedAt).getTime() -
            new Date(b.createdAt || b.updatedAt).getTime()
          );
        case 'budget_low':
          const budgetA =
            'budget' in a ? a.budget?.amount || 0 : 'price' in a ? a.price : 0;
          const budgetB =
            'budget' in b ? b.budget?.amount || 0 : 'price' in b ? b.price : 0;
          return budgetA - budgetB;
        case 'budget_high':
          const budgetA2 =
            'budget' in a ? a.budget?.amount || 0 : 'price' in a ? a.price : 0;
          const budgetB2 =
            'budget' in b ? b.budget?.amount || 0 : 'price' in b ? b.price : 0;
          return budgetB2 - budgetA2;
        case 'rating':
          const ratingA = 'rating' in a ? a.rating || 0 : 0;
          const ratingB = 'rating' in b ? b.rating || 0 : 0;
          return ratingB - ratingA;
        case 'popular':
          const popularityA =
            'proposalsCount' in a
              ? a.proposalsCount || 0
              : 'orders' in a
                ? a.orders
                : 0;
          const popularityB =
            'proposalsCount' in b
              ? b.proposalsCount || 0
              : 'orders' in b
                ? b.orders
                : 0;
          return popularityB - popularityA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, filters, mode]);

  // Update search suggestions based on query
  useEffect(() => {
    if (filters.query.length > 1) {
      const query = filters.query.toLowerCase();
      const matchingSuggestions = generateSuggestions
        .filter((suggestion) => suggestion.text.toLowerCase().includes(query))
        .slice(0, 8);
      setSuggestions(matchingSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [filters.query, generateSuggestions]);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const addToSearchHistory = (query: string) => {
    if (query.trim() && !searchHistory.includes(query)) {
      setSearchHistory((prev) => [query, ...prev.slice(0, 9)]); // Keep last 10 searches
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      location: '',
      minBudget: 0,
      maxBudget: 10000,
      experienceLevel: '',
      skills: [],
      deliveryTime: 0,
      rating: 0,
      sortBy: 'newest',
      dateRange: 'all',
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.category) count++;
    if (filters.location) count++;
    if (filters.experienceLevel) count++;
    if (filters.skills.length > 0) count++;
    if (filters.minBudget > 0 || filters.maxBudget < 10000) count++;
    if (filters.deliveryTime > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  };

  return {
    filters,
    filteredItems,
    suggestions,
    searchHistory,
    updateFilter,
    addToSearchHistory,
    clearFilters,
    activeFilterCount: getActiveFilterCount(),
  };
}
