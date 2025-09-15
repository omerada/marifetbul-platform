import { NextRequest, NextResponse } from 'next/server';
import {
  JobService,
  type JobSearchParams,
} from '@/lib/infrastructure/services/api/jobService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const params: JobSearchParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '12'), 50), // Max 50 items
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      location: searchParams.get('location') || undefined,
      minBudget: searchParams.get('minBudget')
        ? parseInt(searchParams.get('minBudget')!)
        : undefined,
      maxBudget: searchParams.get('maxBudget')
        ? parseInt(searchParams.get('maxBudget')!)
        : undefined,
      skills: searchParams.get('skills')?.split(',').filter(Boolean) || [],
      sortBy:
        (searchParams.get('sortBy') as
          | 'newest'
          | 'oldest'
          | 'budget'
          | 'proposals') || 'newest',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Validate page and limit
    if (params.page < 1) params.page = 1;
    if (params.limit < 1) params.limit = 12;

    const result = await JobService.searchJobs(params);

    return NextResponse.json({
      data: result,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const job = await JobService.createJob(body);

    return NextResponse.json(
      {
        data: job,
        success: true,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create job',
        success: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
