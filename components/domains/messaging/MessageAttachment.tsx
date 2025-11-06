'use client';

import { memo } from 'react';
import {
  Download,
  File,
  FileImage,
  FileText,
  FileVideo,
  FileAudio,
} from 'lucide-react';
import Image from 'next/image';
import type { FileAttachment } from '@/types/core/base';

interface MessageAttachmentProps {
  attachment: FileAttachment;
  /** Whether this is user's own message */
  isOwnMessage?: boolean;
}

/**
 * Get icon component based on file type
 */
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType.includes('pdf') || mimeType.includes('document'))
    return FileText;
  return File;
}

/**
 * Format file size to human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * MessageAttachment Component
 *
 * Displays message attachments with:
 * - Image preview for images
 * - File icon and info for other files
 * - Download button
 * - Responsive design
 */
export const MessageAttachment = memo(function MessageAttachment({
  attachment,
  isOwnMessage = false,
}: MessageAttachmentProps) {
  // Use either type or mimetype field (MSW compatibility)
  const mimeType = attachment.type || attachment.mimetype || '';
  const isImage = mimeType.startsWith('image/');
  const FileIcon = getFileIcon(mimeType);

  const handleDownload = () => {
    // Open file in new tab for download
    window.open(attachment.url, '_blank');
  };

  // Image attachment
  if (isImage) {
    return (
      <div className="group relative overflow-hidden rounded-lg">
        <Image
          src={attachment.url}
          alt={attachment.name || 'Image attachment'}
          width={300}
          height={200}
          className="h-auto max-h-[300px] w-full cursor-pointer object-cover transition-transform hover:scale-105"
          onClick={handleDownload}
        />

        {/* Download overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleDownload}
            className="rounded-full bg-white/90 p-3 transition-colors hover:bg-white"
            aria-label="Download image"
          >
            <Download className="h-5 w-5 text-gray-900" />
          </button>
        </div>

        {/* File info at bottom */}
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="truncate text-xs text-white">{attachment.name}</p>
        </div>
      </div>
    );
  }

  // Other file types
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        isOwnMessage
          ? 'border-blue-400 bg-blue-500/20'
          : 'border-gray-300 bg-white'
      }`}
    >
      {/* File Icon */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded ${
          isOwnMessage ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <FileIcon
          className={`h-5 w-5 ${isOwnMessage ? 'text-white' : 'text-gray-600'}`}
        />
      </div>

      {/* File Info */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${
            isOwnMessage ? 'text-white' : 'text-gray-900'
          }`}
        >
          {attachment.name}
        </p>
        <div className="flex items-center gap-2">
          <p
            className={`text-xs ${
              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {formatFileSize(attachment.size || 0)}
          </p>
          {mimeType && (
            <>
              <span
                className={`text-xs ${
                  isOwnMessage ? 'text-blue-200' : 'text-gray-400'
                }`}
              >
                •
              </span>
              <p
                className={`text-xs ${
                  isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {mimeType.split('/')[1]?.toUpperCase()}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className={`flex-shrink-0 rounded-full p-2 transition-colors ${
          isOwnMessage ? 'hover:bg-blue-600' : 'hover:bg-gray-100'
        }`}
        aria-label="Download file"
      >
        <Download
          className={`h-4 w-4 ${isOwnMessage ? 'text-white' : 'text-gray-600'}`}
        />
      </button>
    </div>
  );
});
