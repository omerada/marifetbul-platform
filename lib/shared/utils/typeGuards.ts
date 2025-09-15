// ================================================
// UNIFIED TYPE GUARDS
// ================================================
// Enhanced type safety utilities with comprehensive guards

import { JobBudget } from '@/types';

// ================================================
// BASIC TYPE GUARDS
// ================================================

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isFunction(
  value: unknown
): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

// ================================================
// PRIMITIVE TYPE GUARDS
// ================================================

export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

export function isFloat(value: unknown): value is number {
  return isNumber(value) && !Number.isInteger(value);
}

export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

export function isNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value < 0;
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

export function isNumericString(value: unknown): value is string {
  return isString(value) && !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

// ================================================
// ARRAY TYPE GUARDS
// ================================================

export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(guard);
}

export function isStringArray(value: unknown): value is string[] {
  return isArrayOf(value, isString);
}

export function isNumberArray(value: unknown): value is number[] {
  return isArrayOf(value, isNumber);
}

export function isBooleanArray(value: unknown): value is boolean[] {
  return isArrayOf(value, isBoolean);
}

export function isNonEmptyArray(value: unknown): value is unknown[] {
  return isArray(value) && value.length > 0;
}

// ================================================
// OBJECT TYPE GUARDS
// ================================================

export function hasProperty<T extends PropertyKey>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> {
  return isObject(obj) && prop in obj;
}

export function hasProperties<T extends PropertyKey[]>(
  obj: unknown,
  props: T
): obj is Record<T[number], unknown> {
  return isObject(obj) && props.every((prop) => prop in obj);
}

export function isObjectWithKeys(
  value: unknown,
  keys: string[]
): value is Record<string, unknown> {
  return isObject(value) && keys.every((key) => key in value);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return isObject(value);
}

export function isEmptyObject(value: unknown): value is Record<string, never> {
  return isObject(value) && Object.keys(value).length === 0;
}

export function isNonEmptyObject(
  value: unknown
): value is Record<string, unknown> {
  return isObject(value) && Object.keys(value).length > 0;
}

// ================================================
// BUSINESS DOMAIN TYPE GUARDS
// ================================================

export function isJobBudgetObject(value: unknown): value is JobBudget {
  return (
    isObject(value) &&
    hasProperty(value, 'amount') &&
    hasProperty(value, 'type') &&
    isNumber(value.amount) &&
    isString(value.type) &&
    (value.type === 'fixed' || value.type === 'hourly')
  );
}

export function isValidJobBudget(
  budget: number | JobBudget
): budget is JobBudget {
  if (isNumber(budget)) return budget > 0;
  return isJobBudgetObject(budget) && budget.amount > 0;
}

// ================================================
// EMAIL AND URL TYPE GUARDS
// ================================================

export function isEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isHttpsUrl(value: unknown): value is string {
  if (!isUrl(value)) return false;
  return value.startsWith('https://');
}

// ================================================
// BUSINESS FORMATTING UTILITIES
// ================================================

export function formatJobBudget(budget: number | JobBudget): string {
  if (isJobBudgetObject(budget)) {
    const maxAmount = budget.maxAmount
      ? ` - ₺${budget.maxAmount.toLocaleString('tr-TR')}`
      : '';
    const suffix = budget.type === 'hourly' ? '/saat' : '';
    return `₺${budget.amount.toLocaleString('tr-TR')}${maxAmount}${suffix}`;
  }

  if (isNumber(budget)) {
    return `₺${budget.toLocaleString('tr-TR')}`;
  }

  return '₺0';
}

export function getBudgetType(budget: number | JobBudget): 'fixed' | 'hourly' {
  return isJobBudgetObject(budget) ? budget.type : 'fixed';
}

export function getBudgetAmount(budget: number | JobBudget): number {
  return isJobBudgetObject(budget)
    ? budget.amount
    : isNumber(budget)
      ? budget
      : 0;
}

export function getBudgetRange(budget: number | JobBudget): {
  min: number;
  max?: number;
} {
  if (isJobBudgetObject(budget)) {
    return {
      min: budget.amount,
      max: budget.maxAmount,
    };
  }

  if (isNumber(budget)) {
    return { min: budget };
  }

  return { min: 0 };
}

// ================================================
// VALIDATION HELPERS
// ================================================

export function isValidPhone(value: unknown): value is string {
  if (!isString(value)) return false;
  const cleaned = value.replace(/\D/g, '');
  return /^0[5][0-9]{9}$/.test(cleaned);
}

export function isValidTurkishId(value: unknown): value is string {
  if (!isString(value)) return false;
  if (!/^\d{11}$/.test(value) || value === '00000000000') return false;

  const digits = value.split('').map(Number);
  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7];

  const check1 = (sumOdd * 7 - sumEven) % 10;
  const check2 = (sumOdd + sumEven + digits[9]) % 10;

  return check1 === digits[9] && check2 === digits[10];
}

export function isValidPassword(value: unknown): value is string {
  if (!isString(value)) return false;
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(value);
}

// ================================================
// FILE TYPE GUARDS
// ================================================

export function isFile(value: unknown): value is File {
  return value instanceof File;
}

export function isImageFile(value: unknown): value is File {
  if (!isFile(value)) return false;
  return value.type.startsWith('image/');
}

export function isDocumentFile(value: unknown): value is File {
  if (!isFile(value)) return false;
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  return documentTypes.includes(value.type);
}

// ================================================
// ERROR TYPE GUARDS
// ================================================

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isErrorWithMessage(
  value: unknown
): value is { message: string } {
  return (
    isObject(value) && hasProperty(value, 'message') && isString(value.message)
  );
}

// ================================================
// PROMISE TYPE GUARDS
// ================================================

export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return (
    value instanceof Promise ||
    (isObject(value) && hasProperty(value, 'then') && isFunction(value.then))
  );
}

// ================================================
// DEFAULT EXPORT
// ================================================

export const TypeGuards = {
  // Basic type guards
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isFunction,
  isDate,
  isNull,
  isUndefined,
  isNullOrUndefined,

  // Primitive type guards
  isInteger,
  isFloat,
  isPositiveNumber,
  isNegativeNumber,
  isNonEmptyString,
  isNumericString,

  // Array type guards
  isArrayOf,
  isStringArray,
  isNumberArray,
  isBooleanArray,
  isNonEmptyArray,

  // Object type guards
  hasProperty,
  hasProperties,
  isObjectWithKeys,
  isRecord,
  isEmptyObject,
  isNonEmptyObject,

  // Business domain type guards
  isJobBudgetObject,
  isValidJobBudget,
  formatJobBudget,
  getBudgetType,
  getBudgetAmount,
  getBudgetRange,

  // Email and URL type guards
  isEmail,
  isUrl,
  isHttpsUrl,

  // Validation helpers
  isValidPhone,
  isValidTurkishId,
  isValidPassword,

  // File type guards
  isFile,
  isImageFile,
  isDocumentFile,

  // Error type guards
  isError,
  isErrorWithMessage,

  // Promise type guards
  isPromise,
};
