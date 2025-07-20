import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';
import { z } from 'zod';

// POST /api/payment/create-intent - Create Stripe payment intent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const createPaymentIntentSchema = z.object({
      orderId: z.string().uuid('Valid order ID is required'),
      amount: z.number().min(1, 'Amount must be greater than 0'),
      currency: z.string().default('inr'),
      customerId: z.string().optional(),
      metadata: z.record(z.string(), z.string()).optional(),
    });

    const validatedData = createPaymentIntentSchema.parse(body);
    const paymentIntent = await PaymentService.createPaymentIntent(validatedData);

    return NextResponse.json(paymentIntent);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

// This GET function seems misplaced - should be in a separate status route
// For now, commenting it out to fix build issues
/*
// GET /api/payment/status/[paymentIntentId] - Get payment intent status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentIntentId: string }> }
) {
  try {
    const { paymentIntentId } = await params;
    const status = await PaymentService.getPaymentIntentStatus(paymentIntentId);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting payment status:', error);
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
}
*/
