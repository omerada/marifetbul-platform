'use client';

import { useState, useEffect } from 'react';

interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
}

export function useResponsive(): UseResponsiveReturn {
  const [screenData, setScreenData] = useState<UseResponsiveReturn>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenSize: 'desktop',
    orientation: 'landscape',
  });

  useEffect(() => {
    const updateScreenData = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      const screenSize: 'mobile' | 'tablet' | 'desktop' = isMobile
        ? 'mobile'
        : isTablet
          ? 'tablet'
          : 'desktop';

      const orientation: 'portrait' | 'landscape' =
        height > width ? 'portrait' : 'landscape';

      setScreenData({
        isMobile,
        isTablet,
        isDesktop,
        screenSize,
        orientation,
      });
    };

    // Initial check
    updateScreenData();

    // Listen for resize events
    window.addEventListener('resize', updateScreenData);
    window.addEventListener('orientationchange', updateScreenData);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateScreenData);
      window.removeEventListener('orientationchange', updateScreenData);
    };
  }, []);

  return screenData;
}

interface UseTouchReturn {
  isTouchDevice: boolean;
  supportsHover: boolean;
}

export function useTouch(): UseTouchReturn {
  const [touchData, setTouchData] = useState<UseTouchReturn>({
    isTouchDevice: false,
    supportsHover: true,
  });

  useEffect(() => {
    const updateTouchData = () => {
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const supportsHover = window.matchMedia('(hover: hover)').matches;

      setTouchData({
        isTouchDevice,
        supportsHover,
      });
    };

    updateTouchData();

    // Listen for media query changes
    const mediaQuery = window.matchMedia('(hover: hover)');
    mediaQuery.addEventListener('change', updateTouchData);

    return () => {
      mediaQuery.removeEventListener('change', updateTouchData);
    };
  }, []);

  return touchData;
}
