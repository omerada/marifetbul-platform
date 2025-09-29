import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');

    // Mock data - gerçek API implementasyonu burada olacak
    const mockJobs = [
      {
        id: '1',
        title: 'Web Sitesi Tasarımı',
        description: 'Modern ve responsive web sitesi tasarımı',
        budget: { min: 5000, max: 10000 },
        category: 'design',
        skills: ['React', 'TypeScript', 'Tailwind CSS'],
        deadline: '2025-10-15',
        employerId: 'emp1',
        employerName: 'Ahmet Yılmaz',
        createdAt: '2025-09-10',
        applicantCount: 5,
      },
      {
        id: '2',
        title: 'Mobile Uygulama Geliştirme',
        description: 'iOS ve Android için mobile uygulama',
        budget: { min: 15000, max: 25000 },
        category: 'development',
        skills: ['React Native', 'JavaScript', 'Firebase'],
        deadline: '2025-11-30',
        employerId: 'emp2',
        employerName: 'Fatma Demir',
        createdAt: '2025-09-12',
        applicantCount: 8,
      },
    ];

    // Filtreleme mantığı
    let filteredJobs = mockJobs;

    if (category) {
      filteredJobs = filteredJobs.filter((job) => job.category === category);
    }

    if (search) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (minBudget) {
      filteredJobs = filteredJobs.filter(
        (job) => job.budget.min >= Number(minBudget)
      );
    }

    if (maxBudget) {
      filteredJobs = filteredJobs.filter(
        (job) => job.budget.max <= Number(maxBudget)
      );
    }

    // Pagination
    const totalJobs = filteredJobs.length;
    const totalPages = Math.ceil(totalJobs / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        jobs: paginatedJobs,
        pagination: {
          page,
          limit,
          totalJobs,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Jobs API Error:', error);
    return NextResponse.json(
      { success: false, error: 'İşler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Burada job creation validation ve logic olacak
    const {
      title,
      description,
      budget,
      category,
      skills,
      deadline,
      employerId,
    } = body;

    // Validation
    if (!title || !description || !budget || !category || !employerId) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    // Mock response - gerçek DB işlemi burada olacak
    const newJob = {
      id: Date.now().toString(),
      title,
      description,
      budget,
      category,
      skills: skills || [],
      deadline,
      employerId,
      createdAt: new Date().toISOString(),
      applicantCount: 0,
      status: 'active',
    };

    return NextResponse.json(
      {
        success: true,
        data: newJob,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Job Creation Error:', error);
    return NextResponse.json(
      { success: false, error: 'İş ilanı oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
