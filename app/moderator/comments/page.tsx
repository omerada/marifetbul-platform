/**
 * ================================================
 * COMMENT MODERATION PAGE
 * ================================================
 * Blog comment moderation interface with bulk actions
 *
 * Sprint 2.2: Comment Moderation Queue
 * @version 2.0.0
 * @author MarifetBul Development Team
 */

'use client';

import React, { useState } from 'react';
import { logger } from '@/lib/shared/utils/logger';
import { Check, X, Flag, Search } from 'lucide-react';

type CommentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SPAM'
  | 'FLAGGED'
  | 'ALL';

export default function CommentModerationPage() {
  const [selectedStatus, setSelectedStatus] =
    useState<CommentStatus>('PENDING');
  const [selectedComments, setSelectedComments] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - will be replaced with real API
  const comments = [
    {
      id: '1',
      author: { name: 'Ahmet Yılmaz', avatar: null },
      content:
        'Çok faydalı bir makale olmuş. React Hook Form kullanımı hakkında daha detaylı bilgi alabilir miyiz?',
      postTitle: 'React Hook Form ile Form Yönetimi',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'PENDING',
      flagged: false,
    },
    {
      id: '2',
      author: { name: 'Mehmet Demir', avatar: null },
      content: 'Spam içerik - satış linki',
      postTitle: 'Next.js 13 Yenilikleri',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      status: 'PENDING',
      flagged: true,
      flagReason: 'Spam',
    },
    {
      id: '3',
      author: { name: 'Ayşe Kara', avatar: null },
      content:
        'Harika açıklamalar! TypeScript migration konusunda da yazı bekliyoruz.',
      postTitle: 'JavaScript Best Practices',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      status: 'PENDING',
      flagged: false,
    },
  ];

  const handleSelectAll = () => {
    if (selectedComments.size === comments.length) {
      setSelectedComments(new Set());
    } else {
      setSelectedComments(new Set(comments.map((c) => c.id)));
    }
  };

  const handleSelectComment = (id: string) => {
    const newSelected = new Set(selectedComments);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedComments(newSelected);
  };

  const handleBulkApprove = async () => {
    logger.debug('Bulk approve:', Array.from(selectedComments));
    // TODO: API call
    setSelectedComments(new Set());
  };

  const handleBulkReject = async () => {
    logger.debug('Bulk reject:', Array.from(selectedComments));
    // TODO: API call
    setSelectedComments(new Set());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Yorum Moderasyonu</h1>
        <p className="mt-2 text-gray-600">
          Blog yorumlarını inceleyin ve onaylayın
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {(
            [
              'ALL',
              'PENDING',
              'FLAGGED',
              'APPROVED',
              'REJECTED',
              'SPAM',
            ] as const
          ).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' && 'Tümü'}
              {status === 'PENDING' && 'Bekleyen'}
              {status === 'FLAGGED' && 'İşaretli'}
              {status === 'APPROVED' && 'Onaylı'}
              {status === 'REJECTED' && 'Reddedilen'}
              {status === 'SPAM' && 'Spam'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Yorum ara..."
            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedComments.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900">
            {selectedComments.size} yorum seçildi
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleBulkApprove}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              Onayla
            </button>
            <button
              onClick={handleBulkReject}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              <X className="h-4 w-4" />
              Reddet
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                selectedComments.size === comments.length && comments.length > 0
              }
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Tümünü Seç
            </span>
          </label>
        </div>

        {/* Comments */}
        <div className="divide-y divide-gray-200">
          {comments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Gösterilecek yorum bulunmuyor
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedComments.has(comment.id)}
                    onChange={() => handleSelectComment(comment.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />

                  {/* Avatar */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-sm font-medium text-gray-600">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {comment.author.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString('tr-TR')}
                      </span>
                      {comment.flagged && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          <Flag className="h-3 w-3" />
                          {comment.flagReason}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {comment.postTitle}
                    </p>
                    <p className="mt-2 text-gray-900">{comment.content}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                      title="Onayla"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      title="Reddet"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Toplam {comments.length} yorum
            </p>
            <div className="flex gap-2">
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                Önceki
              </button>
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                Sonraki
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
