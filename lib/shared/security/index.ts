// Production-ready security utilities
'use client';

import { logger } from '@/lib/shared/utils/logger';

// Content Security Policy helper
export interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'font-src'?: string[];
  'connect-src'?: string[];
  'frame-src'?: string[];
  'object-src'?: string[];
  'media-src'?: string[];
  'worker-src'?: string[];
  'manifest-src'?: string[];
  'base-uri'?: string[];
  'form-action'?: string[];
  'frame-ancestors'?: string[];
  'report-uri'?: string[];
  'report-to'?: string[];
}

export function generateCSP(directives: CSPDirectives): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values?.join(' ') || "'none'"}`)
    .join('; ');
}

// Input sanitization
export class InputSanitizer {
  private static htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  static sanitizeHtml(input: string): string {
    return input.replace(
      /[&<>"'/]/g,
      (match) => this.htmlEntities[match] || match
    );
  }

  static sanitizeUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);

      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }

      return parsedUrl.toString();
    } catch {
      return '';
    }
  }

  static sanitizeFileName(fileName: string): string {
    // Remove path traversal attempts and dangerous characters
    return fileName
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+/, '')
      .slice(0, 255);
  }

  static sanitizeEmail(email: string): string {
    // Basic email validation and sanitization
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = email.trim().toLowerCase();

    return emailRegex.test(sanitized) ? sanitized : '';
  }

  static stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  }

  static limitLength(input: string, maxLength: number): string {
    return input.slice(0, maxLength);
  }

  static sanitizePhoneNumber(phone: string): string {
    // Remove all non-numeric characters except + at the beginning
    return phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  }
}

// CSRF Protection
export class CSRFProtection {
  private static readonly TOKEN_HEADER = 'X-CSRF-Token';
  private static readonly TOKEN_STORAGE_KEY = 'csrf_token';

  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  }

  static storeToken(token: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.TOKEN_STORAGE_KEY, token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.TOKEN_STORAGE_KEY);
    }
    return null;
  }

  static getTokenHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { [this.TOKEN_HEADER]: token } : {};
  }

  static validateToken(providedToken: string, storedToken: string): boolean {
    if (!providedToken || !storedToken) return false;

    // Constant-time comparison to prevent timing attacks
    if (providedToken.length !== storedToken.length) return false;

    let result = 0;
    for (let i = 0; i < providedToken.length; i++) {
      result |= providedToken.charCodeAt(i) ^ storedToken.charCodeAt(i);
    }

    return result === 0;
  }
}

// Rate limiting client-side helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const userRequests = this.requests.get(identifier)!;

    // Remove old requests outside the window
    while (userRequests.length > 0 && userRequests[0] < windowStart) {
      userRequests.shift();
    }

    if (userRequests.length >= this.maxRequests) {
      return false;
    }

    userRequests.push(now);
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }

    const userRequests = this.requests.get(identifier)!;
    const validRequests = userRequests.filter((time) => time >= windowStart);

    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(identifier: string): Date | null {
    if (!this.requests.has(identifier)) {
      return null;
    }

    const userRequests = this.requests.get(identifier)!;
    if (userRequests.length === 0) {
      return null;
    }

    return new Date(userRequests[0] + this.windowMs);
  }
}

// Secure storage wrapper
export class SecureStorage {
  private static readonly PREFIX = 'marifet_secure_';

  static setItem(
    key: string,
    value: string,
    options?: {
      encrypt?: boolean;
      expiry?: number; // milliseconds from now
    }
  ): void {
    if (typeof window === 'undefined') return;

    const data = {
      value: value, // Simple storage without encryption for now
      encrypted: false,
      expiry: options?.expiry ? Date.now() + options.expiry : null,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(data));
    } catch (error) {
      logger.warn(
        'Secure storage failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  static getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (!item) return null;

      const data = JSON.parse(item);

      // Check expiry
      if (data.expiry && Date.now() > data.expiry) {
        this.removeItem(key);
        return null;
      }

      return data.value;
    } catch {
      return null;
    }
  }

  static removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.PREFIX + key);
  }

  static clear(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(this.PREFIX)
    );

    keys.forEach((key) => localStorage.removeItem(key));
  }

  /**
   * Secure AES-GCM encryption using Web Crypto API
   * @param text - Plain text to encrypt
   * @param password - Encryption password (should be from secure source)
   * @returns Base64 encoded encrypted data with salt and IV
   */
  private static async secureEncrypt(
    text: string,
    password: string
  ): Promise<string> {
    try {
      // Generate random salt and IV
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Derive key from password using PBKDF2
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      // Encrypt the text
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        enc.encode(text)
      );

      // Combine salt + iv + encrypted data
      const result = new Uint8Array(
        salt.length + iv.length + encrypted.byteLength
      );
      result.set(salt, 0);
      result.set(iv, salt.length);
      result.set(new Uint8Array(encrypted), salt.length + iv.length);

      // Return as base64
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      logger.error('Encryption failed', error as Error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Secure AES-GCM decryption
   * @param encryptedData - Base64 encoded encrypted data
   * @param password - Decryption password
   * @returns Decrypted plain text
   */
  private static async secureDecrypt(
    encryptedData: string,
    password: string
  ): Promise<string> {
    try {
      // Decode base64
      const data = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

      // Extract salt, iv, and encrypted data
      const salt = data.slice(0, 16);
      const iv = data.slice(16, 28);
      const encrypted = data.slice(28);

      // Derive key from password
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      const dec = new TextDecoder();
      return dec.decode(decrypted);
    } catch (error) {
      logger.error('Decryption failed', error as Error);
      throw new Error('Decryption failed');
    }
  }
}

// Security headers validation
export function validateSecurityHeaders(response: Response): boolean {
  const requiredHeaders = [
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy',
    'strict-transport-security',
  ];

  return requiredHeaders.every((header) => response.headers.has(header));
}

// File upload security
export class FileUploadSecurity {
  private static readonly ALLOWED_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]);

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  static validateFile(file: File): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(
        `File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    // Check file type
    if (!this.ALLOWED_TYPES.has(file.type)) {
      errors.push(`File type '${file.type}' is not allowed`);
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'pdf',
      'txt',
      'doc',
      'docx',
    ];

    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`File extension '${extension}' is not allowed`);
    }

    // Basic filename validation
    if (file.name.length > 255) {
      errors.push('Filename is too long');
    }

    if (/[<>:"/\\|?*]/.test(file.name)) {
      errors.push('Filename contains invalid characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static sanitizeFileName(fileName: string): string {
    return InputSanitizer.sanitizeFileName(fileName);
  }

  static generateSecureFileName(originalName: string): string {
    const extension = originalName.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);

    return `${timestamp}_${random}.${extension}`;
  }
}

// Password strength validator
export class PasswordValidator {
  static validateStrength(password: string): {
    score: number; // 0-4
    feedback: string[];
    isValid: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score++;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else {
      score++;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else {
      score++;
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else {
      score++;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else {
      score++;
    }

    // Check for common patterns
    if (/123456|password|qwerty|admin/i.test(password)) {
      feedback.push('Password contains common patterns and is weak');
      score = Math.max(0, score - 2);
    }

    return {
      score: Math.min(score, 4),
      feedback,
      isValid: score >= 3,
    };
  }

  static generateSecurePassword(length: number = 16): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    return Array.from(array, (byte) => charset[byte % charset.length]).join('');
  }
}

// Security monitoring
export class SecurityMonitor {
  private static violations: Array<{
    type: string;
    details: string;
    timestamp: number;
    userAgent: string;
    url: string;
  }> = [];

  static reportViolation(type: string, details: string): void {
    const violation = {
      type,
      details,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.violations.push(violation);

    // Send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendViolationReport(violation);
    }

    logger.warn(
      'Security violation detected',
      new Error(`Type: ${violation.type}, Details: ${violation.details}`)
    );
  }

  private static sendViolationReport(violation: {
    type: string;
    details: string;
    timestamp: number;
    userAgent: string;
    url: string;
  }): void {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/security/violations',
        JSON.stringify(violation)
      );
    }
  }

  static getViolations(): typeof SecurityMonitor.violations {
    return [...this.violations];
  }

  static clearViolations(): void {
    this.violations = [];
  }
}

// XSS Protection
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
    /<link\b/gi,
    /<meta\b/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

// Session security
export class SessionSecurity {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly ACTIVITY_KEY = 'last_activity';

  static updateActivity(): void {
    SecureStorage.setItem(this.ACTIVITY_KEY, Date.now().toString());
  }

  static isSessionExpired(): boolean {
    const lastActivity = SecureStorage.getItem(this.ACTIVITY_KEY);
    if (!lastActivity) return true;

    const timeSinceActivity = Date.now() - parseInt(lastActivity, 10);
    return timeSinceActivity > this.SESSION_TIMEOUT;
  }

  static getTimeUntilExpiry(): number {
    const lastActivity = SecureStorage.getItem(this.ACTIVITY_KEY);
    if (!lastActivity) return 0;

    const timeSinceActivity = Date.now() - parseInt(lastActivity, 10);
    return Math.max(0, this.SESSION_TIMEOUT - timeSinceActivity);
  }

  static clearSession(): void {
    SecureStorage.clear();
  }
}

// Initialize security monitoring
if (typeof window !== 'undefined') {
  // Monitor for potential XSS attempts
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    Element.prototype,
    'innerHTML'
  );

  if (originalDescriptor && originalDescriptor.set) {
    Object.defineProperty(Element.prototype, 'innerHTML', {
      set: function (value: string) {
        if (detectXSS(value)) {
          SecurityMonitor.reportViolation(
            'XSS_ATTEMPT',
            `Potential XSS in innerHTML: ${value.substring(0, 100)}`
          );
          return;
        }
        originalDescriptor.set!.call(this, value);
      },
      get: originalDescriptor.get,
      configurable: true,
      enumerable: true,
    });
  }

  // Update session activity on user interactions
  ['click', 'keydown', 'scroll', 'mousemove'].forEach((event) => {
    document.addEventListener(
      event,
      () => {
        SessionSecurity.updateActivity();
      },
      { passive: true }
    );
  });
}
