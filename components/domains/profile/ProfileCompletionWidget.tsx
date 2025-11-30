'use client';

/**
 * Profile Completion Widget
 * Sprint 1 - Story 1.1: Profile Completion System
 *
 * Production-ready component for displaying profile completion status
 * with circular progress, missing fields list, and actionable insights
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Code,
  Image,
  Building,
  Globe,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Edit,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProfileCompletion } from '@/hooks/business/profile/useProfileCompletion';
import { ProfileStrength } from '@/types/profile-completion';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { Progress } from '@/components/ui/Progress';

export interface ProfileCompletionWidgetProps {
  /** User ID (optional, defaults to current user) */
  userId?: string;

  /** Display variant */
  variant?: 'compact' | 'full';

  /** Callback when complete profile button clicked */
  onComplete?: () => void;

  /** Custom className */
  className?: string;
}

/**
 * Get icon for specific field
 */
function getFieldIcon(field: string) {
  const iconMap: Record<string, React.ElementType> = {
    username: User,
    email: Mail,
    firstName: User,
    lastName: User,
    bio: User,
    avatar: Image,
    phone: Phone,
    location: MapPin,
    website: Globe,
    title: Briefcase,
    skills: Code,
    hourlyRate: DollarSign,
    portfolio: Image,
    companyName: Building,
    companySize: Building,
    industry: Briefcase,
  };

  return iconMap[field] || AlertCircle;
}

/**
 * Get user-friendly label for field
 */
function getFieldLabel(field: string): string {
  const labelMap: Record<string, string> = {
    username: 'Kullanıcı Adı',
    email: 'E-posta',
    firstName: 'Ad',
    lastName: 'Soyad',
    bio: 'Biyografi',
    avatar: 'Profil Fotoğrafı',
    phone: 'Telefon',
    location: 'Konum',
    website: 'Web Sitesi',
    title: 'Başlık/Uzmanlık',
    skills: 'Beceriler',
    hourlyRate: 'Saatlik Ücret',
    portfolio: 'Portföy',
    companyName: 'Şirket Adı',
    companySize: 'Şirket Büyüklüğü',
    industry: 'Sektör',
    languages: 'Diller',
    socialLinks: 'Sosyal Medya',
  };

  return labelMap[field] || field;
}

/**
 * Get color scheme based on completion percentage
 */
function getCompletionColor(percentage: number): {
  bg: string;
  text: string;
  ring: string;
} {
  if (percentage <= 30) {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      ring: 'ring-red-500',
    };
  }
  if (percentage <= 70) {
    return {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      ring: 'ring-yellow-500',
    };
  }
  return {
    bg: 'bg-green-50',
    text: 'text-green-700',
    ring: 'ring-green-500',
  };
}

/**
 * Circular progress component
 */
function CircularProgress({ value }: { value: number }) {
  const colors = getCompletionColor(value);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="150" height="150" className="-rotate-90 transform">
        {/* Background circle */}
        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className={colors.text}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${colors.text}`}>{value}%</span>
        <span className="text-xs text-gray-500">tamamlandı</span>
      </div>
    </div>
  );
}

/**
 * Strength badge component
 */
function StrengthBadge({ strength }: { strength: ProfileStrength }) {
  const config = {
    [ProfileStrength.WEAK]: {
      label: 'Zayıf',
      variant: 'destructive' as const,
      icon: AlertCircle,
    },
    [ProfileStrength.MEDIUM]: {
      label: 'Orta',
      variant: 'warning' as const,
      icon: TrendingUp,
    },
    [ProfileStrength.STRONG]: {
      label: 'Güçlü',
      variant: 'success' as const,
      icon: CheckCircle2,
    },
  };

  const { label, variant, icon: Icon } = config[strength];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

/**
 * Main widget component
 */
export function ProfileCompletionWidget({
  userId,
  variant = 'full',
  onComplete,
  className = '',
}: ProfileCompletionWidgetProps) {
  const router = useRouter();
  const { completion, isLoading, needsAttention } =
    useProfileCompletion(userId);

  const colors = useMemo(() => {
    return getCompletionColor(completion?.completionPercentage ?? 0);
  }, [completion?.completionPercentage]);

  const handleCompleteProfile = () => {
    if (onComplete) {
      onComplete();
    } else {
      router.push('/profile/edit');
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-gray-200"></div>
          <div className="mx-auto h-32 w-32 rounded-full bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!completion) {
    return null;
  }

  const {
    completionPercentage,
    missingFields,
    strength,
    suggestions,
    nextRecommendedField,
  } = completion;

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`h-12 w-12 rounded-full ${colors.bg} flex items-center justify-center`}
              >
                <span className={`text-sm font-semibold ${colors.text}`}>
                  {completionPercentage}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Profil Tamamlama</p>
              <p className="text-xs text-gray-500">
                {missingFields.length} alan eksik
              </p>
            </div>
          </div>
          {needsAttention && (
            <Button size="sm" variant="outline" onClick={handleCompleteProfile}>
              Tamamla
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Profil Tamamlama</h3>
          <p className="text-sm text-gray-500">Profilinizi güçlendirin</p>
        </div>
        <StrengthBadge strength={strength} />
      </div>

      {/* Circular Progress */}
      <div className="mb-6 flex justify-center">
        <CircularProgress value={completionPercentage} />
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={completionPercentage} className="h-2" />
        <p className="mt-2 text-center text-sm text-gray-600">
          {completion.completedFieldsCount} / {completion.totalFields} alan
          tamamlandı
        </p>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6 space-y-2">
          <h4 className="text-sm font-medium">💡 Öneriler</h4>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700"
            >
              <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{suggestion}</p>
            </div>
          ))}
        </div>
      )}

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium">Eksik Alanlar</h4>
          <div className="space-y-2">
            {missingFields.slice(0, 5).map((field) => {
              const Icon = getFieldIcon(field);
              const label = getFieldLabel(field);
              const isNext = field === nextRecommendedField;

              return (
                <motion.div
                  key={field}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-gray-50 ${
                    isNext ? 'border-l-4 border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isNext ? 'text-blue-600' : 'text-gray-400'}`}
                  />
                  <span className="flex-1 text-sm">{label}</span>
                  {isNext && (
                    <Badge variant="outline" className="text-xs">
                      Önerilen
                    </Badge>
                  )}
                </motion.div>
              );
            })}
            {missingFields.length > 5 && (
              <p className="text-xs text-gray-500">
                +{missingFields.length - 5} alan daha
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      {needsAttention ? (
        <Button onClick={handleCompleteProfile} className="w-full" size="lg">
          <Edit className="mr-2 h-4 w-4" />
          Profili Tamamla
        </Button>
      ) : (
        <div className="rounded-md bg-green-50 p-4 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-600" />
          <p className="text-sm font-medium text-green-700">
            Harika! Profiliniz güçlü görünüyor
          </p>
        </div>
      )}
    </Card>
  );
}

export default ProfileCompletionWidget;
