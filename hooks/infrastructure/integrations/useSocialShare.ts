import { useCallback, useEffect, useState } from 'react';
import { useSocialStore } from '@/lib/core/store/social';
import { logger } from '@/lib/shared/utils/logger';
import type {
  SocialShareData,
  SocialLoginProvider,
} from '@/types/shared/social';

type SocialSharePlatform =
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'whatsapp'
  | 'telegram'
  | 'email';

/**
 * Custom hook for social media functionality
 * Provides utilities for sharing, login, and social analytics
 */
export function useSocialShare() {
  const {
    shareStats,
    isLoading,
    error,
    shareContent,
    loginWithSocial,
    fetchShareStats,
    clearError,
  } = useSocialStore();

  const [isSharing, setIsSharing] = useState(false);

  // Share content to social platform
  const share = useCallback(
    async (platform: SocialSharePlatform, data: SocialShareData) => {
      if (isSharing) return;

      setIsSharing(true);
      try {
        await shareContent(platform, data);

        // Track sharing event
        if (typeof window !== 'undefined' && 'gtag' in window) {
          const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
          gtag?.('event', 'share', {
            method: platform,
            content_id: data.url,
          });
        }
      } finally {
        setIsSharing(false);
      }
    },
    [isSharing, shareContent]
  );

  // Share to multiple platforms
  const shareToMultiple = useCallback(
    async (platforms: SocialSharePlatform[], data: SocialShareData) => {
      const sharePromises = platforms.map((platform) => share(platform, data));
      await Promise.allSettled(sharePromises);
    },
    [share]
  );

  // Generate share URL for a platform
  const generateShareUrl = useCallback(
    (platform: SocialSharePlatform, data: SocialShareData) => {
      const encodedUrl = encodeURIComponent(data.url);
      const encodedTitle = encodeURIComponent(data.title);

      switch (platform) {
        case 'facebook':
          return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

        case 'twitter':
          const tweetText = data.description
            ? `${data.title} - ${data.description}`
            : data.title;
          return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodedUrl}`;

        case 'linkedin':
          return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

        case 'whatsapp':
          const whatsappText = `${data.title} ${data.url}`;
          return `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

        case 'telegram':
          return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;

        case 'email':
          const subject = encodeURIComponent(data.title);
          const body = encodeURIComponent(`${data.description}\n\n${data.url}`);
          return `mailto:?subject=${subject}&body=${body}`;

        default:
          return data.url;
      }
    },
    []
  );

  // Open share dialog
  const openShareDialog = useCallback(
    (platform: SocialSharePlatform, data: SocialShareData) => {
      const shareUrl = generateShareUrl(platform, data);

      if (platform === 'email') {
        window.location.href = shareUrl;
      } else {
        const popup = window.open(
          shareUrl,
          'share',
          'width=600,height=400,scrollbars=yes,resizable=yes'
        );

        if (popup) {
          // Track share attempt
          share(platform, data);
        }
      }
    },
    [generateShareUrl, share]
  );

  // Copy link to clipboard
  const copyLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);

      // Track copy event
      if (typeof window !== 'undefined' && 'gtag' in window) {
        const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
        gtag?.('event', 'share', {
          method: 'copy_link',
          content_id: url,
        });
      }

      return true;
    } catch (error) {
      logger.error('Failed to copy link:', error);
      return false;
    }
  }, []);

  // Login with social provider
  const login = useCallback(
    async (provider: SocialLoginProvider) => {
      try {
        const result = await loginWithSocial(provider.id);

        // Track login event
        if (typeof window !== 'undefined' && 'gtag' in window) {
          const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
          gtag?.('event', 'login', {
            method: provider.id,
          });
        }

        return result;
      } catch (error) {
        logger.error(`Login with ${provider.id} failed:`, error);
        throw error;
      }
    },
    [loginWithSocial]
  );

  // Check if Web Share API is supported
  const isWebShareSupported = useCallback(() => {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }, []);

  // Use native Web Share API
  const shareNative = useCallback(
    async (data: SocialShareData) => {
      if (!isWebShareSupported()) {
        throw new Error('Web Share API not supported');
      }

      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: data.url,
        });

        // Track native share
        if (typeof window !== 'undefined' && 'gtag' in window) {
          const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
          gtag?.('event', 'share', {
            method: 'native',
            content_id: data.url,
          });
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          logger.error('Native sharing failed:', error);
          throw error;
        }
      }
    },
    [isWebShareSupported]
  );

  // Get social sharing statistics
  const getShareStats = useCallback(
    async (url: string) => {
      await fetchShareStats(url);
    },
    [fetchShareStats]
  );

  // Generate social meta tags for better sharing
  const generateSocialMetaTags = useCallback((data: SocialShareData) => {
    return {
      // Open Graph tags
      'og:title': data.title,
      'og:description': data.description || '',
      'og:image': data.image || '/images/og-default.jpg',
      'og:url': data.url,
      'og:type': 'website',
      'og:site_name': 'Marifet Bul',

      // Twitter Card tags
      'twitter:card': 'summary_large_image',
      'twitter:title': data.title,
      'twitter:description': data.description || '',
      'twitter:image': data.image || '/images/twitter-default.jpg',
      'twitter:site': '@marifetbul',
    };
  }, []);

  // Auto-refresh share stats
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      getShareStats(currentUrl);
    }
  }, [getShareStats]);

  return {
    // State
    shareStats,
    isLoading,
    error,
    isSharing,

    // Actions
    share,
    shareToMultiple,
    openShareDialog,
    copyLink,
    login,
    shareNative,
    getShareStats,
    clearError,

    // Utilities
    generateShareUrl,
    generateSocialMetaTags,
    isWebShareSupported,
  };
}
