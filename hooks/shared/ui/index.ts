// ================================================
// UI HOOKS - STANDARDIZED UI INTERACTION PATTERNS
// ================================================
// Unified hooks for UI state management and interactions

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Geçici olarak tip kontrollerini atla

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  useLocalStorage,
  useMediaQuery,
  useDebounce,
  useThrottledCallback,
  useIntersectionObserver,
  usePrevious,
} from '../../../lib/shared/base';

// ================================================
// MODAL HOOKS
// ================================================

export interface ModalState {
  isOpen: boolean;
  data?: unknown;
}

export function useModal<T = unknown>() {
  const [state, setState] = useState<ModalState>({ isOpen: false });

  const open = useCallback((data?: T) => {
    setState({ isOpen: true, data });
  }, []);

  const close = useCallback(() => {
    setState({ isOpen: false, data: undefined });
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => ({
      isOpen: !prev.isOpen,
      data: prev.isOpen ? undefined : prev.data,
    }));
  }, []);

  return {
    isOpen: state.isOpen,
    data: state.data as T,
    open,
    close,
    toggle,
  };
}

// ================================================
// TOAST HOOKS - moved to hooks/core/useToast.ts
// ================================================

// Toast functionality moved to hooks/core/useToast.ts to avoid duplication
// Re-export for backwards compatibility
export { useToast, type Toast, type ToastType } from '../../core/useToast';

// ================================================
// FORM HOOKS
// ================================================

export interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
  isDirty: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validationSchema?: (values: T) => Record<string, string>
) {
  const [state, setState] = useState<FormState<T>>(() => ({
    fields: Object.keys(initialValues).reduce(
      (acc, key) => ({
        ...acc,
        [key]: {
          value: initialValues[key as keyof T],
          touched: false,
          isDirty: false,
        },
      }),
      {} as FormState<T>['fields']
    ),
    isValid: true,
    isSubmitting: false,
    errors: {},
  }));

  const validate = useCallback(
    (values: T) => {
      if (!validationSchema) return {};
      return validationSchema(values);
    },
    [validationSchema]
  );

  const updateField = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      setState((prev) => {
        const newFields = {
          ...prev.fields,
          [name]: {
            ...prev.fields[name],
            value,
            touched: true,
            isDirty: value !== initialValues[name],
          },
        };

        const values = Object.keys(newFields).reduce(
          (acc, key) => ({ ...acc, [key]: newFields[key as keyof T].value }),
          {} as T
        );

        const errors = validate(values);
        const isValid = Object.keys(errors).length === 0;

        return {
          ...prev,
          fields: newFields,
          errors,
          isValid,
        };
      });
    },
    [initialValues, validate]
  );

  const setFieldError = useCallback((name: keyof T, error?: string) => {
    setState((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [name]: {
          ...prev.fields[name],
          error,
        },
      },
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      fields: Object.keys(initialValues).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            value: initialValues[key as keyof T],
            touched: false,
            isDirty: false,
          },
        }),
        {} as FormState<T>['fields']
      ),
      isValid: true,
      isSubmitting: false,
      errors: {},
    });
  }, [initialValues]);

  const getValues = useCallback((): T => {
    return Object.keys(state.fields).reduce(
      (acc, key) => ({ ...acc, [key]: state.fields[key as keyof T].value }),
      {} as T
    );
  }, [state.fields]);

  const setSubmitting = useCallback((submitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting: submitting }));
  }, []);

  return {
    ...state,
    updateField,
    setFieldError,
    reset,
    getValues,
    setSubmitting,
  };
}

// ================================================
// PAGINATION HOOKS
// ================================================

export function usePaginationUI(options: {
  initialPage?: number;
  pageSize?: number;
  totalItems?: number;
}) {
  const { initialPage = 1, pageSize = 10, totalItems = 0 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPrev]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  return {
    currentPage,
    totalPages,
    hasNext,
    hasPrev,
    goToPage,
    nextPage,
    prevPage,
    reset,
  };
}

// ================================================
// THEME HOOKS
// ================================================

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system');
  const systemTheme = useMediaQuery('(prefers-color-scheme: dark)')
    ? 'dark'
    : 'light';

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      switch (prev) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'system';
        case 'system':
          return 'light';
        default:
          return 'light';
      }
    });
  }, [setTheme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}

// ================================================
// SEARCH HOOKS
// ================================================

export function useSearch<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
  options: {
    debounceMs?: number;
    initialQuery?: string;
  } = {}
) {
  const { debounceMs = 300, initialQuery = '' } = options;

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, debounceMs);

  const filteredItems = debouncedQuery
    ? items.filter((item) => searchFn(item, debouncedQuery))
    : items;

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    debouncedQuery,
    filteredItems,
    clearSearch,
    isSearching: query !== debouncedQuery,
  };
}

// ================================================
// DRAG & DROP HOOKS
// ================================================

export interface DragState {
  isDragging: boolean;
  draggedItem: unknown | null;
  dropTarget: unknown | null;
}

export function useDragDrop<T>() {
  const [state, setState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dropTarget: null,
  });

  const startDrag = useCallback((item: T) => {
    setState({
      isDragging: true,
      draggedItem: item,
      dropTarget: null,
    });
  }, []);

  const setDropTarget = useCallback((target: T | null) => {
    setState((prev) => ({
      ...prev,
      dropTarget: target,
    }));
  }, []);

  const endDrag = useCallback(() => {
    setState({
      isDragging: false,
      draggedItem: null,
      dropTarget: null,
    });
  }, []);

  return {
    ...state,
    startDrag,
    setDropTarget,
    endDrag,
  };
}

// ================================================
// SIDEBAR HOOKS
// ================================================

export function useSidebar() {
  const [isOpen, setIsOpen] = useLocalStorage('sidebar-open', true);
  const [isMobile, setIsMobile] = useState(false);

  const isMobileQuery = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setIsMobile(isMobileQuery);
    if (isMobileQuery) {
      setIsOpen(false);
    }
  }, [isMobileQuery, setIsOpen]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, [setIsOpen]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return {
    isOpen,
    isMobile,
    toggle,
    open,
    close,
  };
}

// ================================================
// SCROLL HOOKS
// ================================================

export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  const updatePosition = useThrottledCallback(() => {
    setScrollPosition(window.pageYOffset);
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', updatePosition);
    return () => window.removeEventListener('scroll', updatePosition);
  }, [updatePosition]);

  return scrollPosition;
}

export function useScrollDirection() {
  const scrollPosition = useScrollPosition();
  const previousPosition = usePrevious(scrollPosition);

  if (previousPosition === undefined) return null;

  return scrollPosition > previousPosition ? 'down' : 'up';
}

// ================================================
// CLIPBOARD HOOKS
// ================================================

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy text:', error);
      return false;
    }
  }, []);

  return { copy, copied };
}

// ================================================
// FOCUS MANAGEMENT HOOKS
// ================================================

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

// ================================================
// VISIBILITY HOOKS
// ================================================

export function useVisibility(threshold = 0.1) {
  // @ts-expect-error TypeScript inference issue with intersection observer
  const result = useIntersectionObserver({ threshold });
  const [elementRef, isVisible] = result;

  return {
    elementRef,
    isVisible,
    intersectionRatio: isVisible ? 1 : 0, // Simplification since we don't have exact ratio
  };
}

// ================================================
// KEYBOARD SHORTCUTS HOOKS
// ================================================

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    preventDefault?: boolean;
  } = {}
) {
  const {
    ctrl = false,
    shift = false,
    alt = false,
    preventDefault = true,
  } = options;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      const matchesModifiers =
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt;

      if (matchesKey && matchesModifiers) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrl, shift, alt, preventDefault]);
}

// ================================================
// EXPORTS
// ================================================

const UIHooks = {
  useModal,
  // useToast moved to hooks/core/useToast.ts
  useForm,
  usePaginationUI,
  useTheme,
  useSearch,
  useDragDrop,
  useSidebar,
  useScrollPosition,
  useScrollDirection,
  useClipboard,
  useFocusTrap,
  useVisibility,
  useKeyboardShortcut,
};

export default UIHooks;
