/**
 * Validation Middleware
 *
 * Provides request validation for API routes using Zod schemas.
 * Validates request body, query parameters, and URL parameters.
 *
 * Usage:
 * ```ts
 * import { withValidation } from '@/lib/infrastructure/security/validation-middleware';
 * import { z } from 'zod';
 *
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * export const POST = withValidation(
 *   async (request: Request, { validated }) => {
 *     // validated.body is type-safe!
 *     const { email, password } = validated.body;
 *     // Your handler code
 *   },
 *   { body: schema }
 * );
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { Logger } from '../monitoring/logger';

const logger = new Logger({ level: 'info' });

// ============================================================================
// CUSTOM ERRORS
// ============================================================================

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ValidationException extends Error {
  constructor(
    message: string,
    public statusCode = 400
  ) {
    super(message);
    this.name = 'ValidationException';
  }
}

/**
 * Validate input with Zod schema
 */
function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; errors: Array<{ path: string; message: string }> } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof ZodError) {
      const zodError = error as any;
      const errors = zodError.errors.map((err: z.ZodIssue) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return { success: false, errors };
    }
    throw error;
  }
}

// ============================================================================
// TYPES
// ============================================================================

/**
 * Validation schemas for different parts of the request
 */
export interface ValidationSchemas {
  /**
   * Schema for request body
   */
  body?: z.ZodSchema;

  /**
   * Schema for query parameters
   */
  query?: z.ZodSchema;

  /**
   * Schema for URL parameters (dynamic routes)
   */
  params?: z.ZodSchema;
}

/**
 * Validated request data
 */
export interface ValidatedData<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown,
> {
  body: TBody;
  query: TQuery;
  params: TParams;
}

/**
 * Request with validated data
 */
export interface ValidatedRequest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validated: ValidatedData<any, any, any>;
}

/**
 * Route handler with validation
 */
type ValidatedRouteHandler = (
  request: NextRequest & ValidatedRequest,
  context?: unknown
) => Promise<Response> | Response;

/**
 * Validation middleware options
 */
export interface ValidationOptions {
  /**
   * Strip unknown fields from validated data
   */
  strip?: boolean;

  /**
   * Custom error message
   */
  errorMessage?: string;

  /**
   * Custom status code for validation errors (default: 400)
   */
  statusCode?: number;

  /**
   * Skip validation for specific conditions
   */
  skip?: (request: NextRequest) => boolean | Promise<boolean>;

  /**
   * Callback for validation failure
   */
  onValidationFailure?: (
    request: NextRequest,
    errors: ValidationError['errors']
  ) => void;

  /**
   * Callback for successful validation
   */
  onValidationSuccess?: (request: NextRequest, data: ValidatedData) => void;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Parse request body
 */
async function parseBody(request: NextRequest): Promise<unknown> {
  try {
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return await request.json();
    }

    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const data: Record<string, unknown> = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      return data;
    }

    // For other content types, return null
    return null;
  } catch (error) {
    logger.warn('Failed to parse request body', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Parse query parameters
 */
function parseQuery(request: NextRequest): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  request.nextUrl.searchParams.forEach((value, key) => {
    // Try to parse as number or boolean
    if (value === 'true') {
      query[key] = true;
    } else if (value === 'false') {
      query[key] = false;
    } else if (/^\d+$/.test(value)) {
      query[key] = parseInt(value, 10);
    } else if (/^\d+\.\d+$/.test(value)) {
      query[key] = parseFloat(value);
    } else {
      query[key] = value;
    }
  });

  return query;
}

/**
 * Parse URL parameters from context
 */
function parseParams(context: unknown): Record<string, unknown> {
  if (
    context &&
    typeof context === 'object' &&
    'params' in context &&
    context.params &&
    typeof context.params === 'object'
  ) {
    return context.params as Record<string, unknown>;
  }
  return {};
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Higher-order function that adds validation to an API route handler
 */
export function withValidation(
  handler: ValidatedRouteHandler,
  schemas: ValidationSchemas,
  options: ValidationOptions = {}
): (request: NextRequest, context?: unknown) => Promise<Response> {
  const {
    errorMessage = 'Validation failed',
    statusCode = 400,
    skip,
    onValidationFailure,
    onValidationSuccess,
  } = options;

  return async (request: NextRequest, context?: unknown) => {
    try {
      // Check if should skip
      if (skip && (await skip(request))) {
        logger.debug('Validation skipped', {
          url: request.url,
          method: request.method,
        });

        // Add empty validated data
        const requestWithValidation = request as NextRequest & ValidatedRequest;
        requestWithValidation.validated = {
          body: null,
          query: {},
          params: {},
        };

        return await handler(requestWithValidation, context);
      }

      const validated: ValidatedData = {
        body: null,
        query: {},
        params: {},
      };

      const allErrors: ValidationError['errors'] = [];

      // Validate body
      if (schemas.body) {
        const body = await parseBody(request);
        const result = validateInput(schemas.body, body);

        if (!result.success) {
          allErrors.push(...result.errors);
        } else {
          validated.body = result.data;
        }
      }

      // Validate query
      if (schemas.query) {
        const query = parseQuery(request);
        const result = validateInput(schemas.query, query);

        if (!result.success) {
          allErrors.push(...result.errors);
        } else {
          validated.query = result.data;
        }
      }

      // Validate params
      if (schemas.params) {
        const params = parseParams(context);
        const result = validateInput(schemas.params, params);

        if (!result.success) {
          allErrors.push(...result.errors);
        } else {
          validated.params = result.data;
        }
      }

      // Check if there are any validation errors
      if (allErrors.length > 0) {
        logger.warn('Validation failed', {
          url: request.url,
          method: request.method,
          errors: allErrors,
        });

        // Call failure callback
        if (onValidationFailure) {
          onValidationFailure(request, allErrors);
        }

        return NextResponse.json(
          {
            error: 'Validation Error',
            message: errorMessage,
            code: 'VALIDATION_FAILED',
            errors: allErrors,
          },
          { status: statusCode }
        );
      }

      // Call success callback
      if (onValidationSuccess) {
        onValidationSuccess(request, validated);
      }

      // Add validated data to request
      const requestWithValidation = request as NextRequest & ValidatedRequest;
      requestWithValidation.validated = validated;

      // Validation passed, execute handler
      return await handler(requestWithValidation, context);
    } catch (error) {
      // Handle validation exceptions
      if (error instanceof ValidationException) {
        logger.warn('Validation exception thrown', {
          url: request.url,
          method: request.method,
          errors: (error as any).errors,
        });

        return NextResponse.json(
          {
            error: 'Validation Error',
            message: (error as any).message,
            code: 'VALIDATION_FAILED',
            errors: (error as any).errors,
          },
          { status: statusCode }
        );
      }

      // Re-throw other errors
      throw error;
    }
  };
}

/**
 * Create a validation middleware factory with default options
 */
export function createValidationMiddleware(
  defaultOptions: ValidationOptions = {}
): (
  handler: ValidatedRouteHandler,
  schemas: ValidationSchemas,
  options?: ValidationOptions
) => ReturnType<typeof withValidation> {
  return (
    handler: ValidatedRouteHandler,
    schemas: ValidationSchemas,
    options: ValidationOptions = {}
  ) => {
    const mergedOptions = { ...defaultOptions, ...options };
    return withValidation(handler, schemas, mergedOptions);
  };
}

/**
 * Validate only request body (common use case)
 */
export function withBodyValidation<T>(
  handler: ValidatedRouteHandler,
  schema: z.ZodSchema<T>,
  options: ValidationOptions = {}
): ReturnType<typeof withValidation> {
  return withValidation(handler, { body: schema }, options);
}

/**
 * Validate only query parameters (common use case)
 */
export function withQueryValidation<T>(
  handler: ValidatedRouteHandler,
  schema: z.ZodSchema<T>,
  options: ValidationOptions = {}
): ReturnType<typeof withValidation> {
  return withValidation(handler, { query: schema }, options);
}

/**
 * Validate only URL parameters (common use case)
 */
export function withParamsValidation<T>(
  handler: ValidatedRouteHandler,
  schema: z.ZodSchema<T>,
  options: ValidationOptions = {}
): ReturnType<typeof withValidation> {
  return withValidation(handler, { params: schema }, options);
}

// Export validation types for use in handlers
export type { z };
