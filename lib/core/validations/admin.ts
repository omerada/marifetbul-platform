import { z } from 'zod';

// Common validation patterns
const IP_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// User Management Validation Schemas
export const createUserSchema = z
  .object({
    email: z.string().email('Valid email is required'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    role: z.enum(['freelancer', 'employer', 'admin'], {
      message: 'Role is required',
    }),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const updateUserSchema = z.object({
  id: z.string().uuid('Valid user ID is required'),
  email: z.string().email('Valid email is required').optional(),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .optional(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .optional(),
  role: z.enum(['freelancer', 'employer', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'banned']).optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
});

export const bulkUserActionSchema = z.object({
  userIds: z
    .array(z.string().uuid())
    .min(1, 'At least one user must be selected'),
  action: z.enum([
    'suspend',
    'activate',
    'ban',
    'delete',
    'verify_email',
    'verify_phone',
  ]),
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .optional(),
});

// Content Moderation Validation Schemas
export const moderationActionSchema = z.object({
  itemId: z.string().uuid('Valid item ID is required'),
  action: z.enum(['approve', 'reject', 'flag', 'remove']),
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .optional(),
  adminNotes: z
    .string()
    .max(500, 'Admin notes cannot exceed 500 characters')
    .optional(),
});

export const bulkModerationSchema = z.object({
  itemIds: z
    .array(z.string().uuid())
    .min(1, 'At least one item must be selected'),
  action: z.enum(['approve', 'reject', 'flag', 'remove']),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

export const moderationFilterSchema = z.object({
  status: z
    .array(z.enum(['pending', 'approved', 'rejected', 'flagged']))
    .optional(),
  type: z
    .array(z.enum(['job', 'service', 'profile', 'review', 'message']))
    .optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  reportedBy: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

// Platform Settings Validation Schemas
export const generalSettingsSchema = z.object({
  siteName: z.string().min(2, 'Site name must be at least 2 characters'),
  siteDescription: z
    .string()
    .min(10, 'Description must be at least 10 characters'),
  siteUrl: z.string().url('Valid URL is required'),
  adminEmail: z.string().email('Valid email is required'),
  supportEmail: z.string().email('Valid email is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.string().min(2, 'Language is required'),
  currency: z.string().min(3, 'Currency code is required'),
  maxFileUploadSize: z
    .number()
    .min(1024, 'Minimum file size is 1KB')
    .max(104857600, 'Maximum file size is 100MB'),
});

export const securitySettingsSchema = z.object({
  requireEmailVerification: z.boolean(),
  requirePhoneVerification: z.boolean(),
  enableTwoFactor: z.boolean(),
  sessionTimeout: z
    .number()
    .min(5, 'Minimum session timeout is 5 minutes')
    .max(1440, 'Maximum session timeout is 24 hours'),
  maxLoginAttempts: z
    .number()
    .min(3, 'Minimum login attempts is 3')
    .max(10, 'Maximum login attempts is 10'),
  passwordMinLength: z
    .number()
    .min(6, 'Minimum password length is 6')
    .max(50, 'Maximum password length is 50'),
  enableCaptcha: z.boolean(),
  ipWhitelist: z
    .array(z.string().regex(IP_REGEX, 'Invalid IP address'))
    .optional(),
});

export const paymentSettingsSchema = z.object({
  commissionRate: z
    .number()
    .min(0, 'Commission rate cannot be negative')
    .max(50, 'Commission rate cannot exceed 50%'),
  minimumPayout: z.number().min(0, 'Minimum payout cannot be negative'),
  maximumPayout: z.number().min(0, 'Maximum payout cannot be negative'),
  paymentMethods: z
    .array(
      z.enum([
        'credit_card',
        'bank_transfer',
        'digital_wallet',
        'cryptocurrency',
      ])
    )
    .min(1, 'At least one payment method must be enabled'),
  escrowEnabled: z.boolean(),
  autoReleaseEnabled: z.boolean(),
  autoReleaseDays: z
    .number()
    .min(1, 'Auto release must be at least 1 day')
    .max(30, 'Auto release cannot exceed 30 days'),
  refundPeriodDays: z
    .number()
    .min(0, 'Refund period cannot be negative')
    .max(90, 'Refund period cannot exceed 90 days'),
});

export const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z
    .number()
    .min(1, 'Port must be greater than 0')
    .max(65535, 'Port cannot exceed 65535'),
  smtpUsername: z.string().min(1, 'SMTP username is required'),
  smtpPassword: z.string().min(1, 'SMTP password is required'),
  smtpSecure: z.boolean(),
  fromEmail: z.string().email('Valid from email is required'),
  fromName: z.string().min(1, 'From name is required'),
  replyToEmail: z.string().email('Valid reply-to email is required'),
  enableEmailNotifications: z.boolean(),
  enableWelcomeEmail: z.boolean(),
  enablePasswordResetEmail: z.boolean(),
  enablePaymentNotifications: z.boolean(),
});

export const featureSettingsSchema = z.object({
  enableJobPosting: z.boolean(),
  enableServiceMarketplace: z.boolean(),
  enableMessaging: z.boolean(),
  enableReviews: z.boolean(),
  enablePortfolios: z.boolean(),
  enableSkillTests: z.boolean(),
  enableVideoInterviews: z.boolean(),
  enableProjectMilestones: z.boolean(),
  enableTeamCollaboration: z.boolean(),
  enableAPIAccess: z.boolean(),
});

export const contentSettingsSchema = z.object({
  autoModerationEnabled: z.boolean(),
  requireJobApproval: z.boolean(),
  requireServiceApproval: z.boolean(),
  requireProfileApproval: z.boolean(),
  maxJobDescriptionLength: z
    .number()
    .min(100, 'Minimum job description is 100 characters')
    .max(10000, 'Maximum job description is 10,000 characters'),
  maxServiceDescriptionLength: z
    .number()
    .min(100, 'Minimum service description is 100 characters')
    .max(5000, 'Maximum service description is 5,000 characters'),
  allowedFileTypes: z
    .array(z.string())
    .min(1, 'At least one file type must be allowed'),
  maxImagesPerListing: z
    .number()
    .min(1, 'At least 1 image must be allowed')
    .max(20, 'Maximum 20 images allowed'),
  enableContentScanning: z.boolean(),
  bannedKeywords: z.array(z.string()).optional(),
});

export const apiSettingsSchema = z.object({
  enablePublicAPI: z.boolean(),
  apiRateLimit: z
    .number()
    .min(10, 'Minimum rate limit is 10 requests/minute')
    .max(10000, 'Maximum rate limit is 10,000 requests/minute'),
  requireAPIKey: z.boolean(),
  enableWebhooks: z.boolean(),
  webhookSecret: z
    .string()
    .min(32, 'Webhook secret must be at least 32 characters')
    .optional(),
  allowedOrigins: z.array(z.string().url()).optional(),
  enableCORS: z.boolean(),
  enableAPILogging: z.boolean(),
  apiTimeout: z
    .number()
    .min(5, 'Minimum timeout is 5 seconds')
    .max(300, 'Maximum timeout is 5 minutes'),
});

export const maintenanceSettingsSchema = z.object({
  isMaintenanceMode: z.boolean(),
  maintenanceMessage: z
    .string()
    .max(500, 'Maintenance message cannot exceed 500 characters')
    .optional(),
  allowedIPs: z
    .array(z.string().regex(IP_REGEX, 'Invalid IP address'))
    .optional(),
  scheduledMaintenance: z
    .object({
      enabled: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      message: z.string().max(500).optional(),
    })
    .optional(),
  backupSettings: z
    .object({
      enabled: z.boolean(),
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      retentionDays: z.number().min(1).max(365),
      location: z.string().min(1),
    })
    .optional(),
});

// Complete Platform Settings Schema
export const platformSettingsSchema = z.object({
  general: generalSettingsSchema,
  security: securitySettingsSchema,
  payment: paymentSettingsSchema,
  email: emailSettingsSchema,
  features: featureSettingsSchema,
  content: contentSettingsSchema,
  api: apiSettingsSchema,
  maintenance: maintenanceSettingsSchema,
});

// Admin Profile Settings
export const adminProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .optional(),
  avatar: z.string().url('Valid avatar URL is required').optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.string().min(2, 'Language is required'),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    desktop: z.boolean(),
  }),
  twoFactorEnabled: z.boolean(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Analytics & Reports
export const analyticsFilterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  metrics: z
    .array(z.enum(['revenue', 'users', 'jobs', 'services', 'conversions']))
    .optional(),
  categories: z.array(z.string()).optional(),
  userTypes: z.array(z.enum(['freelancer', 'employer'])).optional(),
});

export const reportGenerationSchema = z.object({
  title: z.string().min(3, 'Report title must be at least 3 characters'),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  type: z.enum([
    'user_activity',
    'financial',
    'content_moderation',
    'platform_health',
  ]),
  format: z.enum(['pdf', 'csv', 'excel']),
  includeCharts: z.boolean(),
  filters: analyticsFilterSchema.optional(),
  recipients: z.array(z.string().email()).optional(),
  schedule: z
    .object({
      enabled: z.boolean(),
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      time: z.string(),
      dayOfWeek: z.number().min(0).max(6).optional(),
      dayOfMonth: z.number().min(1).max(31).optional(),
    })
    .optional(),
});

// System Configuration
export const systemConfigSchema = z.object({
  environment: z.enum(['development', 'staging', 'production']),
  debugMode: z.boolean(),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']),
  maxConcurrentUsers: z.number().min(100).max(100000),
  cacheDuration: z.number().min(60).max(86400), // 1 minute to 24 hours
  sessionCleanupInterval: z.number().min(300).max(86400), // 5 minutes to 24 hours
  enablePerformanceMonitoring: z.boolean(),
  enableErrorTracking: z.boolean(),
  maintenanceWindow: z
    .object({
      start: z.string(),
      end: z.string(),
      timezone: z.string(),
      recurring: z.boolean(),
      description: z.string().optional(),
    })
    .optional(),
});

// Export all schemas as types
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type BulkUserActionFormData = z.infer<typeof bulkUserActionSchema>;
export type ModerationActionFormData = z.infer<typeof moderationActionSchema>;
export type BulkModerationFormData = z.infer<typeof bulkModerationSchema>;
export type ModerationFilterFormData = z.infer<typeof moderationFilterSchema>;
export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;
export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;
export type PaymentSettingsFormData = z.infer<typeof paymentSettingsSchema>;
export type EmailSettingsFormData = z.infer<typeof emailSettingsSchema>;
export type FeatureSettingsFormData = z.infer<typeof featureSettingsSchema>;
export type ContentSettingsFormData = z.infer<typeof contentSettingsSchema>;
export type ApiSettingsFormData = z.infer<typeof apiSettingsSchema>;
export type MaintenanceSettingsFormData = z.infer<
  typeof maintenanceSettingsSchema
>;
export type PlatformSettingsFormData = z.infer<typeof platformSettingsSchema>;
export type AdminProfileFormData = z.infer<typeof adminProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type AnalyticsFilterFormData = z.infer<typeof analyticsFilterSchema>;
export type ReportGenerationFormData = z.infer<typeof reportGenerationSchema>;
export type SystemConfigFormData = z.infer<typeof systemConfigSchema>;

// Validation helper functions
export const validateUserData = (data: unknown) =>
  createUserSchema.safeParse(data);
export const validateModerationAction = (data: unknown) =>
  moderationActionSchema.safeParse(data);
export const validatePlatformSettings = (data: unknown) =>
  platformSettingsSchema.safeParse(data);
export const validateAdminProfile = (data: unknown) =>
  adminProfileSchema.safeParse(data);

// Common validation patterns
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\+?[1-9]\d{1,14}$/;
export const urlRegex = /^https?:\/\/.+/;
export const ipRegex = IP_REGEX;

// Validation error messages
export const ValidationErrors = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORDS_DONT_MATCH: "Passwords don't match",
  INVALID_DATE: 'Please enter a valid date',
  INVALID_NUMBER: 'Please enter a valid number',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Cannot exceed ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Cannot exceed ${max}`,
} as const;
