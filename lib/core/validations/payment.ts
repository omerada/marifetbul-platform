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

// Type exports
export type PaymentMethodType = z.infer<typeof paymentMethodSchema>;
export type CurrencyType = z.infer<typeof currencySchema>;
export type PaymentCardData = z.infer<typeof paymentCardSchema>;
export type BillingAddressData = z.infer<typeof billingAddressSchema>;
export type CreatePaymentRequestData = z.infer<
  typeof createPaymentRequestSchema
>;
export type PaymentFormData = z.infer<typeof paymentFormDataSchema>;
export type PaymentFiltersData = z.infer<typeof paymentFiltersSchema>;
export type InvoiceGenerationData = z.infer<typeof invoiceGenerationSchema>;
export type RefundRequestData = z.infer<typeof refundRequestSchema>;
export type EscrowReleaseData = z.infer<typeof escrowReleaseSchema>;
