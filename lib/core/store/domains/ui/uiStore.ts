// ================================================
// UI STORE - DOMAIN BASED
// ================================================
// UI state management (modals, notifications, loading states)

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ================================
// TYPES & INTERFACES
// ================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  props?: Record<string, unknown>;
  onClose?: () => void;
}

export interface LoadingState {
  id: string;
  message?: string;
  progress?: number;
}

interface UIState {
  // Toast notifications
  toasts: Toast[];

  // Modal management
  modals: Modal[];

  // Global loading states
  loadingStates: LoadingState[];

  // Sidebar state
  isSidebarOpen: boolean;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Layout preferences
  layout: {
    sidebar: 'expanded' | 'collapsed' | 'hidden';
    density: 'comfortable' | 'compact';
  };
}

interface UIActions {
  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Modal actions
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Loading actions
  startLoading: (loading: Omit<LoadingState, 'id'>) => string;
  updateLoading: (id: string, update: Partial<LoadingState>) => void;
  stopLoading: (id: string) => void;
  clearAllLoading: () => void;

  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Theme actions
  setTheme: (theme: UIState['theme']) => void;

  // Layout actions
  setLayout: (layout: Partial<UIState['layout']>) => void;
}

type UIStore = UIState & UIActions;

// ================================
// INITIAL STATE
// ================================

const initialState: UIState = {
  toasts: [],
  modals: [],
  loadingStates: [],
  isSidebarOpen: true,
  theme: 'system',
  layout: {
    sidebar: 'expanded',
    density: 'comfortable',
  },
};

// ================================
// UI STORE
// ================================

export const useUIStore = create<UIStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // Toast actions
      addToast: (toast) => {
        const id = `toast_${Date.now()}_${Math.random()}`;
        const newToast: Toast = {
          id,
          duration: 5000, // Default 5 seconds
          ...toast,
        };

        set((draft) => {
          draft.toasts.push(newToast);
        });

        // Auto remove after duration
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, newToast.duration);
        }

        return id;
      },

      removeToast: (id) => {
        set((draft) => {
          draft.toasts = draft.toasts.filter((toast) => toast.id !== id);
        });
      },

      clearToasts: () => {
        set((draft) => {
          draft.toasts = [];
        });
      },

      // Modal actions
      openModal: (modal) => {
        const id = `modal_${Date.now()}_${Math.random()}`;
        const newModal: Modal = { id, ...modal };

        set((draft) => {
          draft.modals.push(newModal);
        });

        return id;
      },

      closeModal: (id) => {
        set((draft) => {
          const modalIndex = draft.modals.findIndex((modal) => modal.id === id);
          if (modalIndex !== -1) {
            const modal = draft.modals[modalIndex];
            modal.onClose?.();
            draft.modals.splice(modalIndex, 1);
          }
        });
      },

      closeAllModals: () => {
        set((draft) => {
          draft.modals.forEach((modal) => modal.onClose?.());
          draft.modals = [];
        });
      },

      // Loading actions
      startLoading: (loading) => {
        const id = `loading_${Date.now()}_${Math.random()}`;
        const newLoading: LoadingState = { id, ...loading };

        set((draft) => {
          draft.loadingStates.push(newLoading);
        });

        return id;
      },

      updateLoading: (id, update) => {
        set((draft) => {
          const loadingIndex = draft.loadingStates.findIndex(
            (loading) => loading.id === id
          );
          if (loadingIndex !== -1) {
            Object.assign(draft.loadingStates[loadingIndex], update);
          }
        });
      },

      stopLoading: (id) => {
        set((draft) => {
          draft.loadingStates = draft.loadingStates.filter(
            (loading) => loading.id !== id
          );
        });
      },

      clearAllLoading: () => {
        set((draft) => {
          draft.loadingStates = [];
        });
      },

      // Sidebar actions
      toggleSidebar: () => {
        set((draft) => {
          draft.isSidebarOpen = !draft.isSidebarOpen;
        });
      },

      setSidebarOpen: (open) => {
        set((draft) => {
          draft.isSidebarOpen = open;
        });
      },

      // Theme actions
      setTheme: (theme) => {
        set((draft) => {
          draft.theme = theme;
        });
      },

      // Layout actions
      setLayout: (layout) => {
        set((draft) => {
          Object.assign(draft.layout, layout);
        });
      },
    })),
    { name: 'ui-store' }
  )
);

// ================================
// OPTIMIZED SELECTORS
// ================================

export const uiSelectors = {
  useToasts: () => useUIStore((state) => state.toasts),
  useModals: () => useUIStore((state) => state.modals),
  useLoadingStates: () => useUIStore((state) => state.loadingStates),
  useIsLoading: () => useUIStore((state) => state.loadingStates.length > 0),
  useSidebar: () =>
    useUIStore((state) => ({
      isOpen: state.isSidebarOpen,
      layout: state.layout.sidebar,
    })),
  useTheme: () => useUIStore((state) => state.theme),
  useLayout: () => useUIStore((state) => state.layout),

  useActions: () =>
    useUIStore((state) => ({
      addToast: state.addToast,
      removeToast: state.removeToast,
      clearToasts: state.clearToasts,
      openModal: state.openModal,
      closeModal: state.closeModal,
      closeAllModals: state.closeAllModals,
      startLoading: state.startLoading,
      updateLoading: state.updateLoading,
      stopLoading: state.stopLoading,
      clearAllLoading: state.clearAllLoading,
      toggleSidebar: state.toggleSidebar,
      setSidebarOpen: state.setSidebarOpen,
      setTheme: state.setTheme,
      setLayout: state.setLayout,
    })),
};

// ================================
// HOOKS
// ================================

// Main UI hook
export function useUI() {
  const toasts = uiSelectors.useToasts();
  const modals = uiSelectors.useModals();
  const isLoading = uiSelectors.useIsLoading();
  const sidebar = uiSelectors.useSidebar();
  const theme = uiSelectors.useTheme();
  const layout = uiSelectors.useLayout();
  const actions = uiSelectors.useActions();

  return {
    toasts,
    modals,
    isLoading,
    sidebar,
    theme,
    layout,
    ...actions,
  };
}

// Toast hook moved to hooks/core/useToast.ts to avoid duplication

// Modal hook
export function useModal() {
  const { openModal, closeModal, closeAllModals } = uiSelectors.useActions();
  const modals = uiSelectors.useModals();

  return {
    openModal,
    closeModal,
    closeAllModals,
    modals,
    hasModals: modals.length > 0,
  };
}

// Loading hook
export function useLoading() {
  const { startLoading, updateLoading, stopLoading, clearAllLoading } =
    uiSelectors.useActions();
  const loadingStates = uiSelectors.useLoadingStates();
  const isLoading = uiSelectors.useIsLoading();

  return {
    startLoading,
    updateLoading,
    stopLoading,
    clearAllLoading,
    loadingStates,
    isLoading,
  };
}

export default useUIStore;
