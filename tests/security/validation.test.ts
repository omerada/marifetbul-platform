/**
 * Form Validation & Input Sanitization Tests
 *
 * Tests Zod schemas, form validation logic, and input sanitization
 * across all forms using react-hook-form pattern.
 */

import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import { loginSchema, registerSchema } from '@/lib/core/validations/auth';
import { createReviewSchema } from '@/lib/core/validations/reviews';
import {
  createProposalSchema,
  createOrderSchema,
} from '@/lib/core/validations/details';
import {
  createTicketSchema,
  ticketResponseSchema,
} from '@/lib/core/validations/support';

describe('Authentication Validation', () => {
  describe('Login Schema', () => {
    it('should accept valid login credentials', () => {
      const valid = {
        email: 'user@example.com',
        password: 'SecurePass123!',
      };

      expect(() => loginSchema.parse(valid)).not.toThrow();
    });

    it('should reject invalid email format', () => {
      const invalid = {
        email: 'not-an-email',
        password: 'SecurePass123!',
      };

      expect(() => loginSchema.parse(invalid)).toThrow();
    });

    it('should reject empty email', () => {
      const invalid = {
        email: '',
        password: 'SecurePass123!',
      };

      expect(() => loginSchema.parse(invalid)).toThrow();
    });

    it('should reject short password (< 6 chars)', () => {
      const invalid = {
        email: 'user@example.com',
        password: '12345',
      };

      expect(() => loginSchema.parse(invalid)).toThrow();
    });

    it('should accept minimum valid password (6 chars)', () => {
      const valid = {
        email: 'user@example.com',
        password: '123456',
      };

      expect(() => loginSchema.parse(valid)).not.toThrow();
    });
  });

  describe('Register Schema', () => {
    it('should accept valid registration data', () => {
      const valid = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        userType: 'freelancer' as const,
        acceptTerms: true,
      };

      expect(() => registerSchema.parse(valid)).not.toThrow();
    });

    it('should reject mismatched passwords', () => {
      const invalid = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass456!',
        userType: 'freelancer' as const,
        acceptTerms: true,
      };

      expect(() => registerSchema.parse(invalid)).toThrow();
    });

    it('should reject if terms not accepted', () => {
      const invalid = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        userType: 'freelancer' as const,
        acceptTerms: false,
      };

      expect(() => registerSchema.parse(invalid)).toThrow();
    });

    it('should reject short first name (< 2 chars)', () => {
      const invalid = {
        firstName: 'J',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        userType: 'freelancer' as const,
        acceptTerms: true,
      };

      expect(() => registerSchema.parse(invalid)).toThrow();
    });

    it('should reject invalid user type', () => {
      const invalid = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        userType: 'invalid' as any,
        acceptTerms: true,
      };

      expect(() => registerSchema.parse(invalid)).toThrow();
    });
  });
});

describe('Review Validation', () => {
  describe('Create Review Schema', () => {
    it('should accept valid review data', () => {
      const valid = {
        rating: 5,
        comment: 'Great experience! Highly recommend.',
        orderId: 'order-123',
      };

      expect(() => createReviewSchema.parse(valid)).not.toThrow();
    });

    it('should reject rating below 1', () => {
      const invalid = {
        rating: 0,
        comment: 'Great experience!',
        orderId: 'order-123',
      };

      expect(() => createReviewSchema.parse(invalid)).toThrow();
    });

    it('should reject rating above 5', () => {
      const invalid = {
        rating: 6,
        comment: 'Great experience!',
        orderId: 'order-123',
      };

      expect(() => createReviewSchema.parse(invalid)).toThrow();
    });

    it('should reject short comment (< 10 chars)', () => {
      const invalid = {
        rating: 5,
        comment: 'Good',
        orderId: 'order-123',
      };

      expect(() => createReviewSchema.parse(invalid)).toThrow();
    });

    it('should reject very long comment (> 1000 chars)', () => {
      const invalid = {
        rating: 5,
        comment: 'a'.repeat(1001),
        orderId: 'order-123',
      };

      expect(() => createReviewSchema.parse(invalid)).toThrow();
    });

    it('should accept maximum valid comment (1000 chars)', () => {
      const valid = {
        rating: 5,
        comment: 'a'.repeat(1000),
        orderId: 'order-123',
      };

      expect(() => createReviewSchema.parse(valid)).not.toThrow();
    });
  });
});

describe('Proposal Validation', () => {
  describe('Create Proposal Schema', () => {
    it('should accept valid proposal data', () => {
      const valid = {
        serviceId: 'service-123',
        message:
          'I would love to work on this project. I have 5 years of experience...',
        proposedPrice: 500,
        deliveryTime: 7,
      };

      expect(() => createProposalSchema.parse(valid)).not.toThrow();
    });

    it('should reject negative price', () => {
      const invalid = {
        serviceId: 'service-123',
        message: 'I would love to work on this project.',
        proposedPrice: -100,
        deliveryTime: 7,
      };

      expect(() => createProposalSchema.parse(invalid)).toThrow();
    });

    it('should reject zero price', () => {
      const invalid = {
        serviceId: 'service-123',
        message: 'I would love to work on this project.',
        proposedPrice: 0,
        deliveryTime: 7,
      };

      expect(() => createProposalSchema.parse(invalid)).toThrow();
    });

    it('should reject very short message (< 20 chars)', () => {
      const invalid = {
        serviceId: 'service-123',
        message: 'Short message',
        proposedPrice: 500,
        deliveryTime: 7,
      };

      expect(() => createProposalSchema.parse(invalid)).toThrow();
    });

    it('should reject negative delivery time', () => {
      const invalid = {
        serviceId: 'service-123',
        message: 'I would love to work on this project.',
        proposedPrice: 500,
        deliveryTime: -1,
      };

      expect(() => createProposalSchema.parse(invalid)).toThrow();
    });
  });
});

describe('Support Ticket Validation', () => {
  describe('Create Ticket Schema', () => {
    it('should accept valid ticket data', () => {
      const valid = {
        subject: 'Login Issue - Cannot access my account',
        description:
          'I am unable to log in to my account. I have tried resetting my password but did not receive the email.',
        category: 'technical' as const,
        priority: 'medium' as const,
      };

      expect(() => createTicketSchema.parse(valid)).not.toThrow();
    });

    it('should reject short subject (< 10 chars)', () => {
      const invalid = {
        subject: 'Help',
        description: 'I need help with something important.',
        category: 'general' as const,
        priority: 'medium' as const,
      };

      expect(() => createTicketSchema.parse(invalid)).toThrow();
    });

    it('should reject long subject (> 200 chars)', () => {
      const invalid = {
        subject: 'a'.repeat(201),
        description: 'I need help with something important.',
        category: 'general' as const,
        priority: 'medium' as const,
      };

      expect(() => createTicketSchema.parse(invalid)).toThrow();
    });

    it('should reject short description (< 20 chars)', () => {
      const invalid = {
        subject: 'Login Issue',
        description: 'Cannot login',
        category: 'technical' as const,
        priority: 'medium' as const,
      };

      expect(() => createTicketSchema.parse(invalid)).toThrow();
    });

    it('should reject invalid category', () => {
      const invalid = {
        subject: 'Login Issue',
        description: 'I am unable to log in to my account.',
        category: 'invalid-category' as any,
        priority: 'medium' as const,
      };

      expect(() => createTicketSchema.parse(invalid)).toThrow();
    });

    it('should accept valid categories', () => {
      const categories = [
        'account',
        'billing',
        'payment',
        'technical',
        'dispute',
        'feature_request',
        'bug_report',
        'general',
        'abuse',
        'refund',
        'report_user',
      ];

      categories.forEach((category) => {
        const valid = {
          subject: 'Test Ticket Subject Line',
          description:
            'This is a test ticket description with enough characters.',
          category: category as any,
          priority: 'medium' as const,
        };

        expect(() => createTicketSchema.parse(valid)).not.toThrow();
      });
    });

    it('should accept valid priorities', () => {
      const priorities = ['low', 'medium', 'high', 'urgent'];

      priorities.forEach((priority) => {
        const valid = {
          subject: 'Test Ticket Subject Line',
          description:
            'This is a test ticket description with enough characters.',
          category: 'general' as const,
          priority: priority as any,
        };

        expect(() => createTicketSchema.parse(valid)).not.toThrow();
      });
    });

    it('should accept attachments with valid data', () => {
      const valid = {
        subject: 'Login Issue',
        description: 'I am unable to log in to my account.',
        category: 'technical' as const,
        priority: 'medium' as const,
        attachments: [
          {
            name: 'screenshot.png',
            url: 'https://example.com/files/screenshot.png',
            size: 1024000, // 1MB
            type: 'image/png',
          },
        ],
      };

      expect(() => createTicketSchema.parse(valid)).not.toThrow();
    });

    it('should reject too many attachments (> 5)', () => {
      const invalid = {
        subject: 'Login Issue',
        description: 'I am unable to log in to my account.',
        category: 'technical' as const,
        priority: 'medium' as const,
        attachments: [
          {
            name: 'file1.png',
            url: 'https://example.com/file1.png',
            size: 1000,
            type: 'image/png',
          },
          {
            name: 'file2.png',
            url: 'https://example.com/file2.png',
            size: 1000,
            type: 'image/png',
          },
          {
            name: 'file3.png',
            url: 'https://example.com/file3.png',
            size: 1000,
            type: 'image/png',
          },
          {
            name: 'file4.png',
            url: 'https://example.com/file4.png',
            size: 1000,
            type: 'image/png',
          },
          {
            name: 'file5.png',
            url: 'https://example.com/file5.png',
            size: 1000,
            type: 'image/png',
          },
          {
            name: 'file6.png',
            url: 'https://example.com/file6.png',
            size: 1000,
            type: 'image/png',
          },
        ],
      };

      expect(() => createTicketSchema.parse(invalid)).toThrow();
    });

    it('should reject attachment with file too large (> 10MB)', () => {
      const invalid = {
        subject: 'Login Issue',
        description: 'I am unable to log in to my account.',
        category: 'technical' as const,
        priority: 'medium' as const,
        attachments: [
          {
            name: 'large-file.zip',
            url: 'https://example.com/large-file.zip',
            size: 11 * 1024 * 1024, // 11MB
            type: 'application/zip',
          },
        ],
      };

      expect(() => createTicketSchema.parse(invalid)).toThrow();
    });
  });

  describe('Ticket Response Schema', () => {
    it('should accept valid response data', () => {
      const valid = {
        ticketId: 'ticket-123',
        content: 'Thank you for contacting us. We are looking into your issue.',
        isPublic: true,
      };

      expect(() => ticketResponseSchema.parse(valid)).not.toThrow();
    });

    it('should reject short response (< 10 chars)', () => {
      const invalid = {
        ticketId: 'ticket-123',
        content: 'Thanks',
        isPublic: true,
      };

      expect(() => ticketResponseSchema.parse(invalid)).toThrow();
    });

    it('should default isPublic to true', () => {
      const data = {
        ticketId: 'ticket-123',
        content: 'Thank you for your response.',
      };

      const result = ticketResponseSchema.parse(data);
      expect(result.isPublic).toBe(true);
    });
  });
});

describe('Input Sanitization', () => {
  describe('Whitespace Handling', () => {
    it('should trim leading/trailing whitespace from strings', () => {
      const schema = z.object({
        text: z.string().trim(),
      });

      const result = schema.parse({ text: '  hello  ' });
      expect(result.text).toBe('hello');
    });

    it('should reject empty string after trim', () => {
      const schema = z.object({
        text: z.string().min(1).trim(),
      });

      expect(() => schema.parse({ text: '   ' })).toThrow();
    });
  });

  describe('Email Normalization', () => {
    it('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.com',
        'user+tag@example.co.uk',
        'user123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        expect(() =>
          loginSchema.parse({ email, password: '123456' })
        ).not.toThrow();
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
      ];

      invalidEmails.forEach((email) => {
        expect(() =>
          loginSchema.parse({ email, password: '123456' })
        ).toThrow();
      });
    });
  });

  describe('Numeric Validation', () => {
    it('should accept valid positive numbers', () => {
      const schema = z.object({
        price: z.number().positive(),
      });

      expect(() => schema.parse({ price: 100 })).not.toThrow();
      expect(() => schema.parse({ price: 0.01 })).not.toThrow();
    });

    it('should reject negative numbers when positive required', () => {
      const schema = z.object({
        price: z.number().positive(),
      });

      expect(() => schema.parse({ price: -10 })).toThrow();
      expect(() => schema.parse({ price: 0 })).toThrow();
    });

    it('should enforce min/max constraints', () => {
      const schema = z.object({
        rating: z.number().min(1).max(5),
      });

      expect(() => schema.parse({ rating: 3 })).not.toThrow();
      expect(() => schema.parse({ rating: 0 })).toThrow();
      expect(() => schema.parse({ rating: 6 })).toThrow();
    });
  });

  describe('Array Validation', () => {
    it('should validate array length constraints', () => {
      const schema = z.object({
        items: z.array(z.string()).max(5),
      });

      expect(() => schema.parse({ items: ['a', 'b', 'c'] })).not.toThrow();
      expect(() =>
        schema.parse({ items: ['a', 'b', 'c', 'd', 'e', 'f'] })
      ).toThrow();
    });

    it('should validate array item types', () => {
      const schema = z.object({
        numbers: z.array(z.number()),
      });

      expect(() => schema.parse({ numbers: [1, 2, 3] })).not.toThrow();
      expect(() => schema.parse({ numbers: [1, 'two', 3] })).toThrow();
    });
  });
});

describe('Edge Cases & Security', () => {
  describe('SQL Injection Prevention', () => {
    it('should accept data with SQL-like syntax (Zod does not prevent, backend must)', () => {
      // Zod validates format, not SQL injection. Backend JPA/Hibernate handles this.
      const malicious = {
        email: "admin@example.com' OR '1'='1",
        password: 'password',
      };

      // Should pass Zod validation (valid email format)
      // Backend must use parameterized queries
      expect(() => loginSchema.parse(malicious)).not.toThrow();
    });
  });

  describe('Unicode & Special Characters', () => {
    it('should accept unicode characters', () => {
      const schema = z.object({
        name: z.string().min(2),
      });

      expect(() => schema.parse({ name: 'João' })).not.toThrow();
      expect(() => schema.parse({ name: '山田太郎' })).not.toThrow();
      expect(() => schema.parse({ name: 'Müller' })).not.toThrow();
    });

    it('should accept emojis', () => {
      const schema = z.object({
        message: z.string().min(10),
      });

      expect(() =>
        schema.parse({ message: 'Great work! 👍🎉✨' })
      ).not.toThrow();
    });
  });

  describe('Type Coercion', () => {
    it('should not coerce string to number by default', () => {
      const schema = z.object({
        age: z.number(),
      });

      expect(() => schema.parse({ age: '25' })).toThrow();
    });

    it('should coerce with explicit coerce()', () => {
      const schema = z.object({
        age: z.coerce.number(),
      });

      const result = schema.parse({ age: '25' });
      expect(result.age).toBe(25);
    });
  });

  describe('Null/Undefined Handling', () => {
    it('should reject null when not allowed', () => {
      const schema = z.object({
        name: z.string(),
      });

      expect(() => schema.parse({ name: null })).toThrow();
    });

    it('should accept optional fields', () => {
      const schema = z.object({
        name: z.string().optional(),
      });

      expect(() => schema.parse({})).not.toThrow();
      expect(() => schema.parse({ name: undefined })).not.toThrow();
    });
  });
});

describe('Performance', () => {
  it('should validate quickly (< 10ms per validation)', () => {
    const data = {
      subject: 'Performance Test Ticket',
      description:
        'Testing the validation performance with a reasonable amount of text.',
      category: 'general' as const,
      priority: 'medium' as const,
    };

    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      createTicketSchema.parse(data);
    }
    const end = Date.now();

    expect(end - start).toBeLessThan(100); // 1000 validations < 100ms
  });
});
