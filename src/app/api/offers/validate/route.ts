import { NextRequest } from 'next/server';
import { OffersService } from '@/lib/services/offers.service';
import { createSuccessResponse, createErrorResponse, withErrorHandler } from '@/lib/errors';
import { z } from 'zod';

const validateOfferSchema = z.object({
  offerId: z.string().uuid('Valid offer ID is required'),
  orderAmount: z.number().min(0, 'Order amount must be non-negative'),
});

// POST /api/offers/validate - Validate offer for order
export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = validateOfferSchema.parse(body);

    const result = await OffersService.applyOfferDiscount(
      validatedData.offerId,
      validatedData.orderAmount
    );

    return createSuccessResponse(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse({
        message: 'Validation error',
        details: error.issues,
      });
    }
    throw error;
  }
});
