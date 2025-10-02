import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  applyTheme: (theme: Theme) => void;
}

const getSystemTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyDarkMode = (isDark: boolean) => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      isDarkMode: false,

      setTheme: (theme: Theme) => {
        const state = get();
        let isDarkMode = false;

        switch (theme) {
          case 'dark':
            isDarkMode = true;
            break;
          case 'light':
            isDarkMode = false;
            break;
          case 'system':
            isDarkMode = getSystemTheme();
            break;
        }

        state.applyTheme(theme);
        applyDarkMode(isDarkMode);

        set({ theme, isDarkMode });
      },

      toggleTheme: () => {
        const state = get();
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        state.setTheme(newTheme);
      },

      applyTheme: (theme: Theme) => {
        let isDarkMode = false;

        switch (theme) {
          case 'dark':
            isDarkMode = true;
            break;
          case 'light':
            isDarkMode = false;
            break;
          case 'system':
            isDarkMode = getSystemTheme();
            break;
        }

        applyDarkMode(isDarkMode);
        set({ isDarkMode });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme on hydration
          state.applyTheme(state.theme);
        }
      },
    }
  )
);

// System theme change listener
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  mediaQuery.addEventListener('change', (e) => {
    const state = useThemeStore.getState();
    if (state.theme === 'system') {
      applyDarkMode(e.matches);
      useThemeStore.setState({ isDarkMode: e.matches });
    }
  });
}
