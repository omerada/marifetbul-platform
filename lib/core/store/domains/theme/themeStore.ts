// ================================================
// THEME STORE - TYPED MIGRATION EXAMPLE
// ================================================
// Example migration from untyped to type-safe store
// Using typedStoreHelpers.ts utilities

import {
  createTypedStore,
  TypedBaseState,
} from '@/lib/shared/state/typedStoreHelpers';

// ================================
// TYPES
// ================================

export type Theme = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple';

export interface ThemeState extends TypedBaseState {
  // Theme settings
  theme: Theme;
  colorScheme: ColorScheme;

  // Computed
  systemTheme: 'light' | 'dark';
  effectiveTheme: 'light' | 'dark';

  // Actions
  setTheme: (theme: Theme) => void;
  setColorScheme: (colorScheme: ColorScheme) => void;
  detectSystemTheme: () => void;
}

// ================================
// INITIAL STATE
// ================================

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

// ================================
// STORE CREATION
// ================================

export const useThemeStore = createTypedStore<ThemeState>({
  name: 'theme',

  initialState: {
    theme: 'system',
    colorScheme: 'default',
    systemTheme: getSystemTheme(),
    effectiveTheme: getSystemTheme(),
    isLoading: false,
    error: null,
    lastUpdated: null,
    // Dummy action placeholders (will be overridden by actions())
    setTheme: () => {},
    setColorScheme: () => {},
    detectSystemTheme: () => {},
  },

  actions: (set, get) => ({
    setTheme: (theme: Theme) => {
      const { systemTheme } = get();

      set({
        theme,
        effectiveTheme: theme === 'system' ? systemTheme : theme,
        lastUpdated: new Date(),
      });

      // Apply theme to document
      if (typeof document !== 'undefined') {
        const effectiveTheme = theme === 'system' ? systemTheme : theme;
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(effectiveTheme);
      }
    },

    setColorScheme: (colorScheme: ColorScheme) => {
      set({
        colorScheme,
        lastUpdated: new Date(),
      });

      // Apply color scheme to document
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.colorScheme = colorScheme;
      }
    },

    detectSystemTheme: () => {
      const systemTheme = getSystemTheme();
      const { theme } = get();

      set({
        systemTheme,
        effectiveTheme: theme === 'system' ? systemTheme : theme,
      });
    },
  }),

  // Enable persistence for theme preference
  persist: true,

  // Enable DevTools in development
  devtools: true,
});

// ================================
// TYPED SELECTORS
// ================================

export const themeSelectors = {
  useTheme: () => useThemeStore((state) => state.theme),
  useColorScheme: () => useThemeStore((state) => state.colorScheme),
  useEffectiveTheme: () => useThemeStore((state) => state.effectiveTheme),

  useActions: () =>
    useThemeStore((state) => ({
      setTheme: state.setTheme,
      setColorScheme: state.setColorScheme,
      detectSystemTheme: state.detectSystemTheme,
    })),
};

// ================================
// INITIALIZATION
// ================================

// Listen for system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  mediaQuery.addEventListener('change', () => {
    useThemeStore.getState().detectSystemTheme();
  });

  // Apply initial theme
  const { effectiveTheme, colorScheme } = useThemeStore.getState();
  document.documentElement.classList.add(effectiveTheme);
  if (colorScheme !== 'default') {
    document.documentElement.dataset.colorScheme = colorScheme;
  }
}

export default useThemeStore;
