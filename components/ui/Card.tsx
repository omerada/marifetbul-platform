'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import {
  HTMLAttributes,
  ReactNode,
  useEffect,
  useState,
  useCallback,
  forwardRef,
} from 'react';
import {
  Heart,
  Building2,
  MapPin,
  DollarSign,
  Eye,
  Clock,
  Star,
} from 'lucide-react';
import Image from 'next/image';

// Missing component imports - simplified versions
function Badge({
  children,
  variant,
  className,
}: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  return (
    <div className="relative">
      <Image
        src={images[0] || '/placeholder.jpg'}
        alt={alt}
        width={300}
        height={200}
        className="rounded-lg"
      />
    </div>
  );
}

// Type definitions
interface JobCardData {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  budget: {
    min: number;
    max?: number;
    type?: string;
  };
  views: number;
  skills: string[];
  isUrgent: boolean;
  isRemote: boolean;
  postedAt: string;
  applicants?: number;
  deadline?: string;
}

interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  price:
    | number
    | {
        amount: number;
        currency: string;
        type: string;
      };
  images: string[];
  isFeatured: boolean;
  provider: {
    name: string;
    avatar: string;
    rating: number;
    reviews: number;
  };
  tags: string[];
  deliveryTime: string;
  reviewsCount?: number;
}

interface CardDisplayConfig {
  showCompany: boolean;
  showLocation: boolean;
  showBudget: boolean;
  showViews: boolean;
  showActions?: boolean;
  showBadges?: boolean;
  showStats?: boolean;
}

interface CardActions {
  onView?: () => void;
  onContact?: () => void;
  onFavorite?: () => void;
  onBookmark?: () => void;
  onLike?: () => void;
}

// ================================================
// CLEAN BASE CARD COMPONENT
// ================================================
// Simple, focused, reusable card component following SRP

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost' | 'gradient';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  touchOptimized?: boolean;
  hapticFeedback?: boolean;
  loading?: boolean;
  disabled?: boolean;
  asChild?: boolean;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// ================================================
// HOOKS
// ================================================

function useHapticFeedback() {
  const triggerImpact = useCallback(
    (intensity: 'light' | 'medium' | 'heavy') => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const duration =
          intensity === 'light' ? 10 : intensity === 'medium' ? 25 : 50;
        navigator.vibrate(duration);
      }
    },
    []
  );

  return { triggerImpact };
}

// ================================================
// UTILITY COMPONENTS
// ================================================

const FavoriteButton = memo(function FavoriteButton({
  id,
  onToggle,
  isFavorite = false,
  variant = 'heart',
  size = 'md',
}: {
  id: string;
  onToggle?: (id: string) => void;
  isFavorite?: boolean;
  variant?: 'heart' | 'bookmark';
  size?: 'sm' | 'md' | 'lg';
}) {
  const iconSizes = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };
  const Icon = variant === 'heart' ? Heart : Heart; // Use appropriate icon

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.(id);
      }}
      className={cn(
        'rounded-full p-2 transition-colors',
        isFavorite
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
      )}
    >
      <Icon
        className={iconSizes[size]}
        fill={isFavorite ? 'currentColor' : 'none'}
      />
    </button>
  );
});

// ================================================
// CARD CONTENT RENDERERS
// ================================================

const JobCardContent = memo(function JobCardContent({
  data,
  config,
  actions,
}: {
  data: JobCardData;
  config: CardDisplayConfig;
  actions?: CardActions;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
            {data.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
            <Building2 className="h-4 w-4" />
            {data.company}
          </p>
        </div>
        {config.showActions && actions?.onBookmark && (
          <FavoriteButton
            id={data.id}
            onToggle={actions.onBookmark}
            variant="bookmark"
          />
        )}
      </div>

      {data.description && (
        <p className="line-clamp-3 text-sm text-gray-700">{data.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {data.location}
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />${data.budget.min}-$
          {data.budget.max}/{data.budget.type}
        </span>
        {data.applicants && (
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {data.applicants} başvuru
          </span>
        )}
      </div>

      {config.showBadges && (
        <div className="flex flex-wrap gap-2">
          {data.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {data.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{data.skills.length - 3} daha
            </Badge>
          )}
          {data.isUrgent && <Badge variant="destructive">Acil</Badge>}
          {data.isRemote && <Badge variant="default">Uzaktan</Badge>}
        </div>
      )}

      {config.showStats && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(data.postedAt).toLocaleDateString('tr-TR')}
          </span>
          {data.deadline && (
            <span>
              Son tarih: {new Date(data.deadline).toLocaleDateString('tr-TR')}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

const ServiceCardContent = memo(function ServiceCardContent({
  data,
  config,
  actions,
}: {
  data: ServiceCardData;
  config: CardDisplayConfig;
  actions?: CardActions;
}) {
  return (
    <div className="space-y-4">
      {data.images && data.images.length > 0 && (
        <div className="relative h-48 overflow-hidden rounded-lg">
          {data.images.length === 1 ? (
            <Image
              src={data.images[0]}
              alt={data.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <ImageCarousel images={data.images} alt={data.title} />
          )}
          {config.showActions && actions?.onLike && (
            <div className="absolute top-2 right-2">
              <FavoriteButton id={data.id} onToggle={actions.onLike} />
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="line-clamp-2 flex-1 text-lg font-semibold text-gray-900">
            {data.title}
          </h3>
          {data.isFeatured && <Badge variant="default">Öne Çıkan</Badge>}
        </div>

        <div className="flex items-center gap-3">
          <Image
            src={data.provider.avatar}
            alt={data.provider.name}
            width={32}
            height={32}
            className="rounded-full"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {data.provider.name}
            </p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">
                {data.provider.rating} ({data.reviewsCount} değerlendirme)
              </span>
            </div>
          </div>
        </div>

        {data.description && (
          <p className="line-clamp-3 text-sm text-gray-700">
            {data.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">
              {typeof data.price === 'object' && data.price.type === 'starting'
                ? 'Başlangıç fiyatı'
                : 'Sabit fiyat'}
            </span>
            <p className="text-lg font-bold text-gray-900">
              {typeof data.price === 'number'
                ? `₺${data.price.toLocaleString('tr-TR')}`
                : `${data.price.amount} ${data.price.currency}`}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Teslimat</span>
            <p className="text-sm font-medium text-gray-900">
              {data.deliveryTime}
            </p>
          </div>
        </div>

        {config.showBadges && data.tags && (
          <div className="flex flex-wrap gap-2">
            {data.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {data.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{data.tags.length - 3} daha
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// ================================================
// MAIN COMPONENTS
// ================================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      size = 'md',
      interactive = false,
      touchOptimized = false,
      hapticFeedback = false,
      loading = false,
      disabled = false,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const { triggerImpact } = useHapticFeedback();

    useEffect(() => {
      setMounted(true);
      setIsMobile(window.innerWidth < 768);
      setIsTouchDevice(
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      );
    }, []);

    const shouldOptimizeForTouch =
      touchOptimized || (mounted && (isMobile || isTouchDevice));

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled || loading) return;

        if (hapticFeedback && interactive && mounted) {
          triggerImpact('light');
        }

        onClick?.(e);
      },
      [
        disabled,
        loading,
        hapticFeedback,
        interactive,
        mounted,
        onClick,
        triggerImpact,
      ]
    );

    const baseClasses = cn(
      'rounded-lg bg-white transition-all duration-200',
      interactive && 'cursor-pointer hover:shadow-md',
      shouldOptimizeForTouch && interactive && 'active:scale-[0.98]',
      loading && 'opacity-50 pointer-events-none',
      disabled && 'opacity-50 cursor-not-allowed',

      // Variant styles
      {
        'border border-gray-200 shadow-sm': variant === 'default',
        'border border-gray-200 shadow-lg': variant === 'elevated',
        'border-2 border-gray-300': variant === 'outlined',
        'border-none shadow-none': variant === 'ghost',
        'bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200':
          variant === 'gradient',
      },

      // Padding styles
      {
        'p-0': padding === 'none',
        'p-2': padding === 'xs',
        'p-3': padding === 'sm',
        'p-4': padding === 'md',
        'p-6': padding === 'lg',
        'p-8': padding === 'xl',
      },

      // Size styles
      {
        'min-h-[120px]': size === 'sm',
        'min-h-[160px]': size === 'md',
        'min-h-[200px]': size === 'lg',
      },

      className
    );

    if (loading) {
      return (
        <div ref={ref} className={baseClasses} {...props}>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={baseClasses} onClick={handleClick} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export function CardTitle({ className, children, ...props }: CardHeaderProps) {
  return (
    <h3
      className={cn(
        'text-lg leading-none font-semibold tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={cn('mb-4 last:mb-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('mt-4 flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
}
