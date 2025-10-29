'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Loading } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { PortfolioShare } from '@/components/domains/profile/PortfolioShare';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { PortfolioItem } from '@/types';
import { logger } from '@/lib/shared/utils/logger';
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Eye,
  Tag,
  User,
  Grid,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Portfolio Page - Sprint 2
 * Displays user's portfolio items in a dedicated page
 * Features:
 * - Portfolio list view (grid)
 * - Portfolio detail modal
 * - Portfolio share functionality
 * - View count tracking
 * - Skills/tags display
 */
export default function PortfolioPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.id as string;
  const selectedPortfolioId = searchParams.get('portfolio');

  const {
    portfolios,
    currentPortfolio,
    ui,
    fetchUserPortfolios,
    fetchPortfolio,
    setViewModalOpen,
  } = usePortfolioStore();

  const [viewingAll, setViewingAll] = useState(!selectedPortfolioId);

  // Fetch user's portfolios on mount
  useEffect(() => {
    if (userId) {
      fetchUserPortfolios(userId).catch((error) =>
        logger.error('Failed to fetch user portfolios', error)
      );
    }
  }, [userId, fetchUserPortfolios]);

  // Fetch specific portfolio if ID in URL
  useEffect(() => {
    if (selectedPortfolioId) {
      fetchPortfolio(selectedPortfolioId)
        .then(() => {
          setViewModalOpen(true, null);
          setViewingAll(false);
        })
        .catch((error) => logger.error('Failed to fetch portfolio', error));
    }
  }, [selectedPortfolioId, fetchPortfolio, setViewModalOpen]);

  if (ui.isLoading && portfolios.length === 0) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loading />
        </div>
      </AppLayout>
    );
  }

  if (ui.error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12">
          <Card className="border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-600">{ui.error}</p>
            <Button
              variant="outline"
              onClick={() => fetchUserPortfolios(userId)}
              className="mt-4"
            >
              Tekrar Dene
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={`/profile/${userId}`}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Profile Dön
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Portfolyo
                  </h1>
                  <p className="text-sm text-gray-600">
                    {portfolios.length} proje
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewingAll ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewingAll(true)}
                >
                  <Grid className="mr-2 h-4 w-4" />
                  Tümü
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {portfolios.length === 0 ? (
            <Card className="p-12 text-center">
              <ImageIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Henüz Portfolyo Yok
              </h2>
              <p className="text-gray-600">
                Bu kullanıcı henüz portfolyo öğesi eklememiş.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {portfolios.map((item) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  userId={userId}
                  onView={() => {
                    fetchPortfolio(item.id).then(() => {
                      setViewModalOpen(true, item);
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {ui.viewModalOpen && currentPortfolio && (
          <PortfolioDetailModal
            portfolio={currentPortfolio}
            userId={userId}
            onClose={() => setViewModalOpen(false, null)}
          />
        )}
      </div>
    </AppLayout>
  );
}

// ================================================
// PORTFOLIO CARD COMPONENT
// ================================================

interface PortfolioCardProps {
  item: PortfolioItem;
  userId: string;
  onView: () => void;
}

function PortfolioCard({ item, userId: _userId, onView }: PortfolioCardProps) {
  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg"
      onClick={onView}
    >
      {/* Image */}
      <div className="relative aspect-video bg-gray-200">
        {item.images && item.images.length > 0 ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <div className="absolute right-4 bottom-4 left-4">
            <p className="text-sm text-white">Detayları Gör</p>
          </div>
        </div>

        {/* View Count Badge */}
        {item.viewCount !== undefined && item.viewCount > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <Eye className="h-3 w-3" />
            <span>{item.viewCount}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">
          {item.title}
        </h3>

        <p className="mb-3 line-clamp-2 text-sm text-gray-600">
          {item.description}
        </p>

        {/* Skills */}
        {item.skills && item.skills.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {item.skills.slice(0, 3).map((skill: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
              >
                <Tag className="h-3 w-3" />
                {skill}
              </span>
            ))}
            {item.skills.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                +{item.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          {item.completedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(item.completedAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          )}

          {item.client && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="line-clamp-1">{item.client}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ================================================
// PORTFOLIO DETAIL MODAL
// ================================================

interface PortfolioDetailModalProps {
  portfolio: PortfolioItem;
  userId: string;
  onClose: () => void;
}

function PortfolioDetailModal({
  portfolio,
  userId,
  onClose,
}: PortfolioDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = portfolio.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 text-gray-700 backdrop-blur-sm transition-colors hover:bg-white"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="relative aspect-video bg-gray-900">
            <Image
              src={images[currentImageIndex]}
              alt={`${portfolio.title} - Image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
            />

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-3 backdrop-blur-sm transition-all hover:bg-white"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 p-3 backdrop-blur-sm transition-all hover:bg-white"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                {portfolio.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {portfolio.completedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(portfolio.completedAt).toLocaleDateString(
                        'tr-TR',
                        {
                          year: 'numeric',
                          month: 'long',
                        }
                      )}
                    </span>
                  </div>
                )}

                {portfolio.client && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{portfolio.client}</span>
                  </div>
                )}

                {portfolio.viewCount !== undefined &&
                  portfolio.viewCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{portfolio.viewCount} görüntülenme</span>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PortfolioShare portfolio={portfolio} userId={userId} />
              {portfolio.url && (
                <a
                  href={portfolio.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <ExternalLink className="mr-2 inline-block h-4 w-4" />
                  Projeyi Gör
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Açıklama
            </h3>
            <p className="whitespace-pre-wrap text-gray-700">
              {portfolio.description}
            </p>
          </div>

          {/* Skills/Technologies */}
          {portfolio.skills && portfolio.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Kullanılan Teknolojiler
              </h3>
              <div className="flex flex-wrap gap-2">
                {portfolio.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                  >
                    <Tag className="h-3 w-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Category */}
          {portfolio.category && (
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Kategori
              </h3>
              <span className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700">
                {portfolio.category}
              </span>
            </div>
          )}

          {/* Image Thumbnails */}
          {hasMultipleImages && (
            <div className="border-t pt-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Görseller
              </h3>
              <div className="grid grid-cols-4 gap-3 md:grid-cols-6 lg:grid-cols-8">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg transition-all ${
                      currentImageIndex === index
                        ? 'ring-2 ring-blue-600'
                        : 'hover:opacity-75'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
