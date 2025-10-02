'use client';

import { useEffect } from 'react';
import { useThemeInitializer } from '@/hooks';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme system
  useThemeInitializer();

  useEffect(() => {
    // Prevent FOUC (Flash of Unstyled Content)
    document.documentElement.style.visibility = 'visible';
  }, []);

  return <>{children}</>;
}
