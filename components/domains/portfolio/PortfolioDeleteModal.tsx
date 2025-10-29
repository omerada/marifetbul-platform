/**
 * Portfolio Delete Modal
 * Sprint 1: Story 1.5 - Portfolio CRUD UI
 *
 * Confirmation dialog for deleting portfolio items
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { usePortfolio } from '@/hooks/business/portfolio/usePortfolio';
import type { PortfolioResponse } from '@/lib/api/portfolio';

// ============================================================================
// COMPONENT
// ============================================================================

interface PortfolioDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  portfolio: PortfolioResponse | null;
}

export function PortfolioDeleteModal({
  isOpen,
  onClose,
  onSuccess,
  portfolio,
}: PortfolioDeleteModalProps) {
  const { deleteExistingPortfolio, isDeleting } = usePortfolio();
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (!portfolio?.id) {
      toast.error('Portfolio bulunamadı');
      return;
    }

    // Require user to type "SIL" to confirm
    if (confirmText !== 'SIL') {
      toast.error('Lütfen "SIL" yazarak onaylayın');
      return;
    }

    const success = await deleteExistingPortfolio(portfolio.id);

    if (success) {
      setConfirmText('');
      onSuccess?.();
      onClose();
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmText('');
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isDeleting]);

  if (!isOpen || !portfolio) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          handleClose();
        }
      }}
    >
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
            <h2
              id="delete-modal-title"
              className="text-xl font-semibold text-red-600"
            >
              Portfolio Sil
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="rounded-full p-1 hover:bg-gray-100"
            aria-label="Modalı kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Warning Message */}
          <div
            id="delete-modal-description"
            className="rounded-lg border border-red-200 bg-red-50 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                aria-hidden="true"
              />
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-red-800">
                  Dikkat! Bu işlem geri alınamaz
                </h3>
                <p className="text-sm text-red-700">
                  Bu portfolio kalıcı olarak silinecektir. Tüm görseller ve
                  veriler kaybolacaktır.
                </p>
              </div>
            </div>
          </div>

          {/* Portfolio Info */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <h4 className="mb-1 font-medium text-gray-900">
              {portfolio.title}
            </h4>
            <p className="line-clamp-2 text-sm text-gray-600">
              {portfolio.description}
            </p>
            {portfolio.images && portfolio.images.length > 0 && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <span>{portfolio.images.length} görsel</span>
                {portfolio.skills && portfolio.skills.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{portfolio.skills.length} yetenek</span>
                  </>
                )}
                {portfolio.viewCount > 0 && (
                  <>
                    <span>•</span>
                    <span>{portfolio.viewCount} görüntülenme</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Onaylamak için <span className="font-bold text-red-600">SIL</span>{' '}
              yazın:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="SIL"
              disabled={isDeleting}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500"
              autoComplete="off"
            />
            {confirmText && confirmText !== 'SIL' && (
              <p className="mt-1 text-sm text-red-500">
                Lütfen tam olarak &quot;SIL&quot; yazın
              </p>
            )}
          </div>

          {/* Cascade Delete Info */}
          <div className="space-y-1 text-xs text-gray-500">
            <p className="font-medium">Silinecek veriler:</p>
            <ul className="ml-2 list-inside list-disc space-y-0.5">
              <li>Portfolio başlık ve açıklama</li>
              <li>Tüm görsel dosyaları</li>
              <li>İlişkili yetenekler</li>
              <li>Görüntülenme istatistikleri</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t bg-gray-50 p-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            İptal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || confirmText !== 'SIL'}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Siliniyor...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Kalıcı Olarak Sil
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default PortfolioDeleteModal;
