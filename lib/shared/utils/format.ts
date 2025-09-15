// ================================================
// UNIFIED FORMAT UTILITIES
// ================================================
// Consolidated formatting functions with best features from both implementations

// ================================================
// STRING FORMATTING
// ================================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

export function truncateText(
  text: string,
  maxLength: number,
  suffix = '...'
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

export function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map((word) => capitalizeFirst(word))
    .join(' ');
}

// Alias for backward compatibility
export const capitalize = capitalizeFirst;

export function camelToKebab(text: string): string {
  return text.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export function kebabToCamel(text: string): string {
  return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function camelToSnake(text: string): string {
  return text.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(text: string): string {
  return text.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// ================================================
// HTML UTILITIES
// ================================================

export function removeHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// Alias for backward compatibility
export const removeHTML = removeHtmlTags;

export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function unescapeHTML(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

// ================================================
// NUMBER FORMATTING
// ================================================

export function formatCurrency(
  amount: number,
  currency = 'TRY',
  options?: Intl.NumberFormatOptions
): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  return new Intl.NumberFormat('tr-TR', defaultOptions).format(amount);
}

export function formatNumber(
  num: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('tr-TR', options).format(num);
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('tr-TR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

// ================================================
// SPECIALIZED FORMATTING
// ================================================

export function extractInitials(name: string, maxChars = 2): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, maxChars)
    .join('');
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a Turkish phone number
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    // Format: 0 (5XX) XXX XX XX
    return `${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }

  // Return original if not a valid Turkish number
  return phone;
}

export function formatEmailDomain(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return email;

  const [username, domain] = parts;
  const maskedUsername =
    username.length > 2
      ? username.slice(0, 2) + '*'.repeat(username.length - 2)
      : username;

  return `${maskedUsername}@${domain}`;
}

export function formatCreditCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  const matches = cleaned.match(/.{1,4}/g);
  return matches ? matches.join(' ') : cardNumber;
}

export function maskString(
  str: string,
  visibleChars = 4,
  maskChar = '*'
): string {
  if (str.length <= visibleChars) return str;

  const visiblePart = str.slice(-visibleChars);
  const maskedPart = maskChar.repeat(str.length - visibleChars);

  return maskedPart + visiblePart;
}

// ================================================
// VALIDATION HELPERS
// ================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 11 && cleaned.startsWith('0');
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ================================================
// TEXT PROCESSING
// ================================================

export function removeExtraSpaces(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function reverseString(text: string): string {
  return text.split('').reverse().join('');
}

export function shuffleString(text: string): string {
  const arr = text.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

export function getCharacterCount(text: string, includeSpaces = true): number {
  return includeSpaces ? text.length : text.replace(/\s/g, '').length;
}

// ================================================
// DEFAULT EXPORT
// ================================================

export const FormatUtils = {
  // String formatting
  slugify,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  capitalize,
  camelToKebab,
  kebabToCamel,
  camelToSnake,
  snakeToCamel,

  // HTML utilities
  removeHtmlTags,
  removeHTML,
  escapeHTML,
  unescapeHTML,

  // Number formatting
  formatCurrency,
  formatNumber,
  formatBytes,
  formatPercentage,
  formatCompactNumber,

  // Specialized formatting
  extractInitials,
  formatPhoneNumber,
  formatEmailDomain,
  formatCreditCard,
  maskString,

  // Validation helpers
  isValidEmail,
  isValidPhone,
  isValidUrl,

  // Text processing
  removeExtraSpaces,
  reverseString,
  shuffleString,
  getWordCount,
  getCharacterCount,
};
