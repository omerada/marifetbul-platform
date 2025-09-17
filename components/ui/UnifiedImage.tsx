'use client';
// @ts-nocheck

import React, { forwardRef } from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { cn } from '@/lib/utils';

// ================================================
// UNIFIED IMAGE COMPONENT - PRODUCTION READY
// ================================================
// Single image component supporting all use cases
// Replaces: OptimizedImage, AvatarImage, HeroImage, GalleryImage, ThumbnailImage, BackgroundImage

interface UnifiedImageProps extends Omit<NextImageProps, 'alt'> {
  // Variant determines the use case and styling
  variant?:
    | 'avatar'
    | 'hero'
    | 'gallery'
    | 'thumbnail'
    | 'background'
    | 'profile'
    | 'logo'
    | 'product';

  // Layout and sizing
  aspectRatio?: 'square' | '16:9' | '4:3' | '3:2' | '2:1' | 'auto' | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';

  // Styling
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  overlay?: boolean;
  overlayColor?: 'black' | 'white' | 'blue' | 'gray';
  overlayOpacity?: 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90;

  // Accessibility
  alt: string;
  caption?: string;

  // Optimization
  eager?: boolean;
  blur?: boolean;
  quality?: number;

  // Error handling
  fallback?: string;
  onError?: () => void;

  // Interactive
  clickable?: boolean;
  zoom?: boolean;

  // Loading state
  showSkeleton?: boolean;
  skeletonClassName?: string;
}

export const UnifiedImage = forwardRef<HTMLImageElement, UnifiedImageProps>(
  (
    {
      variant = 'gallery',
      aspectRatio = 'auto',
      objectFit = 'cover',
      rounded = 'md',
      shadow = 'none',
      overlay = false,
      overlayColor = 'black',
      overlayOpacity = 50,
      alt,
      caption,
      eager = false,
      blur = false,
      quality = 80,
      fallback,
      onError,
      clickable = false,
      zoom = false,
      showSkeleton = true,
      skeletonClassName,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
    const [isZoomed, setIsZoomed] = React.useState(false);

    // Variant-specific configurations
    const variantConfigs = {
      avatar: {
        defaultRounded: 'full' as const,
        defaultAspectRatio: 'square' as const,
        defaultShadow: 'sm' as const,
        defaultSize: { width: 40, height: 40 },
      },
      hero: {
        defaultRounded: 'none' as const,
        defaultAspectRatio: '16:9' as const,
        defaultShadow: 'lg' as const,
        defaultSize: { width: 1200, height: 675 },
      },
      gallery: {
        defaultRounded: 'md' as const,
        defaultAspectRatio: '4:3' as const,
        defaultShadow: 'md' as const,
        defaultSize: { width: 400, height: 300 },
      },
      thumbnail: {
        defaultRounded: 'sm' as const,
        defaultAspectRatio: 'square' as const,
        defaultShadow: 'sm' as const,
        defaultSize: { width: 100, height: 100 },
      },
      background: {
        defaultRounded: 'none' as const,
        defaultAspectRatio: 'auto' as const,
        defaultShadow: 'none' as const,
        defaultSize: { width: 1920, height: 1080 },
      },
      profile: {
        defaultRounded: 'lg' as const,
        defaultAspectRatio: 'square' as const,
        defaultShadow: 'md' as const,
        defaultSize: { width: 200, height: 200 },
      },
      logo: {
        defaultRounded: 'none' as const,
        defaultAspectRatio: 'auto' as const,
        defaultShadow: 'none' as const,
        defaultSize: { width: 120, height: 40 },
      },
      product: {
        defaultRounded: 'lg' as const,
        defaultAspectRatio: 'square' as const,
        defaultShadow: 'lg' as const,
        defaultSize: { width: 300, height: 300 },
      },
    };

    const config = variantConfigs[variant as keyof typeof variantConfigs];

    // Determine final props with variant defaults
    const finalRounded = rounded === 'md' ? config.defaultRounded : rounded;
    const finalAspectRatio =
      aspectRatio === 'auto' ? config.defaultAspectRatio : aspectRatio;
    const finalShadow = shadow === 'none' ? config.defaultShadow : shadow;

    // Size handling
    const width = props.width || config.defaultSize.width;
    const height = props.height || config.defaultSize.height;

    // Styling classes
    const roundedClasses = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    };

    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    };

    const objectFitClasses = {
      cover: 'object-cover',
      contain: 'object-contain',
      fill: 'object-fill',
      'scale-down': 'object-scale-down',
      none: 'object-none',
    };

    const overlayClasses = {
      black: 'bg-black',
      white: 'bg-white',
      blue: 'bg-blue-600',
      gray: 'bg-gray-600',
    };

    const overlayOpacityClasses = {
      10: 'bg-opacity-10',
      20: 'bg-opacity-20',
      30: 'bg-opacity-30',
      40: 'bg-opacity-40',
      50: 'bg-opacity-50',
      60: 'bg-opacity-60',
      70: 'bg-opacity-70',
      80: 'bg-opacity-80',
      90: 'bg-opacity-90',
    };

    // Aspect ratio handling
    const getAspectRatioClasses = (ratio: string) => {
      switch (ratio) {
        case 'square':
          return 'aspect-square';
        case '16:9':
          return 'aspect-video';
        case '4:3':
          return 'aspect-[4/3]';
        case '3:2':
          return 'aspect-[3/2]';
        case '2:1':
          return 'aspect-[2/1]';
        default:
          return '';
      }
    };

    // Event handlers
    const handleLoad = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      onError?.();
    };

    const handleClick = () => {
      if (zoom) {
        setIsZoomed(!isZoomed);
      }
    };

    // Render fallback
    if (hasError && fallback) {
      return (
        <div
          className={cn(
            'flex items-center justify-center bg-gray-100 text-gray-400',
            roundedClasses[finalRounded],
            shadowClasses[finalShadow],
            getAspectRatioClasses(finalAspectRatio),
            className
          )}
          style={{ width, height, ...style }}
        >
          <NextImage
            src={fallback}
            alt={alt}
            width={width as number}
            height={height as number}
            className={cn(objectFitClasses[objectFit])}
          />
        </div>
      );
    }

    // Render error state
    if (hasError) {
      return (
        <div
          className={cn(
            'flex items-center justify-center bg-gray-100 text-sm text-gray-400',
            roundedClasses[finalRounded],
            shadowClasses[finalShadow],
            getAspectRatioClasses(finalAspectRatio),
            className
          )}
          style={{ width, height, ...style }}
        >
          <div className="text-center">
            <div className="mb-1">⚠️</div>
            <div>Resim yüklenemedi</div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        {/* Loading skeleton */}
        {isLoading && showSkeleton && (
          <div
            className={cn(
              'absolute inset-0 animate-pulse bg-gray-200',
              roundedClasses[finalRounded],
              skeletonClassName
            )}
            style={{ width, height }}
          />
        )}

        {/* Main image container */}
        <div
          className={cn(
            'relative overflow-hidden',
            roundedClasses[finalRounded],
            shadowClasses[finalShadow],
            getAspectRatioClasses(finalAspectRatio),
            clickable && 'cursor-pointer',
            zoom && 'transition-transform duration-300 hover:scale-105',
            className
          )}
          style={aspectRatio === 'auto' ? { width, height, ...style } : style}
          onClick={clickable ? handleClick : undefined}
        >
          <NextImage
            ref={ref}
            alt={alt}
            width={width as number}
            height={height as number}
            quality={quality}
            priority={eager}
            placeholder={blur ? 'blur' : 'empty'}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              objectFitClasses[objectFit],
              'h-full w-full',
              isLoading && 'opacity-0',
              !isLoading && 'opacity-100 transition-opacity duration-300'
            )}
            {...props}
          />

          {/* Overlay */}
          {overlay && (
            <div
              className={cn(
                'absolute inset-0',
                overlayClasses[overlayColor],
                overlayOpacityClasses[overlayOpacity]
              )}
            />
          )}
        </div>

        {/* Caption */}
        {caption && <p className="mt-2 text-sm text-gray-600">{caption}</p>}

        {/* Zoom modal */}
        {isZoomed && (
          <div
            className="bg-opacity-90 fixed inset-0 z-50 flex items-center justify-center bg-black"
            onClick={() => setIsZoomed(false)}
          >
            <div className="relative max-h-[90vh] max-w-[90vw]">
              <NextImage
                src={props.src}
                alt={alt}
                width={width as number}
                height={height as number}
                className="max-h-full max-w-full object-contain"
                quality={100}
              />
              <button
                className="bg-opacity-50 hover:bg-opacity-70 absolute top-4 right-4 rounded-full bg-black p-2 text-white"
                onClick={() => setIsZoomed(false)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

UnifiedImage.displayName = 'UnifiedImage';

// ================================================
// CONVENIENCE COMPONENTS
// ================================================

export const AvatarImage = forwardRef<
  HTMLImageElement,
  Omit<UnifiedImageProps, 'variant'>
>((props, ref) => <UnifiedImage ref={ref} variant="avatar" {...props} />);

export const HeroImage = forwardRef<
  HTMLImageElement,
  Omit<UnifiedImageProps, 'variant'>
>((props, ref) => <UnifiedImage ref={ref} variant="hero" {...props} />);

export const GalleryImage = forwardRef<
  HTMLImageElement,
  Omit<UnifiedImageProps, 'variant'>
>((props, ref) => <UnifiedImage ref={ref} variant="gallery" {...props} />);

export const ThumbnailImage = forwardRef<
  HTMLImageElement,
  Omit<UnifiedImageProps, 'variant'>
>((props, ref) => <UnifiedImage ref={ref} variant="thumbnail" {...props} />);

export const BackgroundImage = forwardRef<
  HTMLImageElement,
  Omit<UnifiedImageProps, 'variant'>
>((props, ref) => <UnifiedImage ref={ref} variant="background" {...props} />);

export const ProfileImage = forwardRef<
  HTMLImageElement,
  Omit<UnifiedImageProps, 'variant'>
>((props, ref) => <UnifiedImage ref={ref} variant="profile" {...props} />);

export const LogoImage = forwardRef<
  HTMLImageElement,
  Omit<UnifiedImageProps, 'variant'>
>((props, ref) => <UnifiedImage ref={ref} variant="logo" {...props} />);

export const ProductImage = forwardRef<
  HTMLImageElement,
  Omit<UnifiedImageProps, 'variant'>
>((props, ref) => <UnifiedImage ref={ref} variant="product" {...props} />);

// Set display names
AvatarImage.displayName = 'AvatarImage';
HeroImage.displayName = 'HeroImage';
GalleryImage.displayName = 'GalleryImage';
ThumbnailImage.displayName = 'ThumbnailImage';
BackgroundImage.displayName = 'BackgroundImage';
ProfileImage.displayName = 'ProfileImage';
LogoImage.displayName = 'LogoImage';
ProductImage.displayName = 'ProductImage';

// ================================================
// HOOKS
// ================================================

// Hook for image preloading
export function useImagePreloader() {
  const preloadImage = React.useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadImages = React.useCallback(
    async (srcs: string[]): Promise<void> => {
      await Promise.all(srcs.map(preloadImage));
    },
    [preloadImage]
  );

  return { preloadImage, preloadImages };
}

// Hook for image lazy loading
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  const [imageSrc, setImageSrc] = React.useState<string>('');
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src, options]);

  return { imageSrc, isIntersecting, imgRef };
}

// ================================================
// LEGACY EXPORTS FOR COMPATIBILITY
// ================================================
export { UnifiedImage as OptimizedImage };
export { UnifiedImage as Image };

export default UnifiedImage;
