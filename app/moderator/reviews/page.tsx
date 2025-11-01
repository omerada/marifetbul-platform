/**
 * ================================================
 * REVIEW MODERATION PAGE
 * ================================================
 * Flagged review moderation interface
 *
 * Sprint 2.3: Review Moderation
 * @version 2.0.0
 * @author MarifetBul Development Team
 */

'use client';

import React, { useState } from 'react';
import {
  Star,
  Flag,
  Check,
  X,
  AlertTriangle,
  Ban,
  Search,
  Eye,
} from 'lucide-react';

type ReviewStatus = 'ALL' | 'FLAGGED' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface MockReview {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  packageTitle: string;
  overallRating: number;
  reviewText: string;
  createdAt: string;
  flagCount: number;
  flagReasons: Array<{ reason: string; count: number }>;
  status: string;
}

export default function ModeratorReviewsPage() {
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus>('FLAGGED');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<MockReview | null>(null);

  // Mock data
  const reviews: MockReview[] = [
    {
      id: '1',
      reviewerName: 'Mehmet Yılmaz',
      packageTitle: 'Logo Tasarımı - Pro Paket',
      overallRating: 1,
      reviewText:
        'Çok kötü bir deneyimdi. Ödeme yaptım ama hiçbir şey teslim edilmedi. Para iadesi istiyorum.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      flagCount: 5,
      flagReasons: [
        { reason: 'INAPPROPRIATE_CONTENT', count: 3 },
        { reason: 'FALSE_INFORMATION', count: 2 },
      ],
      status: 'FLAGGED',
    },
    {
      id: '2',
      reviewerName: 'Ayşe Demir',
      packageTitle: 'SEO Optimizasyonu',
      overallRating: 5,
      reviewText: 'Mükemmel hizmet! Link: www.spam-site.com',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      flagCount: 8,
      flagReasons: [
        { reason: 'SPAM', count: 6 },
        { reason: 'PROMOTIONAL_LINK', count: 2 },
      ],
      status: 'FLAGGED',
    },
    {
      id: '3',
      reviewerName: 'Ali Kaya',
      packageTitle: 'Web Sitesi Tasarımı',
      overallRating: 2,
      reviewText: 'Kötü içerik ve uygunsuz dil kullanımı...',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      flagCount: 3,
      flagReasons: [{ reason: 'INAPPROPRIATE_CONTENT', count: 3 }],
      status: 'FLAGGED',
    },
  ];

  const handleApprove = (reviewId: string) => {
    console.log('Approve review:', reviewId);
    // TODO: API call
  };

  const handleRemove = (reviewId: string) => {
    console.log('Remove review:', reviewId);
    // TODO: API call
  };

  const handleWarnUser = (reviewId: string) => {
    console.log('Warn user for review:', reviewId);
    // TODO: API call
  };

  const handleBanUser = (reviewId: string) => {
    console.log('Ban user for review:', reviewId);
    // TODO: API call
  };

  const getFlagReasonLabel = (reason: string): string => {
    const labels: Record<string, string> = {
      SPAM: 'Spam',
      INAPPROPRIATE_CONTENT: 'Uygunsuz İçerik',
      FALSE_INFORMATION: 'Yanlış Bilgi',
      PROMOTIONAL_LINK: 'Reklam Linki',
      OFFENSIVE_LANGUAGE: 'Hakaret',
      HARASSMENT: 'Taciz',
    };
    return labels[reason] || reason;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Değerlendirme Moderasyonu
        </h1>
        <p className="mt-2 text-gray-600">
          İşaretlenmiş değerlendirmeleri inceleyin ve işlem yapın
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {(['ALL', 'FLAGGED', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(
            (status) => (
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
                {status === 'FLAGGED' && 'İşaretli'}
                {status === 'PENDING' && 'Bekleyen'}
                {status === 'APPROVED' && 'Onaylı'}
                {status === 'REJECTED' && 'Kaldırılan'}
              </button>
            )
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Değerlendirme ara..."
            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              {/* Review Content */}
              <div className="flex-1">
                {/* Header */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-sm font-medium text-gray-600">
                      {review.reviewerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.reviewerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {review.packageTitle}
                    </p>
                  </div>
                  {/* Rating */}
                  <div className="ml-auto flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.overallRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="mb-3 text-gray-900">{review.reviewText}</p>

                {/* Flag Info */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5">
                    <Flag className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">
                      {review.flagCount} işaretleme
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {review.flagReasons.map((fr, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                      >
                        {getFlagReasonLabel(fr.reason)} ({fr.count})
                      </span>
                    ))}
                  </div>
                  <span className="ml-auto text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => setSelectedReview(review)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                Detay
              </button>
              <button
                onClick={() => handleApprove(review.id)}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                Onayla
              </button>
              <button
                onClick={() => handleRemove(review.id)}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                <X className="h-4 w-4" />
                Kaldır
              </button>
              <button
                onClick={() => handleWarnUser(review.id)}
                className="flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
              >
                <AlertTriangle className="h-4 w-4" />
                Uyar
              </button>
              <button
                onClick={() => handleBanUser(review.id)}
                className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
              >
                <Ban className="h-4 w-4" />
                Engelle
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedReview && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Değerlendirme Detayı
              </h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Reviewer Info */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                  <span className="text-lg font-medium text-gray-600">
                    {selectedReview.reviewerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedReview.reviewerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedReview.packageTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Genel Değerlendirme
              </p>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < selectedReview.overallRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  {selectedReview.overallRating}/5
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-gray-700">Yorum</p>
              <p className="text-gray-900">{selectedReview.reviewText}</p>
            </div>

            {/* Flag Details */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-gray-700">
                İşaretleme Detayları
              </p>
              <div className="space-y-2">
                {selectedReview.flagReasons.map((fr, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-red-50 p-3"
                  >
                    <span className="font-medium text-red-900">
                      {getFlagReasonLabel(fr.reason)}
                    </span>
                    <span className="text-sm text-red-700">
                      {fr.count} işaretleme
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleApprove(selectedReview.id);
                  setSelectedReview(null);
                }}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Onayla
              </button>
              <button
                onClick={() => {
                  handleRemove(selectedReview.id);
                  setSelectedReview(null);
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Kaldır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Toplam {reviews.length} değerlendirme
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
  );
}
