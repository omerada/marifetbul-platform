// ================================================/**

// VALIDATION UTILITIES - MOVED FROM SHARED * Validation utilities

// ================================================ */

// Re-export from shared utils to maintain compatibility

/**

export * from '../shared/utils/validation'; * Email validation

export { ValidationUtils as default } from '../shared/utils/validation'; */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone number validation (Turkish format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');

  // Turkish mobile numbers: +90 5XX XXX XX XX or 05XX XXX XX XX
  return /^(90)?5\d{9}$/.test(cleanPhone);
}

/**
 * Password strength validation
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }

  if (!/\d/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Şifre en az bir özel karakter içermelidir');
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (errors.length === 0) {
    strength = 'strong';
  } else if (errors.length <= 2) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Turkish ID number validation
 */
export function isValidTurkishId(id: string): boolean {
  if (id.length !== 11 || !/^\d+$/.test(id)) {
    return false;
  }

  const digits = id.split('').map(Number);

  // First digit cannot be 0
  if (digits[0] === 0) {
    return false;
  }

  // Calculate checksum
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  const checksum1 = (oddSum * 7 - evenSum) % 10;
  const checksum2 = (oddSum + evenSum + digits[9]) % 10;

  return checksum1 === digits[9] && checksum2 === digits[10];
}

/**
 * File validation
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { maxSize, allowedTypes, allowedExtensions } = options;

  if (maxSize && file.size > maxSize) {
    const maxSizeInMB = (maxSize / (1024 * 1024)).toFixed(1);
    errors.push(`Dosya boyutu ${maxSizeInMB}MB'dan küçük olmalıdır`);
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    errors.push('Desteklenmeyen dosya türü');
  }

  if (allowedExtensions) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      errors.push(
        `İzin verilen dosya uzantıları: ${allowedExtensions.join(', ')}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Credit card number validation (Luhn algorithm)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');

  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  // Luhn algorithm
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Postal code validation (Turkish)
 */
export function isValidPostalCode(postalCode: string): boolean {
  return /^\d{5}$/.test(postalCode);
}

/**
 * Username validation
 */
export function validateUsername(username: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (username.length < 3) {
    errors.push('Kullanıcı adı en az 3 karakter olmalıdır');
  }

  if (username.length > 30) {
    errors.push('Kullanıcı adı en fazla 30 karakter olabilir');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push(
      'Kullanıcı adı sadece harf, rakam, _ ve - karakterlerini içerebilir'
    );
  }

  if (/^[_-]/.test(username) || /[_-]$/.test(username)) {
    errors.push('Kullanıcı adı _ veya - ile başlayamaz veya bitemez');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
