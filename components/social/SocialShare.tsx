'use client';

import { useState, useEffect } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useSocialStore } from '@/lib/store/social';
import { SocialShareData } from '@/types/social';
import { cn } from '@/lib/utils';

interface SocialShareProps {
  data: SocialShareData;
  variant?: 'buttons' | 'dropdown' | 'modal';
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  showCopyLink?: boolean;
  className?: string;
}

export function SocialShare({
  data,
  variant = 'buttons',
  size = 'md',
  showStats = false,
  showCopyLink = true,
  className,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const { shareContent, fetchShareStats, isLoading, config } = useSocialStore();

  useEffect(() => {
    if (showStats) {
      fetchShareStats(data.url);
    }
  }, [data.url, showStats, fetchShareStats]);

  const handleShare = async (platform: string) => {
    await shareContent(platform, data);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const getIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  const getButtonStyle = (platform: string) => {
    const styles = {
      facebook: 'bg-[#1877F2] hover:bg-[#166FE5] text-white',
      twitter: 'bg-[#1DA1F2] hover:bg-[#1A94DA] text-white',
      linkedin: 'bg-[#0A66C2] hover:bg-[#095AA0] text-white',
      whatsapp: 'bg-[#25D366] hover:bg-[#22C55E] text-white',
    };
    return styles[platform as keyof typeof styles] || '';
  };

  const enabledPlatforms = config.shareButtons
    .filter((btn) => btn.enabled)
    .sort((a, b) => a.order - b.order);

  if (variant === 'buttons') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {enabledPlatforms.map((button) => (
          <Button
            key={button.platform}
            variant="outline"
            size={size}
            onClick={() => handleShare(button.platform)}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-2',
              getButtonStyle(button.platform)
            )}
          >
            {getIcon(button.platform)}
            <span className="hidden capitalize sm:inline">
              {button.platform}
            </span>
          </Button>
        ))}

        {showCopyLink && (
          <Button
            variant="outline"
            size={size}
            onClick={handleCopyLink}
            className="flex items-center gap-2"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {copied ? 'Kopyalandı' : 'Linki Kopyala'}
            </span>
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        {/* This would need a proper dropdown component */}
        <Button variant="outline" size={size}>
          <Share2 className="mr-2 h-4 w-4" />
          Paylaş
        </Button>
      </div>
    );
  }

  return null;
}

interface SocialStatsProps {
  url: string;
  className?: string;
}

export function SocialStats({ url, className }: SocialStatsProps) {
  const { shareStats, fetchShareStats, isLoading } = useSocialStore();

  useEffect(() => {
    fetchShareStats(url);
  }, [url, fetchShareStats]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2"></div>
        <span className="text-muted-foreground text-sm">Yükleniyor...</span>
      </div>
    );
  }

  if (!shareStats) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex items-center gap-2">
        <Share2 className="text-muted-foreground h-4 w-4" />
        <span className="text-sm font-medium">{shareStats.total}</span>
        <span className="text-muted-foreground text-xs">paylaşım</span>
      </div>

      <div className="flex items-center gap-2">
        <Facebook className="h-4 w-4 text-[#1877F2]" />
        <span className="text-sm">{shareStats.facebook}</span>
      </div>

      <div className="flex items-center gap-2">
        <Twitter className="h-4 w-4 text-[#1DA1F2]" />
        <span className="text-sm">{shareStats.twitter}</span>
      </div>

      <div className="flex items-center gap-2">
        <Linkedin className="h-4 w-4 text-[#0A66C2]" />
        <span className="text-sm">{shareStats.linkedin}</span>
      </div>
    </div>
  );
}

interface SocialLoginProps {
  onSuccess?: (user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  }) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  className?: string;
}

export function SocialLogin({
  onSuccess,
  onError,
  redirectTo = '/',
  className,
}: SocialLoginProps) {
  const { loginWithSocial, isLoading, config } = useSocialStore();

  const handleLogin = async (provider: string) => {
    try {
      const result = await loginWithSocial(provider);

      if (result.success && result.user) {
        onSuccess?.(result.user);
        // Redirect after successful login
        window.location.href = redirectTo;
      } else {
        onError?.(result.error || 'Login failed');
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const enabledProviders = config.platforms.filter((p) => p.enabled);

  return (
    <div className={cn('space-y-3', className)}>
      {enabledProviders.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          onClick={() => handleLogin(provider.id)}
          disabled={isLoading}
          className="w-full justify-start"
        >
          {getProviderIcon(provider.id)}
          <span className="ml-2">{provider.name} ile devam et</span>
        </Button>
      ))}
    </div>
  );
}

function getProviderIcon(providerId: string) {
  switch (providerId) {
    case 'google':
      return <div className="h-4 w-4 rounded-full bg-red-500" />; // Google icon placeholder
    case 'facebook':
      return <Facebook className="h-4 w-4 text-[#1877F2]" />;
    case 'twitter':
      return <Twitter className="h-4 w-4 text-[#1DA1F2]" />;
    case 'linkedin':
      return <Linkedin className="h-4 w-4 text-[#0A66C2]" />;
    case 'github':
      return <div className="h-4 w-4 rounded-full bg-gray-900" />; // GitHub icon placeholder
    default:
      return <ExternalLink className="h-4 w-4" />;
  }
}

interface SocialProofProps {
  type: 'testimonials' | 'user_count' | 'recent_activity';
  data?: {
    testimonials?: Array<{
      id: string;
      name: string;
      avatar?: string;
      text: string;
      rating: number;
      company: string;
    }>;
    userCount?: number;
    recentActivity?: Array<{
      user: string;
      action: string;
      timestamp: string;
    }>;
  };
  className?: string;
}

export function SocialProof({ type, data, className }: SocialProofProps) {
  const mockData = {
    testimonials: [
      {
        id: '1',
        name: 'Ahmet Yılmaz',
        avatar: '/images/avatars/1.jpg',
        text: 'Harika bir platform! Çok kolay iş buldum.',
        rating: 5,
        company: 'Tech Startup',
      },
      {
        id: '2',
        name: 'Ayşe Kaya',
        avatar: '/images/avatars/2.jpg',
        text: 'Kaliteli freelancerlar ile çalışma fırsatı buldum.',
        rating: 5,
        company: 'Digital Agency',
      },
    ],
    userCount: 15420,
    recentActivity: [
      {
        user: 'Mehmet D.',
        action: 'yeni bir proje paylaştı',
        timestamp: '2 dakika önce',
      },
      {
        user: 'Zeynep A.',
        action: 'bir işe başvurdu',
        timestamp: '5 dakika önce',
      },
      {
        user: 'Can B.',
        action: 'profil oluşturdu',
        timestamp: '8 dakika önce',
      },
    ],
  };

  const content = data || mockData;

  switch (type) {
    case 'testimonials':
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle className="text-lg">Kullanıcı Yorumları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.testimonials?.map((testimonial) => (
              <div
                key={testimonial.id}
                className="border-primary border-l-2 pl-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="text-sm">{testimonial.text}</p>
                <div className="mt-2 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-sm text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )) || (
              <p className="text-muted-foreground text-sm">Henüz yorum yok.</p>
            )}
          </CardContent>
        </Card>
      );

    case 'user_count':
      return (
        <div className={cn('py-6 text-center', className)}>
          <div className="text-primary text-3xl font-bold">
            {content.userCount?.toLocaleString('tr-TR') || '0'}
          </div>
          <div className="text-muted-foreground text-sm">aktif kullanıcı</div>
        </div>
      );

    case 'recent_activity':
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle className="text-lg">Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {content.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">
                    <strong>{activity.user}</strong> {activity.action}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {activity.timestamp}
                </span>
              </div>
            )) || (
              <p className="text-muted-foreground text-sm">
                Henüz aktivite yok.
              </p>
            )}
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}
