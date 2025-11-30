/**
 * ================================================
 * BACKEND API PROXY UTILITY
 * ================================================
 *
 * Production-ready utility for proxying requests to backend API.
 * Eliminates duplicate fetch/error handling code across API routes.
 *
 * Features:
 * - Automatic header forwarding (Authorization, Cookies)
 * - Query parameter handling
 * - Request body handling for POST/PUT/PATCH
 * - Consistent error handling with logger integration
 * - Type-safe response handling
 *
 * @module lib/api/backend-proxy
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1.2 - Duplicate Cleanup
 */

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// CONFIGURATION
// ================================================

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// ================================================
// TYPES
// ================================================

/**
 * Backend proxy configuration options
 */
export interface BackendProxyOptions {
  /**
   * HTTP method (GET, POST, PUT, PATCH, DELETE)
   */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  /**
   * Backend endpoint path (e.g., '/packages', '/reviews')
   * Will be appended to BACKEND_API_URL
   */
  endpoint: string;

  /**
   * Request object from Next.js
   */
  request: NextRequest;

  /**
   * Optional request body (for POST/PUT/PATCH)
   * Will be automatically JSON stringified
   */
  body?: unknown;

  /**
   * Optional context name for logging (e.g., 'Packages API', 'Reviews API')
   * Defaults to endpoint name
   */
  logContext?: string;

  /**
   * Whether to include search params from request URL
   * Defaults to true
   */
  includeSearchParams?: boolean;

  /**
   * Use BACKEND_BASE_URL instead of BACKEND_API_URL
   * For legacy /api/v1/orders style endpoints
   * Defaults to false
   */
  useBaseUrl?: boolean;

  /**
   * Custom response transformer
   * Allows transforming backend response before returning
   * Useful for data mapping, formatting, etc.
   */
  transformResponse?: (data: unknown, response: Response) => unknown;

  /**
   * Enable debug logging
   * Logs request/response details for troubleshooting
   * Defaults to false (only in development)
   */
  enableDebugLogging?: boolean;

  /**
   * Custom error handler
   * Allows custom error handling logic
   * If returns null, uses default error handling
   */
  customErrorHandler?: (
    error: unknown,
    request: NextRequest
  ) => NextResponse | null;

  /**
   * Preserve all headers from backend response
   * Critical for Set-Cookie, authentication flows
   * Returns raw Response instead of NextResponse.json()
   * Defaults to false
   */
  preserveAllHeaders?: boolean;

  /**
   * FormData support for file uploads
   * When true, accepts FormData instead of JSON body
   * Automatically handles multipart/form-data
   * Defaults to false
   */
  isFormData?: boolean;
}

// ================================================
// MAIN PROXY FUNCTION
// ================================================

/**
 * Create a proxy request to backend API
 *
 * This function handles all the boilerplate of:
 * - Building backend URL with query params
 * - Forwarding Authorization and Cookie headers
 * - Handling request body for mutations
 * - Proper error handling and logging
 * - Returning NextResponse with correct status
 *
 * @param options - Proxy configuration options
 * @returns NextResponse with backend data or error
 *
 * @example
 * ```typescript
 * // GET request
 * export async function GET(request: NextRequest) {
 *   return createBackendProxy({
 *     method: 'GET',
 *     endpoint: '/packages',
 *     request,
 *     logContext: 'Packages API',
 *   });
 * }
 *
 * // POST request
 * export async function POST(request: NextRequest) {
 *   const body = await request.json();
 *   return createBackendProxy({
 *     method: 'POST',
 *     endpoint: '/reviews',
 *     request,
 *     body,
 *     logContext: 'Reviews API',
 *   });
 * }
 * ```
 */
export async function createBackendProxy(
  options: BackendProxyOptions
): Promise<NextResponse> {
  const {
    method,
    endpoint,
    request,
    body,
    logContext = endpoint,
    includeSearchParams = true,
    useBaseUrl = false,
    transformResponse,
    enableDebugLogging = false,
    customErrorHandler,
    preserveAllHeaders = false,
    isFormData = false,
  } = options;

  try {
    // Build backend URL with query parameters
    const url = new URL(request.url);
    const searchParams = includeSearchParams ? url.searchParams.toString() : '';
    const baseUrl = useBaseUrl ? BACKEND_BASE_URL : BACKEND_API_URL;
    const backendUrl = `${baseUrl}${endpoint}${searchParams ? `?${searchParams}` : ''}`;

    // Debug logging
    if (enableDebugLogging || process.env.NODE_ENV === 'development') {
      logger.debug('Backend proxy request', {
        url: backendUrl,
        hasBody: !!body,
      });
    }

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
      credentials: 'include', // Forward cookies
    };

    // Handle FormData for file uploads
    if (isFormData && body instanceof FormData) {
      // Remove Content-Type header - browser will set it with boundary
      delete (headers as Record<string, string>)['Content-Type'];
      fetchOptions.body = body;
    }
    // Add JSON body for POST/PUT/PATCH requests
    else if (body !== undefined && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = JSON.stringify(body);
    }

    // Make backend request
    const response = await fetch(backendUrl, fetchOptions);

    // Debug logging
    if (enableDebugLogging || process.env.NODE_ENV === 'development') {
      logger.debug('Backend response', {
        status: response.status,
        ok: response.ok,
      });
    }

    // If preserveAllHeaders is true, return raw Response with all headers
    if (preserveAllHeaders) {
      const responseData = await response.text();
      const responseHeaders = new Headers();

      // Copy all headers from backend response
      response.headers.forEach((value, key) => {
        responseHeaders.append(key, value);
      });

      if (enableDebugLogging) {
        logger.debug('Preserving headers', {
          hasSetCookie: hasCookies,
          headerCount: Array.from(response.headers.keys()).length,
        });
      }

      return new NextResponse(responseData, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    // Parse response
    const data = await response.json();

    // Transform response if transformer provided
    const finalData = transformResponse
      ? transformResponse(data, response)
      : data;

    // Return response with same status code
    return NextResponse.json(finalData, { status: response.status });
  } catch (error) {
    // Try custom error handler first
    if (customErrorHandler) {
      const customResponse = customErrorHandler(error, request);
      if (customResponse) {
        return customResponse;
      }
    }

    // Log error with context
    logger.error(
      `${logContext} proxy error:`,
      error instanceof Error ? error : new Error(String(error))
    );

    // Return standardized error response
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        message: 'An error occurred while processing your request',
      },
      { status: 500 }
    );
  }
}

// ================================================
// DYNAMIC ROUTE HELPER
// ================================================

/**
 * Create a proxy request for dynamic routes with path parameters
 *
 * @param options - Proxy configuration options
 * @param params - Route parameters (e.g., { id: '123' })
 * @returns NextResponse with backend data or error
 *
 * @example
 * ```typescript
 * export async function GET(
 *   request: NextRequest,
 *   context: { params: Promise<{ id: string }> }
 * ) {
 *   const { id } = await context.params;
 *   return createBackendProxyWithParams({
 *     method: 'GET',
 *     endpoint: `/packages/${id}`,
 *     request,
 *     logContext: 'Package Details API',
 *   });
 * }
 * ```
 */
export async function createBackendProxyWithParams(
  options: Omit<BackendProxyOptions, 'endpoint'> & { endpoint: string }
): Promise<NextResponse> {
  return createBackendProxy(options);
}

// ================================================
// CONVENIENCE METHODS
// ================================================

/**
 * GET request proxy shorthand
 */
export async function proxyGet(
  endpoint: string,
  request: NextRequest,
  logContext?: string
): Promise<NextResponse> {
  return createBackendProxy({
    method: 'GET',
    endpoint,
    request,
    logContext,
  });
}

/**
 * POST request proxy shorthand
 */
export async function proxyPost(
  endpoint: string,
  request: NextRequest,
  body: unknown,
  logContext?: string
): Promise<NextResponse> {
  return createBackendProxy({
    method: 'POST',
    endpoint,
    request,
    body,
    logContext,
  });
}

/**
 * PUT request proxy shorthand
 */
export async function proxyPut(
  endpoint: string,
  request: NextRequest,
  body: unknown,
  logContext?: string
): Promise<NextResponse> {
  return createBackendProxy({
    method: 'PUT',
    endpoint,
    request,
    body,
    logContext,
  });
}

/**
 * PATCH request proxy shorthand
 */
export async function proxyPatch(
  endpoint: string,
  request: NextRequest,
  body: unknown,
  logContext?: string
): Promise<NextResponse> {
  return createBackendProxy({
    method: 'PATCH',
    endpoint,
    request,
    body,
    logContext,
  });
}

/**
 * DELETE request proxy shorthand
 */
export async function proxyDelete(
  endpoint: string,
  request: NextRequest,
  logContext?: string
): Promise<NextResponse> {
  return createBackendProxy({
    method: 'DELETE',
    endpoint,
    request,
    logContext,
  });
}
