/**
 * ================================================
 * ESCROW CARD COMPONENT
 * ================================================
 * Individual escrow transaction display card
 *
 * Features:
 * - Order information
 * - Payment amount display
 * - Status indicator
 * - Quick actions
 * - Seller/buyer info
 * - Dispute integration
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Escrow System Enhancement
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ExternalLink,
  MoreVertical,
  User,
  Package,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { EscrowStatusBadge } from './EscrowStatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// ============================================================================
// TYPES
// ============================================================================

export interface EscrowCardData {
  /** Payment ID */
  id: string;

  /** Order ID */
  orderId: string;

  /** Order title */
  orderTitle: string;

  /** Payment amount */
  amount: number;

  /** Payment currency */
  currency: string;

  /** Payment status */
  status:
    | 'HELD'
    | 'FROZEN'
    | 'RELEASED'
    | 'REFUNDED'
    | 'PARTIALLY_REFUNDED'
    | 'PENDING_RELEASE';

  /** Seller information */
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };

  /** Buyer information */
  buyer: {
    id: string;
    name: string;
    avatar?: string;
  };

  /** Created at */
  createdAt: string;

  /** Auto-release date (if applicable) */
  autoReleaseDate?: string;

  /** Dispute ID (if disputed) */
  disputeId?: string;

  /** Can release payment */
  canRelease?: boolean;

  /** Can raise dispute */
  canDispute?: boolean;
}

export interface EscrowCardProps {
  /** Escrow data */
  data: EscrowCardData;

  /** Current user role */
  userRole: 'BUYER' | 'SELLER';

  /** On release action */
  onRelease?: (paymentId: string) => void;

  /** On dispute action */
  onDispute?: (paymentId: string) => void;

  /** On view details */
  onViewDetails?: (orderId: string) => void;

  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EscrowCard({
  data,
  userRole,
  onRelease,
  onDispute,
  onViewDetails,
  className = '',
}: EscrowCardProps) {
  const {
    id,
    orderId,
    orderTitle,
    amount,
    currency,
    status,
    seller,
    buyer,
    createdAt,
    autoReleaseDate,
    disputeId,
    canRelease,
    canDispute,
  } = data;

  // Format amount
  const formattedAmount = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
  }).format(amount);

  // Get counter-party (the other user in transaction)
  const counterParty = userRole === 'BUYER' ? seller : buyer;
  const counterPartyLabel = userRole === 'BUYER' ? 'Satıcı' : 'Alıcı';

  return (
    <Card className={`hover:border-primary/50 transition-all ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link
              href={`/dashboard/orders/${orderId}`}
              className="group flex items-center gap-2 hover:underline"
            >
              <Package className="text-muted-foreground h-4 w-4" />
              <h3 className="line-clamp-1 text-base font-semibold text-gray-900">
                {orderTitle}
              </h3>
              <ExternalLink className="text-muted-foreground h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>

            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UnifiedButton
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">İşlemler</span>
              </UnifiedButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails?.(orderId)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Detayları Görüntüle
              </DropdownMenuItem>

              {canRelease && (
                <DropdownMenuItem onClick={() => onRelease?.(id)}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Ödemeyi Serbest Bırak
                </DropdownMenuItem>
              )}

              {canDispute && (
                <DropdownMenuItem
                  onClick={() => onDispute?.(id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Package className="mr-2 h-4 w-4" />
                  İhtilaf Aç
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Amount & Status */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground mb-1 text-xs">Tutar</p>
            <p className="text-2xl font-bold text-gray-900">
              {formattedAmount}
            </p>
          </div>
          <EscrowStatusBadge status={status} />
        </div>

        {/* Counter-party Info */}
        <div className="bg-muted mb-4 rounded-lg p-3">
          <p className="text-muted-foreground mb-2 text-xs">
            {counterPartyLabel}
          </p>
          <Link
            href={`/profile/${counterParty.id}`}
            className="group flex items-center gap-2 hover:underline"
          >
            {counterParty.avatar ? (
              <Image
                src={counterParty.avatar}
                alt={counterParty.name}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                <User className="text-primary h-3 w-3" />
              </div>
            )}
            <span className="text-sm font-medium text-gray-900">
              {counterParty.name}
            </span>
            <ExternalLink className="text-muted-foreground h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>

        {/* Auto-release Notice */}
        {autoReleaseDate && status === 'HELD' && (
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <p className="font-medium">Otomatik Serbest Bırakma</p>
            <p className="mt-1 text-xs text-blue-600">
              {formatDistanceToNow(new Date(autoReleaseDate), {
                addSuffix: true,
                locale: tr,
              })}
            </p>
          </div>
        )}

        {/* Dispute Notice */}
        {disputeId && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <p className="font-medium">İhtilaf Süreci Devam Ediyor</p>
            <Link
              href={`/dashboard/disputes/${disputeId}`}
              className="mt-1 inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
            >
              İhtilaf detaylarını görüntüle
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        {(canRelease || canDispute) && (
          <div className="mt-4 flex gap-2">
            {canRelease && (
              <UnifiedButton
                onClick={() => onRelease?.(id)}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Serbest Bırak
              </UnifiedButton>
            )}

            {canDispute && (
              <UnifiedButton
                onClick={() => onDispute?.(id)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                İhtilaf Aç
              </UnifiedButton>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Skeleton loader for EscrowCard
 */
export function EscrowCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <Card className={className}>
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
            <div className="bg-muted h-3 w-32 animate-pulse rounded" />
          </div>
          <div className="bg-muted h-8 w-8 animate-pulse rounded" />
        </div>

        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="bg-muted h-3 w-12 animate-pulse rounded" />
            <div className="bg-muted h-8 w-24 animate-pulse rounded" />
          </div>
          <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
        </div>

        <div className="bg-muted mb-4 h-16 animate-pulse rounded-lg" />
      </div>
    </Card>
  );
}

export default EscrowCard;
