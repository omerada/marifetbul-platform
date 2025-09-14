// Validation utility types

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
  meta?: Record<string, unknown>;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface Validator<T = unknown> {
  name: string;
  validate: (value: T, context?: ValidationContext) => ValidationResult;
  async?: boolean;
}

export interface ValidationContext {
  field: string;
  form: Record<string, unknown>;
  rules: ValidationRule[];
  options?: ValidationOptions;
}

export interface ValidationRule {
  type: string;
  params?: Record<string, unknown>;
  message?: string;
  when?: ValidationCondition;
}

export interface ValidationCondition {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'in'
    | 'not_in'
    | 'greater_than'
    | 'less_than';
  value: unknown;
}

export interface ValidationOptions {
  stopOnFirstError?: boolean;
  skipMissingFields?: boolean;
  transformValues?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
}

export type ValidationSchema<T = Record<string, unknown>> = {
  [K in keyof T]?: FieldValidation;
};

export interface FieldValidation {
  type?: FieldType;
  required?: boolean;
  nullable?: boolean;
  default?: unknown;
  rules?: ValidationRule[];
  transform?: (value: unknown) => unknown;
  custom?: (value: unknown, context: ValidationContext) => ValidationResult;
}

export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'date'
  | 'email'
  | 'url'
  | 'uuid'
  | 'phone'
  | 'postal_code'
  | 'credit_card'
  | 'ip_address';

export interface StringValidation extends FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp | string;
  enum?: string[];
  trim?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
}

export interface NumberValidation extends FieldValidation {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
  multipleOf?: number;
}

export interface ArrayValidation extends FieldValidation {
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  items?: FieldValidation;
}

export interface ObjectValidation extends Omit<FieldValidation, 'required'> {
  properties?: ValidationSchema;
  additionalProperties?: boolean | FieldValidation;
  requiredFields?: string[];
}

export interface DateValidation extends FieldValidation {
  min?: Date | string;
  max?: Date | string;
  format?: string;
  timezone?: string;
}

export interface FileValidation extends FieldValidation {
  maxSize?: number;
  minSize?: number;
  allowedTypes?: string[];
  dimensions?: ImageDimensions;
}

export interface ImageDimensions {
  width?: { min?: number; max?: number };
  height?: { min?: number; max?: number };
  aspectRatio?: number;
}

export interface AsyncValidator<T = unknown> {
  name: string;
  validate: (
    value: T,
    context?: ValidationContext
  ) => Promise<ValidationResult>;
  async: true;
}

export interface ValidationPipeline {
  validators: Validator[];
  async?: boolean;
  stopOnError?: boolean;
}

export interface ValidationCache {
  get(key: string): ValidationResult | undefined;
  set(key: string, result: ValidationResult, ttl?: number): void;
  clear(): void;
  has(key: string): boolean;
}

export interface ValidationMetrics {
  totalValidations: number;
  successRate: number;
  averageTime: number;
  errorFrequency: Record<string, number>;
  fieldStats: Record<string, FieldStats>;
}

export interface FieldStats {
  validations: number;
  errors: number;
  warnings: number;
  averageTime: number;
  commonErrors: string[];
}

// Predefined validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  URL: /^https?:\/\/.+/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  POSTAL_CODE: /^[\d\w\s\-]+$/,
  CREDIT_CARD: /^\d{13,19}$/,
  IP_ADDRESS:
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  PASSWORD_STRONG:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  HEX_COLOR: /^#(?:[0-9a-fA-F]{3}){1,2}$/,
} as const;
