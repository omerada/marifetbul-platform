/**
 * ============================================================================
 * EVIDENCE GALLERY - Enhanced Evidence Viewer with Lightbox
 * ============================================================================
 * Sprint 1: Dispute Resolution System
 *
 * Features:
 * - Lightbox modal for full-size image preview
 * - PDF viewer integration
 * - Keyboard navigation (arrow keys, ESC)
 * - Zoom controls
 * - Download functionality
 * - Responsive gallery grid
 * - Loading states
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 13, 2025
 * @sprint Sprint 1 - Dispute Resolution
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  X,
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// ============================================================================
// TYPES
// ============================================================================

export interface EvidenceItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
  uploadedAt: string;
  uploadedByUserName?: string;
}

interface EvidenceGalleryProps {
  evidence: EvidenceItem[];
  className?: string;
  onDelete?: (evidenceId: string) => void;
  showDelete?: boolean;
}

// ============================================================================
// LIGHTBOX COMPONENT
// ============================================================================

interface LightboxProps {
  evidence: EvidenceItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

function Lightbox({
  evidence,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
}: LightboxProps) {
  const [zoom, setZoom] = useState(100);
  const current = evidence[currentIndex];
  const isImage = current?.fileType.startsWith('image/');
  const isPdf = current?.fileType === 'application/pdf';

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) onPrevious();
          break;
        case 'ArrowRight':
          if (currentIndex < evidence.length - 1) onNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, evidence.length, onClose, onNext, onPrevious]);

  // Reset zoom on image change
  useEffect(() => {
    setZoom(100);
  }, [currentIndex]);

  if (!current) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = current.fileUrl;
    link.download = current.fileName;
    link.target = '_blank';
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Header */}
      <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-black/50 p-4 backdrop-blur-sm">
        <div className="flex-1">
          <h3 className="font-medium text-white">{current.fileName}</h3>
          <p className="text-sm text-gray-300">
            {currentIndex + 1} / {evidence.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls (Images only) */}
          {isImage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom((prev) => Math.max(50, prev - 25));
                }}
                className="text-white hover:bg-white/20"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <span className="min-w-[4rem] text-center text-sm text-white">
                {zoom}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom((prev) => Math.min(200, prev + 25));
                }}
                className="text-white hover:bg-white/20"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Download */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="text-white hover:bg-white/20"
          >
            <Download className="h-5 w-5" />
          </Button>

          {/* Open in new tab */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(current.fileUrl, '_blank');
            }}
            className="text-white hover:bg-white/20"
          >
            <ExternalLink className="h-5 w-5" />
          </Button>

          {/* Close */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 z-10 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {currentIndex < evidence.length - 1 && (
        <Button
          variant="ghost"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 z-10 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Content */}
      <div
        className="relative flex max-h-[80vh] max-w-[90vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isImage ? (
          <div className="relative overflow-auto">
            <Image
              src={current.fileUrl}
              alt={current.fileName}
              width={1920}
              height={1080}
              className="max-h-[80vh] max-w-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})` }}
              unoptimized
            />
          </div>
        ) : isPdf ? (
          <div className="h-[80vh] w-[90vw] bg-white">
            <iframe
              src={current.fileUrl}
              className="h-full w-full"
              title={current.fileName}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-12">
            <FileText className="h-24 w-24 text-gray-400" />
            <div className="text-center">
              <p className="mb-2 text-lg font-medium text-gray-900">
                {current.fileName}
              </p>
              <p className="text-sm text-gray-500">
                Bu dosya türü önizlenemiyor
              </p>
            </div>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              İndir
            </Button>
          </div>
        )}
      </div>

      {/* Description */}
      {current.description && (
        <div className="absolute right-0 bottom-0 left-0 bg-black/50 p-4 backdrop-blur-sm">
          <p className="text-sm text-white">{current.description}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EvidenceGallery({
  evidence,
  className,
  onDelete,
  showDelete = false,
}: EvidenceGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handlePrevious = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null && prev < evidence.length - 1 ? prev + 1 : prev
    );
  }, [evidence.length]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (evidence.length === 0) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <FileText className="mx-auto mb-3 h-16 w-16 text-gray-300" />
        <p className="text-sm text-gray-500">Henüz kanıt yüklenmemiş</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
          className
        )}
      >
        {evidence.map((item, index) => {
          const isImage = item.fileType.startsWith('image/');
          const isPdf = item.fileType === 'application/pdf';

          return (
            <Card
              key={item.id}
              className="group overflow-hidden transition-shadow hover:shadow-lg"
            >
              <CardContent className="p-0">
                {/* Preview - Clickable */}
                <button
                  onClick={() => setLightboxIndex(index)}
                  className="relative aspect-video w-full overflow-hidden bg-gray-100 transition-transform hover:scale-105"
                >
                  {isImage ? (
                    <Image
                      src={item.fileUrl}
                      alt={item.fileName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileText className="h-16 w-16 text-gray-400" />
                      {isPdf && (
                        <span className="absolute bottom-2 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
                          PDF
                        </span>
                      )}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </button>

                {/* Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(item.fileSize)} •{' '}
                      {formatDate(item.uploadedAt)}
                    </p>
                    {item.uploadedByUserName && (
                      <p className="mt-1 text-xs text-gray-400">
                        Yükleyen: {item.uploadedByUserName}
                      </p>
                    )}
                  </div>

                  {item.description && (
                    <p className="mb-3 line-clamp-2 text-xs text-gray-600">
                      {item.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLightboxIndex(index)}
                      className="flex-1"
                    >
                      Görüntüle
                    </Button>
                    {showDelete && onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <Lightbox
          evidence={evidence}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </>
  );
}
