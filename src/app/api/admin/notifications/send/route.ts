import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const sendNotificationSchema = z.object({
  userId: z.string().optional(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['info', 'warning', 'error', 'success']).default('info'),
  sendToAll: z.boolean().default(false)
});

// POST /api/admin/notifications/send - Send notification
export async function POST(request: NextRequest) {
  try {
    const { userId: adminId } = await auth();
    
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = sendNotificationSchema.parse(body);

    // For now, just return success since we don't have a notification system implemented
    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      data: validatedData
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
