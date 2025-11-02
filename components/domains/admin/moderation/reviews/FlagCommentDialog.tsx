/**
 * ================================================
 * FLAG COMMENT DIALOG
 * ================================================
 * Modal dialog for users to flag/report comments
 *
 * Sprint: Sprint 3 - Day 3 (Moderator Dashboard Enhancement)
 * Features: Category selection, reason picker, custom reason input
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 2, 2025
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button, Label, Textarea } from '@/components/ui';
import { AlertCircle, Flag, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  type FlagCategory,
  type FlagReason,
  getCategoryLabel,
  getFlagReasonsByCategory,
  flagComment,
} from '@/lib/api/comment-flagging';
import type { BlogCommentDto } from '@/types';

// ================================================
// COMPONENT PROPS
// ================================================

export interface FlagCommentDialogProps {
  comment: BlogCommentDto;
  isOpen: boolean;
  onClose: () => void;
  onFlagSuccess?: () => void;
}

// ================================================
// MAIN COMPONENT
// ================================================

export function FlagCommentDialog({
  comment,
  isOpen,
  onClose,
  onFlagSuccess,
}: FlagCommentDialogProps) {
  // ================================================
  // STATE
  // ================================================

  const [selectedCategory, setSelectedCategory] = useState<FlagCategory | null>(
    null
  );
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ================================================
  // DERIVED STATE
  // ================================================

  const availableReasons: FlagReason[] = selectedCategory
    ? getFlagReasonsByCategory(selectedCategory)
    : [];

  const requiresCustomReason =
    selectedReason &&
    availableReasons.find((r) => r.id === selectedReason)?.id ===
      'other-custom';

  const canSubmit =
    selectedCategory &&
    selectedReason &&
    (!requiresCustomReason || customReason.trim().length >= 10);

  // ================================================
  // HANDLERS
  // ================================================

  const handleCategoryChange = (category: FlagCategory) => {
    setSelectedCategory(category);
    setSelectedReason(null);
    setCustomReason('');
    setError(null);
  };

  const handleReasonChange = (reasonId: string) => {
    setSelectedReason(reasonId);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !selectedCategory || !selectedReason) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    const reason =
      availableReasons.find((r) => r.id === selectedReason)?.label || '';
    const finalCustomReason = requiresCustomReason ? customReason : undefined;

    setIsSending(true);
    setError(null);

    try {
      await flagComment(comment.id, {
        category: selectedCategory,
        reason,
        customReason: finalCustomReason,
      });

      toast.success('Yorum başarıyla bildirildi', {
        description: 'Moderatörlerimiz en kısa sürede inceleyecektir.',
      });

      onFlagSuccess?.();
      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Bildirme işlemi başarısız oldu';
      setError(message);
      toast.error('Hata', {
        description: message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (
      (selectedCategory || selectedReason || customReason) &&
      !confirm(
        'Bildirme işlemini iptal etmek istediğinize emin misiniz? Girdiğiniz bilgiler kaybolacak.'
      )
    ) {
      return;
    }

    setSelectedCategory(null);
    setSelectedReason(null);
    setCustomReason('');
    setError(null);
    onClose();
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-orange-600" />
            Yorumu Bildir
          </DialogTitle>
          <DialogDescription>
            Bu yorumu neden bildirmek istediğinizi belirtin. Moderatörlerimiz en
            kısa sürede inceleyecektir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Comment Preview */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Bildirilen Yorum:
              </span>
              <span className="text-xs text-gray-500">
                {comment.authorName}
              </span>
            </div>
            <p className="line-clamp-3 text-sm text-gray-600">
              {comment.content}
            </p>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              1. Kategori Seçin <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(
                // Cast enum values to FlagCategory type
                [
                  'SPAM',
                  'OFFENSIVE',
                  'INAPPROPRIATE',
                  'MISINFORMATION',
                  'HARASSMENT',
                  'OFF_TOPIC',
                  'COPYRIGHT',
                  'OTHER',
                ] as FlagCategory[]
              ).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  className={`rounded-lg border-2 p-3 text-left transition-all ${
                    selectedCategory === category
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium">
                    {getCategoryLabel(category)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reason Selection */}
          {selectedCategory && availableReasons.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                2. Sebep Seçin <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                {availableReasons.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      selectedReason === reason.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="flag-reason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={() => handleReasonChange(reason.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {reason.label}
                        {reason.severity === 'high' && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                            Yüksek Öncelik
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {reason.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom Reason Input */}
          {requiresCustomReason && (
            <div className="space-y-2">
              <Label
                htmlFor="custom-reason"
                className="text-base font-semibold"
              >
                3. Açıklama Yazın <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="custom-reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Lütfen detaylı bir açıklama yazın (en az 10 karakter)..."
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between text-sm">
                <span
                  className={
                    customReason.length < 10 ? 'text-red-600' : 'text-gray-500'
                  }
                >
                  {customReason.length < 10
                    ? `En az ${10 - customReason.length} karakter daha gerekli`
                    : 'Yeterli açıklama'}
                </span>
                <span className="text-gray-500">{customReason.length}/500</span>
              </div>
            </div>
          )}

          {/* Warning Notice */}
          <div className="flex gap-3 rounded-lg bg-amber-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Önemli Bilgi:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>
                  Yanlış bildirimlerde bulunmak hesabınıza kısıtlama getirebilir
                </li>
                <li>Bildiriminiz moderatörler tarafından incelenecektir</li>
                <li>Sonuç hakkında bilgilendirme yapılacaktır</li>
              </ul>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
          >
            <X className="mr-2 h-4 w-4" />
            İptal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isSending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSending ? 'Gönderiliyor...' : 'Bildirimi Gönder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
