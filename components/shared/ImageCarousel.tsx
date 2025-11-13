'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  height?: number | string;
  showNavigation?: boolean;
  showIndicators?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onImageChange?: (index: number) => void;
  fallback?: React.ReactNode;
}

// ================================================
// IMAGE CAROUSEL COMPONENT
// ================================================

export const ImageCarousel = React.memo<ImageCarouselProps>(
  ({
    images,
    alt,
    className,
    height = 160,
    showNavigation = true,
    showIndicators = true,
    autoPlay = false,
    autoPlayInterval = 3000,
    onImageChange,
    fallback,
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = useCallback(() => {
      const nextIndex =
        currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      setCurrentIndex(nextIndex);
      onImageChange?.(nextIndex);
    }, [currentIndex, images.length, onImageChange]);

    const goToPrevious = useCallback(() => {
      const prevIndex =
        currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      onImageChange?.(prevIndex);
    }, [currentIndex, images.length, onImageChange]);

    const goToIndex = useCallback(
      (index: number) => {
        setCurrentIndex(index);
        onImageChange?.(index);
      },
      [onImageChange]
    );

    // Auto play functionality
    React.useEffect(() => {
      if (!autoPlay || images.length <= 1) return;

      const interval = setInterval(goToNext, autoPlayInterval);
      return () => clearInterval(interval);
    }, [autoPlay, autoPlayInterval, goToNext, images.length]);

    // Handle empty images
    if (!images || images.length === 0) {
      return (
        <div
          className={cn(
            'flex items-center justify-center bg-gray-200',
            className
          )}
          style={{ height }}
        >
          {fallback || (
            <div className="text-sm text-gray-400">Resim bulunamadı</div>
          )}
        </div>
      );
    }

    // Single image
    if (images.length === 1) {
      return (
        <div
          className={cn('relative bg-gray-200', className)}
          style={{ height }}
        >
          <Image
            src={images[0]}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      );
    }

    return (
      <div className={cn('relative bg-gray-200', className)} style={{ height }}>
        {/* Current Image */}
        <Image
          src={images[currentIndex]}
          alt={`${alt} - ${currentIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Navigation Buttons */}
        {showNavigation && images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute top-1/2 left-2 -translate-y-1/2 transform rounded-full bg-white/80 p-1 backdrop-blur-sm transition-all hover:bg-white/90"
              aria-label="Önceki resim"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={goToNext}
              className="absolute top-1/2 right-2 -translate-y-1/2 transform rounded-full bg-white/80 p-1 backdrop-blur-sm transition-all hover:bg-white/90"
              aria-label="Sonraki resim"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Indicators */}
        {showIndicators && images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 transform space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors',
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                )}
                aria-label={`Resim ${index + 1}'e git`}
              />
            ))}
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute top-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    );
  }
);

ImageCarousel.displayName = 'ImageCarousel';
