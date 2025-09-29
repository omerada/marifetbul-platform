import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  SocialStore,
  SocialConfig,
  SocialShareData,
  SocialLoginResponse,
  SocialLoginProvider,
  ReferralData,
} from '@/types/shared/social';

const defaultProviders: SocialLoginProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: 'google',
    color: '#4285F4',
    enabled: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    enabled: true,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    enabled: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0A66C2',
    enabled: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    color: '#181717',
    enabled: false,
  },
];

const defaultConfig: SocialConfig = {
  enableSharing: true,
  enableSocialLogin: true,
  enableReferralTracking: true,
  enableSocialProof: true,
  platforms: defaultProviders,
  shareButtons: [
    { platform: 'facebook', enabled: true, order: 1 },
    { platform: 'twitter', enabled: true, order: 2 },
    { platform: 'linkedin', enabled: true, order: 3 },
    { platform: 'whatsapp', enabled: true, order: 4 },
  ],
};

export const useSocialStore = create<SocialStore>()(
  devtools(
    (set) => ({
      config: defaultConfig,
      shareStats: null,
      isLoading: false,
      error: null,

      shareContent: async (platform: string, data: SocialShareData) => {
        set({ isLoading: true, error: null });

        try {
          // Generate share URL based on platform
          const shareUrl = generateShareUrl(platform, data);

          // Open share dialog/window
          if (platform === 'whatsapp') {
            // WhatsApp uses direct link
            window.open(shareUrl, '_blank');
          } else {
            // Other platforms use popup window
            const popup = window.open(
              shareUrl,
              'share-dialog',
              'width=600,height=400,scrollbars=yes,resizable=yes'
            );

            // Focus popup if it exists
            if (popup) {
              popup.focus();
            }
          }

          // Track share event
          trackShareEvent(platform, data);

          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Share failed',
            isLoading: false,
          });
        }
      },

      fetchShareStats: async (url: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(
            `/api/v1/social/share-stats?url=${encodeURIComponent(url)}`
          );
          if (!response.ok) throw new Error('Failed to fetch share stats');

          const data = await response.json();
          set({ shareStats: data.data, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch share stats',
            isLoading: false,
          });
        }
      },

      loginWithSocial: async (
        provider: string
      ): Promise<SocialLoginResponse> => {
        set({ isLoading: true, error: null });

        try {
          // In a real app, this would integrate with OAuth providers
          // For now, we'll simulate the login process

          const authUrl = generateAuthUrl(provider);

          // Open auth popup
          const popup = window.open(
            authUrl,
            'social-login',
            'width=500,height=600,scrollbars=yes,resizable=yes'
          );

          // Wait for popup to close or receive message
          const result = await waitForAuthResult(popup);

          set({ isLoading: false });
          return result;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Login failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      trackReferral: (data: Partial<ReferralData>) => {
        // In a real app, this would send to analytics
        console.log('Referral tracked:', {
          ...data,
          timestamp: new Date().toISOString(),
        });
      },

      updateConfig: (newConfig: Partial<SocialConfig>) => {
        set((state) => ({
          config: { ...state.config, ...newConfig },
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'social-store',
    }
  )
);

// Helper functions
function generateShareUrl(platform: string, data: SocialShareData): string {
  const { url, title, hashtags } = data;
  const encodedUrl = encodeURIComponent(url);

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case 'twitter':
      const hashtagString = hashtags
        ? hashtags.map((tag) => `#${tag}`).join(' ')
        : '';
      const tweetText = `${title} ${hashtagString}`.trim();
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(tweetText)}`;

    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    case 'whatsapp':
      const whatsappText = `${title}\n${url}`;
      return `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function generateAuthUrl(provider: string): string {
  // In a real app, these would be actual OAuth URLs with proper client IDs
  const baseUrls = {
    google: 'https://accounts.google.com/oauth/authorize',
    facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
    twitter: 'https://api.twitter.com/oauth/authenticate',
    linkedin: 'https://www.linkedin.com/oauth/v2/authorization',
    github: 'https://github.com/login/oauth/authorize',
  };

  const clientIds = {
    google: 'your-google-client-id',
    facebook: 'your-facebook-app-id',
    twitter: 'your-twitter-client-id',
    linkedin: 'your-linkedin-client-id',
    github: 'your-github-client-id',
  };

  const redirectUri = `${window.location.origin}/auth/callback/${provider}`;

  const params = new URLSearchParams({
    client_id: clientIds[provider as keyof typeof clientIds] || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: getProviderScope(provider),
  });

  return `${baseUrls[provider as keyof typeof baseUrls]}?${params.toString()}`;
}

function getProviderScope(provider: string): string {
  const scopes = {
    google: 'openid email profile',
    facebook: 'email public_profile',
    twitter: 'read',
    linkedin: 'r_liteprofile r_emailaddress',
    github: 'user:email',
  };

  return scopes[provider as keyof typeof scopes] || '';
}

function waitForAuthResult(popup: Window | null): Promise<SocialLoginResponse> {
  return new Promise((resolve, reject) => {
    if (!popup) {
      reject(new Error('Popup blocked'));
      return;
    }

    // Check if popup is closed
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        reject(new Error('Authentication cancelled'));
      }
    }, 1000);

    // Listen for messages from popup
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'SOCIAL_AUTH_SUCCESS') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        popup.close();
        resolve(event.data.result);
      } else if (event.data.type === 'SOCIAL_AUTH_ERROR') {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        popup.close();
        reject(new Error(event.data.error));
      }
    };

    window.addEventListener('message', messageHandler);

    // Cleanup after 5 minutes
    setTimeout(
      () => {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error('Authentication timeout'));
      },
      5 * 60 * 1000
    );
  });
}

function trackShareEvent(platform: string, data: SocialShareData) {
  // In a real app, this would send to analytics
  console.log('Share tracked:', {
    platform,
    url: data.url,
    title: data.title,
    timestamp: new Date().toISOString(),
  });
}
