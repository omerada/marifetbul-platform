// ================================================
// MODERN RESPONSIVE DESIGN SYSTEM
// ================================================
// Advanced responsive utilities with modern CSS approaches

import { useEffect, useState, useCallback } from 'react';
import { cn } from '../../../utils';

// ================================
// TYPES
// ================================

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface ViewportInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  deviceType: DeviceType;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  pixelRatio: number;
}

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// ================================
// CONSTANTS
// ================================

export const BREAKPOINTS: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const CONTAINER_SIZES = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ================================
// RESPONSIVE HOOKS
// ================================

export function useViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        breakpoint: 'lg',
        deviceType: 'desktop',
        orientation: 'landscape',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouch: false,
        pixelRatio: 1,
      };
    }

    return calculateViewportInfo();
  });

  const updateViewport = useCallback(() => {
    setViewport(calculateViewportInfo());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(() => {
      updateViewport();
    });

    resizeObserver.observe(document.documentElement);

    // Fallback for older browsers
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, [updateViewport]);

  return viewport;
}

export function useBreakpoint(): {
  current: Breakpoint;
  isAbove: (breakpoint: Breakpoint) => boolean;
  isBelow: (breakpoint: Breakpoint) => boolean;
  isOnly: (breakpoint: Breakpoint) => boolean;
  isBetween: (min: Breakpoint, max: Breakpoint) => boolean;
} {
  const { breakpoint, width } = useViewport();

  const isAbove = useCallback(
    (bp: Breakpoint) => {
      return width >= BREAKPOINTS[bp];
    },
    [width]
  );

  const isBelow = useCallback(
    (bp: Breakpoint) => {
      return width < BREAKPOINTS[bp];
    },
    [width]
  );

  const isOnly = useCallback(
    (bp: Breakpoint) => {
      const breakpointKeys = Object.keys(BREAKPOINTS) as Breakpoint[];
      const currentIndex = breakpointKeys.indexOf(bp);
      const nextBreakpoint = breakpointKeys[currentIndex + 1];

      return (
        width >= BREAKPOINTS[bp] &&
        (nextBreakpoint ? width < BREAKPOINTS[nextBreakpoint] : true)
      );
    },
    [width]
  );

  const isBetween = useCallback(
    (min: Breakpoint, max: Breakpoint) => {
      return width >= BREAKPOINTS[min] && width < BREAKPOINTS[max];
    },
    [width]
  );

  return {
    current: breakpoint,
    isAbove,
    isBelow,
    isOnly,
    isBetween,
  };
}

export function useDeviceDetection() {
  const { deviceType, isTouch } = useViewport();
  const [deviceFeatures, setDeviceFeatures] = useState({
    hasHover: false,
    prefersReducedMotion: false,
    colorScheme: 'light' as 'light' | 'dark',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateFeatures = () => {
      setDeviceFeatures({
        hasHover: window.matchMedia('(hover: hover)').matches,
        prefersReducedMotion: window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches,
        colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
      });
    };

    updateFeatures();

    // Listen for changes
    const hoverQuery = window.matchMedia('(hover: hover)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const colorQuery = window.matchMedia('(prefers-color-scheme: dark)');

    hoverQuery.addEventListener('change', updateFeatures);
    motionQuery.addEventListener('change', updateFeatures);
    colorQuery.addEventListener('change', updateFeatures);

    return () => {
      hoverQuery.removeEventListener('change', updateFeatures);
      motionQuery.removeEventListener('change', updateFeatures);
      colorQuery.removeEventListener('change', updateFeatures);
    };
  }, []);

  return {
    deviceType,
    isTouch,
    ...deviceFeatures,
  };
}

// ================================
// UTILITY FUNCTIONS
// ================================

function calculateViewportInfo(): ViewportInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Determine breakpoint
  let breakpoint: Breakpoint = 'xs';
  const breakpointEntries = Object.entries(BREAKPOINTS) as [
    Breakpoint,
    number,
  ][];
  for (const [bp, minWidth] of breakpointEntries.reverse()) {
    if (width >= minWidth) {
      breakpoint = bp;
      break;
    }
  }

  // Determine device type
  let deviceType: DeviceType = 'mobile';
  if (width >= BREAKPOINTS.lg) {
    deviceType = 'desktop';
  } else if (width >= BREAKPOINTS.md) {
    deviceType = 'tablet';
  }

  // Determine orientation
  const orientation: Orientation = width > height ? 'landscape' : 'portrait';

  // Detect touch capability
  const isTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - Legacy IE property check
    navigator.msMaxTouchPoints > 0;

  return {
    width,
    height,
    breakpoint,
    deviceType,
    orientation,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isTouch,
    pixelRatio: window.devicePixelRatio || 1,
  };
}

export function getResponsiveValue<T>(
  value: ResponsiveValue<T> | T,
  currentBreakpoint: Breakpoint
): T | undefined {
  if (typeof value !== 'object' || value === null) {
    return value as T;
  }

  const responsiveValue = value as ResponsiveValue<T>;
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

  // Look for exact match first
  if (responsiveValue[currentBreakpoint] !== undefined) {
    return responsiveValue[currentBreakpoint];
  }

  // Look for the closest smaller breakpoint
  for (let i = currentIndex - 1; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (responsiveValue[bp] !== undefined) {
      return responsiveValue[bp];
    }
  }

  // Fallback to the smallest defined value
  for (const bp of breakpointOrder) {
    if (responsiveValue[bp] !== undefined) {
      return responsiveValue[bp];
    }
  }

  return undefined;
}

export function createResponsiveValue<T>(
  mobile: T,
  tablet?: T,
  desktop?: T
): ResponsiveValue<T> {
  return {
    xs: mobile,
    sm: mobile,
    md: tablet || mobile,
    lg: desktop || tablet || mobile,
    xl: desktop || tablet || mobile,
    '2xl': desktop || tablet || mobile,
  };
}

// ================================
// CSS UTILITIES
// ================================

export function generateResponsiveStyles(
  property: string,
  values: ResponsiveValue<string | number>
): string {
  const styles: string[] = [];

  Object.entries(values).forEach(([breakpoint, value]) => {
    if (value === undefined) return;

    const bp = breakpoint as Breakpoint;
    const minWidth = BREAKPOINTS[bp];

    if (minWidth === 0) {
      styles.push(`${property}: ${value};`);
    } else {
      styles.push(
        `@media (min-width: ${minWidth}px) { ${property}: ${value}; }`
      );
    }
  });

  return styles.join(' ');
}

export function responsiveClasses(
  base: string,
  responsive: Partial<Record<Breakpoint, string>>
): string {
  const classes = [base];

  Object.entries(responsive).forEach(([breakpoint, className]) => {
    if (className) {
      const bp = breakpoint as Breakpoint;
      const prefix = bp === 'xs' ? '' : `${bp}:`;
      classes.push(`${prefix}${className}`);
    }
  });

  return cn(...classes);
}

// ================================
// PERFORMANCE OPTIMIZATION
// ================================

export function useResponsiveImage(
  baseSrc: string,
  sizes?: ResponsiveValue<number>
): {
  src: string;
  srcSet: string;
  sizes: string;
} {
  const { breakpoint } = useViewport();

  const size =
    getResponsiveValue(
      sizes || {
        xs: 320,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
      },
      breakpoint
    ) || 1024;

  // Generate srcSet for different resolutions
  const srcSet = [1, 1.5, 2, 3]
    .map((ratio) => {
      const width = Math.round(size * ratio);
      return `${baseSrc}?w=${width}&q=75 ${ratio}x`;
    })
    .join(', ');

  // Generate sizes attribute
  const sizesAttr =
    Object.entries(BREAKPOINTS)
      .reverse()
      .map(([bp, minWidth]) => {
        const targetSize = sizes?.[bp as Breakpoint];
        if (targetSize && minWidth > 0) {
          return `(min-width: ${minWidth}px) ${targetSize}px`;
        }
        return null;
      })
      .filter(Boolean)
      .join(', ') + `, ${size}px`;

  return {
    src: `${baseSrc}?w=${size}&q=75`,
    srcSet,
    sizes: sizesAttr,
  };
}

// ================================
// EXPORTS
// ================================

const ResponsiveCore = {
  useViewport,
  useBreakpoint,
  useDeviceDetection,
  getResponsiveValue,
  createResponsiveValue,
  generateResponsiveStyles,
  responsiveClasses,
  useResponsiveImage,
  BREAKPOINTS,
  CONTAINER_SIZES,
};

export default ResponsiveCore;
