import { z } from 'zod';

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gereklidir')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: z
    .string()
    .min(1, 'Şifre gereklidir')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
  rememberMe: z.boolean().optional(),
});

// Register form validation schema
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Ad gereklidir')
      .min(2, 'Ad en az 2 karakter olmalıdır')
      .max(50, 'Ad en fazla 50 karakter olabilir'),
    lastName: z
      .string()
      .min(1, 'Soyad gereklidir')
      .min(2, 'Soyad en az 2 karakter olmalıdır')
      .max(50, 'Soyad en fazla 50 karakter olabilir'),
    email: z
      .string()
      .min(1, 'E-posta adresi gereklidir')
      .email('Geçerli bir e-posta adresi giriniz'),
    password: z
      .string()
      .min(1, 'Şifre gereklidir')
      .min(6, 'Şifre en az 6 karakter olmalıdır')
      .max(100, 'Şifre en fazla 100 karakter olabilir'),
    confirmPassword: z.string().min(1, 'Şifre onayı gereklidir'),
    userType: z
      .enum(['freelancer', 'employer'])
      .refine((val) => val !== undefined, {
        message: 'Kullanıcı tipi seçiniz',
      }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'Kullanım şartlarını kabul etmelisiniz',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gereklidir')
    .email('Geçerli bir e-posta adresi giriniz'),
});

// Reset password schema
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Yeni şifre gereklidir')
      .min(6, 'Şifre en az 6 karakter olmalıdır')
      .max(100, 'Şifre en fazla 100 karakter olabilir'),
    confirmPassword: z.string().min(1, 'Şifre onayı gereklidir'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  lastName: z
    .string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad en fazla 50 karakter olabilir'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+90|0)?[5][0-9]{9}$/.test(val.replace(/\s/g, '')),
      {
        message: 'Geçerli bir telefon numarası giriniz',
      }
    ),
  location: z
    .string()
    .max(100, 'Konum en fazla 100 karakter olabilir')
    .optional(),
  bio: z
    .string()
    .max(500, 'Hakkında bölümü en fazla 500 karakter olabilir')
    .optional(),
  website: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Geçerli bir website URL'si giriniz",
    }),
});

// Freelancer specific schema
export const freelancerProfileSchema = profileUpdateSchema.extend({
  title: z
    .string()
    .max(100, 'Başlık en fazla 100 karakter olabilir')
    .optional(),
  skills: z
    .array(z.string())
    .min(1, 'En az bir yetenek seçiniz')
    .max(20, 'En fazla 20 yetenek seçebilirsiniz'),
  hourlyRate: z
    .number()
    .min(0, "Saatlik ücret 0'dan küçük olamaz")
    .max(10000, "Saatlik ücret 10.000 TL'den büyük olamaz")
    .optional(),
  experience: z.enum(['beginner', 'intermediate', 'expert']).optional(),
});

// Employer specific schema
export const employerProfileSchema = profileUpdateSchema.extend({
  companyName: z
    .string()
    .max(100, 'Şirket adı en fazla 100 karakter olabilir')
    .optional(),
  companySize: z.string().optional(),
  industry: z
    .string()
    .max(100, 'Sektör en fazla 100 karakter olabilir')
    .optional(),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type FreelancerProfileFormData = z.infer<typeof freelancerProfileSchema>;
export type EmployerProfileFormData = z.infer<typeof employerProfileSchema>;
