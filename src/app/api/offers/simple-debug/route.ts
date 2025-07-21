import { db } from '@/lib/db';
import { offers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createSuccessResponse, withErrorHandler } from '@/lib/errors';

// GET /api/offers/simple-debug - Simple debug for date filtering
export const GET = withErrorHandler(async () => {
  const now = new Date();
  
  // Get all banner offers
  const bannerOffers = await db
    .select()
    .from(offers)
    .where(and(
      eq(offers.isActive, true),
      eq(offers.type, 'banner')
    ));
  
  // Check each offer's date validity
  const results = bannerOffers.map(offer => {
    const validFromOk = offer.validFrom <= now;
    const validUntilOk = offer.validUntil >= now;
    const targetAudienceOk = offer.targetAudience === 'all';
    
    return {
      id: offer.id,
      title: offer.title,
      targetAudience: offer.targetAudience,
      validFrom: offer.validFrom.toISOString(),
      validUntil: offer.validUntil.toISOString(),
      validFromOk,
      validUntilOk,
      targetAudienceOk,
      passesAll: validFromOk && validUntilOk && targetAudienceOk
    };
  });

  return createSuccessResponse({
    now: now.toISOString(),
    totalBannerOffers: bannerOffers.length,
    results,
    passingOffers: results.filter(r => r.passesAll).length
  });
});
