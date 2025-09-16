// ================================================
// UNIFIED VALIDATION UTILITIES
// ================================================
// Consolidated validation functions with enhanced Turkish locale support

// ================================================
// EMAIL VALIDATION
// ================================================

export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Legacy alias
export const isValidEmail = isEmail;

// ================================================
// PHONE VALIDATION
// ================================================

export function isPhone(phone: string): boolean {
  // Enhanced Turkish phone number validation
  const cleaned = phone.replace(/\D/g, '');

  // Turkish mobile: 0 (5XX) XXX XX XX - 11 digits starting with 05
  // Turkish landline: 0 (2XX) XXX XX XX or 0 (3XX) XXX XX XX - 10/11 digits
  if (cleaned.length === 11 && cleaned.startsWith('05')) {
    return /^05[0-9]{9}$/.test(cleaned);
  }

  // International format validation
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function isPhoneNumber(phone: string): boolean {
  // Turkish specific validation
  const cleanPhone = phone.replace(/\D/g, '');
  return /^0[5][0-9]{9}$/.test(cleanPhone);
}

export function isTurkishMobile(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^0?5[0-9]{9}$/.test(cleaned);
}

export function isTurkishLandline(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^0?[2-4][0-9]{8,9}$/.test(cleaned);
}

// ================================================
// URL VALIDATION
// ================================================

export function isURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Legacy alias
export const isUrl = isURL;

export function isValidUrl(url: string): boolean {
  return isURL(url);
}

export function isHttpsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// ================================================
// PASSWORD VALIDATION
// ================================================

export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('En az 8 karakter olmalı');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('En az 1 küçük harf içermeli');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('En az 1 büyük harf içermeli');

  if (/\d/.test(password)) score++;
  else feedback.push('En az 1 rakam içermeli');

  if (/[@$!%*?&]/.test(password)) score++;
  else feedback.push('En az 1 özel karakter içermeli');

  return {
    isValid: score === 5,
    score,
    feedback,
  };
}

// ================================================
// TURKISH ID VALIDATION
// ================================================

export function isValidTurkishId(tcNo: string): boolean {
  if (!/^\d{11}$/.test(tcNo) || tcNo === '00000000000') return false;

  const digits = tcNo.split('').map(Number);
  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7];

  const check1 = (sumOdd * 7 - sumEven) % 10;
  const check2 = (sumOdd + sumEven + digits[9]) % 10;

  return check1 === digits[9] && check2 === digits[10];
}

// Alias for consistency
export const isValidTurkishID = isValidTurkishId;

// ================================================
// NUMERIC VALIDATION
// ================================================

export function isNumeric(value: string): boolean {
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

export function isInteger(value: string | number): boolean {
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isInteger(num);
}

export function isPositive(value: number): boolean {
  return value > 0;
}

export function isNegative(value: number): boolean {
  return value < 0;
}

export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// ================================================
// FORM VALIDATION HELPERS
// ================================================

export function validateRequired(
  value: unknown,
  fieldName = 'Field'
): string | null {
  if (isEmpty(value)) {
    return `${fieldName} gereklidir`;
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!isEmail(email)) {
    return 'Geçerli bir e-posta adresi giriniz';
  }
  return null;
}

export function validatePhoneNumber(phone: string): string | null {
  if (!isPhoneNumber(phone)) {
    return 'Geçerli bir Türk telefon numarası giriniz';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Şifre en az 8 karakter olmalıdır';
  }
  if (!isStrongPassword(password)) {
    return 'Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir';
  }
  return null;
}

export function validateMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

export function validateRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}

// ================================================
// FILE VALIDATION
// ================================================
// Note: Primary file validation moved to @/lib/core/validations/file
// These are legacy helpers for backward compatibility

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

// Deprecated: Use core/validations/file instead
export function validateImageFile(file: File): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  return validateFileType(file, allowedTypes);
}

// Deprecated: Use core/validations/file instead
export function validateDocumentFile(file: File): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  return validateFileType(file, allowedTypes);
}

// ================================================
// TYPE GUARDS
// ================================================

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
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
// EMPTINESS CHECKS
// ================================================

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
}

export function isNotEmpty(value: unknown): boolean {
  return !isEmpty(value);
}

export function hasValue(value: unknown): boolean {
  return !isNullOrUndefined(value) && !isEmpty(value);
}

// ================================================
// SECURITY VALIDATION
// ================================================

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>&"']/g, (match) => {
    const escapeChars: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;',
    };
    return escapeChars[match] || match;
  });
}

export function isAlphaNumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

export function isAlpha(value: string): boolean {
  return /^[a-zA-Z]+$/.test(value);
}

export function hasSpecialChars(value: string): boolean {
  return /[^a-zA-Z0-9\s]/.test(value);
}

export function containsOnlyLettersAndSpaces(value: string): boolean {
  return /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(value);
}

// ================================================
// CREDIT CARD VALIDATION
// ================================================

export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export function getCreditCardType(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');

  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'MasterCard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6/.test(cleaned)) return 'Discover';

  return 'Unknown';
}

// ================================================
// IBAN VALIDATION
// ================================================

export function isValidIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();

  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleaned)) return false;

  // Move first 4 characters to the end
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);

  // Replace letters with numbers (A=10, B=11, ..., Z=35)
  const numericString = rearranged.replace(/[A-Z]/g, (letter) =>
    (letter.charCodeAt(0) - 55).toString()
  );

  // Calculate mod 97
  let remainder = '';
  for (let i = 0; i < numericString.length; i += 9) {
    remainder = (
      parseInt(remainder + numericString.slice(i, i + 9), 10) % 97
    ).toString();
  }

  return parseInt(remainder, 10) === 1;
}

// ================================================
// DEFAULT EXPORT
// ================================================

export const ValidationUtils = {
  // Email validation
  isEmail,
  isValidEmail,
  validateEmail,

  // Phone validation
  isPhone,
  isPhoneNumber,
  isTurkishMobile,
  isTurkishLandline,
  validatePhoneNumber,

  // URL validation
  isURL,
  isUrl,
  isValidUrl,
  isHttpsUrl,

  // Password validation
  isStrongPassword,
  validatePasswordStrength,
  validatePassword,

  // Turkish ID validation
  isValidTurkishId,
  isValidTurkishID,

  // Numeric validation
  isNumeric,
  isInteger,
  isPositive,
  isNegative,
  isInRange,

  // Form validation
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateRange,

  // File validation
  validateFileSize,
  validateFileType,
  validateImageFile,
  validateDocumentFile,

  // Type guards
  isNumber,
  isString,
  isBoolean,
  isArray,
  isObject,
  isFunction,
  isDate,
  isNull,
  isUndefined,
  isNullOrUndefined,

  // Emptiness checks
  isEmpty,
  isNotEmpty,
  hasValue,

  // Security validation
  sanitizeInput,
  isAlphaNumeric,
  isAlpha,
  hasSpecialChars,
  containsOnlyLettersAndSpaces,

  // Financial validation
  isValidCreditCard,
  getCreditCardType,
  isValidIBAN,
};
