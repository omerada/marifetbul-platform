import { useCallback, useEffect } from 'react';
import { useSEOStore } from '@/lib/core/store/seo';
import { logger } from '@/lib/shared/utils/logger';
import type { SEOPageData } from '@/types/shared/seo';

/**
 * Custom hook for SEO management
 * Provides utilities for meta tags, structured data, and page optimization
 */
export function useSEO() {
  const {
    metaTags,
    currentPageData,
    config,
    isLoading,
    error,
    fetchMetaTags,
    generateMetaTags,
    setPageData,
    updateConfig,
    clearError,
  } = useSEOStore();

  // Generate meta tags for a specific page
  const updatePageSEO = useCallback(
    async (data: SEOPageData) => {
      try {
        setPageData(data);
        await generateMetaTags(data);
      } catch (err) {
        logger.error('Failed to update page SEO:', err);
      }
    },
    [setPageData, generateMetaTags]
  );

  // Fetch meta tags for current URL
  const refreshMetaTags = useCallback(
    async (url?: string) => {
      try {
        const targetUrl = url || window.location.href;
        await fetchMetaTags(targetUrl);
      } catch (err) {
        logger.error('Failed to refresh meta tags:', err);
      }
    },
    [fetchMetaTags]
  );

  // Generate structured data for current page
  const getStructuredData = useCallback(() => {
    if (!currentPageData) return null;

    const baseStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: currentPageData.title,
      description: currentPageData.description,
      url: currentPageData.canonical || window.location.href,
    };

    return baseStructuredData;
  }, [currentPageData]);

  // Generate Open Graph tags
  const getOpenGraphTags = useCallback(() => {
    if (!currentPageData) return {};

    return {
      'og:title': currentPageData.title,
      'og:description': currentPageData.description,
      'og:image': currentPageData.ogImage || '/images/og-default.jpg',
      'og:url': currentPageData.canonical || window.location.href,
      'og:type': 'website',
      'og:site_name': 'Marifet Bul',
      'og:locale': 'tr_TR',
    };
  }, [currentPageData]);

  // Generate Twitter Card tags
  const getTwitterCardTags = useCallback(() => {
    if (!currentPageData) return {};

    return {
      'twitter:card': 'summary_large_image',
      'twitter:title': currentPageData.title,
      'twitter:description': currentPageData.description,
      'twitter:image': currentPageData.ogImage || '/images/twitter-default.jpg',
      'twitter:site': '@marifetbul',
    };
  }, [currentPageData]);

  // SEO validation
  const validateSEO = useCallback(() => {
    if (!currentPageData) return { isValid: false, issues: ['No page data'] };

    const issues: string[] = [];

    // Title validation
    if (!currentPageData.title) {
      issues.push('Missing page title');
    } else if (currentPageData.title.length < 30) {
      issues.push('Title too short (< 30 characters)');
    } else if (currentPageData.title.length > 60) {
      issues.push('Title too long (> 60 characters)');
    }

    // Description validation
    if (!currentPageData.description) {
      issues.push('Missing meta description');
    } else if (currentPageData.description.length < 120) {
      issues.push('Description too short (< 120 characters)');
    } else if (currentPageData.description.length > 160) {
      issues.push('Description too long (> 160 characters)');
    }

    // Keywords validation
    if (!currentPageData.keywords || currentPageData.keywords.length === 0) {
      issues.push('Missing keywords');
    } else if (currentPageData.keywords.length > 10) {
      issues.push('Too many keywords (> 10)');
    }

    // Image validation
    if (!currentPageData.ogImage) {
      issues.push('Missing social media image');
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: Math.max(0, 100 - issues.length * 10),
    };
  }, [currentPageData]);

  // Auto-refresh meta tags on page changes
  useEffect(() => {
    const handleRouteChange = () => {
      refreshMetaTags();
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [refreshMetaTags]);

  return {
    // State
    metaTags,
    currentPageData,
    config,
    isLoading,
    error,

    // Actions
    updatePageSEO,
    refreshMetaTags,
    updateConfig,
    clearError,

    // Utilities
    getStructuredData,
    getOpenGraphTags,
    getTwitterCardTags,
    validateSEO,
  };
}
