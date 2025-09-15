import { z } from 'zod';

// Profile validation schemas
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(30, 'Ad en fazla 30 karakter olabilir')
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, 'Ad sadece harf içerebilir'),

  lastName: z
    .string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(30, 'Soyad en fazla 30 karakter olabilir')
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, 'Soyad sadece harf içerebilir'),

  bio: z
    .string()
    .max(1000, 'Biyografi en fazla 1000 karakter olabilir')
    .optional(),

  location: z
    .string()
    .max(100, 'Lokasyon en fazla 100 karakter olabilir')
    .optional(),

  phone: z
    .string()
    .regex(/^(\+90|0)?5\d{9}$/, 'Geçerli bir telefon numarası giriniz')
    .optional()
    .or(z.literal('')),

  website: z
    .string()
    .url('Geçerli bir URL giriniz')
    .optional()
    .or(z.literal('')),

  socialLinks: z
    .object({
      linkedin: z
        .string()
        .url("Geçerli bir LinkedIn URL'si giriniz")
        .optional()
        .or(z.literal('')),
      twitter: z
        .string()
        .url("Geçerli bir Twitter URL'si giriniz")
        .optional()
        .or(z.literal('')),
      github: z
        .string()
        .url("Geçerli bir GitHub URL'si giriniz")
        .optional()
        .or(z.literal('')),
    })
    .optional(),
});

// Freelancer specific schema
export const freelancerProfileSchema = profileSchema.extend({
  title: z
    .string()
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),

  skills: z
    .array(z.string())
    .min(1, 'En az bir beceri seçmelisiniz')
    .max(20, 'En fazla 20 beceri seçebilirsiniz'),

  hourlyRate: z
    .number()
    .min(5, 'Saatlik ücret en az 5 TL olmalıdır')
    .max(1000, 'Saatlik ücret en fazla 1000 TL olabilir')
    .optional(),

  experience: z.enum(['beginner', 'intermediate', 'expert'], {
    message: 'Geçerli bir deneyim seviyesi seçiniz',
  }),
});

// Employer specific schema
export const employerProfileSchema = profileSchema.extend({
  companyName: z
    .string()
    .min(2, 'Şirket adı en az 2 karakter olmalıdır')
    .max(100, 'Şirket adı en fazla 100 karakter olabilir'),

  industry: z
    .string()
    .min(2, 'Sektör bilgisi en az 2 karakter olmalıdır')
    .max(50, 'Sektör bilgisi en fazla 50 karakter olabilir'),

  companySize: z
    .enum(['1-10', '11-50', '51-200', '201-1000', '1000+'], {
      message: 'Geçerli bir şirket büyüklüğü seçiniz',
    })
    .optional(),
});

// Portfolio item schema
export const portfolioItemSchema = z.object({
  title: z
    .string()
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),

  description: z
    .string()
    .min(20, 'Açıklama en az 20 karakter olmalıdır')
    .max(500, 'Açıklama en fazla 500 karakter olabilir'),

  url: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),

  skills: z
    .array(z.string())
    .min(1, 'En az bir teknoloji seçmelisiniz')
    .max(10, 'En fazla 10 teknoloji seçebilirsiniz'),

  images: z
    .array(z.string())
    .min(1, 'En az bir görsel eklemelisiniz')
    .max(5, 'En fazla 5 görsel ekleyebilirsiniz'),

  completedAt: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Geçerli bir tarih formatı giriniz (YYYY-MM-DD)'
    ),
});

// Avatar upload schema
export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Dosya boyutu 5MB'dan küçük olmalıdır"
    )
    .refine(
      (file) =>
        ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
          file.type
        ),
      'Sadece JPEG, PNG ve WebP formatları desteklenir'
    ),

  cropData: z
    .object({
      x: z.number().min(0),
      y: z.number().min(0),
      width: z.number().min(50, 'Minimum genişlik 50px olmalıdır'),
      height: z.number().min(50, 'Minimum yükseklik 50px olmalıdır'),
    })
    .optional(),
});

// Type exports
export type ProfileFormData = z.infer<typeof profileSchema>;
export type FreelancerProfileFormData = z.infer<typeof freelancerProfileSchema>;
export type EmployerProfileFormData = z.infer<typeof employerProfileSchema>;
export type PortfolioItemFormData = z.infer<typeof portfolioItemSchema>;
export type AvatarUploadFormData = z.infer<typeof avatarUploadSchema>;

// Validation helper functions
export const validateProfile = (
  data: unknown,
  userType: 'freelancer' | 'employer'
) => {
  try {
    if (userType === 'freelancer') {
      return freelancerProfileSchema.parse(data);
    } else {
      return employerProfileSchema.parse(data);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues.map((e) => e.message).join(', '));
    }
    throw error;
  }
};

export const validatePortfolioItem = (data: unknown) => {
  try {
    return portfolioItemSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues.map((e) => e.message).join(', '));
    }
    throw error;
  }
};

export const validateAvatarUpload = (data: unknown) => {
  try {
    return avatarUploadSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues.map((e) => e.message).join(', '));
    }
    throw error;
  }
};
