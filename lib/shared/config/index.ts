// Production-ready environment and configuration management

interface Request {
  url: string;
  method: string;
}

interface Response {
  status: number;
}
export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    url: string;
    timezone: string;
  };
  database: {
    url: string;
    maxConnections: number;
    ssl: boolean;
  };
  redis: {
    url: string;
    ttl: number;
  };
  auth: {
    jwtSecret: string;
    jwtExpiry: string;
    sessionSecret: string;
    bcryptRounds: number;
  };
  email: {
    provider: 'sendgrid' | 'mailgun' | 'ses';
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  storage: {
    provider: 'local' | 's3' | 'cloudinary';
    bucket?: string;
    region?: string;
    accessKey?: string;
    secretKey?: string;
    cloudinaryUrl?: string;
  };
  payment: {
    iyzicoApiKey: string;
    iyzicoSecretKey: string;
    iyzicoBaseUrl: string;
  };
  analytics: {
    googleAnalyticsId?: string;
    mixpanelToken?: string;
    hotjarId?: string;
  };
  monitoring: {
    sentryDsn?: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  features: {
    enableRegistration: boolean;
    enablePayments: boolean;
    enableFileUpload: boolean;
    maxFileSize: number;
    maintenanceMode: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}

// Environment variable validation
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL',
] as const;

// Validate environment variables
function validateEnvironment(): void {
  const missing: string[] = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Create configuration from environment variables
function createConfig(): AppConfig {
  validateEnvironment();

  return {
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || 'Marifet',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment:
        (process.env.NODE_ENV as 'development' | 'staging' | 'production') ||
        'development',
      url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      timezone: process.env.TZ || 'Europe/Istanbul',
    },
    database: {
      url: process.env.DATABASE_URL!,
      maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10'),
      ssl: process.env.DATABASE_SSL === 'true',
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      ttl: parseInt(process.env.REDIS_TTL || '3600'),
    },
    auth: {
      jwtSecret: process.env.NEXTAUTH_SECRET!,
      jwtExpiry: process.env.JWT_EXPIRY || '30d',
      sessionSecret: process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET!,
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    },
    email: {
      provider:
        (process.env.EMAIL_PROVIDER as 'sendgrid' | 'mailgun' | 'ses') ||
        'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.FROM_EMAIL || 'noreply@marifet.com',
      fromName: process.env.FROM_NAME || 'Marifet',
    },
    storage: {
      provider:
        (process.env.STORAGE_PROVIDER as 'local' | 's3' | 'cloudinary') ||
        'local',
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION,
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY,
      cloudinaryUrl: process.env.CLOUDINARY_URL,
    },
    payment: {
      iyzicoApiKey: process.env.NEXT_PUBLIC_IYZICO_API_KEY || '',
      iyzicoSecretKey: process.env.IYZICO_SECRET_KEY || '',
      iyzicoBaseUrl:
        process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
    },
    analytics: {
      googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
      mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
      hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID,
    },
    monitoring: {
      sentryDsn: process.env.SENTRY_DSN,
      logLevel:
        (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') ||
        'info',
    },
    features: {
      enableRegistration: process.env.ENABLE_REGISTRATION !== 'false',
      enablePayments: process.env.ENABLE_PAYMENTS === 'true',
      enableFileUpload: process.env.ENABLE_FILE_UPLOAD !== 'false',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL === 'true',
    },
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: process.env.CORS_CREDENTIALS === 'true',
    },
  };
}

// Configuration instance
let config: AppConfig;

export function getConfig(): AppConfig {
  if (!config) {
    config = createConfig();
  }
  return config;
}

// Environment helpers
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isStaging = () =>
  process.env.VERCEL_ENV === 'preview' || process.env.APP_ENV === 'staging';

// Feature flags
export class FeatureFlags {
  private static config = getConfig();

  static isEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature] as boolean;
  }

  static isRegistrationEnabled(): boolean {
    return this.isEnabled('enableRegistration');
  }

  static isPaymentsEnabled(): boolean {
    return this.isEnabled('enablePayments');
  }

  static isFileUploadEnabled(): boolean {
    return this.isEnabled('enableFileUpload');
  }

  static isMaintenanceMode(): boolean {
    return this.isEnabled('maintenanceMode');
  }

  static getMaxFileSize(): number {
    return this.config.features.maxFileSize;
  }
}

// Database configuration helper
export function getDatabaseConfig() {
  const config = getConfig();
  return {
    connectionString: config.database.url,
    ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
    max: config.database.maxConnections,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

// Redis configuration helper
export function getRedisConfig() {
  const config = getConfig();
  return {
    url: config.redis.url,
    ttl: config.redis.ttl,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
  };
}

// Email configuration helper
export function getEmailConfig() {
  const config = getConfig();
  return {
    provider: config.email.provider,
    apiKey: config.email.apiKey,
    from: {
      email: config.email.fromEmail,
      name: config.email.fromName,
    },
  };
}

// Storage configuration helper
export function getStorageConfig() {
  const config = getConfig();

  switch (config.storage.provider) {
    case 's3':
      return {
        provider: 's3',
        bucket: config.storage.bucket!,
        region: config.storage.region!,
        credentials: {
          accessKeyId: config.storage.accessKey!,
          secretAccessKey: config.storage.secretKey!,
        },
      };
    case 'cloudinary':
      return {
        provider: 'cloudinary',
        cloudinaryUrl: config.storage.cloudinaryUrl!,
      };
    default:
      return {
        provider: 'local',
        uploadDir: './uploads',
      };
  }
}

// Authentication configuration helper
export function getAuthConfig() {
  const config = getConfig();
  return {
    secret: config.auth.jwtSecret,
    sessionMaxAge: config.auth.jwtExpiry,
    bcryptRounds: config.auth.bcryptRounds,
    session: {
      strategy: 'jwt' as const,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
      signIn: '/login',
      signUp: '/register',
      error: '/auth/error',
    },
  };
}

// Rate limiting configuration helper
export function getRateLimitConfig() {
  const config = getConfig();
  return {
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    skip: config.rateLimit.skipSuccessfulRequests
      ? (req: Request, res: Response) => res.status < 400
      : undefined,
    message: {
      error: 'Too many requests, please try again later.',
    },
  };
}

// CORS configuration helper
export function getCorsConfig() {
  const config = getConfig();
  return {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  };
}

// Monitoring configuration helper
export function getMonitoringConfig() {
  const config = getConfig();
  return {
    sentry: {
      dsn: config.monitoring.sentryDsn,
      environment: config.app.environment,
      release: config.app.version,
    },
    logging: {
      level: config.monitoring.logLevel,
      format: isProduction() ? 'json' : 'pretty',
    },
  };
}

const ConfigSystem = {
  getConfig,
  isDevelopment,
  isProduction,
  isStaging,
  FeatureFlags,
  getDatabaseConfig,
  getRedisConfig,
  getEmailConfig,
  getStorageConfig,
  getAuthConfig,
  getRateLimitConfig,
  getCorsConfig,
  getMonitoringConfig,
};

export default ConfigSystem;
