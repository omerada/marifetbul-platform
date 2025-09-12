import { z } from 'zod';

// Proposal schema
export const proposalSchema = z.object({
  jobId: z.string().min(1, 'İş ID gereklidir'),
  coverLetter: z
    .string()
    .min(50, 'Kapak mektubu en az 50 karakter olmalıdır')
    .max(2000, 'Kapak mektubu en fazla 2000 karakter olabilir'),
  budget: z.object({
    amount: z
      .number()
      .min(1, 'Teklif tutarı en az 1 TL olmalıdır')
      .max(1000000, 'Teklif tutarı çok yüksek'),
    type: z.enum(['fixed', 'hourly'], {
      message: 'Geçerli bir ödeme türü seçiniz',
    }),
  }),
  timeline: z.object({
    value: z
      .number()
      .min(1, 'Süre en az 1 olmalıdır')
      .max(365, 'Süre çok uzun'),
    unit: z.enum(['days', 'weeks', 'months'], {
      message: 'Geçerli bir zaman birimi seçiniz',
    }),
  }),
  milestones: z
    .array(
      z.object({
        title: z.string().min(5, 'Başlık en az 5 karakter olmalıdır'),
        description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
        amount: z.number().min(1, 'Tutar pozitif olmalıdır'),
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
        url: z.string().url('Geçerli bir URL giriniz'),
        type: z.string(),
      })
    )
    .optional(),
});

// Order schema
export const orderSchema = z.object({
  packageId: z.string().min(1, 'Paket ID gereklidir'),
  tier: z.enum(['basic', 'standard', 'premium'], {
    message: 'Geçerli bir paket seviyesi seçiniz',
  }),
  customizations: z
    .object({
      requirements: z
        .string()
        .max(1000, 'Özel istekler en fazla 1000 karakter olabilir')
        .optional(),
      additionalInfo: z
        .string()
        .max(500, 'Ek bilgiler en fazla 500 karakter olabilir')
        .optional(),
    })
    .optional(),
  addOns: z.array(z.string()).optional(),
  urgentDelivery: z.boolean().optional(),
});

// File upload schema
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

// Review schema
export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'En az 1 yıldız veriniz')
    .max(5, 'En fazla 5 yıldız verebilirsiniz'),
  comment: z
    .string()
    .min(10, 'Yorum en az 10 karakter olmalıdır')
    .max(1000, 'Yorum en fazla 1000 karakter olabilir'),
  orderId: z.string().min(1, 'Sipariş ID gereklidir'),
});

// Message schema
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Mesaj boş olamaz')
    .max(2000, 'Mesaj en fazla 2000 karakter olabilir'),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
        type: z.string(),
        size: z.number(),
      })
    )
    .optional(),
});

// Search filters schema
export const jobFiltersSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  budgetType: z.enum(['fixed', 'hourly']).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'expert']).optional(),
  location: z.array(z.string()).optional(),
  isRemote: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
  search: z.string().optional(),
  deadline: z.enum(['urgent', 'week', 'month', 'flexible']).optional(),
  sort: z.enum(['newest', 'budget', 'proposals', 'rating']).optional(),
});

export const packageFiltersSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  deliveryTime: z.number().min(1).optional(),
  rating: z.number().min(1).max(5).optional(),
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
  note: z.string().max(500, 'Not en fazla 500 karakter olabilir').optional(),
});

// Contact form schema
export const contactFormSchema = z.object({
  recipientId: z.string().min(1, 'Alıcı ID gereklidir'),
  subject: z
    .string()
    .min(5, 'Konu en az 5 karakter olmalıdır')
    .max(100, 'Konu en fazla 100 karakter olabilir'),
  message: z
    .string()
    .min(20, 'Mesaj en az 20 karakter olmalıdır')
    .max(2000, 'Mesaj en fazla 2000 karakter olabilir'),
  jobId: z.string().optional(),
  packageId: z.string().optional(),
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

// Validation helper functions
export const validateProposal = (data: unknown) => {
  return proposalSchema.safeParse(data);
};

export const validateOrder = (data: unknown) => {
  return orderSchema.safeParse(data);
};

export const validateFile = (file: File) => {
  return fileUploadSchema.safeParse({ file });
};

export const validateReview = (data: unknown) => {
  return reviewSchema.safeParse(data);
};

export const validateMessage = (data: unknown) => {
  return messageSchema.safeParse(data);
};

export const validateJobFilters = (data: unknown) => {
  return jobFiltersSchema.safeParse(data);
};

export const validatePackageFilters = (data: unknown) => {
  return packageFiltersSchema.safeParse(data);
};

export const validateProposalStatus = (data: unknown) => {
  return proposalStatusSchema.safeParse(data);
};

export const validateContactForm = (data: unknown) => {
  return contactFormSchema.safeParse(data);
};
