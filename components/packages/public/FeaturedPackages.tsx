'use client';

/**
 * Featured Packages Carousel
 * Displays featured packages in a horizontal scrollable carousel
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { packageApi } from '@/lib/api/packages';
import { PackageCard } from './PackageCard';
import { Button } from '@/components/ui';
import type { PackageSummary } from '@/types/business/features/package';

interface FeaturedPackagesProps {
  limit?: number;
  showControls?: boolean;
}

export function FeaturedPackages({
  limit = 8,
  showControls = true,
}: FeaturedPackagesProps) {
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFeaturedPackages = async () => {
      try {
        const response = await packageApi.getFeaturedPackages({
          page: 0,
          size: limit,
        });
        setPackages(response.content);
      } catch (error) {
        console.error('Failed to fetch featured packages:', error);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPackages();
  }, [limit]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = 400;
    const newScrollLeft =
      scrollRef.current.scrollLeft +
      (direction === 'left' ? -scrollAmount : scrollAmount);

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-10 w-10 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-10 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="flex gap-6 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="min-w-[300px] animate-pulse rounded-lg border border-gray-200 bg-white"
            >
              <div className="aspect-video w-full bg-gray-200" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-5/6 rounded bg-gray-200" />
                <div className="h-6 w-1/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Öne Çıkan Paketler
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            En popüler ve kaliteli hizmetler
          </p>
        </div>
        {showControls && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll('left')}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Geri
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll('right')}
              leftIcon={<ChevronRight className="h-4 w-4" />}
            >
              İleri
            </Button>
          </div>
        )}
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-6 overflow-x-auto pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {packages.map((pkg) => (
          <div key={pkg.id} className="min-w-[300px] flex-shrink-0">
            <PackageCard package={pkg} />
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center">
        <Link href="/marketplace/packages">
          <Button variant="outline">Tüm Paketleri Gör</Button>
        </Link>
      </div>
    </div>
  );
}
