/**
 * ================================================
 * PAYMENT VALIDATION TESTS
 * ================================================
 * Unit tests for Iyzico payment validation schemas
 * 
 * Coverage:
 * - Luhn algorithm validation
 * - Card type detection
 * - Card number formatting
 * - Payment form validation
 * - Edge cases and error scenarios
 * 
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Testing & QA
 */

import { describe, it, expect } from '@jest/globals';
import {
  luhnCheck,
  detectCardType,
  formatCardNumber,
  iyzicoPaymentSchema,
  savedCardPaymentSchema,
  paymentIntentSchema,
} from '@/lib/core/validations/payment';

describe('Payment Validation - Luhn Algorithm', () => {
  describe('luhnCheck', () => {
    it('should validate correct credit card numbers', () => {
      // Valid test card numbers
      expect(luhnCheck('4111111111111111')).toBe(true); // Visa
      expect(luhnCheck('5555555555554444')).toBe(true); // Mastercard
      expect(luhnCheck('378282246310005')).toBe(true); // Amex
      expect(luhnCheck('6011111111111117')).toBe(true); // Discover
    });

    it('should reject invalid credit card numbers', () => {
      expect(luhnCheck('4111111111111112')).toBe(false); // Invalid checksum
      expect(luhnCheck('1234567890123456')).toBe(false); // Random number
      expect(luhnCheck('0000000000000000')).toBe(false); // All zeros
    });

    it('should handle edge cases', () => {
      expect(luhnCheck('')).toBe(false); // Empty string
      expect(luhnCheck('123')).toBe(false); // Too short
      expect(luhnCheck('abcd1234')).toBe(false); // Contains letters
      expect(luhnCheck('4111 1111 1111 1111')).toBe(true); // With spaces (should clean)
    });

    it('should validate cards with different lengths', () => {
      expect(luhnCheck('378282246310005')).toBe(true); // 15 digits (Amex)
      expect(luhnCheck('4111111111111111')).toBe(true); // 16 digits (Visa)
      expect(luhnCheck('6011000990139424')).toBe(true); // 16 digits (Discover)
    });
  });
});

describe('Payment Validation - Card Type Detection', () => {
  describe('detectCardType', () => {
    it('should detect Visa cards', () => {
      expect(detectCardType('4111111111111111')).toBe('VISA');
      expect(detectCardType('4012888888881881')).toBe('VISA');
      expect(detectCardType('4222222222222')).toBe('VISA');
    });

    it('should detect Mastercard', () => {
      expect(detectCardType('5555555555554444')).toBe('MASTERCARD');
      expect(detectCardType('5105105105105100')).toBe('MASTERCARD');
      expect(detectCardType('2221000000000009')).toBe('MASTERCARD'); // New range
    });

    it('should detect American Express', () => {
      expect(detectCardType('378282246310005')).toBe('AMEX');
      expect(detectCardType('371449635398431')).toBe('AMEX');
      expect(detectCardType('343434343434343')).toBe('AMEX');
    });

    it('should detect Troy cards', () => {
      expect(detectCardType('9792000000000000')).toBe('TROY');
      expect(detectCardType('9792123456789012')).toBe('TROY');
    });

    it('should return UNKNOWN for unrecognized patterns', () => {
      expect(detectCardType('1234567890123456')).toBe('UNKNOWN');
      expect(detectCardType('0000000000000000')).toBe('UNKNOWN');
      expect(detectCardType('')).toBe('UNKNOWN');
    });

    it('should handle formatted card numbers', () => {
      expect(detectCardType('4111 1111 1111 1111')).toBe('VISA');
      expect(detectCardType('5555-5555-5555-4444')).toBe('MASTERCARD');
    });
  });
});

describe('Payment Validation - Card Number Formatting', () => {
  describe('formatCardNumber', () => {
    it('should format card numbers with spaces', () => {
      expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
      expect(formatCardNumber('5555555555554444')).toBe('5555 5555 5555 4444');
    });

    it('should handle partial card numbers', () => {
      expect(formatCardNumber('4111')).toBe('4111');
      expect(formatCardNumber('41111111')).toBe('4111 1111');
      expect(formatCardNumber('411111111111')).toBe('4111 1111 1111');
    });

    it('should clean existing formatting', () => {
      expect(formatCardNumber('4111-1111-1111-1111')).toBe('4111 1111 1111 1111');
      expect(formatCardNumber('4111 1111 1111 1111')).toBe('4111 1111 1111 1111');
    });

    it('should handle edge cases', () => {
      expect(formatCardNumber('')).toBe('');
      expect(formatCardNumber('abc')).toBe('');
      expect(formatCardNumber('12345678901234567890')).toBe('1234 5678 9012 3456'); // Max 16
    });

    it('should handle Amex format (15 digits)', () => {
      expect(formatCardNumber('378282246310005')).toBe('3782 8224 6310 005');
    });
  });
});

describe('Payment Validation - Iyzico Payment Schema', () => {
  describe('iyzicoPaymentSchema', () => {
    const validPaymentData = {
      cardHolderName: 'JOHN DOE',
      cardNumber: '4111 1111 1111 1111',
      expiryMonth: '12',
      expiryYear: '25',
      cvc: '123',
      saveCard: false,
    };

    it('should validate correct payment data', () => {
      const result = iyzicoPaymentSchema.safeParse(validPaymentData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid card holder name', () => {
      const invalidData = { ...validPaymentData, cardHolderName: 'AB' };
      const result = iyzicoPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid card number (Luhn check)', () => {
      const invalidData = { ...validPaymentData, cardNumber: '4111111111111112' };
      const result = iyzicoPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid expiry month', () => {
      const testCases = [
        { expiryMonth: '00', description: 'zero month' },
        { expiryMonth: '13', description: 'month > 12' },
        { expiryMonth: 'AB', description: 'non-numeric' },
        { expiryMonth: '1', description: 'single digit without leading zero' },
      ];

      testCases.forEach(({ expiryMonth, description }) => {
        const invalidData = { ...validPaymentData, expiryMonth };
        const result = iyzicoPaymentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    it('should reject past expiry dates', () => {
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const pastYear = (parseInt(currentYear) - 1).toString().padStart(2, '0');
      
      const invalidData = {
        ...validPaymentData,
        expiryMonth: '12',
        expiryYear: pastYear,
      };
      const result = iyzicoPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid CVC', () => {
      const testCases = [
        { cvc: '12', description: 'too short' },
        { cvc: '12345', description: 'too long' },
        { cvc: 'ABC', description: 'non-numeric' },
      ];

      testCases.forEach(({ cvc, description }) => {
        const invalidData = { ...validPaymentData, cvc };
        const result = iyzicoPaymentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    it('should accept 4-digit CVC for Amex', () => {
      const amexData = {
        ...validPaymentData,
        cardNumber: '3782 8224 6310 005',
        cvc: '1234',
      };
      const result = iyzicoPaymentSchema.safeParse(amexData);
      expect(result.success).toBe(true);
    });

    it('should validate saveCard boolean', () => {
      const withSave = { ...validPaymentData, saveCard: true };
      const withoutSave = { ...validPaymentData, saveCard: false };
      
      expect(iyzicoPaymentSchema.safeParse(withSave).success).toBe(true);
      expect(iyzicoPaymentSchema.safeParse(withoutSave).success).toBe(true);
    });
  });
});

describe('Payment Validation - Saved Card Schema', () => {
  describe('savedCardPaymentSchema', () => {
    const validSavedCardData = {
      cardId: 'card_123456789',
      cvc: '123',
    };

    it('should validate correct saved card data', () => {
      const result = savedCardPaymentSchema.safeParse(validSavedCardData);
      expect(result.success).toBe(true);
    });

    it('should reject empty card ID', () => {
      const invalidData = { ...validSavedCardData, cardId: '' };
      const result = savedCardPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid CVC', () => {
      const invalidData = { ...validSavedCardData, cvc: '12' };
      const result = savedCardPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept 4-digit CVC', () => {
      const amexData = { ...validSavedCardData, cvc: '1234' };
      const result = savedCardPaymentSchema.safeParse(amexData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Payment Validation - Payment Intent Schema', () => {
  describe('paymentIntentSchema', () => {
    const validIntentData = {
      orderId: 'order_123456789',
      amount: 100.50,
      currency: 'TRY' as const,
    };

    it('should validate correct payment intent data', () => {
      const result = paymentIntentSchema.safeParse(validIntentData);
      expect(result.success).toBe(true);
    });

    it('should reject empty order ID', () => {
      const invalidData = { ...validIntentData, orderId: '' };
      const result = paymentIntentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative amounts', () => {
      const invalidData = { ...validIntentData, amount: -10 };
      const result = paymentIntentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject zero amount', () => {
      const invalidData = { ...validIntentData, amount: 0 };
      const result = paymentIntentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept only TRY currency', () => {
      const tryData = { ...validIntentData, currency: 'TRY' as const };
      const usdData = { ...validIntentData, currency: 'USD' as const };
      
      expect(paymentIntentSchema.safeParse(tryData).success).toBe(true);
      expect(paymentIntentSchema.safeParse(usdData).success).toBe(false);
    });

    it('should handle decimal amounts', () => {
      const testCases = [
        { amount: 10.99, expected: true },
        { amount: 100.00, expected: true },
        { amount: 0.01, expected: true },
        { amount: 999999.99, expected: true },
      ];

      testCases.forEach(({ amount, expected }) => {
        const data = { ...validIntentData, amount };
        const result = paymentIntentSchema.safeParse(data);
        expect(result.success).toBe(expected);
      });
    });
  });
});

describe('Payment Validation - Security Tests', () => {
  it('should sanitize SQL injection attempts in card holder name', () => {
    const maliciousData = {
      cardHolderName: "John'; DROP TABLE users; --",
      cardNumber: '4111 1111 1111 1111',
      expiryMonth: '12',
      expiryYear: '25',
      cvc: '123',
      saveCard: false,
    };
    
    // Should still validate (Zod doesn't execute SQL)
    // But card holder name should only contain letters and spaces
    const result = iyzicoPaymentSchema.safeParse(maliciousData);
    expect(result.success).toBe(false); // Should fail pattern validation
  });

  it('should reject XSS attempts in inputs', () => {
    const xssData = {
      cardHolderName: '<script>alert("XSS")</script>',
      cardNumber: '4111 1111 1111 1111',
      expiryMonth: '12',
      expiryYear: '25',
      cvc: '123',
      saveCard: false,
    };
    
    const result = iyzicoPaymentSchema.safeParse(xssData);
    expect(result.success).toBe(false);
  });
});

describe('Payment Validation - Performance Tests', () => {
  it('should validate large batch of cards quickly', () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      luhnCheck('4111111111111111');
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete 1000 validations in under 100ms
    expect(duration).toBeLessThan(100);
  });

  it('should format large batch of card numbers quickly', () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      formatCardNumber('4111111111111111');
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete 1000 formatting operations in under 50ms
    expect(duration).toBeLessThan(50);
  });
});
