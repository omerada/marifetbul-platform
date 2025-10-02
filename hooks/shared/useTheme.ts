import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/lib/core/store/theme';

/**
 * Theme initialization hook
 * Handles theme setup on client side
 */
export function useThemeInitializer() {
  const { isDarkMode } = useThemeStore();
  const initialized = useRef(false);

  useEffect(() => {
    // Only run once on client side
    if (typeof window === 'undefined' || initialized.current) return;

    initialized.current = true;

    // Apply theme class to document
    const root = document.documentElement;
    const body = document.body;

    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      body.classList.remove('dark');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once
}

/**
 * Enhanced theme hook with better UX
 * Provides all theme functionality with proper client-side handling
 */
export function useTheme() {
  const store = useThemeStore();
  const initialized = useRef(false);

  useEffect(() => {
    // Initialize theme on first load only
    if (typeof window !== 'undefined' && !initialized.current) {
      initialized.current = true;

      // Apply theme class to document without triggering store update
      const root = document.documentElement;
      const body = document.body;

      if (store.isDarkMode) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        body.classList.remove('dark');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isDarkMode]); // Watch for theme changes

  return {
    theme: store.theme,
    isDarkMode: store.isDarkMode,
    setTheme: store.setTheme,
    toggleTheme: store.toggleTheme,
    themeIcon: store.isDarkMode ? 'sun' : 'moon',
    themeLabel: store.isDarkMode ? 'Açık Tema' : 'Koyu Tema',
  };
}
