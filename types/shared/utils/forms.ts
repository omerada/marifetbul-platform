// Form-related utility types

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  defaultValue?: unknown;
  validation?: ValidationRule[];
  options?: FormFieldOption[];
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  description?: string;
}

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'datetime'
  | 'time'
  | 'file'
  | 'image'
  | 'range'
  | 'color'
  | 'switch';

export interface FormFieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface ValidationRule {
  type: ValidationType;
  value?: unknown;
  message: string;
}

export type ValidationType =
  | 'required'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'email'
  | 'url'
  | 'number'
  | 'integer'
  | 'positive'
  | 'negative'
  | 'custom';

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export type FormErrors<T> = {
  [K in keyof T]?: string | string[];
};

export type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

export interface FormConfig {
  fields: FormField[];
  layout?: FormLayout;
  validation?: FormValidationConfig;
  submission?: FormSubmissionConfig;
}

export interface FormLayout {
  type: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
  spacing?: 'tight' | 'normal' | 'loose';
  fieldOrder?: string[];
  groups?: FormFieldGroup[];
}

export interface FormFieldGroup {
  title: string;
  fields: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface FormValidationConfig {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  debounceMs?: number;
}

export interface FormSubmissionConfig {
  endpoint?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  transformData?: (data: unknown) => unknown;
  onSuccess?: (response: unknown) => void;
  onError?: (error: unknown) => void;
  resetOnSuccess?: boolean;
}

export interface DynamicFormSchema {
  id: string;
  name: string;
  version: string;
  fields: FormField[];
  conditions?: FormCondition[];
  calculations?: FormCalculation[];
  metadata?: Record<string, unknown>;
}

export interface FormCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional';
  targetFields: string[];
}

export interface FormCalculation {
  targetField: string;
  formula: string;
  dependencies: string[];
  trigger: 'change' | 'blur' | 'submit';
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  validation?: ValidationRule[];
  optional?: boolean;
}

export interface MultiStepFormConfig extends FormConfig {
  steps: FormStep[];
  allowBackNavigation?: boolean;
  showProgress?: boolean;
  persistData?: boolean;
}
