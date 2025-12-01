/**
 * ================================================
 * GDPR DATA MANAGEMENT PANEL
 * ================================================
 * Sprint 1: Security & Compliance - Story 4
 *
 * User interface for GDPR/KVKK data rights:
 * - Export personal data
 * - Request account deletion
 * - View data processing information
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-26
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Alert, AlertDescription } from '@/components/ui';
import {
  Download,
  Trash2,
  Shield,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  Info,
} from 'lucide-react';
import { apiClient } from '@/lib/infrastructure/api/client';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface GDPRDataManagementProps {
  /** Show as full page or embedded card */
  variant?: 'full' | 'card';
}

interface ExportStatus {
  status: 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  requestId?: string;
  downloadUrl?: string;
  createdAt?: string;
  completedAt?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * GDPRDataManagement Component
 *
 * Interface for users to exercise their GDPR/KVKK rights.
 *
 * @example
 * ```tsx
 * // In user settings
 * <GDPRDataManagement variant="card" />
 * ```
 */
export function GDPRDataManagement({
  variant = 'card',
}: GDPRDataManagementProps) {
  const [exportStatus, setExportStatus] = useState<ExportStatus>({
    status: 'IDLE',
  });
  const [isExporting, setIsExporting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Request data export
   */
  const handleRequestExport = async () => {
    try {
      setIsExporting(true);

      const response = await apiClient.post<{
        requestId: string;
        status: string;
        message: string;
      }>('/api/v1/user/data/export');

      setExportStatus({
        status: 'PROCESSING',
        requestId: response.requestId,
      });

      toast.success('Verileriniz Hazırlanıyor', {
        description: response.message,
      });

      logger.info('[GDPR] Data export requested');

      // Check status after 5 seconds
      setTimeout(() => checkExportStatus(), 5000);
    } catch (error) {
      logger.error('[GDPR] Failed to request data export', error as Error);
      toast.error('Hata', {
        description: 'Veri dışa aktarımı başlatılamadı. Lütfen tekrar deneyin.',
      });
      setExportStatus({ status: 'FAILED' });
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Check export status
   */
  const checkExportStatus = async () => {
    try {
      const response = await apiClient.get<{
        status: string;
        requestId: string;
        downloadUrl?: string;
        completedAt?: string;
      }>('/api/v1/user/data/export/status');

      if (response.status === 'COMPLETED') {
        setExportStatus({
          status: 'COMPLETED',
          requestId: response.requestId,
          downloadUrl: response.downloadUrl,
          completedAt: response.completedAt,
        });

        toast.success('Verileriniz Hazır', {
          description:
            'İndirme için hazır. Dosya 7 gün boyunca erişilebilir olacak.',
        });
      } else if (response.status === 'PROCESSING') {
        // Check again after 10 seconds
        setTimeout(() => checkExportStatus(), 10000);
      }
    } catch (error) {
      logger.error('[GDPR] Failed to check export status', error as Error);
    }
  };

  /**
   * Download exported data
   */
  const handleDownload = async () => {
    if (!exportStatus.downloadUrl) return;

    try {
      window.open(exportStatus.downloadUrl, '_blank');

      toast.success('İndiriliyor', {
        description: 'Verileriniz indirilmeye başlandı.',
      });

      logger.info('[GDPR] Data export downloaded');
    } catch (error) {
      logger.error('[GDPR] Failed to download export', error as Error);
      toast.error('Hata', {
        description: 'Dosya indirilemedi. Lütfen tekrar deneyin.',
      });
    }
  };

  /**
   * Request account deletion
   */
  const handleRequestDeletion = async () => {
    if (!deletePassword) {
      toast.error('Şifre Gerekli', {
        description: 'Lütfen şifrenizi girin.',
      });
      return;
    }

    try {
      setIsDeleting(true);

      // Note: DELETE requests typically don't have body, using POST instead
      const response = await apiClient.post<{
        status: string;
        message: string;
      }>('/api/v1/user/data/account/delete', {
        password: deletePassword,
        reason: deleteReason || 'No reason provided',
      });

      toast.success('Doğrulama Kodu Gönderildi', {
        description: response.message,
        duration: 10000,
      });

      setShowDeleteConfirm(false);
      setDeletePassword('');
      setDeleteReason('');

      logger.warn('[GDPR] Account deletion requested');
    } catch (error) {
      logger.error('[GDPR] Failed to request account deletion', error as Error);
      toast.error('Hata', {
        description:
          'Hesap silme isteği başlatılamadı. Şifrenizi kontrol edin.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>GDPR & KVKK Hakları:</strong> Kişisel verilerinizi dışa
          aktarabilir veya hesabınızı silebilirsiniz. Bu işlemler Avrupa Birliği
          GDPR ve Türkiye KVKK mevzuatına uygun olarak gerçekleştirilir.
        </AlertDescription>
      </Alert>

      {/* Data Export Section */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-green-100 p-3">
            <Download className="h-6 w-6 text-green-600" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Verilerimi İndir
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Tüm kişisel verilerinizi JSON formatında indirin. (GDPR Madde 15 &
              20)
            </p>

            {/* Export Status */}
            {exportStatus.status === 'PROCESSING' && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 animate-pulse text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      Verileriniz Hazırlanıyor
                    </p>
                    <p className="text-sm text-blue-700">
                      Bu işlem birkaç dakika sürebilir. Hazır olduğunda bildirim
                      alacaksınız.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {exportStatus.status === 'COMPLETED' && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">
                        Verileriniz Hazır
                      </p>
                      <p className="text-sm text-green-700">
                        İndirme için hazır. 7 gün boyunca erişilebilir.
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleDownload} size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    İndir
                  </Button>
                </div>
              </div>
            )}

            {/* Export Button */}
            <div className="mt-4">
              <Button
                onClick={handleRequestExport}
                disabled={isExporting || exportStatus.status === 'PROCESSING'}
                variant="outline"
              >
                <FileText className="mr-2 h-4 w-4" />
                {isExporting ? 'Hazırlanıyor...' : 'Veri Dışa Aktarımı Başlat'}
              </Button>
            </div>

            {/* What's included */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Hangi veriler dahil?
              </summary>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
                <li>Profil bilgileri (ad, e-posta, telefon, vb.)</li>
                <li>Sipariş geçmişi</li>
                <li>Mesajlar</li>
                <li>Değerlendirmeler</li>
                <li>Finansal işlemler</li>
                <li>Hesap ayarları</li>
              </ul>
            </details>
          </div>
        </div>
      </Card>

      {/* Account Deletion Section */}
      <Card className="border-red-200 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-red-100 p-3">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Hesabımı Sil
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Hesabınızı ve tüm verilerinizi kalıcı olarak silin. (GDPR Madde
              17)
            </p>

            {/* Warning */}
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription>
                <strong>Dikkat:</strong> Bu işlem geri alınamaz. Hesabınız
                silindiğinde tüm verileriniz anonimleştirilir ve geri
                getirilemez.
              </AlertDescription>
            </Alert>

            {/* Delete Confirmation */}
            {!showDeleteConfirm ? (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
                className="mt-4"
              >
                <Shield className="mr-2 h-4 w-4" />
                Hesap Silme İsteği Başlat
              </Button>
            ) : (
              <div className="mt-4 space-y-4 rounded-lg border-2 border-red-200 bg-red-50 p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Şifreniz *
                  </label>
                  <Input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Onaylamak için şifrenizi girin"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Silme Sebebi (İsteğe Bağlı)
                  </label>
                  <Input
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Neden hesabınızı silmek istiyorsunuz?"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword('');
                      setDeleteReason('');
                    }}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRequestDeletion}
                    disabled={isDeleting || !deletePassword}
                    className="flex-1"
                  >
                    {isDeleting ? 'İşleniyor...' : 'Hesabı Sil'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  if (variant === 'full') {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Veri Yönetimi</h1>
          <p className="mt-2 text-gray-600">
            Kişisel verilerinizi yönetin ve haklarınızı kullanın
          </p>
        </div>
        {content}
      </div>
    );
  }

  return content;
}

export default GDPRDataManagement;
