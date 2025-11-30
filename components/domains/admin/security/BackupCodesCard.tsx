/**
 * ================================================
 * BACKUP CODES CARD
 * ================================================
 * Component for displaying and managing 2FA backup codes
 *
 * Features:
 * - Display remaining backup codes
 * - Download codes (PDF/TXT)
 * - Regenerate codes
 * - Print functionality
 *
 * @version 1.0.0
 * @sprint Sprint 2: Admin 2FA System
 * @story Story 1.4: Backup Codes Management
 * @author MarifetBul Development Team
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Alert, AlertDescription } from '@/components/ui';
import {
  Key,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Copy,
  Printer,
} from 'lucide-react';
import { useTwoFactor } from '@/hooks/business/useTwoFactor';
import { formatRecoveryCode } from '@/lib/api/two-factor';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * BackupCodesCard Component
 */
export function BackupCodesCard() {
  const {
    recoveryCodes,
    fetchRecoveryCodes,
    generateRecoveryCodes,
    isLoading,
  } = useTwoFactor();

  const [showCodes, setShowCodes] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Fetch codes on mount
  useEffect(() => {
    fetchRecoveryCodes();
  }, [fetchRecoveryCodes]);

  const handleDownloadTXT = () => {
    if (!recoveryCodes?.codes) return;

    const content = `MarifetBul - 2FA Yedek Kodlar
Oluşturulma: ${new Date(recoveryCodes.generatedAt).toLocaleString('tr-TR')}

ÖNEMLİ: Bu kodları güvenli bir yerde saklayın!
Her kod yalnızca bir kez kullanılabilir.

Yedek Kodlar:
${recoveryCodes.codes.map((code, i) => `${i + 1}. ${formatRecoveryCode(code)}`).join('\n')}

Not: Bu kodlar ile 2FA olmadan giriş yapabilirsiniz.
Kimseyle paylaşmayın!
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marifetbul-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('İndirme Başarılı', {
      description: 'Yedek kodlar TXT dosyası olarak indirildi.',
    });

    logger.info('[BackupCodes] Downloaded backup codes as TXT');
  };

  const handleCopyAll = async () => {
    if (!recoveryCodes?.codes) return;

    const text = recoveryCodes.codes
      .map((code, i) => `${i + 1}. ${formatRecoveryCode(code)}`)
      .join('\n');

    await navigator.clipboard.writeText(text);
    toast.success('Kopyalandı', {
      description: 'Tüm yedek kodlar panoya kopyalandı.',
    });
  };

  const handlePrint = () => {
    if (!recoveryCodes?.codes) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MarifetBul - 2FA Yedek Kodlar</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #1e40af;
              border-bottom: 2px solid #1e40af;
              padding-bottom: 10px;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
            }
            .codes {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              margin: 30px 0;
            }
            .code {
              font-family: monospace;
              font-size: 16px;
              padding: 10px;
              background: #f3f4f6;
              border: 1px solid #d1d5db;
              border-radius: 4px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #d1d5db;
              font-size: 12px;
              color: #6b7280;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>MarifetBul - 2FA Yedek Kodlar</h1>
          <p><strong>Oluşturulma:</strong> ${new Date(recoveryCodes.generatedAt).toLocaleString('tr-TR')}</p>
          
          <div class="warning">
            <strong>⚠️ ÖNEMLİ GÜVENLİK UYARISI</strong>
            <ul>
              <li>Bu kodları güvenli bir yerde saklayın (kasa, password manager)</li>
              <li>Her kod yalnızca bir kez kullanılabilir</li>
              <li>Bu kodlar ile 2FA olmadan giriş yapabilirsiniz</li>
              <li>Kimseyle paylaşmayın!</li>
            </ul>
          </div>

          <h2>Yedek Kodlarınız:</h2>
          <div class="codes">
            ${recoveryCodes.codes
              .map(
                (code, i) => `
              <div class="code">${i + 1}. ${formatRecoveryCode(code)}</div>
            `
              )
              .join('')}
          </div>

          <div class="footer">
            <p>MarifetBul - Admin 2FA Yedek Kodlar</p>
            <p>Yazdırma Tarihi: ${new Date().toLocaleString('tr-TR')}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();

    logger.info('[BackupCodes] Printed backup codes');
  };

  const handleRegenerate = async () => {
    try {
      await generateRecoveryCodes();
      setShowRegenerateConfirm(false);
      toast.success('Yedek Kodlar Yenilendi', {
        description:
          'Yeni yedek kodlar oluşturuldu. Eski kodlar artık geçersiz.',
      });
      logger.info('[BackupCodes] Regenerated backup codes');
    } catch (error) {
      logger.error(
        '[BackupCodes] Failed to regenerate codes',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  const remainingCount = recoveryCodes?.codes?.length || 0;
  const usedCount = recoveryCodes?.usedCount || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-600" />
            <span>Yedek Kodlar</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCodes(!showCodes)}
          >
            {showCodes ? 'Gizle' : 'Göster'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Info */}
        <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Kalan Kod: {remainingCount}
              </p>
              <p className="text-xs text-blue-700">Kullanılan: {usedCount}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRegenerateConfirm(true)}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Yeniden Oluştur
          </Button>
        </div>

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            Yedek kodlar, authenticator uygulamanıza erişiminiz olmadığında
            giriş yapmanızı sağlar. Her kod yalnızca bir kez kullanılabilir.
          </AlertDescription>
        </Alert>

        {/* Codes Display */}
        {showCodes && recoveryCodes?.codes && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {recoveryCodes.codes.map((code, index) => (
                <div
                  key={index}
                  className="rounded bg-gray-50 p-3 font-mono text-sm"
                >
                  {index + 1}. {formatRecoveryCode(code)}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyAll}>
                <Copy className="mr-2 h-4 w-4" />
                Tümünü Kopyala
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadTXT}>
                <Download className="mr-2 h-4 w-4" />
                TXT İndir
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Yazdır
              </Button>
            </div>
          </div>
        )}

        {/* Regenerate Confirmation */}
        {showRegenerateConfirm && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <div className="space-y-2">
                <p className="font-medium">
                  Yeni yedek kodlar oluşturmak istediğinizden emin misiniz?
                </p>
                <p className="text-sm">
                  Mevcut yedek kodlarınız geçersiz hale gelecek.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isLoading}
                  >
                    Evet, Yeniden Oluştur
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRegenerateConfirm(false)}
                  >
                    İptal
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default BackupCodesCard;
