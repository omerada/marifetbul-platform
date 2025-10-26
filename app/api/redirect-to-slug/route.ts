/**
 * Redirect API Route
 * Handles backward compatibility for old ID-based package URLs
 * Fetches package by ID and redirects to slug-based URL
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // Validate parameters
    if (!type || !id) {
      console.error('Missing required parameters:', { type, id });
      return NextResponse.redirect(new URL('/marketplace', request.url));
    }

    // Handle package redirects
    if (type === 'package') {
      try {
        // Fetch package data from backend to get slug
        const backendUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${backendUrl}/api/v1/packages/${id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Package not found');
        }

        const packageData = await response.json();

        // Check if response has data wrapper
        const pkg = packageData.data || packageData;

        if (!pkg.slug) {
          throw new Error('Package slug not found');
        }

        // Permanent redirect to slug-based URL
        return NextResponse.redirect(
          new URL(`/marketplace/packages/${pkg.slug}`, request.url),
          { status: 301 }
        );
      } catch (error) {
        console.error('Failed to fetch package:', error);
        // Fallback to marketplace packages list
        return NextResponse.redirect(
          new URL('/marketplace/packages', request.url)
        );
      }
    }

    // Unknown type - redirect to marketplace home
    return NextResponse.redirect(new URL('/marketplace', request.url));
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/marketplace', request.url));
  }
}
