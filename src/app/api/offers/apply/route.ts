import { NextRequest, NextResponse } from 'next/server';
import { OffersService } from '@/lib/services/offers.service';

// POST /api/offers/apply - Apply offer discount
export async function POST(request: NextRequest) {
  try {
    const { offerId, orderAmount } = await request.json();

    if (!offerId || !orderAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await OffersService.applyOfferDiscount(offerId, orderAmount);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error applying offer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
