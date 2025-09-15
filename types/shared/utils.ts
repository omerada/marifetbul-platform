// Shared utility types
export interface FormValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormValidationError[];
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
}
