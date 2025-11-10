'use client';

/**
 * ================================================
 * MILESTONE EDIT FORM
 * ================================================
 * Form for editing milestone details before delivery
 *
 * Features:
 * - Edit title, description, amount, due date
 * - Cannot edit if status is DELIVERED or beyond
 * - Validation (title length, amount min)
 * - API integration with updateMilestone
 * - Production-ready error handling
 *
 * @version 1.0.0
 * @sprint Sprint 2 - Story 2.2 (Milestone Editing)
 * @author MarifetBul Development Team
 */

import React, { useState } from 'react';
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
  Edit3,
  AlertTriangle,
  Calendar,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { useMilestoneActions } from '@/hooks/business/useMilestones';
import { cn } from '@/lib/utils';
import type { OrderMilestone } from '@/types/business/features/milestone';
import type { UpdateOrderMilestoneRequest } from '@/types/business/features/milestone';

// ================================================
// TYPES
// ================================================

export interface MilestoneEditFormProps {
  /** Milestone to edit */
  milestone: OrderMilestone;
  /** Currency */
  currency: string;
  /** Modal open state */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Success callback */
  onSuccess?: (milestone: OrderMilestone) => void;
}

// ================================================
// CONSTANTS
// ================================================

const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_AMOUNT = 1;

// Non-editable statuses
const NON_EDITABLE_STATUSES = ['DELIVERED', 'ACCEPTED', 'CANCELED'];

// ================================================
// COMPONENT
// ================================================

export function MilestoneEditForm({
  milestone,
  currency,
  isOpen,
  onClose,
  onSuccess,
}: MilestoneEditFormProps) {
  const [title, setTitle] = useState(milestone.title);
  const [description, setDescription] = useState(milestone.description || '');
  const [amount, setAmount] = useState(milestone.amount);
  const [dueDate, setDueDate] = useState(
    milestone.dueDate ? milestone.dueDate.split('T')[0] : ''
  );

  const { updateMilestone, isUpdating } = useMilestoneActions();

  // Check if editable
  const isEditable = !NON_EDITABLE_STATUSES.includes(milestone.status);

  // Reset form when modal opens with new milestone
  React.useEffect(() => {
    if (isOpen) {
      setTitle(milestone.title);
      setDescription(milestone.description || '');
      setAmount(milestone.amount);
      setDueDate(milestone.dueDate ? milestone.dueDate.split('T')[0] : '');
    }
  }, [isOpen, milestone]);

  // Validation
  const isValid =
    title.trim().length >= MIN_TITLE_LENGTH &&
    title.trim().length <= MAX_TITLE_LENGTH &&
    amount >= MIN_AMOUNT &&
    description.length <= MAX_DESCRIPTION_LENGTH;

  // Check if changed
  const hasChanges =
    title.trim() !== milestone.title ||
    description.trim() !== (milestone.description || '') ||
    amount !== milestone.amount ||
    (dueDate || '') !== (milestone.dueDate ? milestone.dueDate.split('T')[0] : '');

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || !hasChanges || !isEditable) return;

    try {
      const updateData: UpdateOrderMilestoneRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        amount,
        dueDate: dueDate || undefined,
      };

      const updated = await updateMilestone(milestone.id, updateData);
      onSuccess?.(updated);
      onClose();
    } catch (error) {
      logger.error('Milestone update failed', error as Error);
      // Error toast already shown by hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Milestone Düzenle
          </DialogTitle>
          <DialogDescription>
            Milestone detaylarını düzenleyin
          </DialogDescription>
        </DialogHeader>

        {/* Non-editable warning */}
        {!isEditable && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="text-sm">
              <p className="font-medium text-red-900">Düzenlenemez</p>
              <p className="mt-1 text-red-700">
                Bu milestone {milestone.status} durumunda olduğu için
                düzenlenemez. Sadece PENDING veya IN_PROGRESS durumundaki
                milestone&apos;lar düzenlenebilir.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Milestone Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Milestone #{milestone.sequence}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant={
                      milestone.status === 'PENDING'
                        ? 'secondary'
                        : milestone.status === 'IN_PROGRESS'
                        ? 'default'
                        : 'outline'
                    }
                  >
                    {milestone.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: currency || 'TRY',
                    }).format(milestone.amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" required>
              Başlık
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
              placeholder="Milestone başlığı"
              disabled={isUpdating || !isEditable}
              required
              className={cn(
                title.trim().length > 0 &&
                  title.trim().length < MIN_TITLE_LENGTH &&
                  'border-red-300'
              )}
            />
            <p className="mt-1 text-xs text-gray-500">
              {title.length}/{MAX_TITLE_LENGTH}
              {title.trim().length > 0 &&
                title.trim().length < MIN_TITLE_LENGTH &&
                ` (Min ${MIN_TITLE_LENGTH} karakter)`}
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              Açıklama{' '}
              <span className="text-gray-500 font-normal">(İsteğe Bağlı)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))
              }
              placeholder="Milestone için detaylı açıklama..."
              rows={4}
              disabled={isUpdating || !isEditable}
              className="resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </p>
          </div>

          {/* Amount and Due Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Amount */}
            <div>
              <Label htmlFor="amount" required>
                Tutar ({currency})
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  min={MIN_AMOUNT}
                  step="0.01"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  disabled={isUpdating || !isEditable}
                  required
                  className="pl-10"
                />
              </div>
              {amount < MIN_AMOUNT && (
                <p className="mt-1 text-xs text-red-600">
                  Minimum tutar:{' '}
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: currency || 'TRY',
                  }).format(MIN_AMOUNT)}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="due-date">
                Teslim Tarihi{' '}
                <span className="text-gray-500 font-normal">(İsteğe Bağlı)</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isUpdating || !isEditable}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Warning if no changes */}
          {!hasChanges && isEditable && (
            <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <p>Herhangi bir değişiklik yapmadınız.</p>
            </div>
          )}

          {/* Success message */}
          {isValid && hasChanges && isEditable && (
            <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>Değişiklikler kaydedilmeye hazır.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <UnifiedButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              type="submit"
              variant="default"
              disabled={!isValid || !hasChanges || !isEditable || isUpdating}
              loading={isUpdating}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isUpdating ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </UnifiedButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MilestoneEditForm;
