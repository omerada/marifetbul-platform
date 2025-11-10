'use client';

/**
 * ================================================
 * MILESTONE CREATION WIZARD
 * ================================================
 * Multi-step wizard for creating order milestones
 *
 * Features:
 * - Multi-step form (add milestones one by one)
 * - Title, description, amount, due date per milestone
 * - Automatic sequence numbering
 * - Total sum validation (must equal order total)
 * - Batch creation API integration
 * - Production-ready validation & error handling
 *
 * @version 1.0.0
 * @sprint Sprint 2 - Story 2.1 (Milestone Creation)
 * @author MarifetBul Development Team
 */

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar,
  DollarSign,
  ListOrdered,
} from 'lucide-react';
import { useMilestoneActions } from '@/hooks/business/useMilestones';
import { cn } from '@/lib/utils';
import type { CreateOrderMilestoneRequest } from '@/types/business/features/milestone';

// ================================================
// TYPES
// ================================================

export interface MilestoneCreationWizardProps {
  /** Order ID to create milestones for */
  orderId: string;
  /** Order total amount (for validation) */
  orderTotal: number;
  /** Currency */
  currency: string;
  /** Modal open state */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Success callback */
  onSuccess?: () => void;
}

interface MilestoneFormData {
  id: string; // Temporary ID for form management
  sequence: number;
  title: string;
  description: string;
  amount: number;
  dueDate?: string;
}

// ================================================
// CONSTANTS
// ================================================

const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_AMOUNT = 1;

// ================================================
// HELPER FUNCTIONS
// ================================================

function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency || 'TRY',
  }).format(amount);
}

// ================================================
// COMPONENT
// ================================================

export function MilestoneCreationWizard({
  orderId,
  orderTotal,
  currency,
  isOpen,
  onClose,
  onSuccess,
}: MilestoneCreationWizardProps) {
  const [milestones, setMilestones] = useState<MilestoneFormData[]>([
    {
      id: generateTempId(),
      sequence: 1,
      title: '',
      description: '',
      amount: 0,
      dueDate: '',
    },
  ]);

  const { createMilestonesBatch, isCreating } = useMilestoneActions();

  // Calculate totals
  const totalAmount = useMemo(
    () => milestones.reduce((sum, m) => sum + (m.amount || 0), 0),
    [milestones]
  );

  const remainingAmount = useMemo(
    () => orderTotal - totalAmount,
    [orderTotal, totalAmount]
  );

  // Validation
  const isValid = useMemo(() => {
    // Must have at least one milestone
    if (milestones.length === 0) return false;

    // Total must equal order total
    if (Math.abs(remainingAmount) > 0.01) return false;

    // All milestones must be valid
    return milestones.every(
      (m) =>
        m.title.trim().length >= MIN_TITLE_LENGTH &&
        m.title.trim().length <= MAX_TITLE_LENGTH &&
        m.amount >= MIN_AMOUNT
    );
  }, [milestones, remainingAmount]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setMilestones([
        {
          id: generateTempId(),
          sequence: 1,
          title: '',
          description: '',
          amount: 0,
          dueDate: '',
        },
      ]);
    }
  }, [isOpen]);

  // Add new milestone
  const handleAddMilestone = () => {
    const newMilestone: MilestoneFormData = {
      id: generateTempId(),
      sequence: milestones.length + 1,
      title: '',
      description: '',
      amount: Math.max(0, remainingAmount), // Auto-fill remaining amount
      dueDate: '',
    };
    setMilestones([...milestones, newMilestone]);
  };

  // Remove milestone
  const handleRemoveMilestone = (id: string) => {
    if (milestones.length === 1) return; // Keep at least one

    const filtered = milestones.filter((m) => m.id !== id);
    // Re-sequence
    const resequenced = filtered.map((m, index) => ({
      ...m,
      sequence: index + 1,
    }));
    setMilestones(resequenced);
  };

  // Update milestone field
  const handleUpdateMilestone = (
    id: string,
    field: keyof MilestoneFormData,
    value: string | number
  ) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    try {
      // Convert to CreateOrderMilestoneRequest (remove temp id)
      const milestoneRequests: CreateOrderMilestoneRequest[] = milestones.map(
        ({ id, ...rest }) => rest
      );

      await createMilestonesBatch(orderId, milestoneRequests);
      onSuccess?.();
      onClose();
    } catch (error) {
      logger.error('Milestone creation failed', error as Error);
      // Error toast already shown by hook
    }
  };

  // Auto-distribute remaining amount
  const handleAutoDistribute = () => {
    if (milestones.length === 0) return;

    const amountPerMilestone = Math.floor(
      (orderTotal / milestones.length) * 100
    ) / 100;
    let remaining = orderTotal;

    setMilestones((prev) =>
      prev.map((m, index) => {
        if (index === prev.length - 1) {
          // Last milestone gets the remaining (to handle rounding)
          return { ...m, amount: remaining };
        } else {
          remaining -= amountPerMilestone;
          return { ...m, amount: amountPerMilestone };
        }
      })
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5" />
            Milestone Oluştur
          </DialogTitle>
          <DialogDescription>
            Siparişi milestone&apos;lara bölerek aşamalı ödeme sistemi kurun
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Summary */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-blue-700">Toplam Tutar</p>
                <p className="text-lg font-semibold text-blue-900">
                  {formatCurrency(orderTotal, currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">
                  Milestone Toplamı
                </p>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    Math.abs(remainingAmount) < 0.01
                      ? 'text-green-900'
                      : 'text-yellow-900'
                  )}
                >
                  {formatCurrency(totalAmount, currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Kalan Tutar</p>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    Math.abs(remainingAmount) < 0.01
                      ? 'text-green-900'
                      : remainingAmount > 0
                      ? 'text-yellow-900'
                      : 'text-red-900'
                  )}
                >
                  {formatCurrency(remainingAmount, currency)}
                </p>
              </div>
            </div>

            {/* Auto-distribute button */}
            <div className="mt-3 flex items-center justify-between border-t border-blue-200 pt-3">
              <p className="text-sm text-blue-700">
                {milestones.length} milestone tanımlandı
              </p>
              <UnifiedButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAutoDistribute}
                disabled={isCreating}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Eşit Dağıt
              </UnifiedButton>
            </div>
          </div>

          {/* Milestones List */}
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{milestone.sequence}</Badge>
                    <span className="text-sm font-medium text-gray-700">
                      Milestone {milestone.sequence}
                    </span>
                  </div>
                  {milestones.length > 1 && (
                    <UnifiedButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMilestone(milestone.id)}
                      disabled={isCreating}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </UnifiedButton>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Title */}
                  <div className="sm:col-span-2">
                    <Label htmlFor={`title-${milestone.id}`} required>
                      Başlık
                    </Label>
                    <Input
                      id={`title-${milestone.id}`}
                      value={milestone.title}
                      onChange={(e) =>
                        handleUpdateMilestone(
                          milestone.id,
                          'title',
                          e.target.value.slice(0, MAX_TITLE_LENGTH)
                        )
                      }
                      placeholder="Örn: Logo Tasarımı"
                      disabled={isCreating}
                      required
                      className={cn(
                        milestone.title.trim().length > 0 &&
                          milestone.title.trim().length < MIN_TITLE_LENGTH &&
                          'border-red-300'
                      )}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {milestone.title.length}/{MAX_TITLE_LENGTH}
                      {milestone.title.trim().length > 0 &&
                        milestone.title.trim().length < MIN_TITLE_LENGTH &&
                        ` (Min ${MIN_TITLE_LENGTH} karakter)`}
                    </p>
                  </div>

                  {/* Amount */}
                  <div>
                    <Label htmlFor={`amount-${milestone.id}`} required>
                      Tutar ({currency})
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id={`amount-${milestone.id}`}
                        type="number"
                        min={MIN_AMOUNT}
                        step="0.01"
                        value={milestone.amount || ''}
                        onChange={(e) =>
                          handleUpdateMilestone(
                            milestone.id,
                            'amount',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        disabled={isCreating}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <Label htmlFor={`due-date-${milestone.id}`}>
                      Teslim Tarihi{' '}
                      <span className="text-gray-500 font-normal">
                        (İsteğe Bağlı)
                      </span>
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id={`due-date-${milestone.id}`}
                        type="date"
                        value={milestone.dueDate || ''}
                        onChange={(e) =>
                          handleUpdateMilestone(
                            milestone.id,
                            'dueDate',
                            e.target.value
                          )
                        }
                        disabled={isCreating}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <Label htmlFor={`description-${milestone.id}`}>
                      Açıklama{' '}
                      <span className="text-gray-500 font-normal">
                        (İsteğe Bağlı)
                      </span>
                    </Label>
                    <Textarea
                      id={`description-${milestone.id}`}
                      value={milestone.description || ''}
                      onChange={(e) =>
                        handleUpdateMilestone(
                          milestone.id,
                          'description',
                          e.target.value.slice(0, MAX_DESCRIPTION_LENGTH)
                        )
                      }
                      placeholder="Milestone için detaylı açıklama..."
                      rows={2}
                      disabled={isCreating}
                      className="resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {(milestone.description || '').length}/
                      {MAX_DESCRIPTION_LENGTH}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Milestone Button */}
          <UnifiedButton
            type="button"
            variant="outline"
            onClick={handleAddMilestone}
            disabled={isCreating || remainingAmount <= 0}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni Milestone Ekle
          </UnifiedButton>

          {/* Validation Messages */}
          {!isValid && milestones.length > 0 && (
            <div className="space-y-2">
              {Math.abs(remainingAmount) > 0.01 && (
                <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>
                    Milestone toplamı sipariş tutarına eşit olmalıdır. Kalan
                    tutar:{' '}
                    <span className="font-semibold">
                      {formatCurrency(remainingAmount, currency)}
                    </span>
                  </p>
                </div>
              )}

              {milestones.some(
                (m) =>
                  m.title.trim().length > 0 &&
                  m.title.trim().length < MIN_TITLE_LENGTH
              ) && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>
                    Bazı milestone başlıkları çok kısa (min {MIN_TITLE_LENGTH}{' '}
                    karakter)
                  </p>
                </div>
              )}

              {milestones.some((m) => m.amount < MIN_AMOUNT) && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>
                    Tüm milestone&apos;ların tutarı en az{' '}
                    {formatCurrency(MIN_AMOUNT, currency)} olmalıdır
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {isValid && (
            <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                Milestone&apos;lar oluşturulmaya hazır. Toplam {milestones.length}{' '}
                milestone, {formatCurrency(totalAmount, currency)} tutar.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <UnifiedButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              type="submit"
              variant="default"
              disabled={!isValid || isCreating}
              loading={isCreating}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isCreating
                ? 'Oluşturuluyor...'
                : `${milestones.length} Milestone Oluştur`}
            </UnifiedButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MilestoneCreationWizard;
