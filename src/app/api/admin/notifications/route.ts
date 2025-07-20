import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/services/admin.service';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// POST /api/admin/notifications - Send bulk notifications
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json();
    
    const notificationSchema = z.object({
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(['promotion', 'system', 'order_update']),
      targetUsers: z.array(z.string()).optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    const validatedData = notificationSchema.parse(body);
    
    const result = await AdminService.sendBulkNotification(validatedData);

    return NextResponse.json({
      success: true,
      data: result
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
