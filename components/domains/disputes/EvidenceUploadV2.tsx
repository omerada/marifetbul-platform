/**
 * ============================================================================
 * EVIDENCE UPLOAD V2 - Modern Evidence Upload with API Integration
 * ============================================================================
 * Modern evidence upload component using dispute-evidence API
 *
 * Features:
 * - Integrated with useDisputeEvidence hook
 * - Real-time progress tracking
 * - Evidence gallery with delete
 * - Auto-refresh on upload
 * - Production-ready validation
 *
 * @version 2.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 * @sprint Security & Settings Sprint - Story 4
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { useDisputeEvidence } from '@/hooks/business/useDisputeEvidence';
import { disputeEvidenceApi } from '@/lib/api/dispute-evidence';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// ============================================================================
// TYPES
// ============================================================================

interface EvidenceUploadV2Props {
  disputeId: string;
  className?: string;
  onUploadComplete?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EvidenceUploadV2({
  disputeId,
  className,
  onUploadComplete,
}: EvidenceUploadV2Props) {
  const {
    evidenceList,
    uploadProgress,
    isUploading,
    uploadEvidence,
    fetchEvidence,
    deleteEvidence,
    clearProgress,
  } = useDisputeEvidence();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load evidence on mount
  useEffect(() => {
    if (disputeId) {
      fetchEvidence(disputeId);
    }
  }, [disputeId, fetchEvidence]);

  // ============================================================================
  // FILE SELECTION
  // ============================================================================

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      if (files.length === 0) return;

      // Upload each file
      for (const file of files) {
        const success = await uploadEvidence(disputeId, {
          file,
          description: '',
        });

        if (success) {
          onUploadComplete?.();
        }
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh evidence list
      await fetchEvidence(disputeId);
    },
    [disputeId, uploadEvidence, fetchEvidence, onUploadComplete]
  );

  // ============================================================================
  // DELETE EVIDENCE
  // ============================================================================

  const handleDelete = useCallback(
    async (evidenceId: string) => {
      const success = await deleteEvidence(disputeId, evidenceId);
      if (success) {
        await fetchEvidence(disputeId);
        onUploadComplete?.();
      }
    },
    [disputeId, deleteEvidence, fetchEvidence, onUploadComplete]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('space-y-6', className)}>
      {/* Upload Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="mb-1 text-sm font-medium text-gray-700">
                Kanıt Yükle
              </p>
              <p className="text-xs text-gray-500">
                JPEG, PNG, WebP, PDF • Maks 10MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full sm:w-auto"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Yükleniyor...' : 'Dosya Seç'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Yükleme İlerlemesi</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearProgress}
                  disabled={isUploading}
                >
                  Temizle
                </Button>
              </div>

              {uploadProgress.map((item) => (
                <div
                  key={item.fileId}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="flex-1 truncate text-sm font-medium">
                      {item.fileName}
                    </p>
                    <span
                      className={cn(
                        'rounded px-2 py-1 text-xs font-medium',
                        item.status === 'success' &&
                          'bg-green-100 text-green-700',
                        item.status === 'error' && 'bg-red-100 text-red-700',
                        item.status === 'uploading' &&
                          'bg-blue-100 text-blue-700',
                        item.status === 'pending' && 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {item.status === 'success' && 'Tamamlandı'}
                      {item.status === 'error' && 'Hata'}
                      {item.status === 'uploading' && `${item.progress}%`}
                      {item.status === 'pending' && 'Bekliyor'}
                    </span>
                  </div>

                  {(item.status === 'uploading' ||
                    item.status === 'pending') && (
                    <Progress value={item.progress} className="h-2" />
                  )}

                  {item.error && (
                    <div className="mt-2 flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                      <p className="text-xs text-red-600">{item.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evidence Gallery */}
      {evidenceList.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Yüklenen Kanıtlar ({evidenceList.length})
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {evidenceList.map((evidence) => {
              const isImage = evidence.fileType.startsWith('image/');

              return (
                <Card key={evidence.id}>
                  <CardContent className="p-4">
                    {/* Preview */}
                    <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-gray-100">
                      {isImage ? (
                        <Image
                          src={evidence.fileUrl}
                          alt={evidence.fileName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <FileText className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <p className="truncate text-sm font-medium">
                        {evidence.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {disputeEvidenceApi.formatFileSize(evidence.fileSize)}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <a
                          href={evidence.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Görüntüle
                          </Button>
                        </a>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(evidence.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {evidenceList.length === 0 && !isUploading && (
        <div className="py-8 text-center text-gray-500">
          <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm">Henüz kanıt yüklenmemiş</p>
          <p className="mt-1 text-xs">
            İtirazınızı desteklemek için kanıt ekleyin
          </p>
        </div>
      )}
    </div>
  );
}
