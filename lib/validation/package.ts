/**
 * ================================================
 * PACKAGE VALIDATION SCHEMAS
 * ================================================
 * Zod validation schemas for Package System
 * Includes tier pricing validation and hierarchy checks
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { z } from 'zod';

// ================================================
// BASIC VALIDATION SCHEMAS
// ================================================

/**
 * Package Basic Info Schema
 * Step 1 of creation wizard
 */
export const packageBasicInfoSchema = z.object({
  title: z
    .string()
    .min(10, 'Başlık en az 10 karakter olmalı')
    .max(200, 'Başlık en fazla 200 karakter olabilir')
    .trim(),

  description: z
    .string()
    .min(50, 'Açıklama en az 50 karakter olmalı')
    .max(5000, 'Açıklama en fazla 5000 karakter olabilir')
    .trim(),

  categoryId: z
    .string()
    .uuid('Geçerli bir kategori seçin')
    .min(1, 'Kategori seçimi zorunlu'),

  keywords: z
    .array(z.string().trim().min(1))
    .min(1, 'En az 1 anahtar kelime girin')
    .max(10, 'En fazla 10 anahtar kelime ekleyebilirsiniz'),
});

export type PackageBasicInfoData = z.infer<typeof packageBasicInfoSchema>;

// ================================================
// TIER VALIDATION SCHEMAS
// ================================================

/**
 * Single Tier Schema
 * Used for Basic, Standard, and Premium tiers
 */
export const packageTierSchema = z.object({
  price: z
    .number()
    .min(50, 'Minimum fiyat 50 TL')
    .max(50000, 'Maximum fiyat 50,000 TL')
    .multipleOf(0.01, 'Fiyat en fazla 2 ondalık basamak içerebilir'),

  deliveryDays: z
    .number()
    .int('Teslimat süresi tam sayı olmalı')
    .min(1, 'Minimum teslimat süresi 1 gün')
    .max(90, 'Maximum teslimat süresi 90 gün'),

  revisionCount: z
    .number()
    .int('Revizyon sayısı tam sayı olmalı')
    .min(0, 'Minimum revizyon sayısı 0')
    .max(20, 'Maximum revizyon sayısı 20'),

  features: z
    .array(z.string().trim().min(1))
    .min(1, 'En az 1 özellik ekleyin')
    .max(20, 'En fazla 20 özellik ekleyebilirsiniz'),
});

export type PackageTierData = z.infer<typeof packageTierSchema>;

/**
 * Tier Pricing Schema with Hierarchy Validation
 * Step 2 of creation wizard
 */
export const packageTierPricingSchema = z
  .object({
    basicTier: packageTierSchema,

    standardTier: packageTierSchema.nullable().optional(),

    premiumTier: packageTierSchema.nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // VALIDATION 1: Price hierarchy (Basic < Standard < Premium)
    if (data.standardTier) {
      if (data.basicTier.price >= data.standardTier.price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Standard paket fiyatı, Basic paketten yüksek olmalı',
          path: ['standardTier', 'price'],
        });
      }
    }

    if (data.premiumTier) {
      if (data.standardTier) {
        if (data.standardTier.price >= data.premiumTier.price) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Premium paket fiyatı, Standard paketten yüksek olmalı',
            path: ['premiumTier', 'price'],
          });
        }
      } else {
        // Premium without Standard: Premium > Basic
        if (data.basicTier.price >= data.premiumTier.price) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Premium paket fiyatı, Basic paketten yüksek olmalı',
            path: ['premiumTier', 'price'],
          });
        }
      }
    }

    // VALIDATION 2: Delivery days hierarchy (Basic >= Standard >= Premium)
    // Higher tier = faster delivery
    if (data.standardTier) {
      if (data.basicTier.deliveryDays < data.standardTier.deliveryDays) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Standard paket teslimat süresi, Basic paketten kısa veya eşit olmalı',
          path: ['standardTier', 'deliveryDays'],
        });
      }
    }

    if (data.premiumTier) {
      if (data.standardTier) {
        if (data.standardTier.deliveryDays < data.premiumTier.deliveryDays) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Premium paket teslimat süresi, Standard paketten kısa veya eşit olmalı',
            path: ['premiumTier', 'deliveryDays'],
          });
        }
      } else {
        if (data.basicTier.deliveryDays < data.premiumTier.deliveryDays) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Premium paket teslimat süresi, Basic paketten kısa veya eşit olmalı',
            path: ['premiumTier', 'deliveryDays'],
          });
        }
      }
    }

    // VALIDATION 3: Revision count hierarchy (Basic <= Standard <= Premium)
    // Higher tier = more revisions
    if (data.standardTier) {
      if (data.basicTier.revisionCount > data.standardTier.revisionCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Standard paket revizyon sayısı, Basic paketten fazla veya eşit olmalı',
          path: ['standardTier', 'revisionCount'],
        });
      }
    }

    if (data.premiumTier) {
      if (data.standardTier) {
        if (data.standardTier.revisionCount > data.premiumTier.revisionCount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Premium paket revizyon sayısı, Standard paketten fazla veya eşit olmalı',
            path: ['premiumTier', 'revisionCount'],
          });
        }
      } else {
        if (data.basicTier.revisionCount > data.premiumTier.revisionCount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Premium paket revizyon sayısı, Basic paketten fazla veya eşit olmalı',
            path: ['premiumTier', 'revisionCount'],
          });
        }
      }
    }

    // VALIDATION 4: Feature count hierarchy (Basic <= Standard <= Premium)
    // Higher tier = more features
    if (data.standardTier) {
      if (data.basicTier.features.length > data.standardTier.features.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Standard paket özellik sayısı, Basic paketten fazla veya eşit olmalı',
          path: ['standardTier', 'features'],
        });
      }
    }

    if (data.premiumTier) {
      if (data.standardTier) {
        if (
          data.standardTier.features.length > data.premiumTier.features.length
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Premium paket özellik sayısı, Standard paketten fazla veya eşit olmalı',
            path: ['premiumTier', 'features'],
          });
        }
      } else {
        if (data.basicTier.features.length > data.premiumTier.features.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Premium paket özellik sayısı, Basic paketten fazla veya eşit olmalı',
            path: ['premiumTier', 'features'],
          });
        }
      }
    }
  });

export type PackageTierPricingData = z.infer<typeof packageTierPricingSchema>;

// ================================================
// FEATURES VALIDATION SCHEMA
// ================================================

/**
 * Package Features Schema
 * Step 3 of creation wizard
 */
export const packageFeaturesSchema = z.object({
  highlights: z
    .array(z.string().trim().min(1))
    .min(1, 'En az 1 öne çıkan özellik girin')
    .max(5, 'En fazla 5 öne çıkan özellik ekleyebilirsiniz'),

  deliverables: z
    .array(z.string().trim().min(1))
    .min(1, 'En az 1 teslim edilecek çıktı girin')
    .max(10, 'En fazla 10 çıktı ekleyebilirsiniz'),

  requirements: z
    .array(z.string().trim().min(1))
    .max(10, 'En fazla 10 gereksinim ekleyebilirsiniz')
    .optional()
    .default([]),
});

export type PackageFeaturesData = z.infer<typeof packageFeaturesSchema>;

// ================================================
// MEDIA VALIDATION SCHEMA
// ================================================

/**
 * Package Media Schema
 * Step 4 of creation wizard
 */
export const packageMediaSchema = z.object({
  images: z
    .array(z.string().url("Geçerli bir resim URL'si olmalı"))
    .min(1, 'En az 1 görsel ekleyin')
    .max(8, 'En fazla 8 görsel ekleyebilirsiniz'),

  videoUrl: z
    .string()
    .url("Geçerli bir video URL'si girin")
    .regex(
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+$/,
      'Sadece YouTube veya Vimeo linkleri kabul edilir'
    )
    .optional()
    .nullable(),
});

export type PackageMediaData = z.infer<typeof packageMediaSchema>;

// ================================================
// SEO VALIDATION SCHEMA
// ================================================

/**
 * Package SEO Schema
 * Step 5 of creation wizard (optional)
 */
export const packageSeoSchema = z.object({
  metaDescription: z
    .string()
    .min(50, 'Meta açıklama en az 50 karakter olmalı')
    .max(160, 'Meta açıklama en fazla 160 karakter olabilir')
    .trim()
    .optional()
    .nullable(),
});

export type PackageSeoData = z.infer<typeof packageSeoSchema>;

// ================================================
// COMPLETE PACKAGE CREATION SCHEMA
// ================================================

/**
 * Complete Package Creation Schema
 * Combines all wizard steps
 */
export const createPackageSchema = packageBasicInfoSchema
  .merge(packageTierPricingSchema)
  .merge(packageFeaturesSchema)
  .merge(packageMediaSchema)
  .merge(packageSeoSchema);

export type CreatePackageFormData = z.infer<typeof createPackageSchema>;

// ================================================
// UPDATE PACKAGE SCHEMA
// ================================================

/**
 * Update Package Schema
 * All fields optional (partial update support)
 */
export const updatePackageSchema = createPackageSchema.partial();

export type UpdatePackageFormData = z.infer<typeof updatePackageSchema>;

// ================================================
// VALIDATION HELPER FUNCTIONS
// ================================================

/**
 * Validate tier price hierarchy
 */
export const validateTierPriceHierarchy = (
  basicPrice: number,
  standardPrice?: number | null,
  premiumPrice?: number | null
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (standardPrice !== undefined && standardPrice !== null) {
    if (basicPrice >= standardPrice) {
      errors.push('Standard paket fiyatı, Basic paketten yüksek olmalı');
    }
  }

  if (premiumPrice !== undefined && premiumPrice !== null) {
    if (standardPrice !== undefined && standardPrice !== null) {
      if (standardPrice >= premiumPrice) {
        errors.push('Premium paket fiyatı, Standard paketten yüksek olmalı');
      }
    } else {
      if (basicPrice >= premiumPrice) {
        errors.push('Premium paket fiyatı, Basic paketten yüksek olmalı');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate tier delivery days hierarchy
 */
export const validateTierDeliveryHierarchy = (
  basicDays: number,
  standardDays?: number | null,
  premiumDays?: number | null
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (standardDays !== undefined && standardDays !== null) {
    if (basicDays < standardDays) {
      errors.push(
        'Standard paket teslimat süresi, Basic paketten kısa veya eşit olmalı'
      );
    }
  }

  if (premiumDays !== undefined && premiumDays !== null) {
    if (standardDays !== undefined && standardDays !== null) {
      if (standardDays < premiumDays) {
        errors.push(
          'Premium paket teslimat süresi, Standard paketten kısa veya eşit olmalı'
        );
      }
    } else {
      if (basicDays < premiumDays) {
        errors.push(
          'Premium paket teslimat süresi, Basic paketten kısa veya eşit olmalı'
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate complete tier hierarchy
 */
export const validateTierHierarchy = (
  basicTier: PackageTierData,
  standardTier?: PackageTierData | null,
  premiumTier?: PackageTierData | null
): { isValid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};

  // Price hierarchy
  const priceValidation = validateTierPriceHierarchy(
    basicTier.price,
    standardTier?.price,
    premiumTier?.price
  );
  if (!priceValidation.isValid) {
    errors.price = priceValidation.errors;
  }

  // Delivery days hierarchy
  const deliveryValidation = validateTierDeliveryHierarchy(
    basicTier.deliveryDays,
    standardTier?.deliveryDays,
    premiumTier?.deliveryDays
  );
  if (!deliveryValidation.isValid) {
    errors.deliveryDays = deliveryValidation.errors;
  }

  // Revision count hierarchy
  if (standardTier && basicTier.revisionCount > standardTier.revisionCount) {
    errors.revisionCount = errors.revisionCount || [];
    errors.revisionCount.push(
      'Standard paket revizyon sayısı, Basic paketten fazla veya eşit olmalı'
    );
  }
  if (premiumTier) {
    if (
      standardTier &&
      standardTier.revisionCount > premiumTier.revisionCount
    ) {
      errors.revisionCount = errors.revisionCount || [];
      errors.revisionCount.push(
        'Premium paket revizyon sayısı, Standard paketten fazla veya eşit olmalı'
      );
    } else if (
      !standardTier &&
      basicTier.revisionCount > premiumTier.revisionCount
    ) {
      errors.revisionCount = errors.revisionCount || [];
      errors.revisionCount.push(
        'Premium paket revizyon sayısı, Basic paketten fazla veya eşit olmalı'
      );
    }
  }

  // Feature count hierarchy
  if (
    standardTier &&
    basicTier.features.length > standardTier.features.length
  ) {
    errors.featureCount = errors.featureCount || [];
    errors.featureCount.push(
      'Standard paket özellik sayısı, Basic paketten fazla veya eşit olmalı'
    );
  }
  if (premiumTier) {
    if (
      standardTier &&
      standardTier.features.length > premiumTier.features.length
    ) {
      errors.featureCount = errors.featureCount || [];
      errors.featureCount.push(
        'Premium paket özellik sayısı, Standard paketten fazla veya eşit olmalı'
      );
    } else if (
      !standardTier &&
      basicTier.features.length > premiumTier.features.length
    ) {
      errors.featureCount = errors.featureCount || [];
      errors.featureCount.push(
        'Premium paket özellik sayısı, Basic paketten fazla veya eşit olmalı'
      );
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
