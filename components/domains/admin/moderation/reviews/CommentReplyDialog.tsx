/**
 * ================================================
 * COMMENT REPLY DIALOG COMPONENT
 * ================================================
 * Modal dialog for moderator to reply to comments
 * Includes official moderator badge and templates
 *
 * Sprint 3 Day 2: Moderator Dashboard Enhancement
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { X, Send, Shield, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { BlogComment } from '@/types/blog';

// ================================================
// TYPES
// ================================================

export interface CommentReplyDialogProps {
  comment: BlogComment;
  isOpen: boolean;
  onClose: () => void;
  onSend: (commentId: string, replyContent: string) => Promise<void>;
}

// ================================================
// CONSTANTS
// ================================================

const REPLY_TEMPLATES = [
  {
    id: 'thanks',
    label: 'Teşekkür',
    content:
      'Yorumunuz için teşekkür ederiz. Geri bildiriminiz bizim için değerli.',
  },
  {
    id: 'clarification',
    label: 'Açıklama',
    content: 'Konuyla ilgili ek bilgi vermek isteriz: ',
  },
  {
    id: 'warning',
    label: 'Uyarı',
    content:
      'Lütfen topluluk kurallarına uygun yorumlar yazmaya özen gösteriniz.',
  },
  {
    id: 'resolved',
    label: 'Çözüldü',
    content:
      'Belirttiğiniz sorun incelenmiş ve çözülmüştür. İlginiz için teşekkürler.',
  },
];

// ================================================
// COMPONENT
// ================================================

export function CommentReplyDialog({
  comment,
  isOpen,
  onClose,
  onSend,
}: CommentReplyDialogProps) {
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const authorName =
    typeof comment.author === 'string' ? comment.author : comment.author.name;

  // ================================================
  // HANDLERS
  // ================================================

  const handleSend = async () => {
    if (!replyContent.trim()) {
      toast.error('Yanıt içeriği boş olamaz');
      return;
    }

    if (replyContent.length < 10) {
      toast.error('Yanıt en az 10 karakter olmalı');
      return;
    }

    setIsSending(true);

    try {
      await onSend(comment.id, replyContent.trim());
      toast.success('Yanıt başarıyla gönderildi');
      setReplyContent('');
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Yanıt gönderilirken hata oluştu';
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleUseTemplate = (template: string) => {
    setReplyContent(template);
  };

  const handleClose = () => {
    if (
      replyContent.trim() &&
      !confirm('Yanıt kaydedilmedi. Çıkmak istediğinize emin misiniz?')
    ) {
      return;
    }
    setReplyContent('');
    onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Yoruma Yanıt Ver
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Original Comment */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {authorName}
              </span>
              <span className="text-xs text-gray-500">Orijinal Yorum</span>
            </div>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>

          {/* Reply Templates */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Hızlı Yanıt Şablonları
            </label>
            <div className="flex flex-wrap gap-2">
              {REPLY_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleUseTemplate(template.content)}
                  className="flex items-center gap-1 rounded-lg border border-purple-300 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{template.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reply Content */}
          <div>
            <label
              htmlFor="replyContent"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Yanıtınız
            </label>
            <textarea
              id="replyContent"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              rows={5}
              placeholder="Yanıtınızı buraya yazın..."
            />
            <div className="mt-1 text-xs text-gray-500">
              {replyContent.length} karakter
            </div>
          </div>

          {/* Moderator Badge Notice */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <div className="text-xs text-blue-800">
                <p className="font-medium">Resmi Moderatör Yanıtı</p>
                <p className="mt-1">
                  Bu yanıt &quot;Moderatör&quot; rozeti ile gösterilecektir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={handleClose}
            disabled={isSending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !replyContent.trim()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Gönderiliyor...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Gönder</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentReplyDialog;
