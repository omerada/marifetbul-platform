'use client';

/**
 * ================================================
 * PAYOUT ELIGIBILITY WIDGET
 * ================================================
 * Shows payout eligibility status and requirements
 *
 * Features:
 * - Eligibility check display
 * - Minimum balance warning
 * - Next eligible date
 * - Pending payout warning
 * - Requirements checklist
 * - Visual status indicators
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 30, 2025
 * @sprint Sprint 1 - Story 1.2 - Task 3 (1 story point)
 */

'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  CreditCard,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';

// ================================================
// TYPES
// ================================================

export interface PayoutEligibilityData {
  isEligible: boolean;
  currentBalance: number;
  minimumBalance: number;
  hasPendingPayout: boolean;
  pendingPayoutAmount?: number;
  hasVerifiedBankAccount: boolean;
  lastPayoutDate?: Date;
  nextEligibleDate?: Date;
  cooldownPeriodDays?: number;
  reasons?: string[];
}

export interface PayoutEligibilityWidgetProps {
  data: PayoutEligibilityData;
  onRequestPayout?: () => void;
  onAddBankAccount?: () => void;
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export const PayoutEligibilityWidget: React.FC<
  PayoutEligibilityWidgetProps
> = ({ data, onRequestPayout, onAddBankAccount, className = '' }) => {
  const {
    isEligible,
    currentBalance,
    minimumBalance,
    hasPendingPayout,
    pendingPayoutAmount,
    hasVerifiedBankAccount,
    lastPayoutDate,
    nextEligibleDate,
    cooldownPeriodDays = 7,
    reasons = [],
  } = data;

  // ==================== COMPUTED PROPERTIES ====================

  const requirements = useMemo(() => {
    const reqs = [
      {
        id: 'balance',
        label: 'Minimum bakiye',
        description: `En az ${formatCurrency(minimumBalance)} olmalı`,
        isMet: currentBalance >= minimumBalance,
        icon: DollarSign,
      },
      {
        id: 'bank',
        label: 'Banka hesabı',
        description: 'Doğrulanmış banka hesabı gerekli',
        isMet: hasVerifiedBankAccount,
        icon: CreditCard,
      },
      {
        id: 'pending',
        label: 'Bekleyen ödeme yok',
        description: 'Aktif bir ödeme talebi olmamalı',
        isMet: !hasPendingPayout,
        icon: Clock,
      },
    ];

    if (nextEligibleDate && new Date() < nextEligibleDate) {
      reqs.push({
        id: 'cooldown',
        label: 'Bekleme süresi',
        description: `${cooldownPeriodDays} gün beklemeli`,
        isMet: false,
        icon: Calendar,
      });
    }

    return reqs;
  }, [
    currentBalance,
    minimumBalance,
    hasVerifiedBankAccount,
    hasPendingPayout,
    nextEligibleDate,
    cooldownPeriodDays,
  ]);

  const metRequirementsCount = requirements.filter((r) => r.isMet).length;
  const totalRequirementsCount = requirements.length;
  const progressPercentage =
    (metRequirementsCount / totalRequirementsCount) * 100;

  // ==================== RENDER ====================

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Para Çekme Durumu
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {isEligible
              ? 'Para çekme işlemi yapabilirsiniz'
              : 'Şu anda para çekemezsiniz'}
          </p>
        </div>
        {isEligible ? (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Uygun
          </Badge>
        ) : (
          <Badge variant="warning" className="gap-1">
            <XCircle className="h-4 w-4" />
            Uygun Değil
          </Badge>
        )}
      </div>

      {/* Current Balance Card */}
      <div className="mb-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">
              Mevcut Bakiyeniz
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-900">
              {formatCurrency(currentBalance)}
            </p>
          </div>
          <DollarSign className="h-10 w-10 text-blue-600" />
        </div>
        {currentBalance < minimumBalance && (
          <div className="mt-3 flex items-start gap-2 rounded-md bg-yellow-100 p-2">
            <AlertCircle className="h-4 w-4 text-yellow-700" />
            <p className="text-xs text-yellow-800">
              Para çekmek için en az{' '}
              {formatCurrency(minimumBalance - currentBalance)} daha kazanmanız
              gerekiyor.
            </p>
          </div>
        )}
      </div>

      {/* Pending Payout Warning */}
      {hasPendingPayout && pendingPayoutAmount && (
        <div className="mb-4 rounded-lg bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900">
                Bekleyen Ödeme Var
              </p>
              <p className="mt-1 text-sm text-orange-800">
                {formatCurrency(pendingPayoutAmount)} tutarında ödeme talebiniz
                işleniyor. Yeni bir talep oluşturmadan önce mevcut talebinizin
                tamamlanmasını bekleyin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next Eligible Date */}
      {!isEligible && nextEligibleDate && new Date() < nextEligibleDate && (
        <div className="mb-4 rounded-lg bg-purple-50 p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-purple-600" />
            <div className="flex-1">
              <p className="font-semibold text-purple-900">
                Sonraki Uygun Tarih
              </p>
              <p className="mt-1 text-sm text-purple-800">
                {formatDate(nextEligibleDate)} tarihinden sonra yeni bir ödeme
                talebi oluşturabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Requirements Checklist */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Gereksinimler</p>
          <span className="text-sm text-gray-600">
            {metRequirementsCount}/{totalRequirementsCount}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Requirements List */}
        <div className="space-y-2">
          {requirements.map((req) => {
            const Icon = req.icon;
            return (
              <div
                key={req.id}
                className={`flex items-start gap-3 rounded-lg p-3 ${
                  req.isMet ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                {req.isMet ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <Icon
                  className={`h-5 w-5 ${req.isMet ? 'text-green-600' : 'text-gray-400'}`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      req.isMet ? 'text-green-900' : 'text-gray-700'
                    }`}
                  >
                    {req.label}
                  </p>
                  <p
                    className={`text-xs ${
                      req.isMet ? 'text-green-700' : 'text-gray-600'
                    }`}
                  >
                    {req.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Reasons */}
      {reasons.length > 0 && (
        <div className="mb-4 rounded-lg bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold text-red-900">
                Dikkat Edilmesi Gerekenler
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-800">
                {reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {isEligible ? (
          <Button onClick={onRequestPayout} className="w-full" size="lg">
            Para Çekme Talebi Oluştur
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <>
            {!hasVerifiedBankAccount && onAddBankAccount && (
              <Button
                onClick={onAddBankAccount}
                variant="outline"
                className="w-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Banka Hesabı Ekle
              </Button>
            )}
            <Button
              onClick={onRequestPayout}
              disabled
              className="w-full"
              variant="outline"
            >
              Para Çekme Talebi Oluştur
            </Button>
          </>
        )}
      </div>

      {/* Last Payout Info */}
      {lastPayoutDate && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-600">
            Son para çekme işleminiz:{' '}
            <span className="font-medium text-gray-900">
              {formatDate(lastPayoutDate)}
            </span>
          </p>
        </div>
      )}
    </Card>
  );
};

export default PayoutEligibilityWidget;
