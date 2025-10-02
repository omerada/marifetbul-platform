import { useEffect } from 'react';
import { useThemeStore } from '@/lib/core/store/theme';

/**
 * Theme initialization hook
 * Handles theme setup on client side
 */
export function useThemeInitializer() {
  const { theme, applyTheme } = useThemeStore();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Apply the stored theme on mount
    applyTheme(theme);
  }, [theme, applyTheme]);
}

/**
 * Enhanced theme hook with better UX
 * Provides all theme functionality with proper client-side handling
 */
export function useTheme() {
  const store = useThemeStore();

  useEffect(() => {
    // Initialize theme on first load
    if (typeof window !== 'undefined') {
      store.applyTheme(store.theme);
    }
  }, [store]);

  return {
    theme: store.theme,
    isDarkMode: store.isDarkMode,
    setTheme: store.setTheme,
    toggleTheme: store.toggleTheme,
    themeIcon: store.isDarkMode ? 'sun' : 'moon',
    themeLabel: store.isDarkMode ? 'Açık Tema' : 'Koyu Tema',
  };
}
