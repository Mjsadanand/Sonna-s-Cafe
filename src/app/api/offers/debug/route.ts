import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { offers } from '@/lib/db/schema';
import { eq, lte, gte, and } from 'drizzle-orm';
import { createSuccessResponse, withErrorHandler } from '@/lib/errors';

// GET /api/offers/debug - Debug offers filtering
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'banner' | 'popup' | 'notification' | null;
  
  const now = new Date();
  
  // Get all offers first
  const allOffers = await db.select().from(offers);
  
  // Get offers with just isActive filter
  const activeOffers = await db.select().from(offers).where(eq(offers.isActive, true));
  
  // Get offers with date filters
  const dateFilteredOffers = await db
    .select()
    .from(offers)
    .where(and(
      eq(offers.isActive, true),
      lte(offers.validFrom, now),
      gte(offers.validUntil, now)
    ));
  
  // Manual filtering by type
  const typeFilteredOffers = dateFilteredOffers.filter(offer => 
    !type || offer.type === type || offer.type === 'both'
  );
  
  // Manual filtering by target audience
  const finalOffers = typeFilteredOffers.filter(offer => 
    offer.targetAudience === 'all'
  );

  return createSuccessResponse({
    debug: {
      now: now.toISOString(),
      requestedType: type,
      counts: {
        all: allOffers.length,
        active: activeOffers.length,
        dateFiltered: dateFilteredOffers.length,
        typeFiltered: typeFilteredOffers.length,
        final: finalOffers.length
      },
      allOffers: allOffers.map(offer => ({
        id: offer.id,
        title: offer.title,
        type: offer.type,
        isActive: offer.isActive,
        targetAudience: offer.targetAudience,
        validFrom: offer.validFrom,
        validUntil: offer.validUntil,
        validFromCheck: offer.validFrom <= now,
        validUntilCheck: offer.validUntil >= now,
      })),
      dateFilteredOffers: dateFilteredOffers.map(offer => ({
        id: offer.id,
        title: offer.title,
        type: offer.type,
        targetAudience: offer.targetAudience,
      })),
      typeFilteredOffers: typeFilteredOffers.map(offer => ({
        id: offer.id,
        title: offer.title,
        type: offer.type,
        targetAudience: offer.targetAudience,
      })),
      finalOffers
    }
  });
});
