import { NextRequest, NextResponse } from 'next/server';
import { ZodError, z } from 'zod';
import { logger } from '@/lib/shared/utils/logger';
import { getBackendApiUrl } from '@/lib/config/api';

// Simple rate limiting implementation
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

async function simpleRateLimit(options: {
  identifier: string;
  windowMs: number;
  maxRequests: number;
}): Promise<boolean> {
  const now = Date.now();
  const key = options.identifier;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return true;
  }

  if (record.count >= options.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Middleware interfaces
export interface ApiContext {
  req: NextRequest;
  params?: Record<string, string>;
  user?: {
    id: string;
    email: string;
    role: 'user' | 'employer' | 'freelancer' | 'admin';
    permissions: string[];
  };
  metadata: {
    startTime: number;
    requestId: string;
    userAgent: string;
    ip: string;
  };
}

export interface ApiHandler {
  (ctx: ApiContext): Promise<NextResponse> | NextResponse;
}

export interface MiddlewareConfig {
  cors?: {
    origin?: string | string[] | boolean;
    methods?: string[];
    credentials?: boolean;
    headers?: string[];
  };
  rateLimit?: {
    windowMs: number;
    max: number;
    skipSuccessfulRequests?: boolean;
  };
  auth?: {
    required?: boolean;
    roles?: string[];
    permissions?: string[];
  };
  validation?: {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
    params?: z.ZodSchema;
  };
  cache?: {
    ttl: number;
    key?: (ctx: ApiContext) => string;
  };
}

// Error response types
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    requestId: string;
  };
}

export interface ApiSuccessResponse<T = unknown> {
  data: T;
  metadata?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

// Built-in error classes
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, 'AUTHENTICATION_ERROR', message);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(403, 'AUTHORIZATION_ERROR', message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Rate limit exceeded') {
    super(429, 'RATE_LIMIT_EXCEEDED', message);
  }
}

// CORS middleware
export function corsMiddleware(config: MiddlewareConfig['cors'] = {}) {
  return (handler: ApiHandler): ApiHandler => {
    return async (ctx: ApiContext) => {
      const { req } = ctx;
      const origin = req.headers.get('origin');
      const response = await handler(ctx);

      // Set CORS headers
      if (
        config.origin === true ||
        (config.origin && checkOrigin(origin, config.origin))
      ) {
        response.headers.set('Access-Control-Allow-Origin', origin || '*');
      } else if (config.origin === false) {
        // No CORS
      } else {
        response.headers.set(
          'Access-Control-Allow-Origin',
          (config.origin as string) || '*'
        );
      }

      if (config.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      if (config.methods) {
        response.headers.set(
          'Access-Control-Allow-Methods',
          config.methods.join(', ')
        );
      }

      if (config.headers) {
        response.headers.set(
          'Access-Control-Allow-Headers',
          config.headers.join(', ')
        );
      }

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: response.headers,
        });
      }

      return response;
    };
  };
}

// Rate limiting middleware
export function rateLimitMiddleware(config: MiddlewareConfig['rateLimit']) {
  return (handler: ApiHandler): ApiHandler => {
    return async (ctx: ApiContext) => {
      if (!config) return handler(ctx);

      const identifier = ctx.user?.id || ctx.metadata.ip;
      const isAllowed = await simpleRateLimit({
        identifier,
        windowMs: config.windowMs,
        maxRequests: config.max,
      });

      if (!isAllowed) {
        throw new RateLimitError();
      }

      return handler(ctx);
    };
  };
}

// Authentication middleware
export function authMiddleware(config: MiddlewareConfig['auth'] = {}) {
  return (handler: ApiHandler): ApiHandler => {
    return async (ctx: ApiContext) => {
      const token = extractToken(ctx.req);

      if (config.required && !token) {
        throw new AuthenticationError();
      }

      if (token) {
        try {
          const user = await validateToken(token);
          if (user) {
            ctx.user = user;

            // Check roles
            if (config.roles && !config.roles.includes(user.role)) {
              throw new AuthorizationError('Insufficient role permissions');
            }

            // Check permissions
            if (
              config.permissions &&
              !hasPermissions(user.permissions, config.permissions)
            ) {
              throw new AuthorizationError('Insufficient permissions');
            }
          }
        } catch {
          if (config.required) {
            throw new AuthenticationError('Invalid token');
          }
        }
      }

      return handler(ctx);
    };
  };
}

// Validation middleware
export function validationMiddleware(
  config: MiddlewareConfig['validation'] = {}
) {
  return (handler: ApiHandler): ApiHandler => {
    return async (ctx: ApiContext) => {
      try {
        // Validate request body
        if (config.body && ctx.req.method !== 'GET') {
          const body = await ctx.req.json().catch(() => null);
          config.body.parse(body);
        }

        // Validate query parameters
        if (config.query) {
          const searchParams = ctx.req.nextUrl.searchParams;
          const query = Object.fromEntries(searchParams.entries());
          config.query.parse(query);
        }

        // Validate route parameters
        if (config.params && ctx.params) {
          config.params.parse(ctx.params);
        }
      } catch (error) {
        if (error instanceof ZodError) {
          throw new ValidationError('Validation failed', {
            errors: error.issues.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          });
        }
        throw error;
      }

      return handler(ctx);
    };
  };
}

// Caching middleware
export function cacheMiddleware(config: MiddlewareConfig['cache']) {
  return (handler: ApiHandler): ApiHandler => {
    return async (ctx: ApiContext) => {
      if (!config || ctx.req.method !== 'GET') {
        return handler(ctx);
      }

      const cacheKey = config.key ? config.key(ctx) : `${ctx.req.url}`;

      // Try to get from cache
      const cached = await getFromCache(cacheKey);
      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': `public, max-age=${Math.floor(config.ttl / 1000)}`,
          },
        });
      }

      // Execute handler and cache result
      const response = await handler(ctx);

      if (response.status === 200) {
        const data = await response.json();
        await setCache(cacheKey, data, config.ttl);

        return NextResponse.json(data, {
          status: response.status,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'X-Cache': 'MISS',
            'Cache-Control': `public, max-age=${Math.floor(config.ttl / 1000)}`,
          },
        });
      }

      return response;
    };
  };
}

// Error handling middleware
export function errorHandlerMiddleware() {
  return (handler: ApiHandler): ApiHandler => {
    return async (ctx: ApiContext) => {
      try {
        return await handler(ctx);
      } catch (error) {
        logger.error('API Error', {
          requestId: ctx.metadata.requestId,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          url: ctx.req.url,
          method: ctx.req.method,
          userAgent: ctx.metadata.userAgent,
          ip: ctx.metadata.ip,
        });

        const errorResponse: ApiErrorResponse = {
          error: {
            code:
              error instanceof ApiError ? error.code : 'INTERNAL_SERVER_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred',
            details: error instanceof ApiError ? error.details : undefined,
            timestamp: new Date().toISOString(),
            requestId: ctx.metadata.requestId,
          },
        };

        const statusCode = error instanceof ApiError ? error.statusCode : 500;

        return NextResponse.json(errorResponse, { status: statusCode });
      }
    };
  };
}

// Logging middleware
export function loggingMiddleware() {
  return (handler: ApiHandler): ApiHandler => {
    return async (ctx: ApiContext) => {
      const startTime = Date.now();

      logger.info('API Request', {
        requestId: ctx.metadata.requestId,
        method: ctx.req.method,
        url: ctx.req.url,
        userAgent: ctx.metadata.userAgent,
        ip: ctx.metadata.ip,
        userId: ctx.user?.id,
      });

      const response = await handler(ctx);

      const duration = Date.now() - startTime;

      logger.info('API Response', {
        requestId: ctx.metadata.requestId,
        status: response.status,
        duration: `${duration}ms`,
      });

      return response;
    };
  };
}

// Main API wrapper
export function createApiHandler(
  handler: ApiHandler,
  config: MiddlewareConfig = {}
): (
  req: NextRequest,
  context?: { params?: Record<string, string> }
) => Promise<NextResponse> {
  // Compose middleware stack
  let composedHandler = handler;

  // Apply middleware in reverse order (last applied runs first)
  composedHandler = errorHandlerMiddleware()(composedHandler);
  composedHandler = loggingMiddleware()(composedHandler);

  if (config.cache) {
    composedHandler = cacheMiddleware(config.cache)(composedHandler);
  }

  if (config.validation) {
    composedHandler = validationMiddleware(config.validation)(composedHandler);
  }

  if (config.auth) {
    composedHandler = authMiddleware(config.auth)(composedHandler);
  }

  if (config.rateLimit) {
    composedHandler = rateLimitMiddleware(config.rateLimit)(composedHandler);
  }

  composedHandler = corsMiddleware(config.cors)(composedHandler);

  return async (
    req: NextRequest,
    context?: { params?: Record<string, string> }
  ) => {
    const ctx: ApiContext = {
      req,
      params: context?.params,
      metadata: {
        startTime: Date.now(),
        requestId: generateRequestId(),
        userAgent: req.headers.get('user-agent') || '',
        ip: getClientIP(req),
      },
    };

    return composedHandler(ctx);
  };
}

// Utility functions
function checkOrigin(
  origin: string | null,
  allowedOrigins: string | string[] | boolean
): boolean {
  if (!origin || allowedOrigins === true) return true;
  if (allowedOrigins === false) return false;

  if (typeof allowedOrigins === 'string') {
    return origin === allowedOrigins;
  }

  return allowedOrigins.includes(origin);
}

function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Also check for token in cookies
  return req.cookies.get('auth_token')?.value || null;
}

async function validateToken(
  token: string
): Promise<NonNullable<ApiContext['user']>> {
  try {
    // Validate JWT token with backend
    const response = await fetch(`${getBackendApiUrl()}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Invalid token');
    }

    const data = await response.json();
    return {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      permissions: data.user.permissions || [],
    };
  } catch {
    throw new Error('Token validation failed');
  }
}

function hasPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  );
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Simple in-memory cache (use Redis in production)
const cache = new Map<string, { data: unknown; expiry: number }>();

async function getFromCache<T>(key: string): Promise<T | null> {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiry) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
}

async function setCache(
  key: string,
  data: unknown,
  ttl: number
): Promise<void> {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
}

// Response helpers
export function successResponse<T>(
  data: T,
  options: {
    status?: number;
    metadata?: ApiSuccessResponse<T>['metadata'];
  } = {}
): NextResponse {
  const response: ApiSuccessResponse<T> = {
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      ...options.metadata,
    },
  };

  return NextResponse.json(response, { status: options.status || 200 });
}

export function errorResponse(
  error: ApiError | Error,
  requestId?: string
): NextResponse {
  const response: ApiErrorResponse = {
    error: {
      code: error instanceof ApiError ? error.code : 'INTERNAL_SERVER_ERROR',
      message: error.message,
      details: error instanceof ApiError ? error.details : undefined,
      timestamp: new Date().toISOString(),
      requestId: requestId || generateRequestId(),
    },
  };

  const statusCode = error instanceof ApiError ? error.statusCode : 500;

  return NextResponse.json(response, { status: statusCode });
}
