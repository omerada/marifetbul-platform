import { NextRequest, NextResponse } from 'next/server';

// Simple mock package without special characters
const mockPackages = [
  {
    id: '1',
    title: 'Web Development Service',
    description: 'Professional web development using React and Next.js',
    price: 1500,
    deliveryTime: 14,
    revisions: 3,
    features: ['Responsive Design', 'SEO Optimization', 'Admin Panel'],
    rating: 4.9,
    orders: 89,
  },
  {
    id: '2',
    title: 'Logo Design Service',
    description: 'Professional logo and brand identity design',
    price: 300,
    deliveryTime: 5,
    revisions: 5,
    features: ['Logo Design', 'Brand Colors', 'Style Guide'],
    rating: 4.8,
    orders: 156,
  },
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Find package by ID
    const pkg = mockPackages.find((p) => p.id === id);

    if (!pkg) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package not found',
          message: `Package with ID: ${id} does not exist`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    console.error('Packages API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        message: 'Error occurred while fetching package',
      },
      { status: 500 }
    );
  }
}
