'use client';

/**
 * Phone Badge Component
 * Sprint 1 - Story 1.3: Phone Verification (OTP)
 *
 * Visual indicator for phone verification status
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

import { Phone, CheckCircle2, AlertCircle, Clock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PhoneVerificationStatus = 'verified' | 'pending' | 'unverified';

export interface PhoneBadgeProps {
  /** Verification status */
  status: PhoneVerificationStatus;

  /** Phone number to display (masked) */
  phoneNumber?: string;

  /** Badge size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Enable compact mode (icon only for md/lg) */
  compact?: boolean;

  /** Click handler */
  onClick?: () => void;

  /** Custom className */
  className?: string;

  /** Show phone number */
  showPhone?: boolean;
}

/**
 * Format phone number for display (mask middle digits)
 */
function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  // Turkish format: 0532 123 45 67 → 0532 *** ** 67
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} *** ** ${cleaned.slice(-2)}`;
  }

  // International format: +90 532 123 45 67 → +90 *** ** 67
  if (cleaned.length > 6) {
    return `${cleaned.slice(0, 3)} *** ${cleaned.slice(-2)}`;
  }

  return phone;
}

/**
 * Get status configuration
 */
function getStatusConfig(status: PhoneVerificationStatus) {
  switch (status) {
    case 'verified':
      return {
        label: 'Doğrulandı',
        icon: CheckCircle2,
        colors: {
          bg: 'bg-green-50 hover:bg-green-100',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-600',
        },
      };
    case 'pending':
      return {
        label: 'Beklemede',
        icon: Clock,
        colors: {
          bg: 'bg-yellow-50 hover:bg-yellow-100',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-600',
        },
      };
    case 'unverified':
      return {
        label: 'Doğrulanmadı',
        icon: AlertCircle,
        colors: {
          bg: 'bg-gray-50 hover:bg-gray-100',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-600',
        },
      };
    default:
      return {
        label: 'Bilinmiyor',
        icon: AlertCircle,
        colors: {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-600',
        },
      };
  }
}

/**
 * Phone Badge Component
 */
export function PhoneBadge({
  status,
  phoneNumber,
  size = 'md',
  compact = false,
  onClick,
  className = '',
  showPhone = false,
}: PhoneBadgeProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  const isClickable = !!onClick;

  // Size configurations
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs gap-1',
      icon: 'h-3 w-3',
      text: 'text-xs',
    },
    md: {
      container: 'px-3 py-1.5 text-sm gap-1.5',
      icon: 'h-4 w-4',
      text: 'text-sm',
    },
    lg: {
      container: 'px-4 py-2 text-base gap-2',
      icon: 'h-5 w-5',
      text: 'text-base',
    },
  };

  const sizeConfig = sizeClasses[size];

  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-colors',
        config.colors.bg,
        config.colors.border,
        config.colors.text,
        sizeConfig.container,
        isClickable && 'cursor-pointer',
        !isClickable && 'cursor-default',
        className
      )}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <Icon
        className={cn(sizeConfig.icon, config.colors.icon)}
        aria-hidden="true"
      />

      {!compact && <span className={sizeConfig.text}>{config.label}</span>}

      {showPhone && phoneNumber && (
        <span className={cn(sizeConfig.text, 'font-mono')}>
          {formatPhoneNumber(phoneNumber)}
        </span>
      )}
    </div>
  );
}

/**
 * Inline Phone Verification Status Component
 * Displays verification status with icon and formatted phone number
 */
export interface InlinePhoneStatusProps {
  /** Verification status */
  status: PhoneVerificationStatus;

  /** Phone number */
  phoneNumber?: string;

  /** Show action button */
  showAction?: boolean;

  /** Action handler */
  onAction?: () => void;

  /** Custom className */
  className?: string;
}

export function InlinePhoneStatus({
  status,
  phoneNumber,
  showAction = false,
  onAction,
  className = '',
}: InlinePhoneStatusProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full',
            status === 'verified' && 'bg-green-100',
            status === 'pending' && 'bg-yellow-100',
            status === 'unverified' && 'bg-gray-100'
          )}
        >
          <Icon
            className={cn('h-4 w-4', config.colors.icon)}
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            {phoneNumber ? (
              <span className="font-mono text-sm text-gray-900">
                {formatPhoneNumber(phoneNumber)}
              </span>
            ) : (
              <span className="text-sm text-gray-500">Telefon eklenmedi</span>
            )}
          </div>

          <span className={cn('text-xs', config.colors.text)}>
            {config.label}
          </span>
        </div>
      </div>

      {showAction && status !== 'verified' && (
        <button
          onClick={onAction}
          className="ml-auto text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {status === 'unverified' ? 'Doğrula' : 'Devam Et'}
        </button>
      )}
    </div>
  );
}

/**
 * Phone Security Badge Component
 * Displays phone verification with security emphasis
 */
export interface PhoneSecurityBadgeProps {
  /** Verification status */
  status: PhoneVerificationStatus;

  /** Phone number */
  phoneNumber?: string;

  /** Show verification button */
  showButton?: boolean;

  /** Verification handler */
  onVerify?: () => void;

  /** Custom className */
  className?: string;
}

export function PhoneSecurityBadge({
  status,
  phoneNumber,
  showButton = true,
  onVerify,
  className = '',
}: PhoneSecurityBadgeProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        status === 'verified' && 'border-green-200 bg-green-50',
        status === 'pending' && 'border-yellow-200 bg-yellow-50',
        status === 'unverified' && 'border-gray-200 bg-gray-50',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
            status === 'verified' && 'bg-green-100',
            status === 'pending' && 'bg-yellow-100',
            status === 'unverified' && 'bg-gray-100'
          )}
        >
          <Shield
            className={cn(
              'h-5 w-5',
              status === 'verified' && 'text-green-600',
              status === 'pending' && 'text-yellow-600',
              status === 'unverified' && 'text-gray-600'
            )}
          />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">Telefon Güvenliği</h4>
            <PhoneBadge status={status} size="sm" />
          </div>

          {phoneNumber ? (
            <p className="font-mono text-sm text-gray-700">
              {formatPhoneNumber(phoneNumber)}
            </p>
          ) : (
            <p className="text-sm text-gray-600">Telefon numarası eklenmedi</p>
          )}

          <p className="text-xs text-gray-600">
            {status === 'verified' &&
              'Telefonunuz doğrulandı ve hesabınız güvende.'}
            {status === 'pending' &&
              'Doğrulama kodu gönderildi. Lütfen kontrol edin.'}
            {status === 'unverified' &&
              'Hesabınızı güvence altına almak için telefon doğrulayın.'}
          </p>
        </div>

        {showButton && status !== 'verified' && onVerify && (
          <button
            onClick={onVerify}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              status === 'pending'
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {status === 'pending' ? 'Devam Et' : 'Doğrula'}
          </button>
        )}
      </div>
    </div>
  );
}

export default PhoneBadge;
