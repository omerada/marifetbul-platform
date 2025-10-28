/**
 * ================================================
 * COMMENT MODERATION NOTES COMPONENT
 * ================================================
 * Component for adding moderation notes/reasons
 * Provides context for moderation decisions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { FileText, X, Save } from 'lucide-react';

// ================================================
// TYPES
// ================================================

export interface ModerationNote {
  id: string;
  commentId: string;
  moderatorId: string;
  moderatorName: string;
  action: 'APPROVED' | 'REJECTED' | 'SPAM';
  reason?: string;
  note?: string;
  createdAt: string;
}

export interface CommentModerationNotesProps {
  commentId: string;
  notes?: ModerationNote[];
  onAddNote?: (note: {
    action: string;
    reason?: string;
    note?: string;
  }) => Promise<boolean>;
  showAddForm?: boolean;
  onClose?: () => void;
}

// ================================================
// CONSTANTS
// ================================================

const REJECTION_REASONS = [
  { value: 'inappropriate', label: 'Uygunsuz İçerik' },
  { value: 'offensive', label: 'Saldırgan/Hakaret' },
  { value: 'spam', label: 'Spam/Reklam' },
  { value: 'off_topic', label: 'Konu Dışı' },
  { value: 'misinformation', label: 'Yanlış Bilgi' },
  { value: 'duplicate', label: 'Tekrar Eden İçerik' },
  { value: 'other', label: 'Diğer' },
];

const SPAM_REASONS = [
  { value: 'advertisement', label: 'Reklam/Tanıtım' },
  { value: 'link_spam', label: 'Link Spam' },
  { value: 'repeated', label: 'Tekrarlayan Spam' },
  { value: 'bot', label: 'Bot/Otomatik' },
  { value: 'malicious', label: 'Zararlı İçerik' },
];

// ================================================
// COMPONENT
// ================================================

export function CommentModerationNotes({
  commentId: _commentId,
  notes = [],
  onAddNote,
  showAddForm = false,
  onClose,
}: CommentModerationNotesProps) {
  // ================================================
  // STATE
  // ================================================

  const [isAdding, setIsAdding] = useState(showAddForm);
  const [action, setAction] = useState<'APPROVED' | 'REJECTED' | 'SPAM'>(
    'REJECTED'
  );
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ================================================
  // COMPUTED
  // ================================================

  const reasonOptions = action === 'SPAM' ? SPAM_REASONS : REJECTION_REASONS;

  // ================================================
  // HANDLERS
  // ================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!onAddNote) return;

    setIsSubmitting(true);
    try {
      const success = await onAddNote({
        action,
        reason: reason || undefined,
        note: note.trim() || undefined,
      });

      if (success) {
        // Reset form
        setReason('');
        setNote('');
        setIsAdding(false);
        onClose?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    setNote('');
    setIsAdding(false);
    onClose?.();
  };

  // ================================================
  // RENDER - Notes List
  // ================================================

  if (!isAdding && notes.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
        <FileText className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Henüz moderasyon notu yok</p>
        {onAddNote && (
          <button
            onClick={() => setIsAdding(true)}
            className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Not Ekle
          </button>
        )}
      </div>
    );
  }

  // ================================================
  // RENDER - Main
  // ================================================

  return (
    <div className="space-y-4">
      {/* Existing Notes */}
      {notes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Moderasyon Notları
          </h4>
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        note.action === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : note.action === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {note.action === 'APPROVED' && 'Onaylandı'}
                      {note.action === 'REJECTED' && 'Reddedildi'}
                      {note.action === 'SPAM' && 'Spam'}
                    </span>
                    {note.reason && (
                      <span className="text-xs text-gray-500">
                        {reasonOptions.find((r) => r.value === note.reason)
                          ?.label || note.reason}
                      </span>
                    )}
                  </div>

                  {/* Note Content */}
                  {note.note && (
                    <p className="mt-2 text-sm text-gray-700">{note.note}</p>
                  )}

                  {/* Footer */}
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span>{note.moderatorName}</span>
                    <span>•</span>
                    <span>
                      {new Date(note.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Form */}
      {isAdding && onAddNote && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Moderasyon Notu Ekle
            </h4>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Action Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                İşlem Türü
              </label>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAction('APPROVED')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    action === 'APPROVED'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Onayla
                </button>
                <button
                  type="button"
                  onClick={() => setAction('REJECTED')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    action === 'REJECTED'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Reddet
                </button>
                <button
                  type="button"
                  onClick={() => setAction('SPAM')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    action === 'SPAM'
                      ? 'border-gray-500 bg-gray-50 text-gray-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Spam
                </button>
              </div>
            </div>

            {/* Reason (only for REJECTED and SPAM) */}
            {action !== 'APPROVED' && (
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700"
                >
                  Sebep {action === 'REJECTED' ? '(İsteğe bağlı)' : ''}
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Seçiniz...</option>
                  {reasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Additional Note */}
            <div>
              <label
                htmlFor="note"
                className="block text-sm font-medium text-gray-700"
              >
                Ek Not (İsteğe bağlı)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Moderasyon kararınız hakkında ek bilgi ekleyin..."
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                {note.length} / 500 karakter
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || note.length > 500}
                className="flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Add Button (when not adding and has notes) */}
      {!isAdding && onAddNote && notes.length > 0 && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          + Yeni Not Ekle
        </button>
      )}
    </div>
  );
}

export default CommentModerationNotes;
