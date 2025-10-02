'use client';

import { useEffect } from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Prevent FOUC (Flash of Unstyled Content)
    document.documentElement.style.visibility = 'visible';
  }, []);

  return <>{children}</>;
}
