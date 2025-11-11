/**
 * ================================================
 * FILE PREVIEW MODAL
 * ================================================
 * Modal for previewing and managing uploaded files
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 6: File Upload/Download
 */

'use client';

import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Download, X, FileText, Image as ImageIcon } from 'lucide-react';
import { fileUploadService } from '@/lib/services/file-upload.service';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface FilePreviewModalProps {
  /** Is modal open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** File to preview */
  file: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  };
  /** Show download button */
  showDownload?: boolean;
  /** Show delete button */
  showDelete?: boolean;
  /** Delete handler */
  onDelete?: () => void;
}

// ================================================
// COMPONENT
// ================================================

export function FilePreviewModal({
  isOpen,
  onClose,
  file,
  showDownload = true,
  showDelete = false,
  onDelete,
}: FilePreviewModalProps) {
  const isImage = file.fileType.startsWith('image/');
  const isPdf = file.fileType.includes('pdf');
  const isPreviewable = isImage || isPdf;

  const handleDownload = async () => {
    try {
      await fileUploadService.downloadFile(file.fileUrl, file.fileName);
    } catch (error) {
      logger.error('Download failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isImage ? (
                <ImageIcon className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
              <span className="max-w-[400px] truncate">{file.fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              {showDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  İndir
                </Button>
              )}
              {showDelete && onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
                >
                  <X className="h-4 w-4" />
                  Sil
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isPreviewable ? (
            <div className="bg-muted/30 flex min-h-[400px] items-center justify-center rounded-lg">
              {isImage ? (
                <div className="relative h-[600px] w-full">
                  <Image
                    src={file.fileUrl}
                    alt={file.fileName}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : isPdf ? (
                <iframe
                  src={file.fileUrl}
                  title={file.fileName}
                  className="h-[600px] w-full border-0"
                />
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <div className="mb-4 text-6xl">
                {fileUploadService.getFileIcon(file.fileType)}
              </div>
              <p className="mb-2 text-lg font-medium">{file.fileName}</p>
              <p className="text-muted-foreground mb-4 text-sm">
                {fileUploadService.formatFileSize(file.fileSize)}
              </p>
              <p className="text-muted-foreground mb-6 text-sm">
                Bu dosya türü için önizleme mevcut değil
              </p>
              {showDownload && (
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Dosyayı İndir
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Dosya Adı:</span>
              <p className="truncate font-medium">{file.fileName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Boyut:</span>
              <p className="font-medium">
                {fileUploadService.formatFileSize(file.fileSize)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Tür:</span>
              <p className="font-medium">{file.fileType}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Durum:</span>
              <p className="font-medium text-green-600">Yüklendi</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
