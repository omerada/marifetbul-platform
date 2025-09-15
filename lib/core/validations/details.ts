import { z } from 'zod';
import { baseSchemas, validateFormData } from './base';
import validationMessages from './messages';

// ================================================
// DETAIL FORM VALIDATION SCHEMAS
// ================================================
// Optimized with base schema composition

const vm = validationMessages.vm();

// Proposal schema with base composition
export const proposalSchema = z.object({
  jobId: baseSchemas.id,
  coverLetter: baseSchemas.description
    .min(50, 'Kapak mektubu en az 50 karakter olmalıdır')
    .max(2000, 'Kapak mektubu en fazla 2000 karakter olabilir'),
  budget: z.object({
    amount: baseSchemas.price
      .min(1, 'Teklif tutarı en az 1 TL olmalıdır')
      .max(1000000, 'Teklif tutarı çok yüksek'),
    type: z.enum(['fixed', 'hourly'], {
      message: 'Geçerli bir ödeme türü seçiniz',
    }),
  }),
  timeline: z.object({
    value: baseSchemas.positiveInt
      .min(1, 'Süre en az 1 olmalıdır')
      .max(365, 'Süre çok uzun'),
    unit: z.enum(['days', 'weeks', 'months'], {
      message: 'Geçerli bir zaman birimi seçiniz',
    }),
  }),
  milestones: z
    .array(
      z.object({
        title: baseSchemas.title.min(5, 'Başlık en az 5 karakter olmalıdır'),
        description: baseSchemas.shortDescription,
        amount: baseSchemas.price,
        dueDate: z.string().refine((date) => new Date(date) > new Date(), {
          message: 'Teslim tarihi gelecekte olmalıdır',
        }),
      })
    )
    .optional(),
  questions: z
    .array(
      z.object({
        question: z.string().min(5, 'Soru en az 5 karakter olmalıdır'),
        answer: z.string().min(5, 'Cevap en az 5 karakter olmalıdır'),
      })
    )
    .optional(),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: baseSchemas.url,
        type: z.string(),
      })
    )
    .optional(),
});

// Order schema with base composition
export const orderSchema = z.object({
  packageId: baseSchemas.id,
  tier: z.enum(['basic', 'standard', 'premium'], {
    message: 'Geçerli bir paket seviyesi seçiniz',
  }),
  customizations: z
    .object({
      requirements: baseSchemas.description
        .max(1000, 'Özel istekler en fazla 1000 karakter olabilir')
        .optional(),
      additionalInfo: baseSchemas.shortDescription
        .max(500, 'Ek bilgiler en fazla 500 karakter olabilir')
        .optional(),
    })
    .optional(),
  addOns: baseSchemas.stringArray.optional(),
  urgentDelivery: baseSchemas.optional,
});

// File upload schema with enhanced validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "Dosya boyutu 10MB'dan büyük olamaz",
    })
    .refine(
      (file) => {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'text/plain',
        ];
        return allowedTypes.includes(file.type);
      },
      {
        message:
          'Desteklenmeyen dosya formatı. PDF, DOC, DOCX, JPG, PNG, GIF veya TXT dosyalarını yükleyebilirsiniz.',
      }
    ),
});

// Review schema with base composition
export const reviewSchema = z.object({
  rating: baseSchemas.rating,
  comment: baseSchemas.description
    .min(10, vm.review.commentTooShort(10))
    .max(1000, 'Yorum en fazla 1000 karakter olabilir'),
  orderId: baseSchemas.id,
});

// Message schema with base composition
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Mesaj boş olamaz')
    .max(2000, 'Mesaj en fazla 2000 karakter olabilir'),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: baseSchemas.url,
        type: z.string(),
        size: z.number(),
      })
    )
    .optional(),
});

// Search filters using marketplace patterns
export const jobFiltersSchema = z.object({
  category: baseSchemas.category.optional(),
  subcategory: z.string().optional(),
  budgetMin: baseSchemas.price.optional(),
  budgetMax: baseSchemas.price.optional(),
  budgetType: z.enum(['fixed', 'hourly']).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'expert']).optional(),
  location: baseSchemas.stringArray.optional(),
  isRemote: baseSchemas.optional,
  skills: baseSchemas.tags.optional(),
  search: z.string().optional(),
  deadline: z.enum(['urgent', 'week', 'month', 'flexible']).optional(),
  sort: z.enum(['newest', 'budget', 'proposals', 'rating']).optional(),
});

export const packageFiltersSchema = z.object({
  category: baseSchemas.category.optional(),
  subcategory: z.string().optional(),
  priceMin: baseSchemas.price.optional(),
  priceMax: baseSchemas.price.optional(),
  deliveryTime: baseSchemas.positiveInt.optional(),
  rating: baseSchemas.rating.optional(),
  search: z.string().optional(),
  sort: z
    .enum(['newest', 'price_low', 'price_high', 'rating', 'orders'])
    .optional(),
});

// Proposal status update schema
export const proposalStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected'], {
    message: 'Geçerli bir durum seçiniz',
  }),
  note: baseSchemas.shortDescription
    .max(500, 'Not en fazla 500 karakter olabilir')
    .optional(),
});

// Contact form schema with base composition
export const contactFormSchema = z.object({
  recipientId: baseSchemas.id,
  subject: baseSchemas.title
    .min(5, 'Konu en az 5 karakter olmalıdır')
    .max(100, 'Konu en fazla 100 karakter olabilir'),
  message: baseSchemas.description
    .min(20, 'Mesaj en az 20 karakter olmalıdır')
    .max(2000, 'Mesaj en fazla 2000 karakter olabilir'),
  jobId: baseSchemas.id.optional(),
  packageId: baseSchemas.id.optional(),
});

// Type exports
export type ProposalFormData = z.infer<typeof proposalSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type FileUploadData = z.infer<typeof fileUploadSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type JobFiltersData = z.infer<typeof jobFiltersSchema>;
export type PackageFiltersData = z.infer<typeof packageFiltersSchema>;
export type ProposalStatusData = z.infer<typeof proposalStatusSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;

// Enhanced validation helper functions
export const validateProposal = async (data: unknown) => {
  return await validateFormData(proposalSchema, data);
};

export const validateOrder = async (data: unknown) => {
  return await validateFormData(orderSchema, data);
};

export const validateFile = (file: File) => {
  return fileUploadSchema.safeParse({ file });
};

export const validateReview = async (data: unknown) => {
  return await validateFormData(reviewSchema, data);
};

export const validateMessage = async (data: unknown) => {
  return await validateFormData(messageSchema, data);
};

export const validateJobFilters = async (data: unknown) => {
  return await validateFormData(jobFiltersSchema, data);
};

export const validatePackageFilters = async (data: unknown) => {
  return await validateFormData(packageFiltersSchema, data);
};

export const validateProposalStatus = async (data: unknown) => {
  return await validateFormData(proposalStatusSchema, data);
};

export const validateContactForm = async (data: unknown) => {
  return await validateFormData(contactFormSchema, data);
};
