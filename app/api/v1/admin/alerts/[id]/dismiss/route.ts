import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/v1/admin/alerts/[id]/dismiss
 * Dismiss an alert
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params.id;

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Mock implementation - in real app, update database
    console.log(`Dismissing alert ${alertId}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Alert dismissed',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Dismiss alert error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
