// ================================================
// SIMPLIFIED FORM SYSTEM
// ================================================
// Production-ready form handling with validation

import { useState, useCallback } from 'react';
import { z } from 'zod';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================
// TYPES
// ================================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface FormConfig {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  validation?: z.ZodSchema<any>;
  initialValues?: Record<string, any>;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ================================
// VALIDATION SCHEMAS
// ================================

export const commonSchemas = {
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  required: z.string().min(1, 'Bu alan zorunlu'),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Geçerli telefon numarası girin'),
  url: z.string().url('Geçerli URL girin'),
};

// ================================
// FORM HOOK
// ================================

export function useForm(config: FormConfig) {
  const [state, setState] = useState<FormState>({
    values: config.initialValues || {},
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  const updateField = useCallback((name: string, value: any) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [name]: value },
      touched: { ...prev.touched, [name]: true },
    }));
  }, []);

  const validateField = useCallback(
    (name: string, value: any) => {
      if (!config.validation) return null;

      try {
        // Simple validation without complex shape access
        config.validation.parse({ [name]: value });
        return null;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const issues = error.issues || [];
          return issues[0]?.message || 'Geçersiz değer';
        }
        return 'Validasyon hatası';
      }
    },
    [config.validation]
  );

  const validateForm = useCallback(() => {
    if (!config.validation) return true;

    try {
      config.validation.parse(state.values);
      setState((prev) => ({ ...prev, errors: {}, isValid: true }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        const issues = error.issues || [];
        issues.forEach((issue: any) => {
          if (issue.path && issue.path.length > 0) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        setState((prev) => ({ ...prev, errors, isValid: false }));
        return false;
      }
      return false;
    }
  }, [config.validation, state.values]);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      setState((prev) => ({ ...prev, isSubmitting: true }));

      if (!validateForm()) {
        setState((prev) => ({ ...prev, isSubmitting: false }));
        return;
      }

      try {
        await config.onSubmit(state.values);
      } catch (error) {
        logger.error(
          'Form submission error',
          error instanceof Error ? error : new Error(String(error))
        );
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [config.onSubmit, state.values, validateForm]
  );

  const reset = useCallback(() => {
    setState({
      values: config.initialValues || {},
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    });
  }, [config.initialValues]);

  const getFieldProps = useCallback(
    (name: string) => {
      const field = config.fields.find((f) => f.name === name);
      return {
        name,
        value: state.values[name] || '',
        onChange: (
          e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        ) => {
          updateField(name, e.target.value);
        },
        onBlur: () => {
          const error = validateField(name, state.values[name]);
          if (error) {
            setState((prev) => ({
              ...prev,
              errors: { ...prev.errors, [name]: error },
            }));
          } else {
            setState((prev) => ({
              ...prev,
              errors: { ...prev.errors, [name]: '' },
            }));
          }
        },
        error: state.errors[name],
        required: field?.required,
        placeholder: field?.placeholder,
      };
    },
    [config.fields, state.values, state.errors, updateField, validateField]
  );

  return {
    ...state,
    updateField,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    getFieldProps,
  };
}

// ================================
// COMMON FORM SCHEMAS
// ================================

export const formSchemas = {
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Şifre gerekli'),
  }),

  register: z
    .object({
      name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
      email: commonSchemas.email,
      password: commonSchemas.password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Şifreler eşleşmiyor',
      path: ['confirmPassword'],
    }),

  profile: z.object({
    name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
    email: commonSchemas.email,
    phone: commonSchemas.phone.optional(),
    bio: z.string().max(500, 'Bio 500 karakterden fazla olamaz').optional(),
    website: commonSchemas.url.optional(),
  }),

  job: z.object({
    title: z.string().min(5, 'Başlık en az 5 karakter olmalı'),
    description: z.string().min(50, 'Açıklama en az 50 karakter olmalı'),
    budget: z.number().min(1, 'Bütçe belirtilmeli'),
    type: z.enum(['fixed', 'hourly']),
    skills: z.array(z.string()).min(1, 'En az 1 yetenek seçin'),
    deadline: z.string().optional(),
  }),

  package: z.object({
    title: z.string().min(5, 'Başlık en az 5 karakter olmalı'),
    description: z.string().min(50, 'Açıklama en az 50 karakter olmalı'),
    price: z.number().min(1, 'Fiyat belirtilmeli'),
    deliveryTime: z.number().min(1, 'Teslimat süresi belirtilmeli'),
    features: z.array(z.string()).min(1, 'En az 1 özellik ekleyin'),
  }),
};

// ================================
// FORM HELPERS
// ================================

export const formHelpers = {
  // Form verisini temizle
  sanitizeFormData: (data: Record<string, any>): Record<string, any> => {
    const sanitized: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  },

  // Form alanlarını disabled yap
  disableForm: (formElement: HTMLFormElement) => {
    const inputs = formElement.querySelectorAll(
      'input, textarea, select, button'
    );
    inputs.forEach((input) => {
      (input as HTMLInputElement).disabled = true;
    });
  },

  // Form alanlarını enable yap
  enableForm: (formElement: HTMLFormElement) => {
    const inputs = formElement.querySelectorAll(
      'input, textarea, select, button'
    );
    inputs.forEach((input) => {
      (input as HTMLInputElement).disabled = false;
    });
  },

  // Form verilerini localStorage'a kaydet
  saveFormData: (formId: string, data: Record<string, any>) => {
    try {
      localStorage.setItem(`form_${formId}`, JSON.stringify(data));
    } catch (error) {
      logger.warn(
        'Form data could not be saved to localStorage',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  },

  // Form verilerini localStorage'dan yükle
  loadFormData: (formId: string): Record<string, any> | null => {
    try {
      const saved = localStorage.getItem(`form_${formId}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      logger.warn(
        'Form data could not be loaded from localStorage',
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }
  },

  // Form verilerini localStorage'dan sil
  clearFormData: (formId: string) => {
    try {
      localStorage.removeItem(`form_${formId}`);
    } catch (error) {
      logger.warn(
        'Form data could not be cleared from localStorage',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  },
};

// ================================
// FORM COMPONENTS TYPES
// ================================

export interface FormFieldProps {
  field: FormField;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  onBlur?: () => void;
}

// ================================
// FORM RENDERING HELPERS
// ================================

export const formRenderHelpers = {
  // Input props generator
  getInputProps: (
    field: FormField,
    value: any,
    onChange: (value: any) => void,
    onBlur?: () => void
  ) => ({
    id: field.name,
    name: field.name,
    type: field.type,
    value: value || '',
    onChange: (e: any) => onChange(e.target.value),
    onBlur,
    placeholder: field.placeholder,
    required: field.required,
  }),

  // Textarea props generator
  getTextareaProps: (
    field: FormField,
    value: any,
    onChange: (value: any) => void,
    onBlur?: () => void
  ) => ({
    id: field.name,
    name: field.name,
    value: value || '',
    onChange: (e: any) => onChange(e.target.value),
    onBlur,
    placeholder: field.placeholder,
    required: field.required,
    rows: 4,
  }),

  // Select props generator
  getSelectProps: (
    field: FormField,
    value: any,
    onChange: (value: any) => void,
    onBlur?: () => void
  ) => ({
    id: field.name,
    name: field.name,
    value: value || '',
    onChange: (e: any) => onChange(e.target.value),
    onBlur,
    required: field.required,
  }),

  // CSS classes for form elements
  getFormClasses: (error?: string) => ({
    formGroup: 'form-group',
    label: 'form-label',
    field: `form-field ${error ? 'error' : ''}`,
    error: 'error-message',
  }),
};

// ================================
// EXPORTS
// ================================

export default {
  useForm,
  formSchemas,
  commonSchemas,
  formHelpers,
  formRenderHelpers,
};
