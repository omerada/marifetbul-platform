// Validation utility functions

export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isPhoneNumber(phone: string): boolean {
  // Turkish phone number validation
  const cleanPhone = phone.replace(/\D/g, '');
  return /^0[5][0-9]{9}$/.test(cleanPhone);
}

export function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

export function isNumeric(value: string): boolean {
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

export function isValidTurkishId(id: string): boolean {
  // Turkish ID validation algorithm
  if (!/^\d{11}$/.test(id) || id === '00000000000') return false;

  const digits = id.split('').map(Number);
  const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7];

  const digit10 = (sum1 * 7 - sum2) % 10;
  const digit11 = (sum1 + sum2 + digit10) % 10;

  return digits[9] === digit10 && digits[10] === digit11;
}

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

export function validateRequired(
  value: unknown,
  fieldName = 'Field'
): string | null {
  if (isEmpty(value)) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!isEmail(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validatePhoneNumber(phone: string): string | null {
  if (!isPhoneNumber(phone)) {
    return 'Please enter a valid Turkish phone number';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!isStrongPassword(password)) {
    return 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character';
  }
  return null;
}
