'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function ImageOptimizer({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  className,
  sizes,
  fill = false,
  loading,
  onLoad,
  onError,
}: ImageOptimizerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  // Generate optimized image URL
  const getOptimizedSrc = (
    originalSrc: string,
    width?: number,
    quality = 75
  ) => {
    // In a real application, this would integrate with a CDN like Cloudinary, ImageKit, or Next.js Image Optimization
    // For this example, we'll simulate optimization parameters

    if (!originalSrc) return '';

    // If it's already a data URL or external URL, return as is
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // Simulate optimization query parameters
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());
    params.set('f', 'webp'); // Prefer WebP format

    return `${originalSrc}?${params.toString()}`;
  };

  // Generate srcSet for responsive images
  const generateSrcSet = (originalSrc: string, width?: number) => {
    if (!width) return undefined;

    const breakpoints = [0.5, 1, 1.5, 2]; // Different density multipliers

    return breakpoints
      .map((multiplier) => {
        const scaledWidth = Math.round(width * multiplier);
        const optimizedSrc = getOptimizedSrc(originalSrc, scaledWidth, quality);
        return `${optimizedSrc} ${multiplier}x`;
      })
      .join(', ');
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    const err = new Error(`Failed to load image: ${src}`);
    setHasError(true);
    onError?.(err);
  };

  // Default blur placeholder
  const defaultBlurDataURL =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  if (!isIntersecting) {
    // Render placeholder while waiting for intersection
    return (
      <div
        ref={imgRef}
        className={cn(
          'bg-muted animate-pulse',
          fill ? 'absolute inset-0' : '',
          className
        )}
        style={{
          width: fill ? undefined : width,
          height: fill ? undefined : height,
          aspectRatio: width && height ? `${width}/${height}` : undefined,
        }}
      />
    );
  }

  if (hasError) {
    // Error fallback
    return (
      <div
        className={cn(
          'bg-muted text-muted-foreground flex items-center justify-center text-sm',
          fill ? 'absolute inset-0' : '',
          className
        )}
        style={{
          width: fill ? undefined : width,
          height: fill ? undefined : height,
          aspectRatio: width && height ? `${width}/${height}` : undefined,
        }}
      >
        Failed to load image
      </div>
    );
  }

  const optimizedSrc = getOptimizedSrc(src, width, quality);
  const srcSet = generateSrcSet(src, width);

  return (
    <div className={cn('relative', fill ? 'absolute inset-0' : '', className)}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <img
          src={blurDataURL || defaultBlurDataURL}
          alt=""
          className={cn(
            'absolute inset-0 h-full w-full object-cover blur-sm filter transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          style={{
            width: fill ? '100%' : width,
            height: fill ? '100%' : height,
          }}
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        loading={loading || (priority ? 'eager' : 'lazy')}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          fill ? 'absolute inset-0 h-full w-full object-cover' : '',
          placeholder === 'blur' && !isLoaded ? 'opacity-0' : 'opacity-100',
          isLoaded ? '' : placeholder === 'empty' ? 'opacity-0' : ''
        )}
        style={{
          aspectRatio:
            width && height && !fill ? `${width}/${height}` : undefined,
        }}
      />

      {/* Loading placeholder for empty placeholder */}
      {placeholder === 'empty' && !isLoaded && (
        <div
          className={cn(
            'bg-muted absolute inset-0 animate-pulse',
            fill ? '' : 'rounded'
          )}
          style={{
            width: fill ? '100%' : width,
            height: fill ? '100%' : height,
          }}
        />
      )}
    </div>
  );
}

// Hook for monitoring image performance
export function useImagePerformance() {
  const [metrics, setMetrics] = useState<{
    loadTime: number;
    size: number;
    format: string;
  } | null>(null);

  const measureImageLoad = (src: string) => {
    const startTime = performance.now();

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const loadTime = performance.now() - startTime;

        // Simulate getting image metadata (in real app, this would come from headers)
        setMetrics({
          loadTime,
          size: 0, // Would need server-side info
          format: src.includes('.webp')
            ? 'webp'
            : src.includes('.png')
              ? 'png'
              : 'jpeg',
        });

        resolve(img);
      };

      img.onerror = reject;
      img.src = src;
    });
  };

  return { metrics, measureImageLoad };
}

// Utility for generating responsive image sizes
export function generateImageSizes(breakpoints: Record<string, number>) {
  return Object.entries(breakpoints)
    .map(([breakpoint, width]) => `(max-width: ${breakpoint}) ${width}px`)
    .join(', ');
}

// Common responsive image configurations
export const imagePresets = {
  avatar: {
    sizes: generateImageSizes({
      '480px': 64,
      '768px': 80,
      '1024px': 96,
    }),
    quality: 80,
  },
  card: {
    sizes: generateImageSizes({
      '480px': 300,
      '768px': 400,
      '1024px': 500,
    }),
    quality: 75,
  },
  hero: {
    sizes: generateImageSizes({
      '480px': 480,
      '768px': 768,
      '1024px': 1024,
      '1440px': 1440,
    }),
    quality: 85,
    priority: true,
  },
  thumbnail: {
    sizes: generateImageSizes({
      '480px': 150,
      '768px': 200,
      '1024px': 250,
    }),
    quality: 70,
  },
} as const;
