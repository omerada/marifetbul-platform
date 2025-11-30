'use client';

/**
 * ================================================
 * CREATE MILESTONE FORM COMPONENT
 * ================================================
 * Form for creating milestones for an existing order
 *
 * Features:
 * - Dynamic milestone rows (add/remove)
 * - Total amount validation (must equal order total)
 * - Due date picker
 * - Sequence auto-assignment
 * - Batch creation API call
 *
 * Sprint: Sprint 1 - Milestone Payment System
 * Story: 1.7 - CreateMilestoneForm (8 pts)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { useMilestoneActions } from '@/hooks/business/useMilestones';
import type { CreateOrderMilestoneRequest } from '@/types/business/features/milestone';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateMilestoneFormProps {
  /** Order ID to create milestones for */
  orderId: string;
  /** Total order amount (for validation) */
  orderTotal: number;
  /** Currency code */
  currency?: string;
  /** Callback on successful creation */
  onSuccess?: (milestones: unknown[]) => void;
  /** Callback on cancel */
  onCancel?: () => void;
  /** Form wrapper class */
  className?: string;
}

interface MilestoneFormRow {
  id: string;
  title: string;
  description: string;
  amount: string;
  dueDate: string;
  errors: {
    title?: string;
    description?: string;
    amount?: string;
    dueDate?: string;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 255;
const MIN_DESCRIPTION_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 2000;
const MIN_AMOUNT = 1;

// ============================================================================
// COMPONENT
// ============================================================================

export function CreateMilestoneForm({
  orderId,
  orderTotal,
  currency = 'TRY',
  onSuccess,
  onCancel,
  className = '',
}: CreateMilestoneFormProps) {
  const { createMilestonesBatch, isCreating } = useMilestoneActions();

  // ========== STATE ==========

  const [milestones, setMilestones] = useState<MilestoneFormRow[]>([
    {
      id: '1',
      title: '',
      description: '',
      amount: '',
      dueDate: '',
      errors: {},
    },
  ]);

  const [globalError, setGlobalError] = useState<string>('');

  // ========== CALCULATIONS ==========

  const totalAmount = milestones.reduce((sum, m) => {
    const amount = parseFloat(m.amount) || 0;
    return sum + amount;
  }, 0);

  const remainingAmount = orderTotal - totalAmount;
  const isAmountValid = Math.abs(remainingAmount) < 0.01;

  // ========== HANDLERS ==========

  const addMilestone = useCallback(() => {
    const newId = (milestones.length + 1).toString();
    setMilestones((prev) => [
      ...prev,
      {
        id: newId,
        title: '',
        description: '',
        amount: '',
        dueDate: '',
        errors: {},
      },
    ]);
    setGlobalError('');
  }, [milestones.length]);

  const removeMilestone = useCallback((id: string) => {
    setMilestones((prev) => {
      // Can't remove if only one milestone left
      if (prev.length === 1) {
        return prev;
      }
      return prev.filter((m) => m.id !== id);
    });
    setGlobalError('');
  }, []);

  const updateMilestone = useCallback(
    (id: string, field: keyof MilestoneFormRow, value: string) => {
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                [field]: value,
                errors: {
                  ...m.errors,
                  [field]: undefined, // Clear error on change
                },
              }
            : m
        )
      );
      setGlobalError('');
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const updatedMilestones = milestones.map((m) => {
      const errors: MilestoneFormRow['errors'] = {};

      // Title validation
      if (!m.title.trim()) {
        errors.title = 'Başlık gereklidir';
        isValid = false;
      } else if (m.title.length < MIN_TITLE_LENGTH) {
        errors.title = `En az ${MIN_TITLE_LENGTH} karakter olmalıdır`;
        isValid = false;
      } else if (m.title.length > MAX_TITLE_LENGTH) {
        errors.title = `En fazla ${MAX_TITLE_LENGTH} karakter olabilir`;
        isValid = false;
      }

      // Description validation
      if (!m.description.trim()) {
        errors.description = 'Açıklama gereklidir';
        isValid = false;
      } else if (m.description.length < MIN_DESCRIPTION_LENGTH) {
        errors.description = `En az ${MIN_DESCRIPTION_LENGTH} karakter olmalıdır`;
        isValid = false;
      } else if (m.description.length > MAX_DESCRIPTION_LENGTH) {
        errors.description = `En fazla ${MAX_DESCRIPTION_LENGTH} karakter olabilir`;
        isValid = false;
      }

      // Amount validation
      const amount = parseFloat(m.amount);
      if (!m.amount || isNaN(amount)) {
        errors.amount = 'Tutar gereklidir';
        isValid = false;
      } else if (amount < MIN_AMOUNT) {
        errors.amount = `En az ${MIN_AMOUNT} olmalıdır`;
        isValid = false;
      }

      // Due date validation (optional but must be valid format if provided)
      if (m.dueDate) {
        const dueDate = new Date(m.dueDate);
        const now = new Date();
        if (isNaN(dueDate.getTime())) {
          errors.dueDate = 'Geçersiz tarih formatı';
          isValid = false;
        } else if (dueDate < now) {
          errors.dueDate = 'Tarih gelecekte olmalıdır';
          isValid = false;
        }
      }

      return { ...m, errors };
    });

    setMilestones(updatedMilestones);

    // Validate total amount
    if (!isAmountValid) {
      setGlobalError(
        `Milestone toplamı sipariş tutarına eşit olmalıdır (${remainingAmount.toFixed(2)} ${currency} fark var)`
      );
      isValid = false;
    }

    return isValid;
  }, [milestones, isAmountValid, remainingAmount, currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    logger.info('[CreateMilestoneForm] Submitting form');

    // Validate
    if (!validateForm()) {
      logger.warn('[CreateMilestoneForm] Validation failed');
      return;
    }

    // Prepare data
    const milestonesData: CreateOrderMilestoneRequest[] = milestones.map(
      (m, index) => ({
        sequence: index + 1,
        title: m.title.trim(),
        description: m.description.trim(),
        amount: parseFloat(m.amount),
        dueDate: m.dueDate ? new Date(m.dueDate).toISOString() : undefined,
      })
    );

    try {
      const result = await createMilestonesBatch(orderId, milestonesData);
      logger.info('[CreateMilestoneForm] Milestones created successfully');
      toast.success("Milestone'lar oluşturuldu", {
        description: `${milestones.length} milestone başarıyla oluşturuldu`,
      });
      onSuccess?.(result);
    } catch (error) {
      logger.error(
        '[CreateMilestoneForm] Failed to create milestones',
        error instanceof Error ? error : new Error(String(error))
      );
      setGlobalError(
        error instanceof Error ? error.message : "Milestone'lar oluşturulamadı"
      );
    }
  };

  const handleCancel = () => {
    logger.info('[CreateMilestoneForm] Form cancelled');
    onCancel?.();
  };

  // ========== RENDER ==========

  return (
    <Card className={`p-6 ${className}`}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Milestone Oluştur
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Siparişi aşamalara bölerek her aşama için ödeme planı oluşturun
          </p>
        </div>

        {/* Total Summary */}
        <div className="mb-6 rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-900">
                Sipariş Toplamı
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {orderTotal.toFixed(2)} {currency}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-purple-900">
                Milestone Toplamı
              </p>
              <p
                className={`text-2xl font-bold ${
                  isAmountValid ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {totalAmount.toFixed(2)} {currency}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-purple-900">Kalan</p>
              <p
                className={`text-2xl font-bold ${
                  isAmountValid ? 'text-green-600' : 'text-amber-600'
                }`}
              >
                {remainingAmount.toFixed(2)} {currency}
              </p>
            </div>
            {isAmountValid && (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
        </div>

        {/* Global Error */}
        {globalError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{globalError}</p>
          </div>
        )}

        {/* Milestone Rows */}
        <div className="mb-6 space-y-4">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Milestone #{index + 1}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMilestone(milestone.id)}
                  disabled={milestones.length === 1 || isCreating}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Başlık
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={milestone.title}
                    onChange={(e) =>
                      updateMilestone(milestone.id, 'title', e.target.value)
                    }
                    placeholder="Örn: Tasarım Onayı"
                    maxLength={MAX_TITLE_LENGTH}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-purple-500 ${
                      milestone.errors.title
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    disabled={isCreating}
                  />
                  {milestone.errors.title && (
                    <p className="mt-1 text-xs text-red-600">
                      {milestone.errors.title}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {milestone.title.length}/{MAX_TITLE_LENGTH}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Açıklama
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <textarea
                    value={milestone.description}
                    onChange={(e) =>
                      updateMilestone(
                        milestone.id,
                        'description',
                        e.target.value
                      )
                    }
                    placeholder="Bu milestone'da yapılacak işleri detaylı olarak açıklayın..."
                    rows={3}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    className={`w-full resize-none rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-purple-500 ${
                      milestone.errors.description
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    disabled={isCreating}
                  />
                  {milestone.errors.description && (
                    <p className="mt-1 text-xs text-red-600">
                      {milestone.errors.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {milestone.description.length}/{MAX_DESCRIPTION_LENGTH}
                  </p>
                </div>

                {/* Amount & Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Tutar ({currency})
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min={MIN_AMOUNT}
                        value={milestone.amount}
                        onChange={(e) =>
                          updateMilestone(
                            milestone.id,
                            'amount',
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        className={`w-full rounded-lg border py-2 pr-3 pl-9 text-sm focus:border-transparent focus:ring-2 focus:ring-purple-500 ${
                          milestone.errors.amount
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                        disabled={isCreating}
                      />
                    </div>
                    {milestone.errors.amount && (
                      <p className="mt-1 text-xs text-red-600">
                        {milestone.errors.amount}
                      </p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Teslim Tarihi (İsteğe Bağlı)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={milestone.dueDate}
                        onChange={(e) =>
                          updateMilestone(
                            milestone.id,
                            'dueDate',
                            e.target.value
                          )
                        }
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full rounded-lg border py-2 pr-3 pl-9 text-sm focus:border-transparent focus:ring-2 focus:ring-purple-500 ${
                          milestone.errors.dueDate
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                        disabled={isCreating}
                      />
                    </div>
                    {milestone.errors.dueDate && (
                      <p className="mt-1 text-xs text-red-600">
                        {milestone.errors.dueDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Milestone Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addMilestone}
          disabled={isCreating}
          className="mb-6 w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Milestone Ekle
        </Button>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
            >
              İptal
            </Button>
          )}
          <Button
            type="submit"
            disabled={isCreating || !isAmountValid}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {milestones.length} Milestone Oluştur
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default CreateMilestoneForm;
