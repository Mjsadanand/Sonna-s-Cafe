import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification.service';
import { z } from 'zod';

// POST /api/notifications/order - Send order notification to admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const orderNotificationSchema = z.object({
      orderNumber: z.string(),
      customerName: z.string(),
      customerPhone: z.string(),
      items: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        price: z.string(),
      })),
      total: z.string(),
      deliveryAddress: z.string(),
      estimatedDeliveryTime: z.string(),
    });

    const validatedData = orderNotificationSchema.parse(body);
    const result = await NotificationService.sendOrderNotificationToAdmin(validatedData);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending order notification:', error);
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

// POST /api/notifications/status - Send order status update to customer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const statusUpdateSchema = z.object({
      customerPhone: z.string(),
      orderNumber: z.string(),
      status: z.string(),
      estimatedDeliveryTime: z.string().optional(),
      message: z.string().optional(),
    });

    const validatedData = statusUpdateSchema.parse(body);
    const result = await NotificationService.sendOrderStatusUpdate(validatedData);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending status update:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to send status update' },
      { status: 500 }
    );
  }
}
