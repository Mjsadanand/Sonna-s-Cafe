import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { offers } from '@/lib/db/schema';
import { createSuccessResponse, createErrorResponse, withErrorHandler } from '@/lib/errors';

const createOfferSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['banner', 'popup', 'notification']),
  discountType: z.enum(['percentage', 'fixed_amount', 'free_delivery']),
  discountValue: z.string().min(1, 'Discount value is required'),
  minimumOrderAmount: z.string().optional(),
  maximumDiscountAmount: z.string().optional(),
  targetAudience: z.enum(['all', 'new_customers', 'loyal_customers', 'birthday', 'anniversary']).default('all'),
  occasionType: z.enum(['birthday', 'anniversary', 'festival', 'regular']).default('regular'),
  usageLimit: z.number().optional(),
  priority: z.number().default(1),
  validFrom: z.string().transform(str => new Date(str)),
  validUntil: z.string().transform(str => new Date(str)),
  popupDelaySeconds: z.number().optional(),
  showFrequencyHours: z.number().optional(),
});

// GET /api/admin/offers - Get all offers
export const GET = withErrorHandler(async () => {
  const allOffers = await db.select().from(offers).orderBy(offers.createdAt);
  return createSuccessResponse(allOffers);
});

// POST /api/admin/offers - Create new offer
export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = createOfferSchema.parse(body);

    const newOffer = await db.insert(offers).values({
      ...validatedData,
      isActive: true,
    }).returning();

    return createSuccessResponse(newOffer[0], 'Offer created successfully');
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
