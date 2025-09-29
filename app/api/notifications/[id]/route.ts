import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Notification update validation schema
const UpdateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params;
    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateNotificationSchema.parse(body);

    // Mock notification update - In production, this would update the database
    const updatedNotification = {
      id: notificationId,
      type: 'review',
      category: 'success',
      title: 'Sample Notification',
      message: 'This is a sample notification',
      isRead: validatedData.isRead ?? false,
      isPinned: validatedData.isPinned ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedNotification,
      message: 'Notification updated successfully',
    });
  } catch (error) {
    console.error('Update notification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid notification update data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params;
    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Mock notification deletion - In production, this would delete from database
    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Delete notification error:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
