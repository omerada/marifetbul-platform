/**
 * Orders API Route - Frontend to Backend Proxy
 * Handles order requests and routes them to appropriate backend endpoints
 * based on user authentication and role
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/orders
 * Fetches orders based on user role and filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const freelancerId = searchParams.get('freelancerId');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = searchParams.get('page') || '0';
    const pageSize = searchParams.get('pageSize') || '20';

    // Build backend URL
    // Determine endpoint based on parameters
    let backendEndpoint = '';

    if (freelancerId) {
      // Get orders as seller
      backendEndpoint = '/orders/seller/me';
    } else if (clientId) {
      // Get orders as buyer
      backendEndpoint = '/orders/buyer/me';
    } else {
      // Default to seller orders (for freelancer dashboard)
      backendEndpoint = '/orders/seller/me';
    }

    // Add status filter if provided
    if (status) {
      backendEndpoint = `${backendEndpoint}/status/${status}`;
    }

    const backendParams = new URLSearchParams({
      page,
      size: pageSize,
      sort: 'createdAt,desc',
    });

    const backendUrl = `${BACKEND_API_URL}${backendEndpoint}?${backendParams.toString()}`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Orders API] GET request:', {
        endpoint: backendEndpoint,
        url: backendUrl,
        filters: {
          status,
          clientId,
          freelancerId,
          category,
          startDate,
          endDate,
        },
      });
    }

    // Forward request to backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward authentication cookies
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Orders API] Backend error:', {
        status: response.status,
        error: errorText,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: 'Failed to fetch orders from backend',
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform Spring Page response to our format
    if (data.success && data.data) {
      const pageData = data.data;

      return NextResponse.json({
        success: true,
        data: pageData.content || [],
        meta: {
          page: pageData.number || 0,
          pageSize: pageData.size || 20,
          total: pageData.totalElements || 0,
          totalPages: pageData.totalPages || 0,
          hasNext: !pageData.last,
          hasPrevious: !pageData.first,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Orders API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while fetching orders',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Creates a new order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Determine order type and backend endpoint
    let backendEndpoint = '/orders/';
    if (body.jobId) {
      backendEndpoint += 'job';
    } else if (body.packageId) {
      backendEndpoint += 'package';
    } else {
      backendEndpoint += 'custom';
    }

    const backendUrl = `${BACKEND_API_URL}${backendEndpoint}`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Orders API] POST request:', {
        endpoint: backendEndpoint,
        url: backendUrl,
        body,
      });
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[Orders API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while creating order',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
