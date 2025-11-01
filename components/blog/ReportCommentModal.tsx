/**
 * ================================================
 * REPORT COMMENT MODAL
 * ================================================
 * Modal for reporting inappropriate comments
 *
 * Features:
 * - Pre-defined report reasons
 * - Optional description field
 * - API integration with blog.reportComment
 * - Success/error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 4 Story 4.1
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
import { Button } from '@/components/ui';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { AlertCircle, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { reportComment } from '@/lib/api/blog';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// TYPES
// ================================================

export type CommentReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'inappropriate_content'
  | 'misinformation'
  | 'off_topic'
  | 'other';

interface ReportCommentModalProps {
  commentId: number;
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted?: () => void;
}

// ================================================
// CONSTANTS
// ================================================

const REPORT_REASONS: Array<{
  value: CommentReportReason;
  label: string;
  description: string;
}> = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Tanıtım, reklam veya alakasız içerik',
  },
  {
    value: 'harassment',
    label: 'Taciz veya Zorbalık',
    description: 'Kişiye yönelik hakaret, tehdit veya zorbalık',
  },
  {
    value: 'hate_speech',
    label: 'Nefret Söylemi',
    description: 'Ayrımcı, ırkçı veya nefret içerikli ifadeler',
  },
  {
    value: 'inappropriate_content',
    label: 'Uygunsuz İçerik',
    description: 'Müstehcen, şiddet içeren veya rahatsız edici içerik',
  },
  {
    value: 'misinformation',
    label: 'Yanlış Bilgi',
    description: 'Kasıtlı olarak yanıltıcı veya yanlış bilgi',
  },
  {
    value: 'off_topic',
    label: 'Konu Dışı',
    description: 'Blog yazısı ile ilgisiz yorum',
  },
  {
    value: 'other',
    label: 'Diğer',
    description: 'Yukarıdaki kategorilere uymayan başka bir sebep',
  },
];

// ================================================
// COMPONENT
// ================================================

export function ReportCommentModal({
  commentId,
  isOpen,
  onClose,
  onReportSubmitted,
}: ReportCommentModalProps) {
  const [selectedReason, setSelectedReason] =
    useState<CommentReportReason>('spam');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      toast.error('Lütfen bir sebep seçin');
      return;
    }

    // For 'other' reason, description is required
    if (selectedReason === 'other' && !description.trim()) {
      toast.error('Lütfen "Diğer" sebebi için açıklama yazın');
      return;
    }

    setIsSubmitting(true);

    try {
      // Construct reason string with optional description
      const reasonText = description.trim()
        ? `${selectedReason}: ${description.trim()}`
        : selectedReason;

      await reportComment(commentId, reasonText);

      toast.success('Şikayet Gönderildi', {
        description: 'Yorumunuz incelenmek üzere alındı. Teşekkür ederiz.',
      });

      // Reset form
      setSelectedReason('spam');
      setDescription('');

      // Callback
      onReportSubmitted?.();

      // Close modal
      onClose();
    } catch (error) {
      logger.error('Failed to report comment:', error);
      toast.error('Şikayet Gönderilemedi', {
        description:
          error instanceof Error
            ? error.message
            : 'Bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedReason('spam');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            Yorumu Şikayet Et
          </DialogTitle>
          <DialogDescription>
            Bu yorumu neden şikayet etmek istediğinizi belirtin. Tüm şikayetler
            moderatörlerimiz tarafından incelenir.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Report Reason Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Şikayet Sebebi *
              </Label>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <div
                    key={reason.value}
                    className="flex items-start space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      id={reason.value}
                      name="reportReason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) =>
                        setSelectedReason(e.target.value as CommentReportReason)
                      }
                      className="mt-0.5 h-4 w-4 cursor-pointer text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={reason.value}
                        className="cursor-pointer font-medium"
                      >
                        {reason.label}
                      </Label>
                      <p className="text-sm text-gray-500">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Açıklama {selectedReason === 'other' && '*'}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  selectedReason === 'other'
                    ? 'Lütfen şikayet sebebinizi açıklayın...'
                    : 'İsteğe bağlı: Ek açıklama yazabilirsiniz...'
                }
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {description.length}/500 karakter
              </p>
            </div>

            {/* Warning Message */}
            <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">Önemli Hatırlatma</p>
                <p className="mt-1 text-xs">
                  Kasıtlı olarak yanlış şikayet yapmak hesabınızın askıya
                  alınmasına neden olabilir.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? 'Gönderiliyor...' : 'Şikayet Gönder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
