/**
 * Modal for employer to request revision on delivered work
 * Sends work back to freelancer with specific revision requirements
 */

'use client';

import React, { useState, useCallback } from 'react';
import { X, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { useOrder } from '@/hooks/business/useOrder';

interface RequestRevisionModalProps {
  orderId: string;
  orderTitle: string;
  currentRevisionCount: number;
  maxRevisions: number;
  deliveryNote?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RequestRevisionModal({
  orderId,
  orderTitle,
  currentRevisionCount,
  maxRevisions,
  deliveryNote,
  isOpen,
  onClose,
  onSuccess,
}: RequestRevisionModalProps) {
  const [revisionNote, setRevisionNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { requestRevision, isLoading } = useOrder({
    onSuccess: () => {
      onSuccess?.();
      handleClose();
    },
  });

  const handleClose = useCallback(() => {
    if (isLoading) return;
    setRevisionNote('');
    setError(null);
    onClose();
  }, [isLoading, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!revisionNote.trim()) {
        setError('Lütfen revizyon detaylarını yazın');
        return;
      }

      if (currentRevisionCount >= maxRevisions) {
        setError(`Maksimum revizyon sayısına (${maxRevisions}) ulaşıldı`);
        return;
      }

      try {
        await requestRevision(orderId, { revisionNote: revisionNote.trim() });
      } catch {
        // Error is handled in the hook
      }
    },
    [orderId, revisionNote, currentRevisionCount, maxRevisions, requestRevision]
  );

  const remainingRevisions = maxRevisions - currentRevisionCount;

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Revizyon Talep Et
            </h2>
            <p className="mt-1 text-sm text-gray-600">{orderTitle}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Revision Count Info */}
          <div
            className={`rounded-lg border p-4 ${
              remainingRevisions <= 1
                ? 'border-red-200 bg-red-50'
                : 'border-blue-200 bg-blue-50'
            }`}
          >
            <div className="flex gap-3">
              <AlertCircle
                className={`h-5 w-5 flex-shrink-0 ${
                  remainingRevisions <= 1 ? 'text-red-600' : 'text-blue-600'
                }`}
              />
              <div className="flex-1">
                <h3
                  className={`font-medium ${
                    remainingRevisions <= 1 ? 'text-red-900' : 'text-blue-900'
                  }`}
                >
                  Revizyon Hakkı
                </h3>
                <p
                  className={`mt-2 text-sm ${
                    remainingRevisions <= 1 ? 'text-red-800' : 'text-blue-800'
                  }`}
                >
                  <strong>{remainingRevisions}</strong> / {maxRevisions}{' '}
                  revizyon hakkı kaldı
                </p>
                {remainingRevisions <= 1 && (
                  <p className="mt-2 text-sm text-red-800">
                    Bu son revizyon hakkınız. Dikkatli değerlendirin.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Previous Delivery Note */}
          {deliveryNote && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-medium text-gray-900">
                Freelancer&apos;ın Teslimat Notu
              </h3>
              <p className="mt-2 text-sm whitespace-pre-wrap text-gray-700">
                {deliveryNote}
              </p>
            </div>
          )}

          {/* Revision Note */}
          <div>
            <Label htmlFor="revisionNote" className="mb-2">
              Revizyon Detayları <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="revisionNote"
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="Nelerin değiştirilmesi gerektiğini detaylı açıklayın..."
              rows={8}
              className="w-full"
              disabled={isLoading}
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Freelancer&apos;ın işi doğru yapabilmesi için net ve açık
              talimatlar verin
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Revizyon Süreci</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>
                    Talep gönderildiğinde sipariş tekrar &quot;devam
                    ediyor&quot; durumuna geçer
                  </li>
                  <li>Freelancer revize edilmiş işi tekrar teslim edecek</li>
                  <li>Ödeme escrow hesabında kalır</li>
                  <li>Net talimatlar revizyon süresini kısaltır</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || currentRevisionCount >= maxRevisions}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Revizyon Talep Et
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
