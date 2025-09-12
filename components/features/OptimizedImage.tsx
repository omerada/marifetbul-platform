'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Loader2, ImageIcon, AlertCircle } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  showLoader?: boolean;
  aspectRatio?: string;
  rounded?: boolean;
  lazy?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc,
  showLoader = true,
  aspectRatio,
  rounded = false,
  lazy = true,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
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
  }, [lazy, priority, isInView]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);

    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
      return;
    }

    onError?.();
  };

  const wrapperClasses = cn(
    'relative overflow-hidden bg-gray-100',
    rounded && 'rounded-lg',
    aspectRatio && 'flex items-center justify-center',
    className
  );

  const imageClasses = cn(
    'transition-opacity duration-300',
    isLoading ? 'opacity-0' : 'opacity-100',
    rounded && 'rounded-lg'
  );

  // Generate responsive sizes if not provided
  const responsiveSizes =
    sizes ||
    (fill
      ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      : width
        ? `${width}px`
        : '100vw');

  // Render placeholder/skeleton while not in view
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={wrapperClasses}
        style={{
          aspectRatio,
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
        }}
      >
        <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-gray-200">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={wrapperClasses}
      style={{
        aspectRatio,
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
      }}
    >
      {/* Loading state */}
      {isLoading && showLoader && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error state */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <AlertCircle className="mb-2 h-8 w-8 text-gray-400" />
          <span className="px-2 text-center text-xs text-gray-500">
            Resim yüklenemedi
          </span>
        </div>
      ) : (
        <Image
          src={currentSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={responsiveSizes}
          className={imageClasses}
          style={{
            objectFit: fill ? objectFit : undefined,
            objectPosition: fill ? objectPosition : undefined,
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : loading}
        />
      )}
    </div>
  );
}

// Specific image variants for common use cases
interface AvatarImageProps
  extends Omit<OptimizedImageProps, 'aspectRatio' | 'objectFit'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square' | 'rounded';
}

export function AvatarImage({
  size = 'md',
  shape = 'circle',
  className,
  ...props
}: AvatarImageProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
  };

  return (
    <OptimizedImage
      {...props}
      aspectRatio="1"
      objectFit="cover"
      className={cn(sizeClasses[size], shapeClasses[shape], className)}
      rounded={shape !== 'circle'}
    />
  );
}

// Hero image component for large images
interface HeroImageProps extends OptimizedImageProps {
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}

export function HeroImage({
  overlay = false,
  overlayColor = 'black',
  overlayOpacity = 0.4,
  className,
  children,
  ...props
}: HeroImageProps & { children?: React.ReactNode }) {
  return (
    <div className={cn('relative', className)}>
      <OptimizedImage
        {...props}
        priority
        quality={85}
        sizes="100vw"
        className="h-full w-full"
      />

      {overlay && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}

      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

// Gallery image component
interface GalleryImageProps extends OptimizedImageProps {
  index?: number;
  total?: number;
}

export function GalleryImage({
  index,
  className,
  ...props
}: GalleryImageProps) {
  // Prioritize first few images in gallery
  const priority = index !== undefined && index < 3;

  return (
    <OptimizedImage
      {...props}
      priority={priority}
      quality={80}
      className={cn(
        'cursor-pointer transition-opacity hover:opacity-90',
        className
      )}
      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
    />
  );
}

// Thumbnail component for small preview images
export function ThumbnailImage({ className, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      quality={60}
      className={cn('h-20 w-20', className)}
      sizes="80px"
    />
  );
}

// Background image component
interface BackgroundImageProps {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  priority?: boolean;
  quality?: number;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}

export function BackgroundImage({
  src,
  alt,
  children,
  className,
  priority = false,
  quality = 75,
  overlay = false,
  overlayColor = 'black',
  overlayOpacity = 0.5,
}: BackgroundImageProps) {
  return (
    <div className={cn('relative', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={quality}
        objectFit="cover"
        className="absolute inset-0 -z-10"
        sizes="100vw"
      />

      {overlay && (
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}

      {children}
    </div>
  );
}

// Hook for image preloading
export function useImagePreloader() {
  const preloadedImages = useRef(new Set<string>());

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.current.has(src)) {
        resolve();
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        preloadedImages.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const preloadImages = (sources: string[]): Promise<void[]> => {
    return Promise.all(sources.map(preloadImage));
  };

  return { preloadImage, preloadImages };
}
