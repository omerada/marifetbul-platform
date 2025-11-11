import { z } from 'zod';
import { baseSchemas, compositeSchemas } from './base';
import validationMessages from './messages';

// ================================================
// PAYMENT VALIDATION SCHEMAS
// ================================================
// Optimized with base schema composition

const vm = validationMessages.vm();

// Payment Method Schema
export const paymentMethodSchema = z.enum([
  'credit_card',
  'bank_transfer',
  'wallet',
]);

// Currency Schema
export const currencySchema = baseSchemas.currency;

// Payment Card Schema with base composition
export const paymentCardSchema = z.object({
  cardNumber: z
    .string()
    .min(13, 'Kart numarası en az 13 haneli olmalı')
    .max(19, 'Kart numarası en fazla 19 haneli olmalı')
    .regex(/^[0-9\s]+$/, 'Kart numarası sadece rakam içermeli'),
  expiryMonth: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, 'Geçerli bir ay seçin (01-12)'),
  expiryYear: z
    .string()
    .regex(/^20[2-9][0-9]$/, 'Geçerli bir yıl girin')
    .refine((year) => {
      const currentYear = new Date().getFullYear();
      return parseInt(year) >= currentYear;
    }, 'Kart süresi geçmiş olamaz'),
  cvv: z
    .string()
    .min(3, 'CVV en az 3 haneli olmalı')
    .max(4, 'CVV en fazla 4 haneli olmalı')
    .regex(/^[0-9]+$/, 'CVV sadece rakam içermeli'),
  cardHolderName: z
    .string()
    .min(2, vm.name.tooShort(2))
    .max(50, vm.name.tooLong(50))
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Kart sahibi adı sadece harf içermeli'),
});

// Billing Address Schema using composites
export const billingAddressSchema = z.object({
  fullName: baseSchemas.name.max(100, 'Ad soyad en fazla 100 karakter olmalı'),
  email: baseSchemas.email,
  phone: baseSchemas.phoneOptional,
  ...compositeSchemas.address.shape,
  postalCode: z
    .string()
    .min(5, 'Posta kodu en az 5 karakter olmalı')
    .max(10, 'Posta kodu en fazla 10 karakter olmalı')
    .regex(/^[0-9]+$/, 'Posta kodu sadece rakam içermeli'),
});

// Create Payment Request Schema
export const createPaymentRequestSchema = z
  .object({
    orderId: baseSchemas.uuid,
    method: paymentMethodSchema,
    amount: baseSchemas.price
      .min(1, 'Tutar en az 1 TL olmalı')
      .max(1000000, 'Tutar en fazla 1.000.000 TL olabilir')
      .multipleOf(0.01, 'Tutar en fazla 2 ondalık basamak içerebilir'),
    currency: currencySchema.default('TRY'),
    saveCard: baseSchemas.optional.default(false),
    cardDetails: paymentCardSchema.optional(),
    billingAddress: billingAddressSchema.optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((data, ctx) => {
    // Credit card için kart detayları ve fatura adresi zorunlu
    if (data.method === 'credit_card') {
      if (!data.cardDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Kredi kartı ödemesi için kart bilgileri gereklidir',
          path: ['cardDetails'],
        });
      }
      if (!data.billingAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Kredi kartı ödemesi için fatura adresi gereklidir',
          path: ['billingAddress'],
        });
      }
    }
  });

// Payment Form Data Schema
export const paymentFormDataSchema = z.object({
  orderId: baseSchemas.id,
  method: paymentMethodSchema,
  amount: baseSchemas.price
    .min(1, vm.payment.amountRequired)
    .max(1000000, 'Tutar en fazla 1.000.000 TL olabilir'),
  currency: currencySchema.default('TRY'),
  saveCard: baseSchemas.optional.default(false),
  cardDetails: paymentCardSchema.optional(),
  billingAddress: billingAddressSchema.optional(),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, 'Kullanım şartlarını kabul etmelisiniz'),
});

// Payment Filters Schema using composite patterns
export const paymentFiltersSchema = z
  .object({
    status: z
      .array(
        z.enum([
          'pending',
          'processing',
          'completed',
          'failed',
          'cancelled',
          'refunded',
        ])
      )
      .optional(),
    method: z.array(paymentMethodSchema).optional(),
    amountMin: baseSchemas.price.optional(),
    amountMax: baseSchemas.price.optional(),
    dateFrom: baseSchemas.dateOptional,
    dateTo: baseSchemas.dateOptional,
    orderId: baseSchemas.uuid.optional(),
    search: z.string().max(100).optional(),
    currency: currencySchema.optional(),
  })
  .refine(
    (data) => {
      if (data.amountMin && data.amountMax) {
        return data.amountMin <= data.amountMax;
      }
      return true;
    },
    {
      message: 'Minimum tutar maksimum tutardan büyük olamaz',
      path: ['amountMin'],
    }
  )
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    {
      message: 'Başlangıç tarihi bitiş tarihinden sonra olamaz',
      path: ['dateFrom'],
    }
  );

// Invoice Generation Schema
export const invoiceGenerationSchema = z.object({
  orderId: baseSchemas.uuid,
  paymentId: baseSchemas.uuid,
  templateType: z.enum(['standard', 'detailed', 'simple']).default('standard'),
  language: z.enum(['tr', 'en']).default('tr'),
  includeItemizedBreakdown: baseSchemas.optional.default(true),
  includeTaxBreakdown: baseSchemas.optional.default(true),
  customFields: z.record(z.string(), z.string()).optional(),
});

// Refund Request Schema
export const refundRequestSchema = z.object({
  paymentId: baseSchemas.uuid,
  amount: baseSchemas.price
    .min(0.01, 'İade tutarı en az 0.01 TL olmalı')
    .max(1000000, 'İade tutarı en fazla 1.000.000 TL olabilir'),
  reason: baseSchemas.description
    .min(10, 'İade sebebi en az 10 karakter olmalı')
    .max(500, 'İade sebebi en fazla 500 karakter olmalı'),
  type: z.enum(['full', 'partial']).default('full'),
  notifyUser: baseSchemas.optional.default(true),
});

// Escrow Release Schema
export const escrowReleaseSchema = z.object({
  paymentId: baseSchemas.uuid,
  amount: baseSchemas.price
    .min(0.01, 'Serbest bırakılacak tutar en az 0.01 TL olmalı')
    .optional(),
  reason: z
    .string()
    .min(5, 'Sebep en az 5 karakter olmalı')
    .max(200, 'Sebep en fazla 200 karakter olmalı'),
  releaseType: z
    .enum(['manual', 'automatic', 'milestone', 'dispute_resolution'])
    .default('manual'),
  notifyUsers: baseSchemas.optional.default(true),
});

// ================================================
// IYZICO-SPECIFIC SCHEMAS (Sprint 1 - Payment System)
// ================================================

/**
 * Luhn algorithm for credit card validation
 */
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Detect card type from card number
 */
export type IyzicoCardType = 'VISA' | 'MASTERCARD' | 'AMEX' | 'TROY' | 'UNKNOWN';

export function detectCardType(cardNumber: string): IyzicoCardType {
  const digits = cardNumber.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'VISA';
  if (/^5[1-5]/.test(digits)) return 'MASTERCARD';
  if (/^3[47]/.test(digits)) return 'AMEX';
  if (/^9792/.test(digits)) return 'TROY';
  return 'UNKNOWN';
}

/**
 * Format card number (XXXX XXXX XXXX XXXX)
 */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(' ');
}

/**
 * Iyzico Payment Form Schema
 */
export const iyzicoPaymentSchema = z.object({
  cardHolderName: z
    .string()
    .min(3, 'Kart sahibi adı en az 3 karakter olmalıdır')
    .max(50, 'Kart sahibi adı en fazla 50 karakter olabilir')
    .regex(/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/, 'Sadece harf karakterleri kullanılabilir')
    .transform((val) => val.toUpperCase().trim()),

  cardNumber: z
    .string()
    .min(1, 'Kart numarası gereklidir')
    .transform((val) => val.replace(/\s/g, ''))
    .refine((val) => /^\d{13,19}$/.test(val), 'Geçerli bir kart numarası giriniz')
    .refine((val) => luhnCheck(val), 'Geçersiz kart numarası'),

  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Geçerli bir ay giriniz (01-12)'),
  
  expiryYear: z.string().regex(/^\d{2}$/, 'Geçerli bir yıl giriniz (YY formatında)'),
  
  cvc: z.string().regex(/^\d{3,4}$/, 'CVV 3 veya 4 rakam olmalıdır'),
  
  saveCard: z.boolean().optional().default(false),
}).refine(
  (data) => {
    // Validate expiry date is not in the past
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const year = parseInt(data.expiryYear, 10);
    const month = parseInt(data.expiryMonth, 10);

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  },
  { message: 'Kartınızın süresi dolmuştur', path: ['expiryMonth'] }
);

/**
 * Saved Card Payment Schema
 */
export const savedCardPaymentSchema = z.object({
  cardToken: z.string().min(1, 'Kart seçimi gereklidir'),
  cvc: z.string().regex(/^\d{3,4}$/, 'CVV 3 veya 4 rakam olmalıdır'),
});

/**
 * Payment Intent Schema
 */
export const paymentIntentSchema = z.object({
  orderId: baseSchemas.uuid,
  amount: baseSchemas.price.positive('Tutar 0\'dan büyük olmalıdır'),
  currency: z.enum(['TRY']).default('TRY'),
  returnUrl: z.string().url().optional(),
  saveCard: z.boolean().optional().default(false),
});

// Type exports
export type PaymentMethodType = z.infer<typeof paymentMethodSchema>;
export type CurrencyType = z.infer<typeof currencySchema>;
export type PaymentCardData = z.infer<typeof paymentCardSchema>;
export type BillingAddressData = z.infer<typeof billingAddressSchema>;
export type CreatePaymentRequestData = z.infer<typeof createPaymentRequestSchema>;
export type PaymentFormData = z.infer<typeof paymentFormDataSchema>;
export type PaymentFiltersData = z.infer<typeof paymentFiltersSchema>;
export type InvoiceGenerationData = z.infer<typeof invoiceGenerationSchema>;
export type RefundRequestData = z.infer<typeof refundRequestSchema>;
export type EscrowReleaseData = z.infer<typeof escrowReleaseSchema>;

// Iyzico-specific types
export type IyzicoPaymentFormData = z.infer<typeof iyzicoPaymentSchema>;
export type SavedCardPaymentData = z.infer<typeof savedCardPaymentSchema>;
export type PaymentIntentData = z.infer<typeof paymentIntentSchema>;
