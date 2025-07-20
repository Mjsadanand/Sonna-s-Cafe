import { NextRequest } from 'next/server';
import { OffersService } from '@/lib/services/offers.service';
import { createSuccessResponse, withErrorHandler } from '@/lib/errors';

// GET /api/offers/popup - Get popup offers for user
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || request.headers.get('x-user-id');
  const sessionId = searchParams.get('sessionId') || request.headers.get('x-session-id') || crypto.randomUUID();

  const offers = await OffersService.getPopupOffersForUser(userId || undefined, sessionId);
  return createSuccessResponse(offers);
});
