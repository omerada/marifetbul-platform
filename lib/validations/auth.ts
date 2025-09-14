import { z } from 'zod';
import { baseSchemas, createPasswordConfirmationSchema } from './base';

// ================================================
// AUTHENTICATION VALIDATION SCHEMAS
// ================================================
// Optimized with base schema composition

// Login form validation schema
export const loginSchema = z.object({
  email: baseSchemas.email,
  password: baseSchemas.password.min(6, 'Şifre en az 6 karakter olmalıdır'),
  rememberMe: baseSchemas.optional,
});

// Register form validation schema
export const registerSchema = z
  .object({
    firstName: baseSchemas.name,
    lastName: baseSchemas.name,
    email: baseSchemas.email,
    password: baseSchemas.password,
    confirmPassword: baseSchemas.confirmPassword,
    userType: z.enum(['freelancer', 'employer'], {
      message: 'Kullanıcı tipi seçiniz',
    }),
    agreeToTerms: baseSchemas.required.refine((val) => val === true, {
      message: 'Kullanım şartlarını kabul etmelisiniz',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: baseSchemas.email,
});

// Reset password schema using utility function
export const resetPasswordSchema = createPasswordConfirmationSchema();

// Profile update schema with base schema composition
export const profileUpdateSchema = z.object({
  firstName: baseSchemas.name,
  lastName: baseSchemas.name,
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+90|0)?[5][0-9]{9}$/.test(val.replace(/\s/g, '')),
      { message: 'Geçerli bir telefon numarası giriniz' }
    ),
  location: z
    .string()
    .max(100, 'Konum en fazla 100 karakter olabilir')
    .optional(),
  bio: baseSchemas.description
    .max(500, 'Hakkında bölümü en fazla 500 karakter olabilir')
    .optional(),
  website: baseSchemas.urlOptional,
});

// Freelancer specific schema using base composition
export const freelancerProfileSchema = profileUpdateSchema.extend({
  title: baseSchemas.title.optional(),
  skills: baseSchemas.tags
    .min(1, 'En az bir yetenek seçiniz')
    .max(20, 'En fazla 20 yetenek seçebilirsiniz'),
  hourlyRate: baseSchemas.price
    .max(10000, "Saatlik ücret 10.000 TL'den büyük olamaz")
    .optional(),
  experience: z.enum(['beginner', 'intermediate', 'expert']).optional(),
});

// Employer specific schema
export const employerProfileSchema = profileUpdateSchema.extend({
  companyName: baseSchemas.name
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
