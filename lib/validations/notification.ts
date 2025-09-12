import { z } from 'zod';

// Notification Type Schema
export const notificationTypeSchema = z.enum([
  'payment_received',
  'payment_completed',
  'payment_failed',
  'escrow_released',
  'invoice_generated',
  'refund_processed',
  'proposal_received',
  'proposal_accepted',
  'proposal_rejected',
  'order_created',
  'order_updated',
  'order_completed',
  'order_cancelled',
  'delivery_submitted',
  'revision_requested',
  'message_received',
  'review_received',
  'dispute_opened',
  'dispute_resolved',
  'system_maintenance',
  'security_alert',
  'account_verification',
  'password_reset',
  'login_attempt',
  'subscription_expiring',
  'welcome',
  'onboarding_step',
  'marketing_announcement',
]);

// Notification Category Schema
export const notificationCategorySchema = z.enum([
  'payment',
  'order',
  'message',
  'system',
  'security',
  'marketing',
]);

// Notification Priority Schema
export const notificationPrioritySchema = z.enum([
  'low',
  'normal',
  'high',
  'urgent',
]);

// Notification Channel Schema
export const notificationChannelSchema = z.enum([
  'browser',
  'email',
  'sms',
  'push',
]);

// Digest Frequency Schema
export const digestFrequencySchema = z.enum([
  'never',
  'daily',
  'weekly',
  'monthly',
]);

// Days of Week Schema
export const daysOfWeekSchema = z.array(
  z.enum([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ])
);

// Time Format Schema (HH:mm)
export const timeFormatSchema = z
  .string()
  .regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Saat formatı HH:mm olmalı (örn: 09:30)'
  );

// Timezone Schema
export const timezoneSchema = z
  .string()
  .min(1, 'Saat dilimi gereklidir')
  .max(50, 'Saat dilimi en fazla 50 karakter olmalı');

// Browser Notification Preferences Schema
export const browserNotificationPrefsSchema = z.object({
  enabled: z.boolean().default(true),
  proposals: z.boolean().default(true),
  messages: z.boolean().default(true),
  payments: z.boolean().default(true),
  orders: z.boolean().default(true),
  system: z.boolean().default(true),
  marketing: z.boolean().default(false),
});

// Email Notification Preferences Schema
export const emailNotificationPrefsSchema = z.object({
  enabled: z.boolean().default(true),
  proposals: z.boolean().default(true),
  messages: z.boolean().default(true),
  payments: z.boolean().default(true),
  orders: z.boolean().default(true),
  system: z.boolean().default(true),
  marketing: z.boolean().default(false),
  digest: digestFrequencySchema.default('daily'),
  digestTime: timeFormatSchema.optional().default('09:00'),
});

// SMS Notification Preferences Schema
export const smsNotificationPrefsSchema = z.object({
  enabled: z.boolean().default(false),
  urgent: z.boolean().default(true),
  payments: z.boolean().default(true),
  security: z.boolean().default(true),
});

// Push Notification Preferences Schema
export const pushNotificationPrefsSchema = z.object({
  enabled: z.boolean().default(true),
  proposals: z.boolean().default(true),
  messages: z.boolean().default(true),
  payments: z.boolean().default(true),
  orders: z.boolean().default(true),
  system: z.boolean().default(true),
  sound: z.boolean().default(true),
  vibration: z.boolean().default(true),
});

// Quiet Hours Schema
export const quietHoursSchema = z
  .object({
    enabled: z.boolean().default(false),
    start: timeFormatSchema.default('22:00'),
    end: timeFormatSchema.default('08:00'),
    timezone: timezoneSchema.default('Europe/Istanbul'),
    daysOfWeek: daysOfWeekSchema.default([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]),
  })
  .refine(
    (data) => {
      if (!data.enabled) return true;

      // Validate that start and end times are different
      return data.start !== data.end;
    },
    {
      message: 'Başlangıç ve bitiş saatleri farklı olmalı',
      path: ['end'],
    }
  );

// Notification Frequency Schema
export const notificationFrequencySchema = z.object({
  immediate: z
    .array(notificationTypeSchema)
    .default([
      'payment_received',
      'payment_failed',
      'order_completed',
      'security_alert',
      'message_received',
    ]),
  batched: z
    .array(notificationTypeSchema)
    .default([
      'proposal_received',
      'marketing_announcement',
      'system_maintenance',
    ]),
  batchInterval: z
    .number()
    .min(5, 'Toplu bildirim aralığı en az 5 dakika olmalı')
    .max(1440, 'Toplu bildirim aralığı en fazla 24 saat (1440 dakika) olabilir')
    .default(60),
});

// Complete Notification Preferences Schema
export const notificationPreferencesSchema = z.object({
  userId: z
    .string()
    .min(1, 'Kullanıcı ID gereklidir')
    .uuid('Geçerli bir kullanıcı ID olmalı'),
  browser: browserNotificationPrefsSchema,
  email: emailNotificationPrefsSchema,
  sms: smsNotificationPrefsSchema,
  push: pushNotificationPrefsSchema,
  quietHours: quietHoursSchema,
  frequency: notificationFrequencySchema,
});

// Notification Settings Form Data Schema
export const notificationSettingsFormDataSchema = z.object({
  browser: browserNotificationPrefsSchema,
  email: emailNotificationPrefsSchema.omit({ digestTime: true }).extend({
    digest: digestFrequencySchema,
  }),
  quietHours: quietHoursSchema.omit({ timezone: true, daysOfWeek: true }),
});

// Create Notification Schema
export const createNotificationSchema = z.object({
  userId: z
    .string()
    .min(1, 'Kullanıcı ID gereklidir')
    .uuid('Geçerli bir kullanıcı ID olmalı'),
  type: notificationTypeSchema,
  title: z
    .string()
    .min(1, 'Başlık gereklidir')
    .max(100, 'Başlık en fazla 100 karakter olmalı'),
  message: z
    .string()
    .min(1, 'Mesaj gereklidir')
    .max(500, 'Mesaj en fazla 500 karakter olmalı'),
  category: notificationCategorySchema,
  priority: notificationPrioritySchema.default('normal'),
  channel: notificationChannelSchema.default('browser'),
  actionUrl: z.string().url('Geçerli bir URL olmalı').optional(),
  actionText: z
    .string()
    .max(50, 'Aksiyon metni en fazla 50 karakter olmalı')
    .optional(),
  imageUrl: z.string().url("Geçerli bir resim URL'si olmalı").optional(),
  expiresAt: z
    .string()
    .datetime('Geçerli bir tarih formatı kullanın')
    .optional(),
  scheduledFor: z
    .string()
    .datetime('Geçerli bir tarih formatı kullanın')
    .optional(),
  variables: z.record(z.string(), z.string()).optional(),
  tags: z
    .array(z.string())
    .max(10, 'En fazla 10 etiket ekleyebilirsiniz')
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Notification Filters Schema
export const notificationFiltersSchema = z
  .object({
    category: z.array(notificationCategorySchema).optional(),
    priority: z.array(notificationPrioritySchema).optional(),
    isRead: z.boolean().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    search: z
      .string()
      .max(100, 'Arama terimi en fazla 100 karakter olmalı')
      .optional(),
    tags: z
      .array(z.string())
      .max(10, 'En fazla 10 etiket filtreleyebilirsiniz')
      .optional(),
  })
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

// Mark Notifications as Read Schema
export const markNotificationsReadSchema = z.object({
  notificationIds: z
    .array(z.string().uuid("Geçerli bildirim ID'leri gerekli"))
    .min(1, 'En az bir bildirim ID gerekli')
    .max(100, 'En fazla 100 bildirimi aynı anda işaretleyebilirsiniz'),
  markAll: z.boolean().default(false),
});

// Push Subscription Schema
export const pushSubscriptionSchema = z.object({
  endpoint: z
    .string()
    .url("Geçerli bir endpoint URL'si gerekli")
    .min(1, 'Endpoint gereklidir'),
  keys: z.object({
    p256dh: z
      .string()
      .min(1, 'p256dh anahtarı gereklidir')
      .max(200, 'p256dh anahtarı çok uzun'),
    auth: z
      .string()
      .min(1, 'Auth anahtarı gereklidir')
      .max(200, 'Auth anahtarı çok uzun'),
  }),
  userAgent: z.string().max(500, 'User agent çok uzun').optional(),
  deviceType: z.enum(['desktop', 'mobile', 'tablet']).default('desktop'),
});

// Push Notification Payload Schema
export const pushNotificationPayloadSchema = z.object({
  title: z
    .string()
    .min(1, 'Başlık gereklidir')
    .max(100, 'Başlık en fazla 100 karakter olmalı'),
  body: z
    .string()
    .min(1, 'İçerik gereklidir')
    .max(300, 'İçerik en fazla 300 karakter olmalı'),
  icon: z.string().url("Geçerli bir ikon URL'si olmalı").optional(),
  badge: z.string().url("Geçerli bir badge URL'si olmalı").optional(),
  image: z.string().url("Geçerli bir resim URL'si olmalı").optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  actions: z
    .array(
      z.object({
        action: z
          .string()
          .min(1, 'Aksiyon ID gerekli')
          .max(50, 'Aksiyon ID çok uzun'),
        title: z
          .string()
          .min(1, 'Aksiyon başlığı gerekli')
          .max(50, 'Aksiyon başlığı çok uzun'),
        icon: z.string().url("Geçerli bir ikon URL'si olmalı").optional(),
      })
    )
    .max(2, 'En fazla 2 aksiyon ekleyebilirsiniz')
    .optional(),
  tag: z.string().max(50, 'Tag en fazla 50 karakter olmalı').optional(),
  requireInteraction: z.boolean().default(false),
  silent: z.boolean().default(false),
  vibrate: z
    .array(z.number().min(0).max(10000))
    .max(10, 'En fazla 10 titreşim paterni')
    .optional(),
  sound: z.string().max(100, 'Ses dosyası adı çok uzun').optional(),
});

// Notification Template Schema
export const notificationTemplateSchema = z.object({
  type: notificationTypeSchema,
  channel: notificationChannelSchema,
  language: z.enum(['tr', 'en']).default('tr'),
  subject: z.string().max(100, 'Konu en fazla 100 karakter olmalı').optional(),
  title: z
    .string()
    .min(1, 'Başlık gereklidir')
    .max(100, 'Başlık en fazla 100 karakter olmalı'),
  body: z
    .string()
    .min(1, 'İçerik gereklidir')
    .max(1000, 'İçerik en fazla 1000 karakter olmalı'),
  actionUrl: z.string().url('Geçerli bir URL olmalı').optional(),
  actionText: z
    .string()
    .max(50, 'Aksiyon metni en fazla 50 karakter olmalı')
    .optional(),
  variables: z
    .array(
      z
        .string()
        .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Geçerli değişken adı olmalı')
    )
    .max(20, 'En fazla 20 değişken tanımlayabilirsiniz')
    .default([]),
  isActive: z.boolean().default(true),
});

// Type exports
export type NotificationTypeEnum = z.infer<typeof notificationTypeSchema>;
export type NotificationCategory = z.infer<typeof notificationCategorySchema>;
export type NotificationPriority = z.infer<typeof notificationPrioritySchema>;
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;
export type DigestFrequency = z.infer<typeof digestFrequencySchema>;
export type NotificationPreferencesData = z.infer<
  typeof notificationPreferencesSchema
>;
export type NotificationSettingsFormData = z.infer<
  typeof notificationSettingsFormDataSchema
>;
export type CreateNotificationData = z.infer<typeof createNotificationSchema>;
export type NotificationFiltersData = z.infer<typeof notificationFiltersSchema>;
export type MarkNotificationsReadData = z.infer<
  typeof markNotificationsReadSchema
>;
export type PushSubscriptionData = z.infer<typeof pushSubscriptionSchema>;
export type PushNotificationPayloadData = z.infer<
  typeof pushNotificationPayloadSchema
>;
export type NotificationTemplateData = z.infer<
  typeof notificationTemplateSchema
>;
