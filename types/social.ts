export interface SocialShareData {
  url: string;
  title: string;
  description?: string;
  image?: string;
  hashtags?: string[];
}

export interface SocialShareStats {
  facebook: number;
  twitter: number;
  linkedin: number;
  whatsapp: number;
  total: number;
}

export interface SocialShareStatsResponse {
  data: SocialShareStats;
}

export interface SocialLoginProvider {
  id: 'google' | 'facebook' | 'twitter' | 'linkedin' | 'github';
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
}

export interface SocialLoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    provider: string;
  };
  error?: string;
}

export interface SocialProfile {
  platform:
    | 'facebook'
    | 'twitter'
    | 'linkedin'
    | 'instagram'
    | 'github'
    | 'behance'
    | 'dribbble';
  username: string;
  url: string;
  verified?: boolean;
  followers?: number;
}

export interface SocialProofWidget {
  type: 'testimonial' | 'review' | 'social_count' | 'recent_activity';
  data: {
    count?: number;
    rating?: number;
    testimonials?: Array<{
      id: string;
      name: string;
      avatar?: string;
      text: string;
      rating?: number;
      company?: string;
    }>;
    activities?: Array<{
      id: string;
      user: string;
      action: string;
      timestamp: string;
    }>;
  };
}

export interface ReferralData {
  referrerId: string;
  refereeId: string;
  source: 'social' | 'email' | 'link' | 'direct';
  platform?: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'rewarded';
  reward?: {
    type: 'credit' | 'discount' | 'bonus';
    value: number;
    currency?: string;
  };
}

export interface SocialMetrics {
  shares: {
    total: number;
    byPlatform: Record<string, number>;
  };
  clicks: {
    total: number;
    byPlatform: Record<string, number>;
  };
  conversions: {
    total: number;
    byPlatform: Record<string, number>;
  };
  engagement: {
    likes: number;
    comments: number;
    reactions: number;
  };
}

export interface SocialConfig {
  enableSharing: boolean;
  enableSocialLogin: boolean;
  enableReferralTracking: boolean;
  enableSocialProof: boolean;
  platforms: SocialLoginProvider[];
  shareButtons: Array<{
    platform: string;
    enabled: boolean;
    order: number;
  }>;
}

export interface SocialStore {
  config: SocialConfig;
  shareStats: SocialShareStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  shareContent: (platform: string, data: SocialShareData) => Promise<void>;
  fetchShareStats: (url: string) => Promise<void>;
  loginWithSocial: (provider: string) => Promise<SocialLoginResponse>;
  trackReferral: (data: Partial<ReferralData>) => void;
  updateConfig: (config: Partial<SocialConfig>) => void;
  clearError: () => void;
}
