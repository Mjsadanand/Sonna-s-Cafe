import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OffersService } from '@/lib/services/offers.service';
import { UserService } from '@/lib/services/user.service';
import { createSuccessResponse, createErrorResponse, withErrorHandler } from '@/lib/errors';
import { Offer } from '@/lib/db/schema';
import { z } from 'zod';

const trackInteractionSchema = z.object({
  offerId: z.string().uuid('Valid offer ID is required'),
  interactionType: z.enum(['viewed', 'clicked', 'dismissed', 'converted']),
  orderId: z.string().uuid().optional(),
});

// GET /api/offers - Get offers for display
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'banner' | 'popup' | 'notification' | null;
  
  // Try to get user ID but don't require authentication
  let clerkUserId: string | null = null;
  try {
    const authResult = await auth();
    clerkUserId = authResult.userId;
  } catch {
    // If auth fails (no middleware), continue as guest user

  }

  let offers: Offer[] = [];

  if (type === 'popup') {
    // Get session ID from headers or generate one
    const sessionId = request.headers.get('x-session-id') || crypto.randomUUID();
    
    let dbUserId;
    if (clerkUserId) {
      try {
        const dbUser = await UserService.getUserByClerkId(clerkUserId);
        dbUserId = dbUser?.id;
      } catch {
        // Error getting user from database
      }
    }
    
    offers = await OffersService.getPopupOffersForUser(dbUserId || undefined, sessionId);
  } else if (clerkUserId) {
    // Get database user ID from Clerk ID
    try {
      const dbUser = await UserService.getUserByClerkId(clerkUserId);
      if (dbUser) {
        offers = await OffersService.getPersonalizedOffers(dbUser.id);
        if (type) {
          offers = offers.filter(offer => offer.type === type);
        }
      } else {
        // For users without database record, show general offers
        offers = await OffersService.getActiveOffers(type || undefined);
      }
    } catch {
      // Error getting personalized offers, fallback to general offers
      offers = await OffersService.getActiveOffers(type || undefined);
    }
  } else {
    offers = await OffersService.getActiveOffers(type || undefined);
  }

  return createSuccessResponse(offers);
});

// POST /api/offers/interact - Track offer interaction
export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    // Try to get user ID but don't require authentication
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch {
      // Continue without authentication
    }
    
    const body = await request.json();
    const validatedData = trackInteractionSchema.parse(body);
    const sessionId = request.headers.get('x-session-id') || crypto.randomUUID();

    await OffersService.trackInteraction(
      validatedData.offerId,
      validatedData.interactionType,
      userId || undefined,
      sessionId,
      validatedData.orderId
    );

    return createSuccessResponse(null, 'Interaction tracked successfully');
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
