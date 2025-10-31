/**
 * ================================================
 * ORDER ATTACHMENTS VIEWER
 * ================================================
 * File attachments display with preview support
 *
 * Features:
 * - File list with icons
 * - File type detection
 * - Download links
 * - Image previews
 * - File size display
 * - Upload date
 * - Grid/List view toggle
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Order System Enhancement
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import {
  FileText,
  Image as ImageIcon,
  File,
  Download,
  ExternalLink,
  Grid,
  List,
} from 'lucide-react';

// ================================================
// TYPES
// ================================================

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

interface OrderAttachmentsViewerProps {
  /** Attachments to display */
  attachments: Attachment[];
  /** Show upload info */
  showUploadInfo?: boolean;
  /** Enable download */
  enableDownload?: boolean;
  /** Default view mode */
  defaultView?: 'grid' | 'list';
}

// ================================================
// HELPER FUNCTIONS
// ================================================

const getFileIcon = (fileType?: string, fileName?: string) => {
  if (!fileType && fileName) {
    fileType = fileName.split('.').pop()?.toLowerCase();
  }

  if (!fileType) return <File className="h-5 w-5 text-gray-400" />;

  // Image types
  if (fileType.match(/^image\/(jpeg|jpg|png|gif|webp|svg)$/i)) {
    return <ImageIcon className="h-5 w-5 text-blue-600" />;
  }

  // Document types
  if (fileType.match(/^(application\/pdf|text\/)/i)) {
    return <FileText className="h-5 w-5 text-red-600" />;
  }

  return <File className="h-5 w-5 text-gray-400" />;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageFile = (fileType?: string, fileName?: string) => {
  if (!fileType && fileName) {
    fileType = fileName.split('.').pop()?.toLowerCase();
  }

  return !!fileType?.match(/^(image\/(jpeg|jpg|png|gif|webp|svg)|jpg|jpeg|png|gif|webp|svg)$/i);
};

// ================================================
// SUB-COMPONENTS
// ================================================

function AttachmentGridItem({ attachment, showUploadInfo, enableDownload }: {
  attachment: Attachment;
  showUploadInfo: boolean;
  enableDownload: boolean;
}) {
  const isImage = isImageFile(attachment.fileType, attachment.fileName);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      {/* Preview */}
      <div className="aspect-square bg-gray-50">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attachment.fileUrl}
            alt={attachment.fileName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {getFileIcon(attachment.fileType, attachment.fileName)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="truncate text-sm font-medium text-gray-900">
          {attachment.fileName}
        </p>
        {attachment.fileSize && (
          <p className="text-xs text-gray-500">
            {formatFileSize(attachment.fileSize)}
          </p>
        )}
        {showUploadInfo && attachment.uploadedAt && (
          <p className="mt-1 text-xs text-gray-500">
            {new Date(attachment.uploadedAt).toLocaleDateString('tr-TR')}
          </p>
        )}
      </div>

      {/* Actions */}
      {enableDownload && (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <a
            href={attachment.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100"
          >
            <ExternalLink className="h-4 w-4 text-gray-600" />
          </a>
          <a
            href={attachment.fileUrl}
            download={attachment.fileName}
            className="rounded-full bg-white p-1.5 shadow-md hover:bg-gray-100"
          >
            <Download className="h-4 w-4 text-gray-600" />
          </a>
        </div>
      )}
    </div>
  );
}

function AttachmentListItem({ attachment, showUploadInfo, enableDownload }: {
  attachment: Attachment;
  showUploadInfo: boolean;
  enableDownload: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-sm">
      {/* Icon */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50">
        {getFileIcon(attachment.fileType, attachment.fileName)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">
          {attachment.fileName}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {attachment.fileSize && <span>{formatFileSize(attachment.fileSize)}</span>}
          {showUploadInfo && attachment.uploadedAt && (
            <>
              <span>•</span>
              <span>{new Date(attachment.uploadedAt).toLocaleDateString('tr-TR')}</span>
            </>
          )}
          {showUploadInfo && attachment.uploadedBy && (
            <>
              <span>•</span>
              <span>{attachment.uploadedBy}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      {enableDownload && (
        <div className="flex gap-1">
          <a
            href={attachment.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-2 hover:bg-gray-100"
          >
            <ExternalLink className="h-4 w-4 text-gray-600" />
          </a>
          <a
            href={attachment.fileUrl}
            download={attachment.fileName}
            className="rounded p-2 hover:bg-gray-100"
          >
            <Download className="h-4 w-4 text-gray-600" />
          </a>
        </div>
      )}
    </div>
  );
}

// ================================================
// MAIN COMPONENT
// ================================================

export function OrderAttachmentsViewer({
  attachments,
  showUploadInfo = true,
  enableDownload = true,
  defaultView = 'grid',
}: OrderAttachmentsViewerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);

  // ================================================
  // RENDER
  // ================================================

  if (attachments.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="mx-auto mb-2 h-12 w-12 text-gray-400" />
        <p className="text-gray-600">Henüz dosya eklenmedi</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
        <div>
          <h3 className="font-semibold text-gray-900">
            Ekler ({attachments.length})
          </h3>
          <p className="text-xs text-gray-600">Sipariş ile ilgili dosyalar</p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 w-8 p-0"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {attachments.map((attachment) => (
              <AttachmentGridItem
                key={attachment.id}
                attachment={attachment}
                showUploadInfo={showUploadInfo}
                enableDownload={enableDownload}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <AttachmentListItem
                key={attachment.id}
                attachment={attachment}
                showUploadInfo={showUploadInfo}
                enableDownload={enableDownload}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
