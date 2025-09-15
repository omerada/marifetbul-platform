import React, { memo, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { shallowEqual } from '@/lib/core/store/optimized';

// ================================================
// PERFORMANCE OPTIMIZED COMPONENTS
// ================================================

/**
 * Optimized Card Component with React.memo and shallow comparison
 */
interface OptimizedCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  onClick?: (id: string) => void;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
  isLoading?: boolean;
}

export const OptimizedCard = memo<OptimizedCardProps>(
  ({
    id,
    title,
    description,
    imageUrl,
    tags,
    onClick,
    onFavorite,
    isFavorited = false,
    isLoading = false,
  }) => {
    // Remove unused variable
    // const tagString = useMemo(() => tags.join(', '), [tags]);
    const cardClassName = useMemo(() => {
      return `
      block p-6 bg-white rounded-lg border border-gray-200 shadow-md 
      hover:shadow-lg transition-shadow duration-200
      ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      ${isFavorited ? 'border-primary-200 bg-primary-50' : ''}
    `.trim();
    }, [isLoading, isFavorited]);

    // Memoized callbacks
    const handleClick = useCallback(() => {
      if (!isLoading && onClick) {
        onClick(id);
      }
    }, [id, onClick, isLoading]);

    const handleFavorite = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoading && onFavorite) {
          onFavorite(id);
        }
      },
      [id, onFavorite, isLoading]
    );

    return (
      <div className={cardClassName} onClick={handleClick}>
        {imageUrl && (
          <div className="relative mb-4 h-48 w-full">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="rounded object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          </div>
        )}

        <div className="mb-2 flex items-start justify-between">
          <h5 className="text-xl font-bold tracking-tight text-gray-900">
            {title}
          </h5>

          {onFavorite && (
            <button
              onClick={handleFavorite}
              className={`rounded-full p-1 transition-colors ${
                isFavorited
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-400 hover:text-red-500'
              }`}
              aria-label={
                isFavorited ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        <p className="mb-3 line-clamp-3 font-normal text-gray-700">
          {description}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return shallowEqual(prevProps, nextProps);
  }
);

OptimizedCard.displayName = 'OptimizedCard';

// ================================================
// VIRTUALIZED LIST COMPONENT
// ================================================

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  overscan = 5,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleItems = useMemo(() => {
    const containerHeight = height;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );

    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex,
      visibleItems: items.slice(Math.max(0, startIndex - overscan), endIndex),
    };
  }, [items, scrollTop, itemHeight, height, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleItems.startIndex * itemHeight;

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.visibleItems.map((item, index) => (
            <div
              key={visibleItems.startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleItems.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================================================
// PERFORMANCE TRACKING COMPONENT
// ================================================

interface PerformanceTrackerProps {
  children: React.ReactNode;
  componentName: string;
}

export const PerformanceTracker = memo<PerformanceTrackerProps>(
  ({ children, componentName }) => {
    const renderStartTime = useMemo(() => performance.now(), []);

    React.useLayoutEffect(() => {
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime;

      // Track render performance
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);

        if (renderTime > 16) {
          console.warn(
            `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
          );
        }
      }
    });

    return <>{children}</>;
  }
);

PerformanceTracker.displayName = 'PerformanceTracker';

// ================================================
// LAZY LOADING WRAPPER
// ================================================

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  threshold?: number;
}

export const LazyWrapper = memo<LazyWrapperProps>(
  ({ children, fallback: Fallback, threshold = 0.1 }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, [threshold]);

    return (
      <div ref={ref}>
        {isVisible ? children : Fallback ? <Fallback /> : null}
      </div>
    );
  }
);

LazyWrapper.displayName = 'LazyWrapper';

// ================================================
// EXPORTS
// ================================================

const PerformanceOptimizedComponents = {
  OptimizedCard,
  VirtualizedList,
  PerformanceTracker,
  LazyWrapper,
};

export default PerformanceOptimizedComponents;
